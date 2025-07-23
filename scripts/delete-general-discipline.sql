-- Delete all terms in the General Project Terms discipline
DELETE FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어';

-- Verify deletion
SELECT COUNT(*) as remaining_general_terms 
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어';

-- Show remaining disciplines
SELECT discipline, COUNT(*) as term_count 
FROM public.glossary_terms 
GROUP BY discipline 
ORDER BY discipline;
