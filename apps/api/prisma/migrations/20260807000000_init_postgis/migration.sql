-- apps/api/prisma/migrations/20260807000000_init_postgis/migration.sql

-- Mengaktifkan ekstensi PostGIS di skema public
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- Mengaktifkan ekstensi postgis_topology di skema topology
CREATE SCHEMA IF NOT EXISTS topology;
CREATE EXTENSION IF NOT EXISTS postgis_topology SCHEMA topology;

-- Opsional: Mengaktifkan fuzzy match untuk pencarian nama jalan yang typo
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch SCHEMA public;