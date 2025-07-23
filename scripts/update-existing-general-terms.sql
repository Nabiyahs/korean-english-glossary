-- Update existing "프로젝트 일반 용어" terms to use the new "General" discipline
UPDATE public.glossary_terms 
SET discipline = 'General', abbreviation = 'Gen'
WHERE discipline = '프로젝트 일반 용어';

-- Verify the update
SELECT discipline, abbreviation, COUNT(*) as term_count 
FROM public.glossary_terms 
WHERE discipline IN ('General', '프로젝트 일반 용어')
GROUP BY discipline, abbreviation 
ORDER BY discipline;
