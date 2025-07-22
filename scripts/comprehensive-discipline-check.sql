-- COMPREHENSIVE DISCIPLINE MISMATCH DIAGNOSIS
-- Let's find exactly what's happening

-- Step 1: Show ALL discipline names currently in database
SELECT 'STEP 1: ALL CURRENT DISCIPLINES' as step;
SELECT 
    discipline,
    abbreviation,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
GROUP BY discipline, abbreviation, status
ORDER BY discipline, status;

-- Step 2: Look for ANY variation of General terms
SELECT 'STEP 2: SEARCH FOR GENERAL VARIATIONS' as step;
SELECT 
    discipline,
    abbreviation,
    COUNT(*) as count
FROM public.glossary_terms 
WHERE 
    discipline ILIKE '%general%' 
    OR discipline ILIKE '%일반%'
    OR discipline ILIKE '%gen%'
    OR abbreviation = 'Gen'
    OR discipline = 'General'
    OR discipline = '프로젝트 일반 용어'
GROUP BY discipline, abbreviation;

-- Step 3: Show sample terms that should be General
SELECT 'STEP 3: SAMPLE TERMS THAT SHOULD BE GENERAL' as step;
SELECT 
    id,
    en,
    kr,
    discipline,
    abbreviation,
    status
FROM public.glossary_terms 
WHERE 
    en ILIKE '%project management%'
    OR en ILIKE '%scope of work%'
    OR kr ILIKE '%프로젝트%관리%'
    OR kr ILIKE '%업무%범위%'
    OR en ILIKE '%milestone%'
    OR kr ILIKE '%마일스톤%'
LIMIT 10;

-- Step 4: Check what the frontend expects vs what exists
SELECT 'STEP 4: FRONTEND EXPECTATION CHECK' as step;
SELECT 
    CASE 
        WHEN discipline = 'General' THEN 'MATCHES_FRONTEND'
        WHEN discipline = '프로젝트 일반 용어' THEN 'OLD_KOREAN_NAME'
        WHEN discipline ILIKE '%general%' THEN 'SIMILAR_TO_GENERAL'
        ELSE 'OTHER'
    END as match_status,
    discipline,
    COUNT(*) as count
FROM public.glossary_terms
GROUP BY discipline
ORDER BY count DESC;

-- Step 5: Show exact character analysis of discipline names
SELECT 'STEP 5: CHARACTER ANALYSIS' as step;
SELECT DISTINCT
    discipline,
    LENGTH(discipline) as char_length,
    OCTET_LENGTH(discipline) as byte_length,
    encode(discipline::bytea, 'hex') as hex_representation,
    COUNT(*) as term_count
FROM public.glossary_terms 
GROUP BY discipline
ORDER BY term_count DESC;
