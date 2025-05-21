import json
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest

# Import validate function from scripts/validate_json.py
SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
import validate_json  # type: ignore


class ValidateJsonTests(unittest.TestCase):
    def test_valid_file(self):
        path = Path("Dictionary/data_v1.json")
        self.assertTrue(validate_json.validate(path))

    def test_missing_metadata_key(self):
        data = {
            "metadata": {"status": "active"},
            "data": []
        }
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as tmp:
            json.dump(data, tmp)
            tmp_path = Path(tmp.name)
        try:
            self.assertFalse(validate_json.validate(tmp_path))
        finally:
            tmp_path.unlink()

    def test_missing_entry_key(self):
        metadata = {
            "status": "active",
            "name": "tmp.json",
            "description": "temp",
            "version": "1.0",
            "last_update": "2025-01-01T00:00:00"
        }
        data = {
            "metadata": metadata,
            "data": [
                {"word": "test"}
            ]
        }
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as tmp:
            json.dump(data, tmp)
            tmp_path = Path(tmp.name)
        try:
            self.assertFalse(validate_json.validate(tmp_path))
        finally:
            tmp_path.unlink()

    def test_cli_valid_exit_code(self):
        path = Path("Dictionary/data_v1.json")
        result = subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "validate_json.py"), str(path)],
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
