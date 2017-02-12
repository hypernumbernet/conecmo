
-- DROP TABLE public.users;

CREATE TABLE public.users
(
  id serial,
  uname character varying(100),
  pass character varying(100),
  urole character varying(100),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
