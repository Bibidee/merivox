"""Windows compatibility adapter for genlayer-test Direct Mode 0.30.0rc2.

The upstream loader unlinks its temporary stdin file while descriptor 0 is
still open. Windows rejects that operation. Keep the same message injection,
restore stdin after import, and then remove the temporary file.
"""

from __future__ import annotations

import os
import sys
import tempfile

import gltest.direct.loader as direct_loader


_original_allocate = direct_loader._allocate_contract


def _allocate_contract_compat(contract_cls, vm, *args, **kwargs):
    """Allocate storage contracts with the std-lib ABI shipped by rc3.

    genlayer-test 0.30.0rc2 prefers the newer ``_BuilderCtx`` allocator, but
    the official v0.6.0-rc3 runner still exposes the preceding two-argument
    ``_storage_build`` API.  Both paths construct the same storage-backed
    contract instance; this adapter keeps Direct Mode on the official runner
    instead of replacing storage with ordinary Python attributes.
    """
    try:
        from genlayer.py.storage import ROOT_SLOT_ID
        from genlayer.py.storage._internal.generate import (
            ORIGINAL_INIT_ATTR,
            _storage_build,
        )
        try:
            from genlayer.py.storage._internal.generate import _BuilderCtx
        except ImportError:
            _BuilderCtx = None
    except ImportError:
        return _original_allocate(contract_cls, vm, *args, **kwargs)

    if _BuilderCtx is not None:
        return _original_allocate(contract_cls, vm, *args, **kwargs)

    type_desc = _storage_build(contract_cls, {})
    slot = vm._storage.get_store_slot(ROOT_SLOT_ID)
    instance = type_desc.get(slot, 0)
    init = getattr(type_desc, 'cls', None)
    init = getattr(init, '__init__', None) if init is not None else getattr(
        contract_cls, '__init__', None
    )
    if init is not None:
        init = getattr(init, ORIGINAL_INIT_ATTR, init)
        init(instance, *args, **kwargs)
    return instance


direct_loader._allocate_contract = _allocate_contract_compat


def _patch_gl_vm_direct_mode() -> None:
    """Expose Direct Mode's patched nondeterminism through ``genlayer.gl.vm``."""
    import genlayer.gl.vm as gl_vm
    sys.modules.setdefault('genlayer.vm', gl_vm)

    try:
        import genlayer.vm as direct_vm
    except ImportError:
        from gltest.direct import wasi_mock

        def direct_run_nondet(leader_fn, validator_fn, /, **kwargs):
            vm = wasi_mock.get_vm()
            vm._in_nondet = True
            try:
                result = leader_fn()
            finally:
                vm._in_nondet = False
            vm._captured_validators.append((result, leader_fn, validator_fn))
            return result

        gl_vm.run_nondet = direct_run_nondet
        gl_vm.run_nondet_unsafe = direct_run_nondet
        return

    direct_loader._patch_run_nondet_for_direct_mode()
    gl_vm.run_nondet = direct_vm.run_nondet
    gl_vm.run_nondet_unsafe = direct_vm.run_nondet
    gl_vm.run_nondet_default = direct_vm.run_nondet_default


def _patch_sdk_compat_imports() -> None:
    """Bridge gltest's v0.3 imports to the rc3 ``genlayer.py`` layout."""
    import gltest.direct.sdk_compat as compat
    from genlayer.py import calldata
    from genlayer.py import types as sdk_types

    compat.import_calldata = lambda: calldata
    compat.import_types = lambda: sdk_types
    compat.import_address = lambda: sdk_types.Address
    compat.import_address_u256 = lambda: (sdk_types.Address, sdk_types.u256)
    compat.import_lazy = lambda: sdk_types.Lazy
    direct_loader.import_calldata = compat.import_calldata
    direct_loader.import_address = compat.import_address
    direct_loader.import_lazy = compat.import_lazy

    import gltest.direct.wasi_mock as wasi_mock

    wasi_mock.import_calldata = compat.import_calldata


def _inject_message_windows(vm) -> None:
    from genlayer.py import calldata
    from genlayer.py.types import Address

    sender_addr = vm.sender
    if isinstance(sender_addr, bytes):
        sender_addr = Address(sender_addr)
    elif not isinstance(sender_addr, Address) and hasattr(sender_addr, 'as_bytes'):
        sender_addr = Address(sender_addr.as_bytes)
    contract_addr = vm._contract_address
    if isinstance(contract_addr, bytes):
        contract_addr = Address(contract_addr)
    origin_addr = vm.origin
    if isinstance(origin_addr, bytes):
        origin_addr = Address(origin_addr)
    elif not isinstance(origin_addr, Address) and hasattr(origin_addr, 'as_bytes'):
        origin_addr = Address(origin_addr.as_bytes)
    message_data = {
        'contract_address': contract_addr,
        'sender_address': sender_addr,
        'origin_address': origin_addr,
        'stack': [],
        'value': vm._value,
        'datetime': vm._datetime,
        'is_init': False,
        'chain_id': vm._chain_id,
        'entry_kind': 0,
        'entry_data': b'',
        'entry_stage_data': None,
    }
    encoded = calldata.encode(message_data)
    fd, path = tempfile.mkstemp()
    os.write(fd, encoded)
    os.lseek(fd, 0, os.SEEK_SET)
    vm._original_stdin_fd = os.dup(0)
    os.dup2(fd, 0)
    os.close(fd)
    vm._direct_message_path = path


_original_inject = direct_loader._inject_message_to_fd0
_original_load = direct_loader.load_contract_class


def _load_with_restored_stdin(contract_path, vm, sdk_version=None):
    try:
        contract_cls = _original_load(contract_path, vm, sdk_version)
        _patch_sdk_compat_imports()
        _patch_gl_vm_direct_mode()
        return contract_cls
    finally:
        original = getattr(vm, '_original_stdin_fd', None)
        if original is not None:
            os.dup2(original, 0)
            os.close(original)
            vm._original_stdin_fd = None
        path = getattr(vm, '_direct_message_path', None)
        if path:
            try:
                os.unlink(path)
            except FileNotFoundError:
                pass
            vm._direct_message_path = None


direct_loader._inject_message_to_fd0 = _inject_message_windows
direct_loader.load_contract_class = _load_with_restored_stdin

_original_warp = direct_loader.VMContext.warp if hasattr(direct_loader, 'VMContext') else None
if _original_warp is None:
    from gltest.direct.vm import VMContext

    _original_warp = VMContext.warp
else:
    VMContext = direct_loader.VMContext


_original_refresh = VMContext._refresh_gl_message


def _refresh_gl_message_compat(vm) -> None:
    """Refresh the current sender for the rc3 ``genlayer.gl`` message API."""
    _original_refresh(vm)
    gl_module = sys.modules.get('genlayer.gl')
    if gl_module is None or not hasattr(gl_module, 'MessageType'):
        return

    from genlayer.py.types import Address, u256

    def as_address(value):
        if value is None or isinstance(value, Address):
            return value
        if isinstance(value, bytes):
            return Address(value)
        if hasattr(value, 'as_bytes'):
            return Address(value.as_bytes)
        return value

    sender = as_address(vm.sender)
    origin = as_address(vm.origin)
    raw = getattr(gl_module, 'message_raw', None)
    if isinstance(raw, dict):
        raw['sender_address'] = sender
        raw['origin_address'] = origin
        raw['value'] = vm._value
        raw['chain_id'] = vm._chain_id

    current = getattr(gl_module, 'message', None)
    if current is not None:
        gl_module.message = gl_module.MessageType(
            contract_address=current.contract_address,
            sender_address=sender,
            origin_address=origin,
            value=u256(vm._value),
            chain_id=u256(vm._chain_id),
        )


VMContext._refresh_gl_message = _refresh_gl_message_compat


def _warp_with_message_refresh(vm, timestamp: str) -> None:
    _original_warp(vm, timestamp)
    gl_module = sys.modules.get('genlayer.gl')
    if gl_module is not None and getattr(gl_module, 'message_raw', None) is not None:
        gl_module.message_raw['datetime'] = timestamp


VMContext.warp = _warp_with_message_refresh
