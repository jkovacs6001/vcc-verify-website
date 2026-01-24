#!/bin/bash

# Database backup script for Prisma PostgreSQL
# Usage: bash scripts/backup-db.sh

set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep DATABASE_URL .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"
echo "✓ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups to save space
find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +7 -delete
echo "✓ Old backups cleaned up"
