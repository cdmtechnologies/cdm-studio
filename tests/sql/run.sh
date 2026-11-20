#!/bin/sh
# Runs the migrations and the tests on a local Postgres: PGHOST=/var/run/postgresql sh tests/sql/run.sh
set -e
cd "$(dirname "$0")/../.."
P="psql -U postgres -v ON_ERROR_STOP=1 -q"
$P -c "drop database if exists cdm_studio_test" -c "create database cdm_studio_test" >/dev/null
$P -d cdm_studio_test -f tests/sql/shim.sql >/dev/null
for f in supabase/migrations/*.sql; do $P -d cdm_studio_test -f "$f" >/dev/null; done
for f in tests/sql/*_test.sql; do $P -d cdm_studio_test -f "$f" | grep -E "PASSED|ERROR" || true; done
