-- Migration: 002_add_vendedor_nombre
-- Description: Add vendedor_nombre column to ventas table

ALTER TABLE ventas
  ADD COLUMN vendedor_nombre VARCHAR(200) NOT NULL DEFAULT '';

-- Update existing rows with a placeholder if any exist
UPDATE ventas SET vendedor_nombre = '' WHERE vendedor_nombre = '';
