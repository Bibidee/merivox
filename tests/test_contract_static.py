"""Static smoke checks only; these are NOT Direct Mode tests."""
import ast
from pathlib import Path

CONTRACT=Path(__file__).resolve().parents[1]/'contracts'/'merivox.py'

def test_contract_is_valid_python():
    ast.parse(CONTRACT.read_text(encoding='utf-8'))

def test_foundation_has_lifecycle_methods():
    tree=ast.parse(CONTRACT.read_text(encoding='utf-8'))
    cls=next(x for x in tree.body if isinstance(x,ast.ClassDef) and x.name=='Merivox')
    methods={x.name for x in cls.body if isinstance(x,ast.FunctionDef)}
    assert {'create_round','nominate','begin_alignment','get_round','get_alternative','list_rounds'}<=methods
