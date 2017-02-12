SELECT a.attname FROM pg_index i
JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
WHERE i.indrelid = '"film_category"'::regclass AND i.indisprimary
ORDER BY a.attnum