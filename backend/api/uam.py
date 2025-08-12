"""
UAM API endpoints for Universal Agent Metamodel
Read-only schema and example retrieval for builders/clients
"""
from fastapi import APIRouter, HTTPException
from typing import Any, Dict, List
import os
import json
import jsonschema

router = APIRouter(prefix="/api/uam", tags=["uam"]) 

# Derive project root dynamically: backend/api/uam.py -> backend -> project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UAM_SPEC_DIR = os.path.join(PROJECT_ROOT, "spec", "uam", "v0.1")
SCHEMA_PATH = os.path.join(UAM_SPEC_DIR, "schema.json")
EXAMPLE_PATH = os.path.join(UAM_SPEC_DIR, "example-agent.json")

# Simple in-memory cache for schema to avoid repeated disk I/O
_SCHEMA_CACHE: Dict[str, Any] | None = None


def _load_schema() -> Dict[str, Any]:
    global _SCHEMA_CACHE
    if _SCHEMA_CACHE is not None:
        return _SCHEMA_CACHE
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        _SCHEMA_CACHE = json.load(f)
    return _SCHEMA_CACHE


@router.get("/schema")
async def get_uam_schema() -> Dict[str, Any]:
    """Return the UAM v0.1 JSON Schema (read-only)"""
    try:
        schema = _load_schema()
        return {"success": True, "version": "v0.1", "schema": schema}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="UAM schema not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/example")
async def get_uam_example() -> Dict[str, Any]:
    """Return an example UAM v0.1 agent document"""
    try:
        with open(EXAMPLE_PATH, "r", encoding="utf-8") as f:
            example = json.load(f)
        return {"success": True, "version": "v0.1", "example": example}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="UAM example not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
async def validate_uam_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a UAM document against the v0.1 schema.

    Returns a uniform shape with validity and a structured error list compatible with frontend expectations.
    """
    try:
        schema = _load_schema()
        # Use Draft7Validator to accumulate all errors if the schema targets draft-07 (contains $schema field)
        validator = jsonschema.Draft7Validator(schema)
        errors: List[Dict[str, Any]] = []
        for err in validator.iter_errors(doc):
            errors.append({
                "message": err.message,
                "path": list(err.path),
                "schemaPath": list(err.schema_path)
            })
        is_valid = len(errors) == 0
        return {"success": True, "version": "v0.1", "valid": is_valid, "errors": errors}
    except jsonschema.SchemaError as e:
        # Schema itself invalid
        raise HTTPException(status_code=500, detail=f"UAM schema error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))