-- Pipeline: estado «esperando» (le he escrito y espero respuesta) y movimientos del tablero en el historial.
alter table negocios drop constraint negocios_estado_check;
alter table negocios add constraint negocios_estado_check check (
  estado in ('pendiente', 'esperando', 'sin_respuesta', 'volver', 'interesado', 'quiere_propuesta', 'reunion', 'no_interesa', 'no_contactar')
);

alter table contactos drop constraint contactos_resultado_check;
alter table contactos add constraint contactos_resultado_check check (
  resultado in ('pendiente', 'esperando', 'sin_respuesta', 'volver', 'interesado', 'quiere_propuesta', 'reunion', 'no_interesa', 'no_contactar')
);

-- «pipeline»: no es un contacto, es un cambio de columna en el tablero. Se guarda para que quede en el historial.
alter table contactos drop constraint contactos_canal_check;
alter table contactos add constraint contactos_canal_check check (
  canal in ('llamada', 'formulario', 'instagram', 'whatsapp', 'correo', 'visita', 'pipeline')
);
