import json
import sqlite3
from pathlib import Path
from typing import Any


class DeploymentRepository:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        db_parent = Path(db_path).parent
        db_parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _initialize(self) -> None:
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS deployments
                (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    name         TEXT NOT NULL,
                    status       TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    yaml_text    TEXT,
                    created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
                )
                """)

    def list_deployments(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, status, payload_json, yaml_text, created_at, updated_at "
                "FROM deployments ORDER BY updated_at DESC"
            ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    def save_deployment(
        self, *, name: str, status: str, payload: dict[str, Any], yaml_text: str | None
    ) -> int:
        with self._connect() as conn:
            cur = conn.execute(
                """
                INSERT INTO deployments(name, status, payload_json, yaml_text)
                VALUES (?, ?, ?, ?)
                """,
                (name, status, json.dumps(payload), yaml_text),
            )
            conn.commit()
            return cur.lastrowid or 0

    def delete_deployment(self, deployment_id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute("DELETE FROM deployments WHERE id = ?", (deployment_id,))
            conn.commit()
            return cur.rowcount > 0

    def _row_to_dict(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "status": row["status"],
            "payload": json.loads(row["payload_json"]),
            "yaml": row["yaml_text"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
