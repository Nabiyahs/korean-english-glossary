-- Check overall database size
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check row counts for your tables
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "rows inserted",
    n_tup_upd as "rows updated", 
    n_tup_del as "rows deleted",
    n_live_tup as "live rows",
    n_dead_tup as "dead rows"
FROM pg_stat_user_tables 
WHERE schemaname = 'public';

-- Check specifically glossary_terms table
SELECT 
    COUNT(*) as total_terms,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_terms,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_terms
FROM public.glossary_terms;

-- Check database connections
SELECT 
    count(*) as active_connections,
    max_conn,
    max_conn - count(*) as remaining_connections
FROM pg_stat_activity, 
     (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') mc
GROUP BY max_conn;

-- Check storage usage by table
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
