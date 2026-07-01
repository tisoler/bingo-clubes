-- Migration: 001_init
-- Description: Initial schema for "El Bono de los Clubes"

CREATE TABLE clubes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  url_escudo VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bonos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  anio INTEGER NOT NULL,
  mes_inicial INTEGER NOT NULL,
  monto_cuota DECIMAL(10,2) NOT NULL,
  monto_contado DECIMAL(10,2) NOT NULL,
  cantidad_cuotas INTEGER NOT NULL DEFAULT 6,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bono_club (
  id SERIAL PRIMARY KEY,
  bono_id INTEGER NOT NULL REFERENCES bonos(id),
  club_id INTEGER NOT NULL REFERENCES clubes(id),
  rango_inicio INTEGER NOT NULL,
  rango_fin INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (bono_id, club_id)
);

CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  bono_id INTEGER NOT NULL REFERENCES bonos(id),
  numero INTEGER NOT NULL CHECK (numero >= 0 AND numero <= 499),
  club_id INTEGER NOT NULL REFERENCES clubes(id),
  comprador_nombre VARCHAR(200) NOT NULL,
  vendedor_uid VARCHAR(128) NOT NULL,
  vendedor_nombre VARCHAR(200) NOT NULL DEFAULT '',
  actividad VARCHAR(100) DEFAULT NULL,
  tipo_pago VARCHAR(20) NOT NULL DEFAULT 'contado'
    CHECK (tipo_pago IN ('contado', 'transferencia', 'cuotas')),
  cantidad_cuotas INTEGER DEFAULT 1,
  pago_verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (bono_id, numero)
);

CREATE TABLE cuotas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  mes INTEGER,
  pagada BOOLEAN DEFAULT FALSE,
  fecha_pago TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (venta_id, numero_cuota)
);

CREATE TABLE sorteos (
  id SERIAL PRIMARY KEY,
  bono_id INTEGER NOT NULL REFERENCES bonos(id),
  fecha_sorteo DATE NOT NULL,
  premio TEXT NOT NULL,
  mes INTEGER NOT NULL,
  numero_ganador INTEGER,
  id_club_ganador INTEGER REFERENCES clubes(id),
  vendedor_ganador_uid VARCHAR(128),
  venta_ganadora_id INTEGER REFERENCES ventas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ventas_bono_id ON ventas(bono_id);
CREATE INDEX idx_ventas_club_id ON ventas(club_id);
CREATE INDEX idx_ventas_vendedor_uid ON ventas(vendedor_uid);
CREATE INDEX idx_ventas_numero ON ventas(bono_id, numero);
CREATE INDEX idx_cuotas_venta_id ON cuotas(venta_id);
CREATE INDEX idx_cuotas_pagada ON cuotas(pagada);
CREATE INDEX idx_sorteos_bono_id ON sorteos(bono_id);
CREATE INDEX idx_bono_club_bono_id ON bono_club(bono_id);
CREATE INDEX idx_bono_club_club_id ON bono_club(club_id);
