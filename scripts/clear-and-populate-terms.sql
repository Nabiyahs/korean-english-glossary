-- Clear all existing terms
DELETE FROM public.glossary_terms;

-- Insert discipline-relevant basic technical terms
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES

-- 프로젝트 일반 용어 (General Project Terms)
('Project Management', '프로젝트 관리', '프로젝트의 계획, 실행, 모니터링 및 완료를 위한 체계적 접근법', '프로젝트 일반 용어', 'Gen', 'approved'),
('Scope of Work', '업무 범위', '프로젝트에서 수행해야 할 작업의 범위와 내용', '프로젝트 일반 용어', 'Gen', 'approved'),
('Milestone', '마일스톤', '프로젝트의 주요 단계나 중요한 달성 목표', '프로젝트 일반 용어', 'Gen', 'approved'),
('Deliverable', '산출물', '프로젝트에서 제공해야 하는 결과물이나 서비스', '프로젝트 일반 용어', 'Gen', 'approved'),
('Schedule', '일정', '프로젝트 활동의 시간 계획과 순서', '프로젝트 일반 용어', 'Gen', 'approved'),
('Budget', '예산', '프로젝트 수행에 필요한 비용 계획', '프로젝트 일반 용어', 'Gen', 'approved'),
('Risk Management', '위험 관리', '프로젝트 위험 요소의 식별, 분석 및 대응', '프로젝트 일반 용어', 'Gen', 'approved'),
('Quality Control', '품질 관리', '제품이나 서비스의 품질 기준 유지 및 개선', '프로젝트 일반 용어', 'Gen', 'approved'),
('Stakeholder', '이해관계자', '프로젝트에 영향을 주거나 받는 개인이나 조직', '프로젝트 일반 용어', 'Gen', 'approved'),
('Change Order', '변경 지시서', '계약 범위나 조건의 변경을 문서화한 지시서', '프로젝트 일반 용어', 'Gen', 'approved'),

-- Architecture (건축)
('Floor Plan', '평면도', '건물의 각 층별 공간 배치를 나타낸 도면', 'Architecture', 'Arch', 'approved'),
('Elevation', '입면도', '건물의 외관을 정면에서 본 도면', 'Architecture', 'Arch', 'approved'),
('Section', '단면도', '건물을 수직으로 자른 단면을 나타낸 도면', 'Architecture', 'Arch', 'approved'),
('Facade', '파사드', '건물의 정면 외벽이나 외관', 'Architecture', 'Arch', 'approved'),
('Layout', '배치도', '건물이나 시설의 전체적인 배치 계획', 'Architecture', 'Arch', 'approved'),
('Zoning', '조닝', '공간의 용도별 구역 계획', 'Architecture', 'Arch', 'approved'),
('Circulation', '동선', '건물 내 사람의 이동 경로', 'Architecture', 'Arch', 'approved'),
('Building Code', '건축법규', '건축물의 설계와 시공에 관한 법적 기준', 'Architecture', 'Arch', 'approved'),
('Space Planning', '공간 계획', '효율적인 공간 활용을 위한 계획', 'Architecture', 'Arch', 'approved'),
('Accessibility', '접근성', '장애인이나 거동 불편자의 건물 이용 편의성', 'Architecture', 'Arch', 'approved'),

-- Electrical (전기)
('Circuit Breaker', '차단기', '전기 회로의 과부하나 단락을 차단하는 보호 장치', 'Electrical', 'Elec', 'approved'),
('Voltage', '전압', '전기 회로에서 전위차를 나타내는 단위', 'Electrical', 'Elec', 'approved'),
('Current', '전류', '전기 회로에서 흐르는 전기의 양', 'Electrical', 'Elec', 'approved'),
('Power Distribution', '전력 분배', '전력을 각 부하로 분배하는 시스템', 'Electrical', 'Elec', 'approved'),
('Transformer', '변압기', '전압을 변환하는 전기 장치', 'Electrical', 'Elec', 'approved'),
('Panel Board', '배전반', '전기를 분배하고 제어하는 장치', 'Electrical', 'Elec', 'approved'),
('Conduit', '전선관', '전선을 보호하고 정리하는 관', 'Electrical', 'Elec', 'approved'),
('Grounding', '접지', '전기 안전을 위해 대지와 연결하는 것', 'Electrical', 'Elec', 'approved'),
('Load Calculation', '부하 계산', '전기 설비의 필요 용량 계산', 'Electrical', 'Elec', 'approved'),
('Emergency Power', '비상 전원', '정전 시 사용하는 예비 전력 시스템', 'Electrical', 'Elec', 'approved'),

-- Piping (배관)
('Pipeline', '배관', '유체를 운반하는 관로 시스템', 'Piping', 'Piping', 'approved'),
('Valve', '밸브', '유체의 흐름을 제어하는 장치', 'Piping', 'Piping', 'approved'),
('Pump', '펌프', '유체를 이송하는 기계 장치', 'Piping', 'Piping', 'approved'),
('Pressure', '압력', '유체가 관벽에 가하는 힘', 'Piping', 'Piping', 'approved'),
('Flow Rate', '유량', '단위 시간당 흐르는 유체의 양', 'Piping', 'Piping', 'approved'),
('Pipe Fitting', '관 이음쇠', '배관을 연결하거나 방향을 바꾸는 부품', 'Piping', 'Piping', 'approved'),
('Insulation', '보온', '배관의 열손실을 방지하는 재료', 'Piping', 'Piping', 'approved'),
('Drainage', '배수', '폐수나 우수를 배출하는 시스템', 'Piping', 'Piping', 'approved'),
('Water Supply', '급수', '깨끗한 물을 공급하는 시스템', 'Piping', 'Piping', 'approved'),
('Pipe Support', '배관 지지대', '배관을 고정하고 지지하는 구조물', 'Piping', 'Piping', 'approved'),

-- Civil (토목)
('Foundation', '기초', '건물의 하중을 지반에 전달하는 구조물', 'Civil', 'Civil', 'approved'),
('Excavation', '굴착', '건설을 위해 땅을 파는 작업', 'Civil', 'Civil', 'approved'),
('Concrete', '콘크리트', '시멘트, 골재, 물을 혼합한 건설 재료', 'Civil', 'Civil', 'approved'),
('Reinforcement', '철근', '콘크리트의 인장강도를 보강하는 강재', 'Civil', 'Civil', 'approved'),
('Soil Investigation', '지반 조사', '건설 부지의 지반 특성을 조사하는 것', 'Civil', 'Civil', 'approved'),
('Drainage System', '배수 시스템', '빗물이나 지하수를 배출하는 시설', 'Civil', 'Civil', 'approved'),
('Retaining Wall', '옹벽', '토압을 지지하는 구조물', 'Civil', 'Civil', 'approved'),
('Pavement', '포장', '도로나 보도의 표면 마감', 'Civil', 'Civil', 'approved'),
('Utility', '유틸리티', '전기, 가스, 통신 등의 공공 시설', 'Civil', 'Civil', 'approved'),
('Site Work', '부지 조성', '건설을 위한 부지 정리 및 준비 작업', 'Civil', 'Civil', 'approved'),

-- Instrument & Control (제어)
('Sensor', '센서', '물리적 변화를 감지하여 신호로 변환하는 장치', 'Instrument & Control', 'I&C', 'approved'),
('Control Panel', '제어반', '시스템을 제어하고 모니터링하는 장치', 'Instrument & Control', 'I&C', 'approved'),
('PLC', 'PLC', '프로그래머블 로직 컨트롤러', 'Instrument & Control', 'I&C', 'approved'),
('HMI', 'HMI', '휴먼 머신 인터페이스', 'Instrument & Control', 'I&C', 'approved'),
('SCADA', 'SCADA', '감시 제어 및 데이터 수집 시스템', 'Instrument & Control', 'I&C', 'approved'),
('Actuator', '액추에이터', '제어 신호를 받아 물리적 동작을 수행하는 장치', 'Instrument & Control', 'I&C', 'approved'),
('Transmitter', '트랜스미터', '측정값을 신호로 변환하여 전송하는 장치', 'Instrument & Control', 'I&C', 'approved'),
('Control Loop', '제어 루프', '측정, 비교, 조정의 순환 과정', 'Instrument & Control', 'I&C', 'approved'),
('Setpoint', '설정값', '제어 시스템에서 목표로 하는 값', 'Instrument & Control', 'I&C', 'approved'),
('Alarm System', '경보 시스템', '이상 상황을 감지하고 알리는 시스템', 'Instrument & Control', 'I&C', 'approved'),

-- Fire Protection (소방)
('Sprinkler System', '스프링클러 시스템', '자동 화재 진압 시스템', 'Fire Protection', 'FP', 'approved'),
('Fire Alarm', '화재 경보', '화재를 감지하고 알리는 시스템', 'Fire Protection', 'FP', 'approved'),
('Smoke Detector', '연기 감지기', '연기를 감지하는 화재 감지 장치', 'Fire Protection', 'FP', 'approved'),
('Fire Extinguisher', '소화기', '초기 화재를 진압하는 휴대용 장비', 'Fire Protection', 'FP', 'approved'),
('Fire Pump', '소화 펌프', '소화용수를 공급하는 펌프', 'Fire Protection', 'FP', 'approved'),
('Fire Hydrant', '소화전', '소방용수를 공급하는 설비', 'Fire Protection', 'FP', 'approved'),
('Emergency Exit', '비상구', '화재 시 대피를 위한 출구', 'Fire Protection', 'FP', 'approved'),
('Fire Damper', '방화 댐퍼', '화재 시 연기 확산을 차단하는 장치', 'Fire Protection', 'FP', 'approved'),
('Fire Rating', '내화 등급', '화재에 대한 저항 시간 등급', 'Fire Protection', 'FP', 'approved'),
('Suppression System', '소화 시스템', '화재를 진압하는 전체 시스템', 'Fire Protection', 'FP', 'approved'),

-- HVAC (공조)
('Air Handling Unit', '공기조화기', '공기를 처리하고 순환시키는 장치', 'HVAC', 'HVAC', 'approved'),
('Ductwork', '덕트', '공기를 운반하는 관로 시스템', 'HVAC', 'HVAC', 'approved'),
('Ventilation', '환기', '실내외 공기를 교환하는 것', 'HVAC', 'HVAC', 'approved'),
('Air Conditioning', '냉방', '실내 온도를 낮추는 시스템', 'HVAC', 'HVAC', 'approved'),
('Heating', '난방', '실내 온도를 높이는 시스템', 'HVAC', 'HVAC', 'approved'),
('Chiller', '냉동기', '냉수를 생산하는 장치', 'HVAC', 'HVAC', 'approved'),
('Boiler', '보일러', '온수나 증기를 생산하는 장치', 'HVAC', 'HVAC', 'approved'),
('Fan Coil Unit', '팬코일 유닛', '냉난방을 위한 소형 공조 장치', 'HVAC', 'HVAC', 'approved'),
('Thermostat', '온도조절기', '실내 온도를 자동 제어하는 장치', 'HVAC', 'HVAC', 'approved'),
('Air Filter', '공기 필터', '공기 중 먼지나 오염물질을 제거하는 장치', 'HVAC', 'HVAC', 'approved'),

-- Structure (구조)
('Beam', '보', '수평 하중을 지지하는 구조 부재', 'Structure', 'Struct', 'approved'),
('Column', '기둥', '수직 하중을 지지하는 구조 부재', 'Structure', 'Struct', 'approved'),
('Slab', '슬래브', '바닥이나 지붕을 구성하는 평판 구조', 'Structure', 'Struct', 'approved'),
('Truss', '트러스', '삼각형 조합으로 구성된 구조 시스템', 'Structure', 'Struct', 'approved'),
('Load', '하중', '구조물에 작용하는 힘', 'Structure', 'Struct', 'approved'),
('Steel Frame', '철골 구조', '강재로 구성된 골조 구조', 'Structure', 'Struct', 'approved'),
('Reinforced Concrete', '철근 콘크리트', '철근으로 보강된 콘크리트 구조', 'Structure', 'Struct', 'approved'),
('Joint', '접합부', '구조 부재들이 연결되는 부분', 'Structure', 'Struct', 'approved'),
('Seismic Design', '내진 설계', '지진에 대비한 구조 설계', 'Structure', 'Struct', 'approved'),
('Structural Analysis', '구조 해석', '구조물의 거동을 분석하는 것', 'Structure', 'Struct', 'approved'),

-- Cell (배터리)
('Battery Cell', '배터리 셀', '전기 에너지를 저장하는 기본 단위', 'Cell', 'Cell', 'approved'),
('Electrolyte', '전해질', '이온 전도를 위한 화학 물질', 'Cell', 'Cell', 'approved'),
('Cathode', '양극', '배터리의 양극 전극', 'Cell', 'Cell', 'approved'),
('Anode', '음극', '배터리의 음극 전극', 'Cell', 'Cell', 'approved'),
('Battery Pack', '배터리 팩', '여러 셀을 조합한 배터리 모듈', 'Cell', 'Cell', 'approved'),
('Charging', '충전', '배터리에 전기 에너지를 저장하는 과정', 'Cell', 'Cell', 'approved'),
('Discharging', '방전', '배터리에서 전기 에너지를 방출하는 과정', 'Cell', 'Cell', 'approved'),
('Capacity', '용량', '배터리가 저장할 수 있는 전기량', 'Cell', 'Cell', 'approved'),
('BMS', 'BMS', '배터리 관리 시스템', 'Cell', 'Cell', 'approved'),
('Energy Density', '에너지 밀도', '단위 무게당 저장 가능한 에너지량', 'Cell', 'Cell', 'approved');
