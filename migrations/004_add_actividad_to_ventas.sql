-- Migration: 004_add_actividad_to_ventas
-- Description: Add actividad column to ventas table

ALTER TABLE ventas ADD COLUMN actividad VARCHAR(100) DEFAULT NULL;
