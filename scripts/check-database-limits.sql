-- Check total number of terms in database
SELECT COUNT(*) as total_terms FROM public.glossary_terms;

-- Check terms by status
SELECT status, COUNT(*) as count 
FROM public.glossary_terms 
GROUP BY status 
ORDER BY status;

-- Check terms by discipline
SELECT discipline, COUNT(*) as count 
FROM public.glossary_terms 
GROUP BY discipline 
ORDER BY discipline;

-- Check if we have more than 1000 terms (Supabase default limit)
SELECT 
  COUNT(*) as total_terms,
  CASE 
    WHEN COUNT(*) > 1000 THEN 'WARNING: More than 1000 terms - pagination needed'
    ELSE 'OK: Under 1000 terms'
  END as status
FROM public.glossary_terms;

-- Sample query to test pagination
SELECT id, en, kr, discipline, status
FROM public.glossary_terms
ORDER BY discipline, en
LIMIT 10 OFFSET 0;
