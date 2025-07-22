-- FINAL FIX: Ensure all discipline names are consistent English names
-- This will fix any remaining Korean discipline names and ensure consistency

-- Step 1: Show current state
SELECT 'BEFORE FINAL FIX - Current disciplines:' as status;
SELECT 
    discipline,
    abbreviation,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
GROUP BY discipline, abbreviation, status
ORDER BY discipline, status;

-- Step 2: Update any remaining Korean discipline names to English
UPDATE public.glossary_terms 
SET 
    discipline = 'General',
    abbreviation = 'Gen'
WHERE discipline = '프로젝트 일반 용어' OR discipline LIKE '%일반%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Architecture',
    abbreviation = 'Arch'
WHERE discipline = '건축' OR discipline LIKE '%건축%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Electrical',
    abbreviation = 'Elec'
WHERE discipline = '전기' OR discipline LIKE '%전기%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Piping',
    abbreviation = 'Piping'
WHERE discipline = '배관' OR discipline LIKE '%배관%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Civil',
    abbreviation = 'Civil'
WHERE discipline = '토목' OR discipline LIKE '%토목%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Instrument & Control',
    abbreviation = 'I&C'
WHERE discipline = '제어' OR discipline LIKE '%제어%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Fire Protection',
    abbreviation = 'FP'
WHERE discipline = '소방' OR discipline LIKE '%소방%';

UPDATE public.glossary_terms 
SET 
    discipline = 'HVAC',
    abbreviation = 'HVAC'
WHERE discipline = '공조' OR discipline LIKE '%공조%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Structure',
    abbreviation = 'Struct'
WHERE discipline = '구조' OR discipline LIKE '%구조%';

UPDATE public.glossary_terms 
SET 
    discipline = 'Cell',
    abbreviation = 'Cell'
WHERE discipline = '배터리' OR discipline LIKE '%배터리%';

-- Step 3: Verify the fix
SELECT 'AFTER FINAL FIX - Updated disciplines:' as status;
SELECT 
    discipline,
    abbreviation,
    COUNT(*) as count,
    status
FROM public.glossary_terms 
GROUP BY discipline, abbreviation, status
ORDER BY discipline, status;

-- Step 4: Show sample General terms to confirm they exist
SELECT 'SAMPLE GENERAL TERMS:' as status;
SELECT 
    en,
    kr,
    discipline,
    abbreviation,
    status
FROM public.glossary_terms 
WHERE discipline = 'General'
LIMIT 10;

SELECT 'Final discipline fix completed. All names should now be in English.' as final_status;
