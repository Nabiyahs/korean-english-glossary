-- FORCE FIX - This will manually ensure General terms exist and are visible
-- Run this AFTER the diagnosis to force-create General terms if they're missing

-- First, let's see what we're working with
SELECT 'BEFORE FIX - Current state' as status;

SELECT 
    discipline,
    status,
    COUNT(*) as count
FROM public.glossary_terms 
GROUP BY discipline, status
ORDER BY discipline, status;

-- STEP 1: Fix any discipline name issues by being very explicit
UPDATE public.glossary_terms 
SET discipline = '프로젝트 일반 용어'
WHERE 
    -- Be very specific about what we're looking for
    (discipline != '프로젝트 일반 용어' AND (
        discipline ILIKE '%일반%' 
        OR discipline ILIKE '%general%'
        OR discipline = 'Gen'
        OR discipline = 'General'
        OR en ILIKE '%project management%'
        OR en ILIKE '%scope of work%'
        OR kr ILIKE '%프로젝트%관리%'
        OR kr ILIKE '%업무%범위%'
    ));

-- STEP 2: If no General terms exist, create some basic ones
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status)
SELECT * FROM (VALUES
    ('Project Management', '프로젝트 관리', '프로젝트 전반적인 관리 업무', '프로젝트 일반 용어', 'Gen', 'approved'),
    ('Scope of Work', '업무 범위', '업무 범위 정의', '프로젝트 일반 용어', 'Gen', 'approved'),
    ('Milestone', '마일스톤', '프로젝트의 주요 단계나 중요한 달성 목표', '프로젝트 일반 용어', 'Gen', 'approved'),
    ('Deliverable', '산출물', '프로젝트에서 제공해야 하는 결과물이나 서비스', '프로젝트 일반 용어', 'Gen', 'approved'),
    ('Schedule', '일정', '프로젝트 활동의 시간 계획과 순서', '프로젝트 일반 용어', 'Gen', 'approved')
) AS new_terms(en, kr, description, discipline, abbreviation, status)
WHERE NOT EXISTS (
    SELECT 1 FROM public.glossary_terms 
    WHERE discipline = '프로젝트 일반 용어' 
    AND status = 'approved'
);

-- STEP 3: Verify the fix worked
SELECT 'AFTER FIX - New state' as status;

SELECT 
    discipline,
    status,
    COUNT(*) as count
FROM public.glossary_terms 
GROUP BY discipline, status
ORDER BY discipline, status;

-- STEP 4: Show sample General terms
SELECT 
    'SAMPLE GENERAL TERMS' as check_type,
    en,
    kr,
    status,
    discipline
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어'
LIMIT 10;

SELECT 'Force fix completed. Please refresh your browser with Ctrl+F5.' as final_status;
