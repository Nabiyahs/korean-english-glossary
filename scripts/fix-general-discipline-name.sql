-- Fix General discipline name from Korean to English
-- This will update all existing terms with Korean discipline name to English

-- Step 1: Show current state
SELECT 'BEFORE UPDATE - Current General terms:' as status;
SELECT 
    discipline,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어'
GROUP BY discipline, status;

-- Step 2: Update all terms from Korean to English discipline name
UPDATE public.glossary_terms 
SET 
    discipline = 'General',
    abbreviation = 'Gen'
WHERE discipline = '프로젝트 일반 용어';

-- Step 3: Verify the update
SELECT 'AFTER UPDATE - Updated General terms:' as status;
SELECT 
    discipline,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
WHERE discipline = 'General'
GROUP BY discipline, status;

-- Step 4: Show all disciplines after update
SELECT 'ALL DISCIPLINES AFTER UPDATE:' as status;
SELECT 
    discipline,
    COUNT(*) as count
FROM public.glossary_terms 
GROUP BY discipline 
ORDER BY count DESC;

-- Step 5: Verify no Korean discipline names remain
SELECT 'CHECK FOR REMAINING KOREAN DISCIPLINES:' as status;
SELECT 
    discipline,
    COUNT(*) as count
FROM public.glossary_terms 
WHERE discipline LIKE '%프로젝트%' OR discipline LIKE '%일반%'
GROUP BY discipline;
