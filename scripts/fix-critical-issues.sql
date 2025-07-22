-- CRITICAL ISSUE FIXES
-- Run this script to fix the General Terms display issue

-- FIX 1: STANDARDIZE ALL GENERAL TERMS DISCIPLINE NAMES
-- This fixes the "General terms not showing" issue by ensuring the name is consistent.

UPDATE public.glossary_terms 
SET discipline = '프로젝트 일반 용어'
WHERE 
    -- Catch all possible variations of the General discipline name
    discipline IN (
        '프로젝트일반용어',
        '프로젝트 일반용어', 
        '일반용어',
        'General',
        'Gen',
        '프로젝트일반 용어',
        '프로젝트 일반  용어',
        ' 프로젝트일반용어',
        '프로젝트일반용어 '
    ) 
    OR discipline ILIKE '%일반용어%'
    OR discipline ILIKE '%general%'
    OR (discipline ILIKE '%일반%' AND discipline != '프로젝트 일반 용어');

-- FIX 2: CLEAN UP ANY POTENTIAL DUPLICATE ENTRIES
-- This removes duplicate terms, keeping only the oldest entry.

-- First, identify potential duplicates
CREATE TEMP TABLE duplicate_terms AS
SELECT 
    en, 
    kr, 
    discipline,
    COUNT(*) as duplicate_count,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY created_at DESC) as all_ids
FROM public.glossary_terms 
GROUP BY en, kr, discipline
HAVING COUNT(*) > 1;

-- Show duplicates before cleaning (for your verification)
SELECT 
    'DUPLICATES FOUND' as info,
    en,
    kr,
    discipline,
    duplicate_count
FROM duplicate_terms
ORDER BY duplicate_count DESC;

-- Remove duplicates (keep the oldest one)
DELETE FROM public.glossary_terms 
WHERE id IN (
    SELECT unnest(all_ids[2:]) 
    FROM duplicate_terms
);

-- FIX 3: VERIFY THE FIXES WORKED
SELECT 
    'VERIFICATION - GENERAL TERMS' as check_type,
    discipline,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어'
GROUP BY discipline, status;

SELECT 
    'VERIFICATION - TOTAL COUNT' as check_type,
    COUNT(*) as total_terms_after_fix
FROM public.glossary_terms;

SELECT 'Fix script completed successfully.' as status;
