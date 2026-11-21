"""Queue a full catalog ingest: python -m animarka_workers.ingest [limit]"""

import sys

from animarka_workers.tasks.ingest import ingest_catalog

if __name__ == "__main__":
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    print(ingest_catalog.delay(limit=limit).get(timeout=600))
