-- Script para crear la tabla pagos_renta
CREATE TABLE IF NOT EXISTS public.pagos_renta (
    id SERIAL PRIMARY KEY,
    venta_id integer NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
    categoria character varying(50) NOT NULL, -- 'anticipo', 'pendiente', 'extra'
    metodo character varying(50) NOT NULL,    -- 'efectivo', 'tarjeta'
    monto numeric(10,2) NOT NULL,
    fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
