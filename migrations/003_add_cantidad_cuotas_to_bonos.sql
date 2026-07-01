-- Migration: 003_add_cantidad_cuotas_to_bonos
-- Description: Add cantidad_cuotas column to bonos table

ALTER TABLE bonos
  ADD COLUMN cantidad_cuotas INTEGER NOT NULL DEFAULT 6;

-- Update existing rows to use 6 as default
UPDATE bonos SET cantidad_cuotas = 6 WHERE cantidad_cuotas IS NULL;
