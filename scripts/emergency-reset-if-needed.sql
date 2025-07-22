-- EMERGENCY RESET SCRIPT
-- Only run this if the above fixes don't work and you need to start fresh

-- WARNING: This will delete ALL terms and reset the table
-- Uncomment the lines below ONLY if you want to completely reset

-- DELETE FROM public.glossary_terms;

-- Re-insert basic sample data to test
-- INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES
-- ('Project Management', '프로젝트 관리', '프로젝트 전반적인 관리 업무', '프로젝트 일반 용어', 'Gen', 'approved'),
-- ('Scope of Work', '업무 범위', '업무 범위 정의', '프로젝트 일반 용어', 'Gen', 'approved'),
-- ('Floor Plan', '평면도', '건물의 각 층별 공간 배치를 나타낸 도면', 'Architecture', 'Arch', 'approved'),
-- ('Circuit Breaker', '차단기', '전기 회로의 과부하나 단락을 차단하는 보호 장치', 'Electrical', 'Elec', 'approved'),
-- ('Pipeline', '배관', '유체를 운반하는 관로 시스템', 'Piping', 'Piping', 'approved');

-- SELECT 'EMERGENCY RESET COMPLETED' as status, COUNT(*) as new_term_count FROM public.glossary_terms;
