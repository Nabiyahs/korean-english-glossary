-- CRITICAL ISSUE DIAGNOSIS
-- Run this script to identify both problems

-- 1. CHECK IF WE'RE HITTING A 1000-TERM LIMIT
SELECT 
    'TOTAL TERMS CHECK' as check_type,
    COUNT(*) as total_terms,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_terms,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_terms
FROM public.glossary_terms;

-- 2. CHECK FOR EXACT DISCIPLINE NAME MISMATCHES
SELECT 
    'DISCIPLINE NAME CHECK' as check_type,
    discipline,
    LENGTH(discipline) as name_length,
    COUNT(*) as count,
    status,
    -- Show the exact bytes to detect encoding issues
    encode(discipline::bytea, 'hex') as discipline_hex
FROM public.glossary_terms 
GROUP BY discipline, status
ORDER BY discipline;

-- 3. CHECK SPECIFICALLY FOR GENERAL TERMS WITH ALL POSSIBLE VARIATIONS
SELECT 
    'GENERAL TERMS SEARCH' as check_type,
    id,
    en,
    kr,
    discipline,
    status,
    created_at,
    -- Show exact character analysis
    LENGTH(discipline) as len,
    discipline = '프로젝트 일반 용어' as exact_match
FROM public.glossary_terms 
WHERE 
    discipline ILIKE '%일반%' 
    OR discipline ILIKE '%general%' 
    OR discipline ILIKE '%gen%'
    OR discipline = '프로젝트 일반 용어'
ORDER BY created_at DESC;

-- 4. CHECK IF THERE'S A HIDDEN LIMIT OR CONSTRAINT
SELECT 
    'TABLE CONSTRAINTS CHECK' as check_type,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.glossary_terms'::regclass;

-- 5. CHECK FOR ANY TRIGGERS THAT MIGHT BE LIMITING INSERTS
SELECT 
    'TRIGGERS CHECK' as check_type,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'glossary_terms';

-- 6. CHECK RECENT INSERTIONS TO SEE IF NEW TERMS ARE ACTUALLY BEING ADDED
SELECT 
    'RECENT INSERTIONS CHECK' as check_type,
    DATE(created_at) as date_created,
    COUNT(*) as terms_added_that_day
FROM public.glossary_terms 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date_created DESC;
