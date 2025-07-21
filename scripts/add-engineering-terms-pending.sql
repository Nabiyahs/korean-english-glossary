-- Add engineering terms as pending for admin review
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES

-- 프로젝트 일반 용어 (General Project Terms)
('Basic Engineering Design Data, BEDD', '기본설계자료', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Issued For Approval, IFA', '승인용 발행', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Approval for Construction, AFC', '건설승인', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Detail Design Engineering, DDE', '상세설계', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Letter of Intent, L/I', '발주의향서', '결재 통지서', '프로젝트 일반 용어', 'Gen', 'pending'),
('Invitation to Bid, ITB', '입찰안내서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Technical Bid Evaluation, TBE', '기술입찰평가', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Technical Bid Analysis, TBA', '기술입찰분석', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Commercial Bid Analysis, CBA', '상업입찰분석', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Document Control Log, DCL', '문서관리목록', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Quality Assurance Representative, QAR', '품질보증담당자', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Design Review Request, DRR', '설계검토 요청서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Design Review Check-List, DRL', '설계검토 점검표', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Master Document Control Log, MDCL', '총괄 문서관리 목록표', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Request For Quotation, RFQ', '견적요청서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Primary Feasibility Study Report, PFS', '예비 타당성 조사', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Feasibility Study Report, FSR', '타당성 조사', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Basic Design Report, BDR', '기본 설계 보고서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Engineering/Design Execution Plan, PDP', '설계계획서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Execution Plan, EDP', '사업계획서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('System Design Criteria, SDC', '계통 설계기준서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Technical Specification & Data Sheet, TSP', '기술사양서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('System Design Description, SDD', '계통설계설명서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Construction Specification, CSP', '공사시방서', '사양서', '프로젝트 일반 용어', 'Gen', 'pending'),
('Miscellaneous Engineering Procedure, ZEP', '각종절차서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Cost Estimation for Construction, CES', '공사설계서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Preliminary Design Review Report, PDR', '사전검토서', '검토보고서', '프로젝트 일반 용어', 'Gen', 'pending'),
('Final Design Report, FDR', '최종설계보고서', 'O & M Manual, Data Book', '프로젝트 일반 용어', 'Gen', 'pending'),
('List, LST', '각종 목록', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Bill of Material, BOM', '수량산출', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Data Sheet, DSH', '데이터시트', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Inspection or Test Sheets, ISH', '검사 또는 시험서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Check List or Punch List, CHL', '점검목록', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Test Report, TRT', '시험보고서', 'Shop or Field Test Report', '프로젝트 일반 용어', 'Gen', 'pending'),
('Calculation, CAL', '설계계산서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Contractor''s Master Document Register, CDMR', '계약자 주요문서 등록부', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Cost Control Sheet, PCCS', '프로젝트 비용관리표', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Engineering Master Document Schedule, EMD', '설계 주요문서 일정표', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Pre-Qualification, PQ', '사전자격심사', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Engineering Drawing, ENDO', '설계도면', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Material Requisition, MR', '기술사양서', '기계쪽에서 사용', '프로젝트 일반 용어', 'Gen', 'pending'),
('Vendor Print, VP', '업체도면', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Minutes of Meeting, MOM', '회의록', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Field Change Notice, FCN', '현장 변경 통보', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Field Change Request, FCR', '현장 변경 요청', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Design Change Notice, DCN', '설계 변경 통보', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Design Change Request, DCR', '설계 변경 요청', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Manager, PM', '프로젝트 관리자', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Coordinator, PC', '프로젝트 조정자', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Lead Engineer, LE', '주임기술자', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Assign Engineer, AE', '담당기술자', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Interdisciplinary Design Review, IDR', '분야간 설계 검토', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Purchase Order, P/O', '구매주문서', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Master Engineering Document List, MEDL', '설계 주요문서 목록', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('As Soon As Possible, ASAP', '가능한 빨리', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Joint Venture, J/V', '합작방식', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Build-Operate-Transfer, BOT', '건설-운영-이양', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Project Financing, PF', '프로젝트 파이낸싱', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Independent Power Producer, IPP', '민간발전사업', '', '프로젝트 일반 용어', 'Gen', 'pending'),
('Division of Responsibility, DOR', '상세역무표', '', '프로젝트 일반 용어', 'Gen', 'pending'),

-- Architecture (건축)
('Platform, P/F', '플랫폼', '', 'Architecture', 'Arch', 'pending'),
('Architectural Institute of Korea, AIK', '대한건축학회', '', 'Architecture', 'Arch', 'pending'),

-- Electrical (전기)
('Transformer, TR', '변압기', '', 'Electrical', 'Elec', 'pending'),
('Motor Control Center, MCC', '전동기 제어반', '', 'Electrical', 'Elec', 'pending'),
('Turbine Generator, T/G', '터빈발전기', '', 'Electrical', 'Elec', 'pending'),
('Combined Heat & Power, CHP', '열병합발전', '', 'Electrical', 'Elec', 'pending'),
('Maximum Continuous Rating, MCR', '시간당 최대열생산부하', '', 'Electrical', 'Elec', 'pending'),
('Tonnage of Oil Equivalent, TOE', '석유환산톤', '티오이', 'Electrical', 'Elec', 'pending'),

-- Piping (배관)
('Piping and Instrument Diagram, P&ID', '공정 배관 계통도', '', 'Piping', 'Piping', 'pending'),
('Process Flow Diagram, PFD', '공정흐름도', '', 'Piping', 'Piping', 'pending'),
('In Site Battery Limit, ISBL', '부지내 배터리 한계', '', 'Piping', 'Piping', 'pending'),
('Out Site Battery Limit, OSBL', '부지외 배터리 한계', '', 'Piping', 'Piping', 'pending'),
('Battery Limit, BL', '배터리 한계', '', 'Piping', 'Piping', 'pending'),
('Fuel Test Loop, FTL', '핵연료 노내조사시험설비', '', 'Piping', 'Piping', 'pending'),

-- Civil (토목)
('Pile Location Plan, PLP', '파일위치도', '', 'Civil', 'Civil', 'pending'),
('Foundation Location Plan, FLP', '기초위치도', '', 'Civil', 'Civil', 'pending'),
('Underground, U/G', '지하', '', 'Civil', 'Civil', 'pending'),
('Reclamation Fill', '매립토', '', 'Civil', 'Civil', 'pending'),

-- Instrument & Control (제어)
('Distributed Control System, DCS', '분산제어시스템', '분산디지털제어설비', 'Instrument & Control', 'I&C', 'pending'),
('On-Line Monitoring System, OLMS', '개별 감시 시스템', '', 'Instrument & Control', 'I&C', 'pending'),
('Hazards & Operability Study, HAZOP', '위험성평가', '', 'Instrument & Control', 'I&C', 'pending'),
('Process Safety Management, PSM', '공정안전보고서', '', 'Instrument & Control', 'I&C', 'pending'),
('Safety Management System, SMS', '안전성향계획서', '', 'Instrument & Control', 'I&C', 'pending'),

-- Fire Protection (소방)
('Fire Fighting, F/F', '소방', '', 'Fire Protection', 'FP', 'pending'),

-- HVAC (공조)
('Heating, Ventilation and Air Conditioning, HVAC', '난방, 통기, 공기조절', '', 'HVAC', 'HVAC', 'pending'),
('Ventilation', '환기', '', 'HVAC', 'HVAC', 'pending'),
('Hazardous Area', '방폭지역', '', 'HVAC', 'HVAC', 'pending'),

-- Structure (구조)
('Engineering Procurement Construction, EPC', '설계, 구매, 시공 일괄도급방식', '', 'Structure', 'Struct', 'pending'),
('Engineering Procurement Construction Inspection, EPCI', '설계, 구매, 시공, 검사 일괄도급방식', '', 'Structure', 'Struct', 'pending'),
('Mechanical Completion, M/C', '기계준공', '', 'Structure', 'Struct', 'pending'),
('Overhaul', '점검보수', '정밀검사', 'Structure', 'Struct', 'pending'),
('Electrical Control Management System, ECMS', '전기자동화설비', '', 'Structure', 'Struct', 'pending'),
('Audit Plan', '감사계획', '', 'Structure', 'Struct', 'pending'),
('Field Engineer', '현장기술자', '설계자가 설계현장에서 시공자가 설계를 잘 이해할수 있도록 도와주고 설계변경사항 발생시 Minor한 사항은 Field에서 변경해주고 아닌 경우 설계 본사와 Coordination을 할수 있는 설계자', 'Structure', 'Struct', 'pending'),
('Brainstorm', '브레인스토밍', '갑자기 떠오르는 묘안', 'Structure', 'Struct', 'pending')

ON CONFLICT (en, kr) DO NOTHING;
