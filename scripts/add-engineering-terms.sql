-- Add engineering terms organized by discipline
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES

-- 프로젝트 일반 용어 (General Project Terms)
('Basic Engineering Design Data, BEDD', '기본설계자료', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Issued For Approval, IFA', '승인용 발행', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Approval for Construction, AFC', '건설승인', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Detail Design Engineering, DDE', '상세설계', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Letter of Intent, L/I', '발주의향서', '결재 통지서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Invitation to Bid, ITB', '입찰안내서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Technical Bid Evaluation, TBE', '기술입찰평가', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Technical Bid Analysis, TBA', '기술입찰분석', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Commercial Bid Analysis, CBA', '상업입찰분석', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Document Control Log, DCL', '문서관리목록', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Quality Assurance Representative, QAR', '품질보증담당자', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Design Review Request, DRR', '설계검토 요청서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Design Review Check-List, DRL', '설계검토 점검표', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Master Document Control Log, MDCL', '총괄 문서관리 목록표', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Request For Quotation, RFQ', '견적요청서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Primary Feasibility Study Report, PFS', '예비 타당성 조사', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Feasibility Study Report, FSR', '타당성 조사', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Basic Design Report, BDR', '기본 설계 보고서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Engineering/Design Execution Plan, PDP', '설계계획서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Execution Plan, EDP', '사업계획서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('System Design Criteria, SDC', '계통 설계기준서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Technical Specification & Data Sheet, TSP', '기술사양서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('System Design Description, SDD', '계통설계설명서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Construction Specification, CSP', '공사시방서', '사양서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Miscellaneous Engineering Procedure, ZEP', '각종절차서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Cost Estimation for Construction, CES', '공사설계서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Preliminary Design Review Report, PDR', '사전검토서', '검토보고서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Final Design Report, FDR', '최종설계보고서', 'O & M Manual, Data Book', '프로젝트 일반 용어', 'Gen', 'approved'),
('List, LST', '각종 목록', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Bill of Material, BOM', '수량산출', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Data Sheet, DSH', '데이터시트', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Inspection or Test Sheets, ISH', '검사 또는 시험서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Check List or Punch List, CHL', '점검목록', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Test Report, TRT', '시험보고서', 'Shop or Field Test Report', '프로젝트 일반 용어', 'Gen', 'approved'),
('Calculation, CAL', '설계계산서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Contractor''s Master Document Register, CDMR', '계약자 주요문서 등록부', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Cost Control Sheet, PCCS', '프로젝트 비용관리표', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Engineering Master Document Schedule, EMD', '설계 주요문서 일정표', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Pre-Qualification, PQ', '사전자격심사', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Engineering Drawing, ENDO', '설계도면', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Material Requisition, MR', '기술사양서', '기계쪽에서 사용', '프로젝트 일반 용어', 'Gen', 'approved'),
('Vendor Print, VP', '업체도면', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Minutes of Meeting, MOM', '회의록', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Field Change Notice, FCN', '현장 변경 통보', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Field Change Request, FCR', '현장 변경 요청', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Design Change Notice, DCN', '설계 변경 통보', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Design Change Request, DCR', '설계 변경 요청', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Manager, PM', '프로젝트 관리자', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Coordinator, PC', '프로젝트 조정자', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Lead Engineer, LE', '주임기술자', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Assign Engineer, AE', '담당기술자', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Interdisciplinary Design Review, IDR', '분야간 설계 검토', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Purchase Order, P/O', '구매주문서', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Master Engineering Document List, MEDL', '설계 주요문서 목록', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('As Soon As Possible, ASAP', '가능한 빨리', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Joint Venture, J/V', '합작방식', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Build-Operate-Transfer, BOT', '건설-운영-이양', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Project Financing, PF', '프로젝트 파이낸싱', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Independent Power Producer, IPP', '민간발전사업', '', '프로젝트 일반 용어', 'Gen', 'approved'),
('Division of Responsibility, DOR', '상세역무표', '', '프로젝트 일반 용어', 'Gen', 'approved'),

-- Architecture (건축)
('Platform, P/F', '플랫폼', '', 'Architecture', 'Arch', 'approved'),
('Architectural Institute of Korea, AIK', '대한건축학회', '', 'Architecture', 'Arch', 'approved'),

-- Electrical (전기)
('Transformer, TR', '변압기', '', 'Electrical', 'Elec', 'approved'),
('Motor Control Center, MCC', '전동기 제어반', '', 'Electrical', 'Elec', 'approved'),
('Turbine Generator, T/G', '터빈발전기', '', 'Electrical', 'Elec', 'approved'),
('Combined Heat & Power, CHP', '열병합발전', '', 'Electrical', 'Elec', 'approved'),
('Maximum Continuous Rating, MCR', '시간당 최대열생산부하', '', 'Electrical', 'Elec', 'approved'),
('Tonnage of Oil Equivalent, TOE', '석유환산톤', '티오이', 'Electrical', 'Elec', 'approved'),

-- Piping (배관)
('Piping and Instrument Diagram, P&ID', '공정 배관 계통도', '', 'Piping', 'Piping', 'approved'),
('Process Flow Diagram, PFD', '공정흐름도', '', 'Piping', 'Piping', 'approved'),
('In Site Battery Limit, ISBL', '부지내 배터리 한계', '', 'Piping', 'Piping', 'approved'),
('Out Site Battery Limit, OSBL', '부지외 배터리 한계', '', 'Piping', 'Piping', 'approved'),
('Battery Limit, BL', '배터리 한계', '', 'Piping', 'Piping', 'approved'),
('Fuel Test Loop, FTL', '핵연료 노내조사시험설비', '', 'Piping', 'Piping', 'approved'),

-- Civil (토목)
('Pile Location Plan, PLP', '파일위치도', '', 'Civil', 'Civil', 'approved'),
('Foundation Location Plan, FLP', '기초위치도', '', 'Civil', 'Civil', 'approved'),
('Underground, U/G', '지하', '', 'Civil', 'Civil', 'approved'),
('Reclamation Fill', '매립토', '', 'Civil', 'Civil', 'approved'),

-- Instrument & Control (제어)
('Distributed Control System, DCS', '분산제어시스템', '분산디지털제어설비', 'Instrument & Control', 'I&C', 'approved'),
('On-Line Monitoring System, OLMS', '개별 감시 시스템', '', 'Instrument & Control', 'I&C', 'approved'),
('Hazards & Operability Study, HAZOP', '위험성평가', '', 'Instrument & Control', 'I&C', 'approved'),
('Process Safety Management, PSM', '공정안전보고서', '', 'Instrument & Control', 'I&C', 'approved'),
('Safety Management System, SMS', '안전성향계획서', '', 'Instrument & Control', 'I&C', 'approved'),

-- Fire Protection (소방)
('Fire Fighting, F/F', '소방', '', 'Fire Protection', 'FP', 'approved'),

-- HVAC (공조)
('Heating, Ventilation and Air Conditioning, HVAC', '난방, 통기, 공기조절', '', 'HVAC', 'HVAC', 'approved'),
('Ventilation', '환기', '', 'HVAC', 'HVAC', 'approved'),
('Hazardous Area', '방폭지역', '', 'HVAC', 'HVAC', 'approved'),

-- Structure (구조)
('Engineering Procurement Construction, EPC', '설계, 구매, 시공 일괄도급방식', '', 'Structure', 'Struct', 'approved'),
('Engineering Procurement Construction Inspection, EPCI', '설계, 구매, 시공, 검사 일괄도급방식', '', 'Structure', 'Struct', 'approved'),
('Mechanical Completion, M/C', '기계준공', '', 'Structure', 'Struct', 'approved'),
('Overhaul', '점검보수', '정밀검사', 'Structure', 'Struct', 'approved'),
('Electrical Control Management System, ECMS', '전기자동화설비', '', 'Structure', 'Struct', 'approved'),
('Audit Plan', '감사계획', '', 'Structure', 'Struct', 'approved'),
('Field Engineer', '현장기술자', '설계자가 설계현장에서 시공자가 설계를 잘 이해할수 있도록 도와주고 설계변경사항 발생시 Minor한 사항은 Field에서 변경해주고 아닌 경우 설계 본사와 Coordination을 할수 있는 설계자', 'Structure', 'Struct', 'approved'),
('Brainstorm', '브레인스토밍', '갑자기 떠오르는 묘안', 'Structure', 'Struct', 'approved')

ON CONFLICT (en, kr) DO NOTHING;
