# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""Contract-enforced publication permissions for Merivox communities.

The gate deliberately has no administrator.  Its only permission-changing
entry point accepts finalized internal messages from the immutable Merivox
contract configured at deployment.  Every message is checked against the
current Merivox authorization view before storage changes are made.
"""

import hashlib
import json
from dataclasses import dataclass

from genlayer import *


MAX_PERMISSION_LIFETIME = 30 * 86400
MAX_ANNOUNCEMENT_LENGTH = 2000
MAX_PAGE = 25


@allow_storage
@dataclass
class PublisherPermission:
    space_id: str
    recipient_wallet: str
    permission_scope: str
    action_type: str
    expires_at: u64
    version: u256
    action_digest: str
    active: bool
    applied_at: u64


@allow_storage
@dataclass
class Announcement:
    id: str
    space_id: str
    author: Address
    content: str
    content_digest: str
    published_at: u64
    authorization_version: u256


def _digest(value: dict) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(encoded).hexdigest()


class MerivoxActionGate(gl.Contract):
    authorized_merivox: Address
    permissions: TreeMap[str, PublisherPermission]
    announcements: TreeMap[str, Announcement]
    announcement_ids: DynArray[str]
    deliveries: TreeMap[str, bool]
    next_announcement_id: u256

    def __init__(self, merivox_address: Address):
        if isinstance(merivox_address, str):
            merivox_address = Address(merivox_address)
        if not isinstance(merivox_address, Address):
            raise gl.vm.UserError('Merivox address is required')
        self.authorized_merivox = merivox_address
        self.announcement_ids = []
        self.next_announcement_id = u256(1)

    def _timestamp(self) -> int:
        from datetime import datetime
        stamp = str(gl.message_raw['datetime']).replace('Z', '+00:00')
        return int(datetime.fromisoformat(stamp).timestamp())

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _merivox(self):
        return gl.get_contract_at(self.authorized_merivox)

    def _permission_key(self, space_id: str, recipient_wallet: str) -> str:
        return space_id + '|' + recipient_wallet.lower()

    def _delivery_key(self, space_id: str, recipient_wallet: str, version: u256, action_digest: str) -> str:
        return self._permission_key(space_id, recipient_wallet) + '|' + str(int(version)) + '|' + action_digest

    def _permission_dict(self, permission: PublisherPermission | None, now: int) -> dict:
        if permission is None:
            return {
                'exists': False,
                'applied': False,
                'effective': False,
                'active': False,
                'version': 0,
                'action_digest': '',
                'expires_at': 0,
                'reason': 'NO_PERMISSION',
            }
        expired = int(permission.expires_at) > 0 and now >= int(permission.expires_at)
        return {
            'exists': True,
            'applied': True,
            'effective': bool(permission.active) and not expired,
            'active': bool(permission.active),
            'space_id': permission.space_id,
            'recipient_wallet': permission.recipient_wallet,
            'permission_scope': permission.permission_scope,
            'action_type': permission.action_type,
            'expires_at': int(permission.expires_at),
            'version': int(permission.version),
            'action_digest': permission.action_digest,
            'applied_at': int(permission.applied_at),
            'reason': 'EXPIRED' if expired else ('ACTIVE' if permission.active else 'REVOKED'),
        }

    def _current_authorization(self, space_id: str, recipient_wallet: str) -> dict:
        result = self._merivox().view().get_current_authorization(space_id, recipient_wallet)
        if not isinstance(result, dict):
            raise gl.vm.UserError('Merivox authorization view returned malformed data')
        return result

    def _check_message_sender(self) -> None:
        if self._sender() != self.authorized_merivox.as_hex.lower():
            raise gl.vm.UserError('Only the configured Merivox contract may change permissions')

    @gl.public.write
    def apply_authorization(
        self,
        space_id: str,
        action_type: str,
        recipient_wallet: str,
        permission_scope: str,
        expires_at: u64,
        version: u256,
        action_digest: str,
    ) -> str:
        self._check_message_sender()
        if not isinstance(space_id, str) or not space_id:
            raise gl.vm.UserError('Invalid community space')
        action_type = str(action_type).strip().upper()
        recipient = str(recipient_wallet).strip().lower()
        scope = str(permission_scope).strip().upper()
        if action_type not in ('GRANT_PUBLISHER', 'REVOKE_PUBLISHER'):
            raise gl.vm.UserError('Invalid permission action')
        if scope != 'PUBLISHER':
            raise gl.vm.UserError('Invalid permission scope')
        try:
            recipient = Address(recipient).as_hex.lower()
        except Exception:
            raise gl.vm.UserError('Invalid recipient wallet')
        now = self._timestamp()
        expiry = int(expires_at)
        current = self._current_authorization(space_id, recipient)
        expected = {
            'space_id': space_id,
            'action_type': action_type,
            'recipient_wallet': recipient,
            'permission_scope': scope,
            'expires_at': expiry,
        }
        if str(current.get('action_digest', '')) != action_digest or int(current.get('version', 0)) != int(version):
            return 'SUPERSEDED'
        if str(current.get('space_id', '')) != space_id or str(current.get('action_type', '')).upper() != action_type:
            return 'SUPERSEDED'
        if str(current.get('recipient_wallet', '')).lower() != recipient or str(current.get('permission_scope', '')).upper() != scope:
            return 'SUPERSEDED'
        if int(current.get('expires_at', 0)) != expiry:
            return 'SUPERSEDED'
        if _digest(expected) != action_digest:
            raise gl.vm.UserError('Authorization digest mismatch')
        if action_type == 'GRANT_PUBLISHER':
            if expiry <= now or expiry > now + MAX_PERMISSION_LIFETIME:
                raise gl.vm.UserError('Publisher grant expiry is outside the 30-day bound')
        elif expiry != 0:
            raise gl.vm.UserError('Revocations cannot carry an expiry')

        key = self._permission_key(space_id, recipient)
        delivery_key = self._delivery_key(space_id, recipient, version, action_digest)
        existing = self.permissions.get(key)
        if existing is not None:
            if int(version) < int(existing.version):
                return 'SUPERSEDED'
            if int(version) == int(existing.version):
                if existing.action_digest == action_digest:
                    self.deliveries[delivery_key] = True
                    return 'DUPLICATE'
                return 'SUPERSEDED'

        if action_type == 'GRANT_PUBLISHER' and now >= expiry:
            return 'EXPIRED'
        self.permissions[key] = PublisherPermission(
            space_id=space_id,
            recipient_wallet=recipient,
            permission_scope=scope,
            action_type=action_type,
            expires_at=u64(expiry),
            version=u256(version),
            action_digest=action_digest,
            active=action_type == 'GRANT_PUBLISHER',
            applied_at=u64(now),
        )
        self.deliveries[delivery_key] = True
        return 'APPLIED'

    @gl.public.write
    def publish_announcement(self, space_id: str, content: str) -> str:
        if not isinstance(content, str) or not content.strip() or len(content.strip()) > MAX_ANNOUNCEMENT_LENGTH:
            raise gl.vm.UserError('Announcement must contain 1 to 2000 characters')
        recipient = self._sender()
        permission = self.permissions.get(self._permission_key(space_id, recipient))
        now = self._timestamp()
        if permission is None or permission.permission_scope != 'PUBLISHER' or permission.action_type != 'GRANT_PUBLISHER' or not permission.active:
            raise gl.vm.UserError('Wallet is not an active publisher for this community')
        if int(permission.expires_at) == 0 or now >= int(permission.expires_at):
            raise gl.vm.UserError('Publisher permission has expired')
        current = self._current_authorization(space_id, recipient)
        if int(current.get('version', 0)) != int(permission.version) or str(current.get('action_digest', '')) != permission.action_digest:
            raise gl.vm.UserError('Publisher permission is stale or superseded')
        if str(current.get('action_type', '')).upper() != 'GRANT_PUBLISHER' or int(current.get('expires_at', 0)) <= now:
            raise gl.vm.UserError('Publisher permission is not currently effective')
        text = content.strip()
        announcement_id = str(self.next_announcement_id)
        self.next_announcement_id += u256(1)
        self.announcements[announcement_id] = Announcement(
            id=announcement_id,
            space_id=space_id,
            author=gl.message.sender_address,
            content=text,
            content_digest=hashlib.sha256(text.encode('utf-8')).hexdigest(),
            published_at=u64(now),
            authorization_version=u256(permission.version),
        )
        self.announcement_ids.append(announcement_id)
        return announcement_id

    @gl.public.view
    def get_authorized_merivox(self) -> str:
        return self.authorized_merivox.as_hex

    @gl.public.view
    def get_permission(self, space_id: str, recipient_wallet: str) -> dict:
        recipient = Address(recipient_wallet).as_hex.lower()
        permission = self.permissions.get(self._permission_key(space_id, recipient))
        result = self._permission_dict(permission, self._timestamp())
        if result.get('exists'):
            current = self._current_authorization(space_id, recipient)
            if int(current.get('version', 0)) != int(result['version']) or str(current.get('action_digest', '')) != str(result['action_digest']):
                result['effective'] = False
                result['reason'] = 'SUPERSEDED'
        return result

    @gl.public.view
    def get_announcement(self, announcement_id: str) -> dict:
        announcement = self.announcements.get(announcement_id)
        if announcement is None:
            raise gl.vm.UserError('Announcement does not exist')
        return {
            'id': announcement.id,
            'space_id': announcement.space_id,
            'author': announcement.author.as_hex,
            'content': announcement.content,
            'content_digest': announcement.content_digest,
            'published_at': int(announcement.published_at),
            'authorization_version': int(announcement.authorization_version),
        }

    @gl.public.view
    def list_announcements(self, space_id: str, offset: u32, limit: u32) -> list:
        if int(limit) < 1 or int(limit) > MAX_PAGE:
            raise gl.vm.UserError('Invalid page size')
        results = []
        start = int(offset)
        for i in range(start, min(start + int(limit), len(self.announcement_ids))):
            announcement = self.announcements[self.announcement_ids[i]]
            if announcement.space_id != space_id:
                continue
            results.append(self.get_announcement(announcement.id))
        return results
