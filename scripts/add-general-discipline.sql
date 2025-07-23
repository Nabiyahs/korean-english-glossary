-- Add some sample General terms to demonstrate the new discipline
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES

-- General (일반)
('Project Management', '프로젝트 관리', '프로젝트의 계획, 실행, 모니터링 및 완료를 위한 체계적 접근법', 'General', 'Gen', 'approved'),
('Quality Control', '품질 관리', '제품이나 서비스의 품질 기준 유지 및 개선', 'General', 'Gen', 'approved'),
('Risk Management', '위험 관리', '프로젝트 위험 요소의 식별, 분석 및 대응', 'General', 'Gen', 'approved'),
('Stakeholder', '이해관계자', '프로젝트에 영향을 주거나 받는 개인이나 조직', 'General', 'Gen', 'approved'),
('Milestone', '마일스톤', '프로젝트의 주요 단계나 중요한 달성 목표', 'General', 'Gen', 'approved'),
('Deliverable', '산출물', '프로젝트에서 제공해야 하는 결과물이나 서비스', 'General', 'Gen', 'approved'),
('Schedule', '일정', '프로젝트 활동의 시간 계획과 순서', 'General', 'Gen', 'approved'),
('Budget', '예산', '프로젝트 수행에 필요한 비용 계획', 'General', 'Gen', 'approved'),
('Scope of Work', '업무 범위', '프로젝트에서 수행해야 할 작업의 범위와 내용', 'General', 'Gen', 'approved'),
('Change Order', '변경 지시서', '계약 범위나 조건의 변경을 문서화한 지시서', 'General', 'Gen', 'approved')

ON CONFLICT (en, kr) DO NOTHING;
