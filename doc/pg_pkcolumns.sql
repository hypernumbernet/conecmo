SELECT ccu.column_name 
FROM 
information_schema.table_constraints tc
, information_schema.constraint_column_usage ccu 
WHERE 
tc.table_name = 'film_actor' 
AND tc.constraint_type = 'PRIMARY KEY' 
AND tc.table_catalog = ccu.table_catalog 
AND tc.table_schema = ccu.table_schema 
AND tc.table_name = ccu.table_name 
AND tc.constraint_name = ccu.constraint_name
ORDER BY ccu.column_name 