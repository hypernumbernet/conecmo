
-- DROP TABLE public.edited;

CREATE TABLE public.edited
(
  id bigserial,
  table_id bigint NOT NULL,
  pkey text NOT NULL,
  operation "char" NOT NULL, -- U:UPDATE,I:INSERT,D:DELETE
  CONSTRAINT edited_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
COMMENT ON COLUMN public.edited.operation IS 'U:UPDATE,I:INSERT,D:DELETE';
