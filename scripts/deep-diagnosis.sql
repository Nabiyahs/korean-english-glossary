-- SIMPLE STEP-BY-STEP DIAGNOSIS
-- Let's check one thing at a time

-- Step 1: Basic term count
SELECT 'STEP 1: BASIC COUNTS' as step;
SELECT 
    status,
    COUNT(*) as count
FROM public.glossary_terms 
GROUP BY status;

-- Step 2: All discipline names
SELECT 'STEP 2: ALL DISCIPLINES' as step;
SELECT DISTINCT 
    discipline,
    COUNT(*) as term_count
FROM public.glossary_terms 
GROUP BY discipline 
ORDER BY term_count DESC;

-- Step 3: Look for General terms specifically
SELECT 'STEP 3: GENERAL TERMS SEARCH' as step;
SELECT 
    id,
    en,
    kr,
    discipline,
    status,
    created_at
FROM public.glossary_terms 
WHERE discipline LIKE '%일반%' 
   OR discipline LIKE '%General%'
   OR discipline = '프로젝트 일반 용어'
ORDER BY created_at DESC;

-- Step 4: Check recent terms
SELECT 'STEP 4: RECENT TERMS' as step;
SELECT 
    en,
    kr,
    discipline,
    status,
    created_at
FROM public.glossary_terms 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 5: Check approved terms only
SELECT 'STEP 5: APPROVED TERMS COUNT' as step;
SELECT 
    discipline,
    COUNT(*) as approved_count
FROM public.glossary_terms 
WHERE status = 'approved'
GROUP BY discipline 
ORDER BY approved_count DESC;
