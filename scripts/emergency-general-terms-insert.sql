-- EMERGENCY: If General terms are completely missing, this will add them
-- Run this if the above scripts show NO General terms exist

-- Delete any problematic General terms first
DELETE FROM public.glossary_terms 
WHERE discipline ILIKE '%일반%' OR discipline ILIKE '%general%';

-- Insert a comprehensive set of General terms
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES
('Project Management', '프로젝트 관리', '프로젝트 전반적인 관리 업무', '프로젝트 일반 용어', 'Gen', 'approved'),
('Scope of Work', '업무 범위', '업무 범위 정의', '프로젝트 일반 용어', 'Gen', 'approved'),
('Milestone', '마일스톤', '프로젝트의 주요 단계나 중요한 달성 목표', '프로젝트 일반 용어', 'Gen', 'approved'),
('Deliverable', '산출물', '프로젝트에서 제공해야 하는 결과물이나 서비스', '프로젝트 일반 용어', 'Gen', 'approved'),
('Schedule', '일정', '프로젝트 활동의 시간 계획과 순서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Budget', '예산', '프로젝트 수행에 필요한 비용 계획', '프로젝트 일반 용어', 'Gen', 'approved'),
('Risk Management', '위험 관리', '프로젝트 위험 요소의 식별, 분석 및 대응', '프로젝트 일반 용어', 'Gen', 'approved'),
('Quality Control', '품질 관리', '제품이나 서비스의 품질 기준 유지 및 개선', '프로젝트 일반 용어', 'Gen', 'approved'),
('Stakeholder', '이해관계자', '프로젝트에 영향을 주거나 받는 개인이나 조직', '프로젝트 일반 용어', 'Gen', 'approved'),
('Change Order', '변경 지시서', '계약 범위나 조건의 변경을 문서화한 지시서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Manager', '프로젝트 관리자', '프로젝트 전체를 책임지는 관리자', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Coordinator', '프로젝트 조정자', '프로젝트 업무를 조정하는 담당자', '프로젝트 일반 용어', 'Gen', 'approved'),
('Lead Engineer', '주임기술자', '기술 분야를 총괄하는 엔지니어', '프로젝트 일반 용어', 'Gen', 'approved'),
('Design Review', '설계 검토', '설계 내용을 검토하는 과정', '프로젝트 일반 용어', 'Gen', 'approved'),
('Purchase Order', '구매주문서', '자재나 서비스 구매를 위한 주문서', '프로젝트 일반 용어', 'Gen', 'approved');

-- Verify insertion
SELECT 
    'EMERGENCY INSERT COMPLETED' as status,
    COUNT(*) as general_terms_count
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어';

SELECT 
    en, kr, status
FROM public.glossary_terms 
WHERE discipline = '프로젝트 일반 용어'
ORDER BY en;
