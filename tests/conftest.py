"""Windows compatibility adapter for genlayer-test Direct Mode 0.29.2.

The upstream loader unlinks its temporary stdin file while descriptor 0 is
still open. Windows rejects that operation. Keep the same message injection,
restore stdin after import, and then remove the temporary file.
"""

from __future__ import annotations

import os
import sys
import tempfile

import gltest.direct.loader as direct_loader


def _inject_message_windows(vm) -> None:
    from genlayer.py import calldata
    from genlayer.py.types import Address

    sender_addr = vm.sender
    if isinstance(sender_addr, bytes):
        sender_addr = Address(sender_addr)
    contract_addr = vm._contract_address
    if isinstance(contract_addr, bytes):
        contract_addr = Address(contract_addr)
    origin_addr = vm.origin
    if isinstance(origin_addr, bytes):
        origin_addr = Address(origin_addr)
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
        return _original_load(contract_path, vm, sdk_version)
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


def _warp_with_message_refresh(vm, timestamp: str) -> None:
    _original_warp(vm, timestamp)
    gl_module = sys.modules.get('genlayer.gl')
    if gl_module is not None and getattr(gl_module, 'message_raw', None) is not None:
        gl_module.message_raw['datetime'] = timestamp


VMContext.warp = _warp_with_message_refresh
