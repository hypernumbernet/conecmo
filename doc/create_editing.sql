
-- DROP TABLE public.editing;

CREATE TABLE public.editing
(
  id bigserial,
  touch timestamp without time zone NOT NULL,
  ticket character varying(16) NOT NULL,
  finish timestamp without time zone,
  users_id integer NOT NULL,
  db_id integer NOT NULL,
  table_id integer NOT NULL,
  started timestamp without time zone NOT NULL,
  pkey text,
  save_data text,
  CONSTRAINT editing_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
