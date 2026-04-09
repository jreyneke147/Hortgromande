-- Seeded from uploaded PDI workbook set (latest + baseline assessments)

create table if not exists pdi_entity_assessments (
  id uuid primary key default gen_random_uuid(),
  entity_code text not null,
  entity_name text not null,
  assessment_year text not null,
  entity_status text,
  business_type text,
  processing_facility text,
  fruit_category text,
  town text,
  province text,
  race text,
  youth_band text,
  bbbee_rating text,
  ownership_type text,
  tenure_type text,
  total_beneficiaries integer default 0,
  black_ownership_pct numeric,
  women_ownership_pct numeric,
  youth_ownership_pct numeric,
  disabled_ownership_pct numeric,
  created_at timestamptz default now()
);

create table if not exists pdi_farm_assessments (
  id uuid primary key default gen_random_uuid(),
  puc text not null,
  entity_code text not null,
  entity_name text,
  farm_name text not null,
  assessment_year text not null,
  farm_status text,
  farm_size_ha numeric default 0,
  pome_hectares numeric default 0,
  stone_hectares numeric default 0,
  total_hectares numeric default 0,
  new_hectares numeric default 0,
  created_at timestamptz default now()
);

alter table pdi_entity_assessments enable row level security;
alter table pdi_farm_assessments enable row level security;

create policy "Authenticated users can read pdi entity assessments" on pdi_entity_assessments for select to authenticated using (true);
create policy "Authenticated users can read pdi farm assessments" on pdi_farm_assessments for select to authenticated using (true);

create index if not exists idx_pdi_entity_assessments_code_year on pdi_entity_assessments(entity_code, assessment_year);
create index if not exists idx_pdi_farm_assessments_code_year on pdi_farm_assessments(entity_code, assessment_year);

delete from pdi_entity_assessments;
insert into pdi_entity_assessments (entity_code, entity_name, assessment_year, entity_status, business_type, processing_facility, fruit_category, town, province, race, youth_band, bbbee_rating, ownership_type, tenure_type, total_beneficiaries, black_ownership_pct, women_ownership_pct, youth_ownership_pct, disabled_ownership_pct) values
('A001', 'A&B Williams Trust', 2025, 'Active', 'Processing', 'Packing /CA Storage/Logistics', 'Pome/Stone', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 4, 1, 0.5, 0, 0),
('A002', 'Afrikan Farms (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Amersfoort', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 5, 1, 0, 0, 0),
('A003', 'Alona Fresh Produce (Pty) Ltd', 2025, 'Active', 'Processing', 'Pack House (off-farm)', 'Pome', 'BOTRIVIER', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 1, 0.5, 0, 0),
('A004', 'Altius Trading (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Caledon', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 3, 1, 0, 0.308, 0),
('A005', 'Amanzi Farming CC (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'African', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 0, 0, 0),
('A006', 'Anhalt Boerdery (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'LRAD-CPA', 120, 1, 0, 0, 0),
('A007', 'Arborlane Estates (Edms) Bpk 1', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'KOUE-BOKKEVELD', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 0, 0.26, 0, 0, 0),
('A008', 'Arieskraal Estate (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', NULL, 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 197, 0.22, 0.22, 0, 0),
('B001', 'B & C Fourie Boerdery', 2025, 'Inactive', 'Producer', 'NONE', 'Stone', 'Bonnievale', 'Western Cape', NULL, NULL, NULL, NULL, 'Private ownership', 0, 0.4, 0, NULL, 0),
('B002', 'Bambisane Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Ceres', 'Western Cape', 'Black', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 4, 0.51, 0.255, 0.15, 0.01),
('B003', 'Becca Farming Projects (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Middelburg', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 1, 1, 1, 0, 0),
('B004', 'Belleview Agricultural Co-Operative Limited', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 9, 1, 0.11, 0, 0),
('B005', 'Bergendal Boerdery', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'CITRUSDAL', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 150, 0.3, 0, 0, 0),
('B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'VILLIERSDORP', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 273, 0.6, 0, 0, 0),
('B007', 'Bronaar Plase (Edms) Bpk', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'KOUE-BOKKEVELD', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 143, 0.28, 0.28, 0, 0),
('C001', 'Ceres Tierberg Boerdery (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'KoueBoekeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 4, 0.85, 0.2125, 0, 0),
('C002', 'Constitution Road Winegrowers (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'ROBERTSON', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 183, 0.66, 1, 0, 0),
('C003', 'Cortina Farm (Pty) Ltd', 2025, 'Active', 'Producer', 'Cold Storage', 'Pome', 'VYEBOOM', 'Western Cape', 'Coloured', 'Below 35', 'Level 1', 'Black owned', 'Private ownership', 6, 1, 0, 0, 0),
('C004', 'Cortina Farm (Pty) Ltd', 2025, 'Active', 'Processing', 'Pack house (on-farm)', 'Pome', 'VYEBOOM', 'Western Cape', 'Coloured', 'Below 35', 'Level 1', 'Black owned', 'Private ownership', 6, 1, 0, 0, 0),
('C005', 'CPCE INVESTMENT FUND', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Motagu', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 1, 0.5, 1, 0),
('C006', 'Crispy farming (Pty) Ltd', 2025, 'Active', 'Producer/Processing', 'Cold Storage', 'Pome', 'CERES', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity Shares', 'Private ownership', 1410, 0.51, 0.51, 0, 0),
('D001', 'D&M Fresh (Pty) Ltd', 2025, 'Active', 'Producer/Processing', 'Pack house (off-farm)', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 3, 1, 0.6, 0, 0),
('D002', 'De Fynne Kwekery CC', 2025, 'Active', 'Input provider', 'Nursery', 'Pome/Stone/other plants', 'R45Road,Paarl', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 2, 1, 0.5, 0, 0),
('D003', 'De Goree Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Rovertson', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 11, 0.52, 0, 0, 0),
('D004', 'Denou Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'LRAD', 34, 0.51, 0.26, 0, 0),
('D005', 'Destiny Boerdery Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'VYEBOOM', 'Western Cape', NULL, NULL, NULL, NULL, 'Unknown', 0, NULL, 1, NULL, NULL),
('D006', 'DNG Boerdery (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 2, 1, 0.5, 0, 0),
('D007', 'Donkerbos Landgoed/ Eyethu Intaba', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Koue Bokkeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 11, 0.3, 0.4, 0, 0),
('D008', 'Doornkloof SEB (Pty) Ltd', 2025, 'Active', 'Producer', 'Drying', 'Pome/Stone', 'Laingsurg', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 4, 1, 0.8, 0, 0),
('D009', 'Dwarsberg Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 9, 1, 0.1, 0, 0),
('E001', 'Elandsrivier Farming Company', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'VILLIERSDORP', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 251, 1, 1, 0, 0),
('G001', 'George Bell', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Caltzdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private Lease', 1, 1, 0, 0, 0),
('G002', 'GJJ Greeff Boerdery Edms Bpk', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Piketberg', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 19, 0.6, 0.6, 0, 0),
('G003', 'Groundstone Group (Pty)Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Zebediela', 'Limpopo', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'PTO', 2, 1, 0.5, 0, 0),
('H001', 'Hoë-Uitsig Agricultural Primary Cooperation', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Misgund', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 36, 1, 0.16, 0.07, 0),
('H002', 'Howbill Farming (Pty) Ltd (TSR Bordery)', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Koue Bokkeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 2, 0.51, 0.25, 0, 0),
('I001', 'Imibala Orchards (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Groot Drakenstein', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 1, 0.75, 0.75, 0, 0),
('I002', 'Indile Projects and Consulting Services', 2025, 'Active', 'Producer', 'NONE', 'Stone', NULL, 'North West', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 'TBC', 'TBC', 'TBC'),
('I003', 'Ithemba Elitsha Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 0, 0.51, 0.24, 0, 0),
('I004', 'Ithemba Elitsha Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 0, 0.51, 0.2418, 0, 0),
('J001', 'Jacobs Jam', 2025, 'Active', 'Processing', 'Jam', NULL, 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Short term lease', 2, 1, 0.51, 0, 0),
('K001', 'Kaapschon Boerdery 35 (Edms) Bpk', 2025, 'Active', 'Producer', 'Packing/Marketing', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 4, 1, 0, 0, 0),
('K002', 'Kalos Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'White', 'Above 35', 'Level1', 'Black Owned', 'Private ownership', 4, 0.51, 1, 0, 0),
('K003', 'Kliprivier Kleinboere Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Wolseley', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 21, 1, 0.54, 'TBC', 'TBC'),
('K004', 'KLP AGRI (Pty) Ltd', 2025, 'Active', 'Producer/Processing', 'Pack house (on-farm)', 'Pome/Stone', 'ROBERTSON', 'Western Cape', 'Black', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 2, 0.6, 0, 0, 0),
('L001', 'La Vouere Stonefruit (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'LRAD', 2, 0.6, 0, 0, 0),
('L002', 'Laasterivier Boerdery (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Montagu', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 1, 1, 0, 0, 0),
('L003', 'Lakeview Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'White', 'Below 35', 'Level 1', 'Black Owned', 'LRAD', 79, 1, 0.42, 0, 0),
('L004', 'Langrivier Boerdery (Edms) Bpk', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Koue-Bokkeveld', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 242, 0.3, 0, 0, 0),
('L005', 'Leopont Properties 484 (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 102, 0.51, 0, 0, 0),
('L006', 'Lingenfelder Broers BK', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Rusfontein', 'Western Cape', 'White', 'Above 35', 'TBC', 'Equity', 'Private ownership', 0, 'TBC', 'TBC', 'TBC', 'TBC'),
('L007', 'Loch Lynne (EDMS) BPK 
Bokveldskloof ZZ2', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'KoueBokkeveld', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 0, 0.4, 0, 0, 0),
('L008', 'Louis Lategan & Seuns Boerdery', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'BREËRIVIER', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 102, 0.6, 0, 0, 0.6),
('M001', 'Mafube Fresh (Pty) Ltd', 2025, 'Active', 'Marketing', 'Marketing', NULL, 'Tygervalley', 'Western Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private lease', 1, 1, 1, 0, 0),
('M002', 'Misgund Oos Kleinboere Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Misgund', 'Eastern Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 0, 1, 'TBC', 0, 0),
('M003', 'Misgund Oos Kleinboere Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Misgund', 'Eastern Cape', 'White', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 134, 1, 1, 0, 0),
('M004', 'Mistico Trading (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 29, 1, 0.48, 0, 0),
('M005', 'Modulaqhowa Plant Nursery', 2025, 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Botshabelo', 'Free State', 'Black', 'Above 35', 'Level 1', 'Black owner', 'Private lease', 5, 1, 1, 0, 0),
('M006', 'Morceaux Boerdery (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'CERES', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 47, 0.6, 0, 0, 0),
('M007', 'Motala Farming (Pty) Ltd', 2025, 'Inactive', 'Producer', 'NONE', 'Pome', 'Wolseley', 'Western Cape', 'Indian', 'Below 35', 'Level 1', 'Black Owned', 'Privat ownership', 3, 1, 0.3333, 0.3333, 0),
('M008', 'Mouton Nursery', 2025, 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Riviersonderend', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private lease', 1, 1, 0, 0, 0),
('M009', 'Mthombeni Family Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Hendrina', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 6, 1, 0.2, 0.4, 0),
('N001', 'Na-die-Oes Boerdery Trust', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Bonnievale', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 1, 1, 1, 0, 0),
('N002', 'Nitaflo (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 3, 1, 0.8, 0, 0),
('P001', 'Patrick De Wet Familie Trust', 2025, 'Active', 'Producer/Processing', 'Unkown', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 0, 1, 0.4, 0, 0),
('P002', 'Poituers Boerdery BK', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 32, 0.4, 0, 0, 0),
('R001', 'Remmoho Investments', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Bethlehem', 'Free State', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 0.74, 0, 0, 0),
('R002', 'Rhoda''s Market Agency', 2025, 'Active', 'Marketing', 'Marketing', NULL, 'Cape Town', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', NULL, 1, 1, 1, 0, 0),
('R003', 'Rica''s Fruit (Pty) Ltd', 2025, 'Active', 'Producer/Processing', 'Pack house (on-farm)', 'Pome/Stone', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.5, 0, 0),
('R004', 'Rixon Investments h/a Groendal Plase', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Misgund', 'Eastern Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 63, 0.5, 0, 0, 0),
('R005', 'Rovon Middelplaas (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Louterwater', 'Eastern Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'CPA-DALLRD', 65, 1, 0, 0, 0),
('S001', 'Schutz Group (Ntinga Dev. Agency)', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Rosebank', 'Eastern Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 1, 0, 0),
('S002', 'SH van der Horst (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 25, 1, 0, 0, 0),
('S003', 'Shiloh Holdings Investment (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Wolselry', 'Western Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.51, 0, 0),
('S004', 'Sinalo/ Kwasa Farming', 2025, 'Inactive', 'Producer', 'NONE', 'Pome', NULL, 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Lease with municipality', 10, 1, 1, 0, 0),
('S005', 'Stargrow Suikerbosrand JV', 2025, 'Inactive', 'Producer/ Input provider', 'Nursery', 'Pome', 'Stellenbosch', 'Western Cape', 'White', 'Above 35', 'Level 1', 'Black owned', 'Private lease', 2, 0.51, 0, 0, 0),
('T001', 'Tauthitong (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', NULL, 'North West', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.5, 0, 0),
('T002', 'Thandi Estate', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'LRAD', 107, 0.6, 0.5607476635514018, 0.07476635514018691, 0),
('T003', 'Thembelitsha Farming (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Prince Alfred Hamlet', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 5, 0.51, 0, 0, 0),
('T004', 'Thobela Royale (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', NULL, 'Mpumalanga', 'Black', 'Above 35', 'Lelve 1', 'Black owned', 'PTO', 1, 1, 0, 0, 0),
('T005', 'Tradouw Highlands (Pty) Ltd', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Montagu', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 136, 0.75, 0.28, 0.05, 0),
('T006', 'Trevors Boerdery (EDMS) BPK', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership-from LRAD', 6, 1, 0, 0, 0),
('T007', 'Tulpieskraal Werknemers Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Joubertina', 'Eastern Cape', 'White', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 33, 1, 0, 0, 0),
('U001', 'Uitvlugt Boerdery Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 141, 1, 0.2553191489361702, 0, 0),
('V001', 'Vredehoek Kwekery', 2025, 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Montagu', 'Western Cape', NULL, 'Above 35', NULL, NULL, 'TBC', 0, NULL, NULL, NULL, NULL),
('W001', 'Warme Water', 2025, 'Active', 'Producer', 'NONE', 'Stone', 'Montagu', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 17, 0.6, 0.6, 0, 0),
('W002', 'Witzenberg Deelnemings  Trust', 2025, 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'LRAD', 48, 1, 1, 0, 0),
('A001', NULL, 'Baseline 2024', 'Active', 'Processing', 'Packing /CA Storage/Logistics', 'Pome/Stone', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 4, 1, 0.5, 0, 0),
('A002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Amersfoort', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 5, 1, 0, 0, 0),
('A003', NULL, 'Baseline 2024', 'Active', 'Processing', 'Pack House (off-farm)', 'Pome', 'BOTRIVIER', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 1, 0.5, 0, 0),
('A004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Caledon', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 3, 1, 0, 0.308, 0),
('A005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'African', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 0, 0, 0),
('A006', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'LRAD-CPA', 120, 1, 0, 0, 0),
('A007', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'KOUE-BOKKEVELD', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 0, 0.26, 0, 0, 0),
('A008', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', NULL, 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 197, 0.22, 0.22, 0, 0),
('B001', NULL, 'Baseline 2024', 'Inactive', 'Producer', 'NONE', 'Stone', 'Bonnievale', 'Western Cape', 'TBC', 'TBC', 'TBC', 'TBC', 'Private ownership', 0, 0.4, 0, 'TBC', 0),
('B002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Ceres', 'Western Cape', 'Black', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 4, 0.51, 0.255, 0.15, 0.01),
('B003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Middelburg', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 1, 1, 1, 0, 0),
('B004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 9, 1, 0.11, 0, 0),
('B005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'CITRUSDAL', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 150, 0.3, 0, 0, 0),
('B006', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'VILLIERSDORP', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 273, 0.6, 0, 0, 0),
('B007', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'KOUE-BOKKEVELD', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity-Minority shares', 'Private ownership', 143, 0.28, 0.28, 0, 0),
('C001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'KoueBoekeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 4, 0.85, 0.2125, 0, 0),
('C002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'ROBERTSON', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 183, 0.66, 1, 0, 0),
('C003', NULL, 'Baseline 2024', 'Active', 'Producer', 'Cold Storage', 'Pome', 'VYEBOOM', 'Western Cape', 'Coloured', 'Below 35', 'Level 1', 'Black owned', 'Private ownership', 6, 1, 0, 0, 0),
('C004', NULL, 'Baseline 2024', 'Active', 'Processing', 'Pack house (on-farm)', 'Pome', 'VYEBOOM', 'Western Cape', 'Coloured', 'Below 35', 'Level 1', 'Black owned', 'Private ownership', 6, 1, 0, 0, 0),
('C005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Motagu', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 1, 0.5, 1, 0),
('C006', NULL, 'Baseline 2024', 'Active', 'Producer/Processing', 'Cold Storage', 'Pome', 'CERES', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity Shares', 'Private ownership', 1410, 0.51, 0.51, 0, 0),
('D001', NULL, 'Baseline 2024', 'Active', 'Producer/Processing', 'Pack house (off-farm)', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 3, 1, 0.6, 0, 0),
('D002', NULL, 'Baseline 2024', 'Active', 'Input provider', 'Nursery', 'Pome/Stone/other plants', 'R45Road,Paarl', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 2, 1, 0.5, 0, 0),
('D003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Rovertson', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 11, 0.52, 0, 0, 0),
('D004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'LRAD', 34, 0.51, 0.26, 0, 0),
('D005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'VYEBOOM', 'Western Cape', 'TBC', 'TBC', 'TBC', 'TBC', 'Unknown', 0, 'TBC', 1, 'TBC', 'TBC'),
('D006', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 2, 1, 0.5, 0, 0),
('D007', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Koue Bokkeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 11, 0.3, 0.4, 0, 0),
('D008', NULL, 'Baseline 2024', 'Active', 'Producer', 'Drying', 'Pome/Stone', 'Laingsurg', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 4, 1, 0.8, 0, 0),
('D009', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 9, 1, 0.1, 0, 0),
('E001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'VILLIERSDORP', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 251, 1, 1, 0, 0),
('G001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Caltzdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private Lease', 1, 1, 0, 0, 0),
('G002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Piketberg', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 19, 0.6, 0.6, 0, 0),
('G003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Zebediela', 'Limpopo', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'PTO', 2, 1, 0.5, 0, 0),
('H001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Misgund', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 36, 1, 0.16, 0.07, 0),
('H002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Koue Bokkeveld', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 2, 0.51, 0.25, 0, 0),
('I001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Groot Drakenstein', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 1, 0.75, 0.75, 0, 0),
('I002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', NULL, 'North West', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 'TBC', 'TBC', 'TBC'),
('I003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 0, 0.51, 0.24, 0, 0),
('I004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 0, 0.51, 0.2418, 0, 0),
('J001', NULL, 'Baseline 2024', 'Active', 'Processing', 'Jam', NULL, 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Short term lease', 2, 1, 0.51, 0, 0),
('K001', NULL, 'Baseline 2024', 'Active', 'Producer', 'Packing/Marketing', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 4, 1, 0, 0, 0),
('K002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'White', 'Above 35', 'Level1', 'Black Owned', 'Private ownership', 4, 0.51, 1, 0, 0),
('K003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Wolseley', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 21, 1, 0.54, 'TBC', 'TBC'),
('K004', NULL, 'Baseline 2024', 'Active', 'Producer/Processing', 'Pack house (on-farm)', 'Pome/Stone', 'ROBERTSON', 'Western Cape', 'Black', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 2, 0.6, 0, 0, 0),
('L001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black Owned', 'LRAD', 2, 0.6, 0, 0, 0),
('L002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Montagu', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 1, 1, 0, 0, 0),
('L003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'White', 'Below 35', 'Level 1', 'Black Owned', 'LRAD', 79, 1, 0.42, 0, 0),
('L004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Koue-Bokkeveld', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 242, 0.3, 0, 0, 0),
('L005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 102, 0.51, 0, 0, 0),
('L006', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Rusfontein', 'Western Cape', 'White', 'Above 35', 'TBC', 'Equity', 'Private ownership', 0, 'TBC', 'TBC', 'TBC', 'TBC'),
('L007', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'KoueBokkeveld', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 0, 0.4, 0, 0, 0),
('L008', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'BREËRIVIER', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 102, 0.6, 0, 0, 0.6),
('M001', NULL, 'Baseline 2024', 'Active', 'Marketing', 'Marketing', NULL, 'Tygervalley', 'Western Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private lease', 1, 1, 1, 0, 0),
('M002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Misgund', 'Eastern Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 0, 1, 'TBC', 0, 0),
('M003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Misgund', 'Eastern Cape', 'White', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 134, 1, 1, 0, 0),
('M004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 29, 1, 0.48, 0, 0),
('M005', NULL, 'Baseline 2024', 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Botshabelo', 'Free State', 'Black', 'Above 35', 'Level 1', 'Black owner', 'Private lease', 5, 1, 1, 0, 0),
('M006', NULL, 'Baseline 2024', 'Active', 'Input provider', 'NONE', 'Pome/Stone', 'CERES', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 47, 0.6, 0, 0, 0),
('M007', NULL, 'Baseline 2024', 'Inactive', 'Producer', 'NONE', 'Pome', 'Wolseley', 'Western Cape', 'Indian', 'Below 35', 'Level 1', 'Black Owned', 'Privat ownership', 3, 1, 0.3333, 0.3333, 0),
('M008', NULL, 'Baseline 2024', 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Riviersonderend', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private lease', 1, 1, 0, 0, 0),
('M009', NULL, 'Baseline 2024', 'Active', 'Input provider', 'NONE', 'Pome', 'Hendrina', 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 6, 1, 0.2, 0.4, 0),
('N001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Bonnievale', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 1, 1, 1, 0, 0),
('N002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'PLAS', 3, 1, 0.8, 0, 0),
('P001', NULL, 'Baseline 2024', 'Active', 'Producer/Processing', 'Unkown', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 0, 1, 0.4, 0, 0),
('P002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'PRINCE ALFRED HAMLET', 'Western Cape', 'White', 'Above 35', 'Level 7', 'Equity', 'Private ownership', 32, 0.4, 0, 0, 0),
('R001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Bethlehem', 'Free State', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Private ownership', 2, 0.74, 0, 0, 0),
('R002', NULL, 'Baseline 2024', 'Active', 'Marketing', 'Marketing', NULL, 'Cape Town', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', NULL, 1, 1, 1, 0, 0),
('R003', NULL, 'Baseline 2024', 'Active', 'Producer/Processing', 'Pack house (on-farm)', 'Pome/Stone', 'Haarlem', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.5, 0, 0),
('R004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Misgund', 'Eastern Cape', 'White', 'Above 35', 'Level 2', 'Equity', 'Private ownership', 63, 0.5, 0, 0, 0),
('R005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Louterwater', 'Eastern Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'CPA-DALLRD', 65, 1, 0, 0, 0),
('S001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Rosebank', 'Eastern Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 1, 1, 1, 0, 0),
('S002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 25, 1, 0, 0, 0),
('S003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Wolselry', 'Western Cape', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.51, 0, 0),
('S004', NULL, 'Baseline 2024', 'Inactive', 'Producer', 'NONE', 'Pome', NULL, 'Mpumalanga', 'Black', 'Above 35', 'Level 1', 'Black owned', 'Lease with municipality', 10, 1, 1, 0, 0),
('S005', NULL, 'Baseline 2024', 'Inactive', 'Producer/ Input provider', 'Nursery', 'Pome', 'Stellenbosch', 'Western Cape', 'White', 'Above 35', 'Level 1', 'Black owned', 'Private lease', 2, 0.51, 0, 0, 0),
('T001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', NULL, 'North West', 'Black', 'Above 35', 'Level 1', 'Black owned', 'PLAS', 2, 1, 0.5, 0, 0),
('T002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Grabouw', 'Western Cape', 'Coloured', 'Above 35', 'Level 2', 'Black owned', 'LRAD', 107, 0.6, 0.5607476635514018, 0.07476635514018691, 0),
('T003', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Prince Alfred Hamlet', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 5, 0.51, 0, 0, 0),
('T004', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', NULL, 'Mpumalanga', 'Black', 'Above 35', 'Lelve 1', 'Black owned', 'PTO', 1, 1, 0, 0, 0),
('T005', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Montagu', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black owned', 'Private ownership', 136, 0.75, 0.28, 0.05, 0),
('T006', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'Private ownership-from LRAD', 6, 1, 0, 0, 0),
('T007', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Joubertina', 'Eastern Cape', 'White', 'Above 35', 'Level 1', 'Black Owned', 'Private ownership', 33, 1, 0, 0, 0),
('U001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome', 'Villiersdorp', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black Owned', 'LRAD', 141, 1, 0.2553191489361702, 0, 0),
('V001', NULL, 'Baseline 2024', 'Active', 'Input provider', 'Nursery', 'Pome/Stone', 'Montagu', 'Western Cape', 'TBC', 'Above 35', 'TBC', 'TBC', 'TBC', 0, 'TBC', 'TBC', 'TBC', 'TBC'),
('W001', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Stone', 'Montagu', 'Western Cape', 'White', 'Above 35', 'Level 2', 'Black Owned', 'Private ownership', 17, 0.6, 0.6, 0, 0),
('W002', NULL, 'Baseline 2024', 'Active', 'Producer', 'NONE', 'Pome/Stone', 'Ceres', 'Western Cape', 'Coloured', 'Above 35', 'Level 1', 'Black owned', 'LRAD', 48, 1, 1, 0, 0);

delete from pdi_farm_assessments;
insert into pdi_farm_assessments (puc, entity_code, entity_name, farm_name, assessment_year, farm_status, farm_size_ha, pome_hectares, stone_hectares, total_hectares, new_hectares) values
('D17020', 'A002', 'Afrikan Farms (Pty) Ltd', 'Kleinfontein Plaas', 2025, 'Active', 4783, 4.0, 0.0, 4.0, 0.0),
('C3380', 'A003', 'Alona Fresh Produce (Pty) Ltd', 'Alona', 2025, 'Active', 8.25, 0.0, 0.0, 0.0, 0.0),
('V0308', 'A004', 'Altius Trading (Pty) Ltd', 'Klein Ezeljacht', 2025, 'Active', 871, 53.0, 0.0, 53.0, 0.0),
('V0299', 'A005', 'Amanzi Farming CC (Pty) Ltd', 'Nooigedagt', 2025, 'Active', 211, 24.43, 0.0, 24.43, 0.0),
('L0351', 'A006', 'Anhalt Boerdery (Pty) Ltd', 'Anhalt', 2025, 'Active', 563, 78.0, 0.0, 78.0, 0.0),
('C1129', 'A007', 'Arborlane Estates (Edms) Bpk 1', 'Weltevrede', 2025, 'Active', 969, 78.09, 0.0, 78.09, 0.0),
('C1130', 'A007', 'Arborlane Estates (Edms) Bpk 1', 'Tweefontein', 2025, 'Active', 100, 67.0, 18.0, 85.0, 0.0),
('E0120', 'A008', 'Arieskraal Estate (Pty) Ltd', 'Arieskraal', 2025, 'Active', 307, 180.0, 0.0, 180.0, 0.0),
('Y1200', 'B001', 'B & C Fourie Boerdery', 'Gelukshoop', 2025, 'Active', 4, 0.0, 2.0, 2.0, 0.0),
('X1306', 'B002', 'Bambisane Farming (Pty) Ltd', 'Slangfontein', 2025, 'Active', 1009.4251, 14.100000000000001, 0.0, 14.100000000000001, 1.3),
('Unknown', 'B003', 'Becca Farming Projects (Pty) Ltd', 'Wonderhoek', 2025, 'Active', 123, 0.0, 75.0, 75.0, 0.0),
('V1073', 'B004', 'Belleview Agricultural Co-Operative Limited', 'Waterval 72', 2025, 'Active', 56.14, 42.3, 0.0, 42.3, 0.0),
('X1254', 'B005', 'Bergendal Boerdery', 'Maanskloof', 2025, 'Active', 2236, 0.0, 73.15, 73.15, 0.15000000000000568),
('X0153', 'B005', 'Bergendal Boerdery', 'Bergendal', 2025, 'Active', 1151, 0.0, 42.76, 42.76, 0.0),
('C0333', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Ceder (Tuinskloof)', 2025, 'Active', 110, 89.0, 12.0, 101.0, 0.0),
('H2578', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Eikebos', 2025, 'Active', 42, 33.0, 9.0, 42.0, 0.0),
('HG0294', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Pruimboskloof', 2025, 'Active', 39, 37.0, 2.0, 39.0, 0.0),
('HG0306', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Sandfontein', 2025, 'Active', 28, 6.0, 24.0, 30.0, 0.0),
('HG0317', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Vredelust', 2025, 'Active', 62, 47.0, 10.0, 57.0, 0.0),
('V0088', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Welgemoed', 2025, 'Active', 150, 0.0, 109.0, 109.0, 0.0),
('W0332', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Wyzersdrift', 2025, 'Active', 22, 0.0, 26.0, 26.0, 0.0),
('C1135', 'B007', 'Bronaar Plase (Edms) Bpk', 'Uitkyk', 2025, 'Active', 489, 51.82, 0.0, 51.82, 0.0),
('C1134', 'B007', 'Bronaar Plase (Edms) Bpk', 'Ou muur', 2025, 'Active', 619, 56.92, 0.0, 56.92, 0.0),
('C1136', 'B007', 'Bronaar Plase (Edms) Bpk', 'Kleinfontein', 2025, 'Active', 439, 95.0, 0.0, 95.0, 0.0),
('C0386', 'B007', 'Bronaar Plase (Edms) Bpk', 'Bronaar', 2025, 'Active', 484, 47.0, 0.0, 47.0, 0.0),
('Unknown', 'C001', 'Ceres Tierberg Boerdery (Pty) Ltd', 'Tierberg', 2025, 'Active', 322.5997, 3.7, 0.0, 3.7, 2.2),
('Y1370', 'C002', 'Constitution Road Winegrowers (Pty) Ltd', 'Klipdrif', 2025, 'Active', 115, 0.0, 35.69, 35.69, 0.0),
('V0414', 'C003', 'Cortina Farm (Pty) Ltd', 'Cortina', 2025, 'Active', 52.58, 37.0, 0.0, 37.0, 0.0),
('HG0680', 'C003', 'Cortina Farm (Pty) Ltd', 'Burgh-ri Estate', 2025, 'Active', 48.7, 27.0, 0.0, 30.0, 2.15),
('Unknown', 'C005', 'CPCE INVESTMENT FUND', 'Boererus farm', 2025, 'Active', 84, 0.0, 37.531, 37.531, 0.0),
('C2945', 'C006', 'Crispy farming (Pty) Ltd', 'Vreeland', 2025, 'Active', 53, 42.0, 0.0, 42.0, 0.0),
('HG017', 'C006', 'Crispy farming (Pty) Ltd', 'Mfuleni', 2025, 'Active', 14, 13.73, 0.0, 13.73, 0.0),
('HG016', 'C006', 'Crispy farming (Pty) Ltd', 'La Rochelle', 2025, 'Active', 27, 26.25, 0.0, 26.25, 0.0),
('C3466', 'C006', 'Crispy farming (Pty) Ltd', 'Klein Pruise', 2025, 'Active', 91, 80.04, 0.0, 80.04, 0.0),
('C2853', 'C006', 'Crispy farming (Pty) Ltd', 'Eureka', 2025, 'Active', 50, 18.8, 0.0, 18.8, 0.0),
('C2887', 'C006', 'Crispy farming (Pty) Ltd', 'Coshla', 2025, 'Active', 29, 20.0, 0.0, 20.0, 0.0),
('V2709', 'D001', 'D&M Fresh (Pty) Ltd', 'Klipfontein', 2025, 'Active', 101.1088, 43.69, 0.0, 43.69, 0.0),
('P0778', 'D002', 'De Fynne Kwekery CC', 'Nooitgedacht', 2025, 'Active', 21.3, 0.0, 0.0, 0.0, 0.0),
('Y1007', 'D003', 'De Goree Farming (Pty) Ltd', 'Klaasvoogds', 2025, 'Active', 493.52, 3.4, 0.0, 3.4, 0.0),
('C2857', 'D004', 'Denou Farming (Pty) Ltd', 'Delta, Den Haag & Nuutbegin', 2025, 'Active', 687.21, 22.0, 51.0, 73.0, 0.0),
('V0453', 'D005', 'Destiny Boerdery Trust', 'Trelawney', 2025, 'Active', 'TBC', 10.0, 3.0, 13.0, 0.0),
('C3113', 'D006', 'DNG Boerdery (Pty) Ltd', 'Tweefontein 23 of 30', 2025, 'Active', 13.25, 4.2, 5.75, 9.95, 0.0),
('C0298', 'D007', 'Donkerbos Landgoed/ Eyethu Intaba', 'Disselfontein', 2025, 'Active', 1050, 103.08, 0.0, 103.08, 0.0),
('Y0514', 'D008', 'Doornkloof SEB (Pty) Ltd', 'Doornkloof', 2025, 'Active', 283, 1.69, 30.62, 32.31, 0.0),
('C0381', 'D009', 'Dwarsberg Farming (Pty) Ltd', 'Stinkfontein', 2025, 'Active', 77.5, 27.0, 13.0, 40.0, 0.0),
('V1116', 'E001', 'Elandsrivier Farming Company', 'Elandsrivier', 2025, 'Active', 150, 41.24, 0.0, 41.24, 0.0),
('Unknown', 'G001', 'George Bell', 'Withoek', 2025, 'Active', 365, 0.0, 21.700000000000003, 21.700000000000003, 0.0),
('Q0058', 'G002', 'GJJ Greeff Boerdery Edms Bpk', 'Harmonie Boerdery', 2025, 'Active', 230, 11.01, 0.0, 11.01, 0.0),
('Unknown', 'G003', 'Groundstone Group (Pty)Ltd', 'Bellvue', 2025, 'Active', 15, 0.0, 11.0, 11.0, 0.0),
('L7936', 'H001', 'Hoë-Uitsig Agricultural Primary Cooperation', 'Ongelegen', 2025, 'Active', 595.8954, 41.0, 0.0, 41.0, 0.0),
('C3435', 'H002', 'Howbill Farming (Pty) Ltd (TSR Bordery)', 'Kleinvlei', 2025, 'Active', 298, 12.53, 0.0, 12.53, 0.0),
('P1027', 'I001', 'Imibala Orchards (Pty) Ltd', 'Vergelegen', 2025, 'Active', 16.85, 9.0, 29.0, 38.0, 0.0),
('P0170', 'I001', 'Imibala Orchards (Pty) Ltd', 'Two Rivers', 2025, 'Active', 18, 1.0, 14.0, 15.0, 0.0),
('P1296', 'I001', 'Imibala Orchards (Pty) Ltd', 'The Junction', 2025, 'Active', 55, 0.0, 14.0, 14.0, 0.0),
('Unknown', 'I002', 'Indile Projects and Consulting Services', 'TBC', 2025, 'Active', 0, 0.0, 0.0, 0.0, 0.0),
('Unknown', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Weltevreden', 2025, 'Active', 42.36, 24.72, 0.0, 24.72, 3.28),
('E0768', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Valley Green', 2025, 'Active', 73.63, 47.0, 0.0, 47.0, 0.0),
('V0426', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Corner Farm', 2025, 'Active', 80.48, 40.0, 0.0, 40.0, 0.0),
('Unknown', 'J001', 'Jacobs Jam', 'Industrial Ceres', 2025, 'Active', 0.1, 0.0, 0.0, 0.0, 0.0),
('E1042', 'K001', 'Kaapschon Boerdery 35 (Edms) Bpk', 'Norham', 2025, 'Active', 144, 76.0, 0.0, 76.0, 0.0),
('E1047', 'K001', 'Kaapschon Boerdery 35 (Edms) Bpk', 'Dewhurst', 2025, NULL, NULL, NULL, NULL, NULL, NULL),
('C3479', 'K002', 'Kalos Farming (Pty) Ltd', 'Kaja Boerdery', 2025, 'Active', 63, 4.0, 9.0, 13.0, 0.0),
('C3371', 'K003', 'Kliprivier Kleinboere Trust', 'Kliprivier', 2025, 'Active', 51.2, 3.0, 0.0, 3.0, 0.0),
('Y0594', 'K004', 'KLP AGRI (Pty) Ltd', 'Mon Don', 2025, 'Active', 76.98, 0.0, 42.9, 42.9, 0.0),
('C3118', 'L001', 'La Vouere Stonefruit (Pty) Ltd', 'Tweefontein', 2025, 'Active', 109.66, 0.0, 37.07, 37.07, 0.0),
('M0795', 'L002', 'Laasterivier Boerdery (Pty) Ltd', 'Laasterivier', 2025, 'Active', 58, 18.0, 4.0, 22.0, 0.0),
('V0091', 'L003', 'Lakeview Farming (Pty) Ltd', 'Zeekoekraal', 2025, 'Active', 63, 30.0, 0.0, 30.0, 3.0),
('C1149', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Wydekloof', 2025, 'Active', 120, 104.0, 0.0, 104.0, 0.0),
('L0408', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Libertas', 2025, 'Active', 160, 19.0, 0.0, 19.0, 0.0),
('C0531', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Langrivier', 2025, 'Active', 168, 100.0, 29.0, 129.0, 0.0),
('C1111', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'De Meul', 2025, 'Active', 92, 85.0, 0.0, 85.0, 0.0),
('C1158', 'L005', 'Leopont Properties 484 (Pty) Ltd', 'Welgemeen', 2025, 'Active', 82, 57.0, 21.0, 78.0, 0.0),
('V1108', 'L006', 'Lingenfelder Broers BK', 'Rustfontein', 2025, 'Active', 172.1, 137.0, 3.0, 140.0, 0.0),
('C0228', 'L007', 'Loch Lynne (EDMS) BPK - Bokveldskloof ZZ2', 'Bokveldskloof', 2025, 'Active', 361, 117.0, 0.0, 117.0, 0.0),
('H0735', 'L008', 'Louis Lategan & Seuns Boerdery', 'Klaarfontein', 2025, 'Active', 0, 41.0, 11.0, 52.0, 0.0),
('HG092', 'M002', 'Misgund Oos Kleinboere Trust', 'Misgund Landgoed', 2025, 'Active', 98.5069, 28.83, 0.0, 28.83, 0.0),
('L0053', 'M002', 'Misgund Oos Kleinboere Trust', 'Laurita', 2025, 'Active', 65.1821, 39.0, 2.0, 41.0, 0.0),
('L0364', 'M004', 'Mistico Trading (Pty) Ltd', 'Appelkloof', 2025, 'Active', 669, 75.0, 0.0, 75.0, 0.0),
('Unknown', 'M005', 'Modulaqhowa Plant Nursery', 'Botshabelo', 2025, 'Active', 7, 3.0, 0.0, 3.0, 0.0),
('C0097', 'M006', 'Morceaux Boerdery (Pty) Ltd', 'Morceaux', 2025, 'Active', 87, 61.0, 8.0, 69.0, 0.0),
('T0342', 'M007', 'Motala Farming (Pty) Ltd', 'Waveren', 2025, 'Inactive', 57.17, 37.0, 0.0, 37.0, 0.0),
('Unknown', 'M008', 'Mouton Nursery', 'Morning star', 2025, 'Active', 122, 10.0, 0.0, 10.0, 0.0),
('D9283', 'M009', 'Mthombeni Family Trust', 'Kromkraans', 2025, 'Active', 217, 10.0, 0.0, 10.0, 0.0),
('Y0020', 'N001', 'Na-die-Oes Boerdery Trust', 'Na die Oes', 2025, 'Active', 2, 0.0, 0.42, 0.42, 0.0),
('V1012', 'N002', 'Nitaflo (Pty) Ltd', 'Protea', 2025, 'Active', 74.68, 38.0, 0.0, 38.0, 0.0),
('C2018', 'P001', 'Patrick De Wet Familie Trust', 'Stukkiewit', 2025, 'Active', 94.3195, 32.0, 23.0, 55.0, 0.0),
('HG066', 'P002', 'Poituers Boerdery BK', 'Haaswerf', 2025, 'Active', 83, 0.0, 11.0, 11.0, 0.0),
('Unknown', 'R001', 'Remmoho Investments', 'Stead Farm', 2025, 'Active', 428, 16.0, 0.0, 16.0, 8.0),
('L0408/L8068', 'R003', 'Rica''s Fruit (Pty) Ltd', 'Langfontein', 2025, 'Active', 393.0963, 71.34, 6.84, 78.18, 0.0),
('L0585', 'R004', 'Rixon Investments h/a Groendal Plase', 'Kleinrivier', 2025, 'Active', 66.98, 9.0, 0.0, 9.0, 0.0),
('HG041', 'R004', 'Rixon Investments h/a Groendal Plase', 'Groendal', 2025, 'Active', 41, 23.0, 0.0, 23.0, 0.0),
('HG040', 'R004', 'Rixon Investments h/a Groendal Plase', 'Die Nek', 2025, 'Active', 350, 21.0, 0.0, 21.0, 0.0),
('HG037', 'R004', 'Rixon Investments h/a Groendal Plase', 'Dagbreek', 2025, 'Active', 57, 14.0, 5.0, 19.0, 0.0),
('HG039', 'R004', 'Rixon Investments h/a Groendal Plase', 'Blou Swaan', 2025, 'Active', 93, 32.0, 2.0, 34.0, 0.0),
('L0585X', 'R005', 'Rovon Middelplaas (Pty) Ltd', 'Rovon Middelplaas', 2025, 'Active', 90, 58.0, 0.0, 58.0, 0.0),
('Unknown', 'S001', 'Schutz Group (Ntinga Dev. Agency)', 'Swartberg', 2025, 'Active', 500, 8.5, 5.5, 14.0, 0.0),
('H2610', 'S002', 'SH van der Horst (Pty) Ltd', 'Loufontein', 2025, 'Active', 1165, 31.0, 13.0, 44.0, 0.0),
('T0381', 'S003', 'Shiloh Holdings Investment (Pty) Ltd', 'Voorsorg', 2025, 'Active', 71.3, 29.35, 20.0, 49.35, 0.0),
('D15236', 'S004', 'Sinalo/ Kwasa Farming', 'TBC', 2025, 'Inactive', 7, 5.0, 0.0, 5.0, 0.0),
('C3453', 'S005', 'Stargrow Suikerbosrand JV', 'Suikerbosrand', 2025, 'Inactive', 0, 17.0, 0.0, 17.0, 0.0),
('Unknown', 'T001', 'Tauthitong (Pty) Ltd', 'Buffelsfontein Farm', 2025, 'Active', 320, 0.0, 10.0, 10.0, 0.0),
('E1017', 'T002', 'Thandi Estate', 'Lebanon Fruit farm', 2025, 'Active', 200, 24.93, 0.0, 24.93, 0.0),
('C0462', 'T003', 'Thembelitsha Farming (Pty) Ltd', 'Daytona', 2025, 'Active', 169, 0.0, 28.0, 28.0, 0.0),
('D14811', 'T004', 'Thobela Royale (Pty) Ltd', 'Aarnhemburg 155', 2025, 'Active', 100, 0.0, 28.0, 28.0, 12.71),
('M0780', 'T005', 'Tradouw Highlands (Pty) Ltd', 'Klipkuil', 2025, 'Active', 375.2203, 0.0, 26.0, 26.0, 0.0),
('C3337', 'T006', 'Trevors Boerdery (EDMS) BPK', 'Berberhoek', 2025, 'Active', 34, 8.0, 13.0, 21.0, 0.0),
('HG0554', 'T007', 'Tulpieskraal Werknemers Trust', 'Tulpieskraal Werknemers Trust', 2025, 'Active', 25, 16.0, 0.0, 16.0, 0.0),
('V0317', 'U001', 'Uitvlugt Boerdery Trust', 'Uitvlugt', 2025, 'Active', 162.74, 42.0, 0.0, 42.0, 0.0),
('M0001', 'V001', 'Vredehoek Kwekery', 'Rietvlei No 1 (Vredehoek)', 2025, 'Active', 0, 0.0, 0.0, 0.0, 0.0),
('HG145', 'W001', 'Warme Water', 'Yeyethu', 2025, 'Active', 10, 0.0, 3.0, 3.0, 0.0),
('C3291', 'W002', 'Witzenberg Deelnemings  Trust', 'Hillsight', 2025, 'Active', 57.4, 0.0, 5.0, 4.0, 0.0),
('D17020', 'A002', 'Afrikan Farms (Pty) Ltd', 'Kleinfontein Plaas', 'Baseline 2024', 'Active', 4783, 4.0, 0.0, 4.0, 0.0),
('C3380', 'A003', 'Alona Fresh Produce (Pty) Ltd', 'Alona', 'Baseline 2024', 'Active', 8.25, 0.0, 0.0, 0.0, 0.0),
('V0308', 'A004', 'Altius Trading (Pty) Ltd', 'Klein Ezeljacht', 'Baseline 2024', 'Active', 871, 53.0, 0.0, 53.0, 0.0),
('V0299', 'A005', 'Amanzi Farming CC (Pty) Ltd', 'Nooigedagt', 'Baseline 2024', 'Active', 211, 24.43, 0.0, 24.43, 0.0),
('L0351', 'A006', 'Anhalt Boerdery (Pty) Ltd', 'Anhalt', 'Baseline 2024', 'Active', 563, 78.0, 0.0, 78.0, 0.0),
('C1129', 'A007', 'Arborlane Estates (Edms) Bpk 1', 'Weltevrede', 'Baseline 2024', 'Active', 969, 78.09, 0.0, 78.09, 0.0),
('C1130', 'A007', 'Arborlane Estates (Edms) Bpk 1', 'Tweefontein', 'Baseline 2024', 'Active', 100, 67.0, 18.0, 85.0, 0.0),
('E0120', 'A008', 'Arieskraal Estate (Pty) Ltd', 'Arieskraal', 'Baseline 2024', 'Active', 307, 180.0, 0.0, 180.0, 0.0),
('Y1200', 'B001', 'B & C Fourie Boerdery', 'Gelukshoop', 'Baseline 2024', 'Active', 4, 0.0, 2.0, 2.0, 0.0),
('X1306', 'B002', 'Bambisane Farming (Pty) Ltd', 'Slangfontein', 'Baseline 2024', 'Active', 1009.4251, 14.100000000000001, 0.0, 14.100000000000001, 1.3),
('Unknown', 'B003', 'Becca Farming Projects (Pty) Ltd', 'Wonderhoek', 'Baseline 2024', 'Active', 123, 0.0, 75.0, 75.0, 0.0),
('V1073', 'B004', 'Belleview Agricultural Co-Operative Limited', 'Waterval 72', 'Baseline 2024', 'Active', 56.14, 42.3, 0.0, 42.3, 0.0),
('X1254', 'B005', 'Bergendal Boerdery', 'Maanskloof', 'Baseline 2024', 'Active', 2236, 0.0, 73.15, 73.15, 0.15000000000000568),
('X0153', 'B005', 'Bergendal Boerdery', 'Bergendal', 'Baseline 2024', 'Active', 1151, 0.0, 42.76, 42.76, 0.0),
('C0333', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Ceder (Tuinskloof)', 'Baseline 2024', 'Active', 110, 89.0, 12.0, 101.0, 0.0),
('H2578', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Eikebos', 'Baseline 2024', 'Active', 42, 33.0, 9.0, 42.0, 0.0),
('HG0294', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Pruimboskloof', 'Baseline 2024', 'Active', 39, 37.0, 2.0, 39.0, 0.0),
('HG0306', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Sandfontein', 'Baseline 2024', 'Active', 28, 6.0, 24.0, 30.0, 0.0),
('HG0317', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Vredelust', 'Baseline 2024', 'Active', 62, 47.0, 10.0, 57.0, 0.0),
('V0088', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Welgemoed', 'Baseline 2024', 'Active', 150, 0.0, 109.0, 109.0, 0.0),
('W0332', 'B006', 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Wyzersdrift', 'Baseline 2024', 'Active', 22, 0.0, 26.0, 26.0, 0.0),
('C1135', 'B007', 'Bronaar Plase (Edms) Bpk', 'Uitkyk', 'Baseline 2024', 'Active', 489, 51.82, 0.0, 51.82, 0.0),
('C1134', 'B007', 'Bronaar Plase (Edms) Bpk', 'Ou muur', 'Baseline 2024', 'Active', 619, 56.92, 0.0, 56.92, 0.0),
('C1136', 'B007', 'Bronaar Plase (Edms) Bpk', 'Kleinfontein', 'Baseline 2024', 'Active', 439, 95.0, 0.0, 95.0, 0.0),
('C0386', 'B007', 'Bronaar Plase (Edms) Bpk', 'Bronaar', 'Baseline 2024', 'Active', 484, 47.0, 0.0, 47.0, 0.0),
('Unknown', 'C001', 'Ceres Tierberg Boerdery (Pty) Ltd', 'Tierberg', 'Baseline 2024', 'Active', 322.5997, 3.7, 0.0, 3.7, 2.2),
('Y1370', 'C002', 'Constitution Road Winegrowers (Pty) Ltd', 'Klipdrif', 'Baseline 2024', 'Active', 115, 0.0, 35.69, 35.69, 0.0),
('V0414', 'C003', 'Cortina Farm (Pty) Ltd', 'Cortina', 'Baseline 2024', 'Active', 52.58, 37.0, 0.0, 37.0, 0.0),
('HG0680', 'C003', 'Cortina Farm (Pty) Ltd', 'Burgh-ri Estate', 'Baseline 2024', 'Active', 48.7, 27.0, 0.0, 30.0, 2.15),
('Unknown', 'C005', 'CPCE INVESTMENT FUND', 'Boererus farm', 'Baseline 2024', 'Active', 84, 0.0, 37.531, 37.531, 0.0),
('C2945', 'C006', 'Crispy farming (Pty) Ltd', 'Vreeland', 'Baseline 2024', 'Active', 53, 42.0, 0.0, 42.0, 0.0),
('HG017', 'C006', 'Crispy farming (Pty) Ltd', 'Mfuleni', 'Baseline 2024', 'Active', 14, 13.73, 0.0, 13.73, 0.0),
('HG016', 'C006', 'Crispy farming (Pty) Ltd', 'La Rochelle', 'Baseline 2024', 'Active', 27, 26.25, 0.0, 26.25, 0.0),
('C3466', 'C006', 'Crispy farming (Pty) Ltd', 'Klein Pruise', 'Baseline 2024', 'Active', 91, 80.04, 0.0, 80.04, 0.0),
('C2853', 'C006', 'Crispy farming (Pty) Ltd', 'Eureka', 'Baseline 2024', 'Active', 50, 18.8, 0.0, 18.8, 0.0),
('C2887', 'C006', 'Crispy farming (Pty) Ltd', 'Coshla', 'Baseline 2024', 'Active', 29, 20.0, 0.0, 20.0, 0.0),
('V2709', 'D001', 'D&M Fresh (Pty) Ltd', 'Klipfontein', 'Baseline 2024', 'Active', 101.1088, 43.69, 0.0, 43.69, 0.0),
('P0778', 'D002', 'De Fynne Kwekery CC', 'Nooitgedacht', 'Baseline 2024', 'Active', 21.3, 0.0, 0.0, 0.0, 0.0),
('Y1007', 'D003', 'De Goree Farming (Pty) Ltd', 'Klaasvoogds', 'Baseline 2024', 'Active', 493.52, 3.4, 0.0, 3.4, 0.0),
('C2857', 'D004', 'Denou Farming (Pty) Ltd', 'Delta, Den Haag & Nuutbegin', 'Baseline 2024', 'Active', 687.21, 22.0, 51.0, 73.0, 0.0),
('V0453', 'D005', 'Destiny Boerdery Trust', 'Trelawney', 'Baseline 2024', 'Active', 'TBC', 10.0, 3.0, 13.0, 0.0),
('C3113', 'D006', 'DNG Boerdery (Pty) Ltd', 'Tweefontein 23 of 30', 'Baseline 2024', 'Active', 13.25, 4.2, 5.75, 9.95, 0.0),
('C0298', 'D007', 'Donkerbos Landgoed/ Eyethu Intaba', 'Disselfontein', 'Baseline 2024', 'Active', 1050, 103.08, 0.0, 103.08, 0.0),
('Y0514', 'D008', 'Doornkloof SEB (Pty) Ltd', 'Doornkloof', 'Baseline 2024', 'Active', 283, 1.69, 30.62, 32.31, 0.0),
('C0381', 'D009', 'Dwarsberg Farming (Pty) Ltd', 'Stinkfontein', 'Baseline 2024', 'Active', 77.5, 27.0, 13.0, 40.0, 0.0),
('V1116', 'E001', 'Elandsrivier Farming Company', 'Elandsrivier', 'Baseline 2024', 'Active', 150, 41.24, 0.0, 41.24, 0.0),
('Unknown', 'G001', 'George Bell', 'Withoek', 'Baseline 2024', 'Active', 365, 0.0, 21.700000000000003, 21.700000000000003, 0.0),
('Q0058', 'G002', 'GJJ Greeff Boerdery Edms Bpk', 'Harmonie Boerdery', 'Baseline 2024', 'Active', 230, 11.01, 0.0, 11.01, 0.0),
('Unknown', 'G003', 'Groundstone Group (Pty)Ltd', 'Bellvue', 'Baseline 2024', 'Active', 15, 0.0, 11.0, 11.0, 0.0),
('L7936', 'H001', 'Hoë-Uitsig Agricultural Primary Cooperation', 'Ongelegen', 'Baseline 2024', 'Active', 595.8954, 41.0, 0.0, 41.0, 0.0),
('C3435', 'H002', 'Howbill Farming (Pty) Ltd (TSR Bordery)', 'Kleinvlei', 'Baseline 2024', 'Active', 298, 12.53, 0.0, 12.53, 0.0),
('P1027', 'I001', 'Imibala Orchards (Pty) Ltd', 'Vergelegen', 'Baseline 2024', 'Active', 16.85, 9.0, 29.0, 38.0, 0.0),
('P0170', 'I001', 'Imibala Orchards (Pty) Ltd', 'Two Rivers', 'Baseline 2024', 'Active', 18, 1.0, 14.0, 15.0, 0.0),
('P1296', 'I001', 'Imibala Orchards (Pty) Ltd', 'The Junction', 'Baseline 2024', 'Active', 55, 0.0, 14.0, 14.0, 0.0),
('Unknown', 'I002', 'Indile Projects and Consulting Services', 'TBC', 'Baseline 2024', 'Active', 0, 0.0, 0.0, 0.0, 0.0),
('Unknown', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Weltevreden', 'Baseline 2024', 'Active', 42.36, 24.72, 0.0, 24.72, 3.28),
('E0768', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Valley Green', 'Baseline 2024', 'Active', 73.63, 47.0, 0.0, 47.0, 0.0),
('V0426', 'I003', 'Ithemba Elitsha Farming (Pty) Ltd', 'Corner Farm', 'Baseline 2024', 'Active', 80.48, 40.0, 0.0, 40.0, 0.0),
('Unknown', 'J001', 'Jacobs Jam', 'Industrial Ceres', 'Baseline 2024', 'Active', 0.1, 0.0, 0.0, 0.0, 0.0),
('E1042', 'K001', 'Kaapschon Boerdery 35 (Edms) Bpk', 'Norham', 'Baseline 2024', 'Active', 144, 76.0, 0.0, 76.0, 0.0),
('E1047', 'K001', 'Kaapschon Boerdery 35 (Edms) Bpk', 'Dewhurst', 'Baseline 2024', NULL, NULL, NULL, NULL, NULL, NULL),
('C3479', 'K002', 'Kalos Farming (Pty) Ltd', 'Kaja Boerdery', 'Baseline 2024', 'Active', 63, 4.0, 9.0, 13.0, 0.0),
('C3371', 'K003', 'Kliprivier Kleinboere Trust', 'Kliprivier', 'Baseline 2024', 'Active', 51.2, 3.0, 0.0, 3.0, 0.0),
('Y0594', 'K004', 'KLP AGRI (Pty) Ltd', 'Mon Don', 'Baseline 2024', 'Active', 76.98, 0.0, 42.9, 42.9, 0.0),
('C3118', 'L001', 'La Vouere Stonefruit (Pty) Ltd', 'Tweefontein', 'Baseline 2024', 'Active', 109.66, 0.0, 37.07, 37.07, 0.0),
('M0795', 'L002', 'Laasterivier Boerdery (Pty) Ltd', 'Laasterivier', 'Baseline 2024', 'Active', 58, 18.0, 4.0, 22.0, 0.0),
('V0091', 'L003', 'Lakeview Farming (Pty) Ltd', 'Zeekoekraal', 'Baseline 2024', 'Active', 63, 30.0, 0.0, 30.0, 3.0),
('C1149', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Wydekloof', 'Baseline 2024', 'Active', 120, 104.0, 0.0, 104.0, 0.0),
('L0408', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Libertas', 'Baseline 2024', 'Active', 160, 19.0, 0.0, 19.0, 0.0),
('C0531', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'Langrivier', 'Baseline 2024', 'Active', 168, 100.0, 29.0, 129.0, 0.0),
('C1111', 'L004', 'Langrivier Boerdery (Edms) Bpk', 'De Meul', 'Baseline 2024', 'Active', 92, 85.0, 0.0, 85.0, 0.0),
('C1158', 'L005', 'Leopont Properties 484 (Pty) Ltd', 'Welgemeen', 'Baseline 2024', 'Active', 82, 57.0, 21.0, 78.0, 0.0),
('V1108', 'L006', 'Lingenfelder Broers BK', 'Rustfontein', 'Baseline 2024', 'Active', 172.1, 137.0, 3.0, 140.0, 0.0),
('C0228', 'L007', 'Loch Lynne (EDMS) BPK - Bokveldskloof ZZ2', 'Bokveldskloof', 'Baseline 2024', 'Active', 361, 117.0, 0.0, 117.0, 0.0),
('H0735', 'L008', 'Louis Lategan & Seuns Boerdery', 'Klaarfontein', 'Baseline 2024', 'Active', 0, 41.0, 11.0, 52.0, 0.0),
('HG092', 'M002', 'Misgund Oos Kleinboere Trust', 'Misgund Landgoed', 'Baseline 2024', 'Active', 98.5069, 28.83, 0.0, 28.83, 0.0),
('L0053', 'M002', 'Misgund Oos Kleinboere Trust', 'Laurita', 'Baseline 2024', 'Active', 65.1821, 39.0, 2.0, 41.0, 0.0),
('L0364', 'M004', 'Mistico Trading (Pty) Ltd', 'Appelkloof', 'Baseline 2024', 'Active', 669, 75.0, 0.0, 75.0, 0.0),
('Unknown', 'M005', 'Modulaqhowa Plant Nursery', 'Botshabelo', 'Baseline 2024', 'Active', 7, 3.0, 0.0, 3.0, 0.0),
('C0097', 'M006', 'Morceaux Boerdery (Pty) Ltd', 'Morceaux', 'Baseline 2024', 'Active', 87, 61.0, 8.0, 69.0, 0.0),
('T0342', 'M007', 'Motala Farming (Pty) Ltd', 'Waveren', 'Baseline 2024', 'Inactive', 57.17, 37.0, 0.0, 37.0, 0.0),
('Unknown', 'M008', 'Mouton Nursery', 'Morning star', 'Baseline 2024', 'Active', 122, 10.0, 0.0, 10.0, 0.0),
('D9283', 'M009', 'Mthombeni Family Trust', 'Kromkraans', 'Baseline 2024', 'Active', 217, 10.0, 0.0, 10.0, 0.0),
('Y0020', 'N001', 'Na-die-Oes Boerdery Trust', 'Na die Oes', 'Baseline 2024', 'Active', 2, 0.0, 0.42, 0.42, 0.0),
('V1012', 'N002', 'Nitaflo (Pty) Ltd', 'Protea', 'Baseline 2024', 'Active', 74.68, 38.0, 0.0, 38.0, 0.0),
('C2018', 'P001', 'Patrick De Wet Familie Trust', 'Stukkiewit', 'Baseline 2024', 'Active', 94.3195, 32.0, 23.0, 55.0, 0.0),
('HG066', 'P002', 'Poituers Boerdery BK', 'Haaswerf', 'Baseline 2024', 'Active', 83, 0.0, 11.0, 11.0, 0.0),
('Unknown', 'R001', 'Remmoho Investments', 'Stead Farm', 'Baseline 2024', 'Active', 428, 16.0, 0.0, 16.0, 8.0),
('L0408/L8068', 'R003', 'Rica''s Fruit (Pty) Ltd', 'Langfontein', 'Baseline 2024', 'Active', 393.0963, 71.34, 6.84, 78.18, 0.0),
('L0585', 'R004', 'Rixon Investments h/a Groendal Plase', 'Kleinrivier', 'Baseline 2024', 'Active', 66.98, 9.0, 0.0, 9.0, 0.0),
('HG041', 'R004', 'Rixon Investments h/a Groendal Plase', 'Groendal', 'Baseline 2024', 'Active', 41, 23.0, 0.0, 23.0, 0.0),
('HG040', 'R004', 'Rixon Investments h/a Groendal Plase', 'Die Nek', 'Baseline 2024', 'Active', 350, 21.0, 0.0, 21.0, 0.0),
('HG037', 'R004', 'Rixon Investments h/a Groendal Plase', 'Dagbreek', 'Baseline 2024', 'Active', 57, 14.0, 5.0, 19.0, 0.0),
('HG039', 'R004', 'Rixon Investments h/a Groendal Plase', 'Blou Swaan', 'Baseline 2024', 'Active', 93, 32.0, 2.0, 34.0, 0.0),
('L0585X', 'R005', 'Rovon Middelplaas (Pty) Ltd', 'Rovon Middelplaas', 'Baseline 2024', 'Active', 90, 58.0, 0.0, 58.0, 0.0),
('Unknown', 'S001', 'Schutz Group (Ntinga Dev. Agency)', 'Swartberg', 'Baseline 2024', 'Active', 500, 8.5, 5.5, 14.0, 0.0),
('H2610', 'S002', 'SH van der Horst (Pty) Ltd', 'Loufontein', 'Baseline 2024', 'Active', 1165, 31.0, 13.0, 44.0, 0.0),
('T0381', 'S003', 'Shiloh Holdings Investment (Pty) Ltd', 'Voorsorg', 'Baseline 2024', 'Active', 71.3, 29.35, 20.0, 49.35, 0.0),
('D15236', 'S004', 'Sinalo/ Kwasa Farming', 'TBC', 'Baseline 2024', 'Inactive', 7, 5.0, 0.0, 5.0, 0.0),
('C3453', 'S005', 'Stargrow Suikerbosrand JV', 'Suikerbosrand', 'Baseline 2024', 'Inactive', 0, 17.0, 0.0, 17.0, 0.0),
('Unknown', 'T001', 'Tauthitong (Pty) Ltd', 'Buffelsfontein Farm', 'Baseline 2024', 'Active', 320, 0.0, 10.0, 10.0, 0.0),
('E1017', 'T002', 'Thandi Estate', 'Lebanon Fruit farm', 'Baseline 2024', 'Active', 200, 24.93, 0.0, 24.93, 0.0),
('C0462', 'T003', 'Thembelitsha Farming (Pty) Ltd', 'Daytona', 'Baseline 2024', 'Active', 169, 0.0, 28.0, 28.0, 0.0),
('D14811', 'T004', 'Thobela Royale (Pty) Ltd', 'Aarnhemburg 155', 'Baseline 2024', 'Active', 100, 0.0, 28.0, 28.0, 12.71),
('M0780', 'T005', 'Tradouw Highlands (Pty) Ltd', 'Klipkuil', 'Baseline 2024', 'Active', 375.2203, 0.0, 26.0, 26.0, 0.0),
('C3337', 'T006', 'Trevors Boerdery (EDMS) BPK', 'Berberhoek', 'Baseline 2024', 'Active', 34, 8.0, 13.0, 21.0, 0.0),
('HG0554', 'T007', 'Tulpieskraal Werknemers Trust', 'Tulpieskraal Werknemers Trust', 'Baseline 2024', 'Active', 25, 16.0, 0.0, 16.0, 0.0),
('V0317', 'U001', 'Uitvlugt Boerdery Trust', 'Uitvlugt', 'Baseline 2024', 'Active', 162.74, 42.0, 0.0, 42.0, 0.0),
('M0001', 'V001', 'Vredehoek Kwekery', 'Rietvlei No 1 (Vredehoek)', 'Baseline 2024', 'Active', 0, 0.0, 0.0, 0.0, 0.0),
('HG145', 'W001', 'Warme Water', 'Yeyethu', 'Baseline 2024', 'Active', 10, 0.0, 3.0, 3.0, 0.0),
('C3291', 'W002', 'Witzenberg Deelnemings  Trust', 'Hillsight', 'Baseline 2024', 'Active', 57.4, 0.0, 5.0, 4.0, 0.0);

alter table entities add column if not exists external_code text;
alter table farms add column if not exists external_code text;

delete from farms where external_code is not null;
delete from entities where external_code is not null;

insert into entities (id, name, type, region, province, latitude, longitude, contact_person, contact_email, contact_phone, is_active, is_deleted, created_at, updated_at, external_code)
  select gen_random_uuid(), 'A&B Williams Trust', 'Processing', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A001'
  union all
  select gen_random_uuid(), 'Afrikan Farms (Pty) Ltd', 'Producer', 'Amersfoort', 'Mpumalanga', null, null, '', '', '', 1, false, now(), now(), 'A002'
  union all
  select gen_random_uuid(), 'Alona Fresh Produce (Pty) Ltd', 'Processing', 'BOTRIVIER', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A003'
  union all
  select gen_random_uuid(), 'Altius Trading (Pty) Ltd', 'Producer', 'Caledon', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A004'
  union all
  select gen_random_uuid(), 'Amanzi Farming CC (Pty) Ltd', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A005'
  union all
  select gen_random_uuid(), 'Anhalt Boerdery (Pty) Ltd', 'Producer', 'Haarlem', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A006'
  union all
  select gen_random_uuid(), 'Arborlane Estates (Edms) Bpk 1', 'Producer', 'KOUE-BOKKEVELD', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A007'
  union all
  select gen_random_uuid(), 'Arieskraal Estate (Pty) Ltd', 'Producer', NULL, 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'A008'
  union all
  select gen_random_uuid(), 'B & C Fourie Boerdery', 'Producer', 'Bonnievale', 'Western Cape', null, null, '', '', '', 0, false, now(), now(), 'B001'
  union all
  select gen_random_uuid(), 'Bambisane Farming (Pty) Ltd', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'B002'
  union all
  select gen_random_uuid(), 'Becca Farming Projects (Pty) Ltd', 'Producer', 'Middelburg', 'Mpumalanga', null, null, '', '', '', 1, false, now(), now(), 'B003'
  union all
  select gen_random_uuid(), 'Belleview Agricultural Co-Operative Limited', 'Producer', 'Villiersdorp', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'B004'
  union all
  select gen_random_uuid(), 'Bergendal Boerdery', 'Producer', 'CITRUSDAL', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'B005'
  union all
  select gen_random_uuid(), 'Bokkeveld Partnerships T/A Ceder Fruit Farms', 'Producer', 'VILLIERSDORP', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'B006'
  union all
  select gen_random_uuid(), 'Bronaar Plase (Edms) Bpk', 'Producer', 'KOUE-BOKKEVELD', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'B007'
  union all
  select gen_random_uuid(), 'Ceres Tierberg Boerdery (Pty) Ltd', 'Producer', 'KoueBoekeveld', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C001'
  union all
  select gen_random_uuid(), 'Constitution Road Winegrowers (Pty) Ltd', 'Producer', 'ROBERTSON', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C002'
  union all
  select gen_random_uuid(), 'Cortina Farm (Pty) Ltd', 'Producer', 'VYEBOOM', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C003'
  union all
  select gen_random_uuid(), 'Cortina Farm (Pty) Ltd', 'Processing', 'VYEBOOM', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C004'
  union all
  select gen_random_uuid(), 'CPCE INVESTMENT FUND', 'Producer', 'Motagu', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C005'
  union all
  select gen_random_uuid(), 'Crispy farming (Pty) Ltd', 'Producer/Processing', 'CERES', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'C006'
  union all
  select gen_random_uuid(), 'D&M Fresh (Pty) Ltd', 'Producer/Processing', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D001'
  union all
  select gen_random_uuid(), 'De Fynne Kwekery CC', 'Input provider', 'R45Road,Paarl', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D002'
  union all
  select gen_random_uuid(), 'De Goree Farming (Pty) Ltd', 'Producer', 'Rovertson', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D003'
  union all
  select gen_random_uuid(), 'Denou Farming (Pty) Ltd', 'Producer', 'PRINCE ALFRED HAMLET', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D004'
  union all
  select gen_random_uuid(), 'Destiny Boerdery Trust', 'Producer', 'VYEBOOM', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D005'
  union all
  select gen_random_uuid(), 'DNG Boerdery (Pty) Ltd', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D006'
  union all
  select gen_random_uuid(), 'Donkerbos Landgoed/ Eyethu Intaba', 'Producer', 'Koue Bokkeveld', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D007'
  union all
  select gen_random_uuid(), 'Doornkloof SEB (Pty) Ltd', 'Producer', 'Laingsurg', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D008'
  union all
  select gen_random_uuid(), 'Dwarsberg Farming (Pty) Ltd', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'D009'
  union all
  select gen_random_uuid(), 'Elandsrivier Farming Company', 'Producer', 'VILLIERSDORP', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'E001'
  union all
  select gen_random_uuid(), 'George Bell', 'Producer', 'Caltzdorp', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'G001'
  union all
  select gen_random_uuid(), 'GJJ Greeff Boerdery Edms Bpk', 'Producer', 'Piketberg', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'G002'
  union all
  select gen_random_uuid(), 'Groundstone Group (Pty)Ltd', 'Producer', 'Zebediela', 'Limpopo', null, null, '', '', '', 1, false, now(), now(), 'G003'
  union all
  select gen_random_uuid(), 'Hoë-Uitsig Agricultural Primary Cooperation', 'Producer', 'Misgund', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'H001'
  union all
  select gen_random_uuid(), 'Howbill Farming (Pty) Ltd (TSR Bordery)', 'Producer', 'Koue Bokkeveld', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'H002'
  union all
  select gen_random_uuid(), 'Imibala Orchards (Pty) Ltd', 'Producer', 'Groot Drakenstein', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'I001'
  union all
  select gen_random_uuid(), 'Indile Projects and Consulting Services', 'Producer', NULL, 'North West', null, null, '', '', '', 1, false, now(), now(), 'I002'
  union all
  select gen_random_uuid(), 'Ithemba Elitsha Farming (Pty) Ltd', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'I003'
  union all
  select gen_random_uuid(), 'Ithemba Elitsha Farming (Pty) Ltd', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'I004'
  union all
  select gen_random_uuid(), 'Jacobs Jam', 'Processing', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'J001'
  union all
  select gen_random_uuid(), 'Kaapschon Boerdery 35 (Edms) Bpk', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'K001'
  union all
  select gen_random_uuid(), 'Kalos Farming (Pty) Ltd', 'Producer', 'PRINCE ALFRED HAMLET', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'K002'
  union all
  select gen_random_uuid(), 'Kliprivier Kleinboere Trust', 'Producer', 'Wolseley', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'K003'
  union all
  select gen_random_uuid(), 'KLP AGRI (Pty) Ltd', 'Producer/Processing', 'ROBERTSON', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'K004'
  union all
  select gen_random_uuid(), 'La Vouere Stonefruit (Pty) Ltd', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L001'
  union all
  select gen_random_uuid(), 'Laasterivier Boerdery (Pty) Ltd', 'Producer', 'Montagu', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L002'
  union all
  select gen_random_uuid(), 'Lakeview Farming (Pty) Ltd', 'Producer', 'Villiersdorp', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L003'
  union all
  select gen_random_uuid(), 'Langrivier Boerdery (Edms) Bpk', 'Producer', 'Koue-Bokkeveld', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L004'
  union all
  select gen_random_uuid(), 'Leopont Properties 484 (Pty) Ltd', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L005'
  union all
  select gen_random_uuid(), 'Lingenfelder Broers BK', 'Producer', 'Rusfontein', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L006'
  union all
  select gen_random_uuid(), 'Loch Lynne (EDMS) BPK 
Bokveldskloof ZZ2', 'Producer', 'KoueBokkeveld', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L007'
  union all
  select gen_random_uuid(), 'Louis Lategan & Seuns Boerdery', 'Producer', 'BREËRIVIER', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'L008'
  union all
  select gen_random_uuid(), 'Mafube Fresh (Pty) Ltd', 'Marketing', 'Tygervalley', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'M001'
  union all
  select gen_random_uuid(), 'Misgund Oos Kleinboere Trust', 'Producer', 'Misgund', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'M002'
  union all
  select gen_random_uuid(), 'Misgund Oos Kleinboere Trust', 'Producer', 'Misgund', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'M003'
  union all
  select gen_random_uuid(), 'Mistico Trading (Pty) Ltd', 'Producer', 'Haarlem', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'M004'
  union all
  select gen_random_uuid(), 'Modulaqhowa Plant Nursery', 'Input provider', 'Botshabelo', 'Free State', null, null, '', '', '', 1, false, now(), now(), 'M005'
  union all
  select gen_random_uuid(), 'Morceaux Boerdery (Pty) Ltd', 'Producer', 'CERES', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'M006'
  union all
  select gen_random_uuid(), 'Motala Farming (Pty) Ltd', 'Producer', 'Wolseley', 'Western Cape', null, null, '', '', '', 0, false, now(), now(), 'M007'
  union all
  select gen_random_uuid(), 'Mouton Nursery', 'Input provider', 'Riviersonderend', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'M008'
  union all
  select gen_random_uuid(), 'Mthombeni Family Trust', 'Producer', 'Hendrina', 'Mpumalanga', null, null, '', '', '', 1, false, now(), now(), 'M009'
  union all
  select gen_random_uuid(), 'Na-die-Oes Boerdery Trust', 'Producer', 'Bonnievale', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'N001'
  union all
  select gen_random_uuid(), 'Nitaflo (Pty) Ltd', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'N002'
  union all
  select gen_random_uuid(), 'Patrick De Wet Familie Trust', 'Producer/Processing', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'P001'
  union all
  select gen_random_uuid(), 'Poituers Boerdery BK', 'Producer', 'PRINCE ALFRED HAMLET', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'P002'
  union all
  select gen_random_uuid(), 'Remmoho Investments', 'Producer', 'Bethlehem', 'Free State', null, null, '', '', '', 1, false, now(), now(), 'R001'
  union all
  select gen_random_uuid(), 'Rhoda''s Market Agency', 'Marketing', 'Cape Town', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'R002'
  union all
  select gen_random_uuid(), 'Rica''s Fruit (Pty) Ltd', 'Producer/Processing', 'Haarlem', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'R003'
  union all
  select gen_random_uuid(), 'Rixon Investments h/a Groendal Plase', 'Producer', 'Misgund', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'R004'
  union all
  select gen_random_uuid(), 'Rovon Middelplaas (Pty) Ltd', 'Producer', 'Louterwater', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'R005'
  union all
  select gen_random_uuid(), 'Schutz Group (Ntinga Dev. Agency)', 'Producer', 'Rosebank', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'S001'
  union all
  select gen_random_uuid(), 'SH van der Horst (Pty) Ltd', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'S002'
  union all
  select gen_random_uuid(), 'Shiloh Holdings Investment (Pty) Ltd', 'Producer', 'Wolselry', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'S003'
  union all
  select gen_random_uuid(), 'Sinalo/ Kwasa Farming', 'Producer', NULL, 'Mpumalanga', null, null, '', '', '', 0, false, now(), now(), 'S004'
  union all
  select gen_random_uuid(), 'Stargrow Suikerbosrand JV', 'Producer/ Input provider', 'Stellenbosch', 'Western Cape', null, null, '', '', '', 0, false, now(), now(), 'S005'
  union all
  select gen_random_uuid(), 'Tauthitong (Pty) Ltd', 'Producer', NULL, 'North West', null, null, '', '', '', 1, false, now(), now(), 'T001'
  union all
  select gen_random_uuid(), 'Thandi Estate', 'Producer', 'Grabouw', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'T002'
  union all
  select gen_random_uuid(), 'Thembelitsha Farming (Pty) Ltd', 'Producer', 'Prince Alfred Hamlet', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'T003'
  union all
  select gen_random_uuid(), 'Thobela Royale (Pty) Ltd', 'Producer', NULL, 'Mpumalanga', null, null, '', '', '', 1, false, now(), now(), 'T004'
  union all
  select gen_random_uuid(), 'Tradouw Highlands (Pty) Ltd', 'Producer', 'Montagu', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'T005'
  union all
  select gen_random_uuid(), 'Trevors Boerdery (EDMS) BPK', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'T006'
  union all
  select gen_random_uuid(), 'Tulpieskraal Werknemers Trust', 'Producer', 'Joubertina', 'Eastern Cape', null, null, '', '', '', 1, false, now(), now(), 'T007'
  union all
  select gen_random_uuid(), 'Uitvlugt Boerdery Trust', 'Producer', 'Villiersdorp', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'U001'
  union all
  select gen_random_uuid(), 'Vredehoek Kwekery', 'Input provider', 'Montagu', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'V001'
  union all
  select gen_random_uuid(), 'Warme Water', 'Producer', 'Montagu', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'W001'
  union all
  select gen_random_uuid(), 'Witzenberg Deelnemings  Trust', 'Producer', 'Ceres', 'Western Cape', null, null, '', '', '', 1, false, now(), now(), 'W002';

insert into farms (id, name, entity_id, hectares, crop_types, region, province, latitude, longitude, is_active, is_deleted, created_at, updated_at, external_code)
  select gen_random_uuid(), 'Kleinfontein Plaas', e.id, 4.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'D17020' from entities e where e.contact_person = 'A002'
  union all
  select gen_random_uuid(), 'Alona', e.id, 0.0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3380' from entities e where e.contact_person = 'A003'
  union all
  select gen_random_uuid(), 'Klein Ezeljacht', e.id, 53.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0308' from entities e where e.contact_person = 'A004'
  union all
  select gen_random_uuid(), 'Nooigedagt', e.id, 24.43, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0299' from entities e where e.contact_person = 'A005'
  union all
  select gen_random_uuid(), 'Anhalt', e.id, 78.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0351' from entities e where e.contact_person = 'A006'
  union all
  select gen_random_uuid(), 'Weltevrede', e.id, 78.09, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1129' from entities e where e.contact_person = 'A007'
  union all
  select gen_random_uuid(), 'Tweefontein', e.id, 85.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1130' from entities e where e.contact_person = 'A007'
  union all
  select gen_random_uuid(), 'Arieskraal', e.id, 180.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'E0120' from entities e where e.contact_person = 'A008'
  union all
  select gen_random_uuid(), 'Gelukshoop', e.id, 2.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y1200' from entities e where e.contact_person = 'B001'
  union all
  select gen_random_uuid(), 'Slangfontein', e.id, 14.100000000000001, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'X1306' from entities e where e.contact_person = 'B002'
  union all
  select gen_random_uuid(), 'Wonderhoek', e.id, 75.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'B003'
  union all
  select gen_random_uuid(), 'Waterval 72', e.id, 42.3, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V1073' from entities e where e.contact_person = 'B004'
  union all
  select gen_random_uuid(), 'Maanskloof', e.id, 73.15, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'X1254' from entities e where e.contact_person = 'B005'
  union all
  select gen_random_uuid(), 'Bergendal', e.id, 42.76, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'X0153' from entities e where e.contact_person = 'B005'
  union all
  select gen_random_uuid(), 'Ceder (Tuinskloof)', e.id, 101.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0333' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Eikebos', e.id, 42.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'H2578' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Pruimboskloof', e.id, 39.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG0294' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Sandfontein', e.id, 30.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG0306' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Vredelust', e.id, 57.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG0317' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Welgemoed', e.id, 109.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0088' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Wyzersdrift', e.id, 26.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'W0332' from entities e where e.contact_person = 'B006'
  union all
  select gen_random_uuid(), 'Uitkyk', e.id, 51.82, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1135' from entities e where e.contact_person = 'B007'
  union all
  select gen_random_uuid(), 'Ou muur', e.id, 56.92, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1134' from entities e where e.contact_person = 'B007'
  union all
  select gen_random_uuid(), 'Kleinfontein', e.id, 95.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1136' from entities e where e.contact_person = 'B007'
  union all
  select gen_random_uuid(), 'Bronaar', e.id, 47.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0386' from entities e where e.contact_person = 'B007'
  union all
  select gen_random_uuid(), 'Tierberg', e.id, 3.7, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'C001'
  union all
  select gen_random_uuid(), 'Klipdrif', e.id, 35.69, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y1370' from entities e where e.contact_person = 'C002'
  union all
  select gen_random_uuid(), 'Cortina', e.id, 37.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0414' from entities e where e.contact_person = 'C003'
  union all
  select gen_random_uuid(), 'Burgh-ri Estate', e.id, 30.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG0680' from entities e where e.contact_person = 'C003'
  union all
  select gen_random_uuid(), 'Boererus farm', e.id, 37.531, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'C005'
  union all
  select gen_random_uuid(), 'Vreeland', e.id, 42.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C2945' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'Mfuleni', e.id, 13.73, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG017' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'La Rochelle', e.id, 26.25, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG016' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'Klein Pruise', e.id, 80.04, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3466' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'Eureka', e.id, 18.8, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C2853' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'Coshla', e.id, 20.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C2887' from entities e where e.contact_person = 'C006'
  union all
  select gen_random_uuid(), 'Klipfontein', e.id, 43.69, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V2709' from entities e where e.contact_person = 'D001'
  union all
  select gen_random_uuid(), 'Nooitgedacht', e.id, 0.0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'P0778' from entities e where e.contact_person = 'D002'
  union all
  select gen_random_uuid(), 'Klaasvoogds', e.id, 3.4, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y1007' from entities e where e.contact_person = 'D003'
  union all
  select gen_random_uuid(), 'Delta, Den Haag & Nuutbegin', e.id, 73.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C2857' from entities e where e.contact_person = 'D004'
  union all
  select gen_random_uuid(), 'Trelawney', e.id, 13.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0453' from entities e where e.contact_person = 'D005'
  union all
  select gen_random_uuid(), 'Tweefontein 23 of 30', e.id, 9.95, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3113' from entities e where e.contact_person = 'D006'
  union all
  select gen_random_uuid(), 'Disselfontein', e.id, 103.08, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0298' from entities e where e.contact_person = 'D007'
  union all
  select gen_random_uuid(), 'Doornkloof', e.id, 32.31, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y0514' from entities e where e.contact_person = 'D008'
  union all
  select gen_random_uuid(), 'Stinkfontein', e.id, 40.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0381' from entities e where e.contact_person = 'D009'
  union all
  select gen_random_uuid(), 'Elandsrivier', e.id, 41.24, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V1116' from entities e where e.contact_person = 'E001'
  union all
  select gen_random_uuid(), 'Withoek', e.id, 21.700000000000003, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'G001'
  union all
  select gen_random_uuid(), 'Harmonie Boerdery', e.id, 11.01, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Q0058' from entities e where e.contact_person = 'G002'
  union all
  select gen_random_uuid(), 'Bellvue', e.id, 11.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'G003'
  union all
  select gen_random_uuid(), 'Ongelegen', e.id, 41.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L7936' from entities e where e.contact_person = 'H001'
  union all
  select gen_random_uuid(), 'Kleinvlei', e.id, 12.53, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3435' from entities e where e.contact_person = 'H002'
  union all
  select gen_random_uuid(), 'Vergelegen', e.id, 38.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'P1027' from entities e where e.contact_person = 'I001'
  union all
  select gen_random_uuid(), 'Two Rivers', e.id, 15.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'P0170' from entities e where e.contact_person = 'I001'
  union all
  select gen_random_uuid(), 'The Junction', e.id, 14.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'P1296' from entities e where e.contact_person = 'I001'
  union all
  select gen_random_uuid(), 'TBC', e.id, 0.0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'I002'
  union all
  select gen_random_uuid(), 'Weltevreden', e.id, 24.72, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'I003'
  union all
  select gen_random_uuid(), 'Valley Green', e.id, 47.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'E0768' from entities e where e.contact_person = 'I003'
  union all
  select gen_random_uuid(), 'Corner Farm', e.id, 40.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0426' from entities e where e.contact_person = 'I003'
  union all
  select gen_random_uuid(), 'Industrial Ceres', e.id, 0.0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'J001'
  union all
  select gen_random_uuid(), 'Norham', e.id, 76.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'E1042' from entities e where e.contact_person = 'K001'
  union all
  select gen_random_uuid(), 'Dewhurst', e.id, 0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 0, false, now(), now(), 'E1047' from entities e where e.contact_person = 'K001'
  union all
  select gen_random_uuid(), 'Kaja Boerdery', e.id, 13.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3479' from entities e where e.contact_person = 'K002'
  union all
  select gen_random_uuid(), 'Kliprivier', e.id, 3.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3371' from entities e where e.contact_person = 'K003'
  union all
  select gen_random_uuid(), 'Mon Don', e.id, 42.9, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y0594' from entities e where e.contact_person = 'K004'
  union all
  select gen_random_uuid(), 'Tweefontein', e.id, 37.07, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3118' from entities e where e.contact_person = 'L001'
  union all
  select gen_random_uuid(), 'Laasterivier', e.id, 22.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'M0795' from entities e where e.contact_person = 'L002'
  union all
  select gen_random_uuid(), 'Zeekoekraal', e.id, 30.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0091' from entities e where e.contact_person = 'L003'
  union all
  select gen_random_uuid(), 'Wydekloof', e.id, 104.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1149' from entities e where e.contact_person = 'L004'
  union all
  select gen_random_uuid(), 'Libertas', e.id, 19.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0408' from entities e where e.contact_person = 'L004'
  union all
  select gen_random_uuid(), 'Langrivier', e.id, 129.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0531' from entities e where e.contact_person = 'L004'
  union all
  select gen_random_uuid(), 'De Meul', e.id, 85.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1111' from entities e where e.contact_person = 'L004'
  union all
  select gen_random_uuid(), 'Welgemeen', e.id, 78.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C1158' from entities e where e.contact_person = 'L005'
  union all
  select gen_random_uuid(), 'Rustfontein', e.id, 140.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V1108' from entities e where e.contact_person = 'L006'
  union all
  select gen_random_uuid(), 'Bokveldskloof', e.id, 117.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0228' from entities e where e.contact_person = 'L007'
  union all
  select gen_random_uuid(), 'Klaarfontein', e.id, 52.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'H0735' from entities e where e.contact_person = 'L008'
  union all
  select gen_random_uuid(), 'Misgund Landgoed', e.id, 28.83, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG092' from entities e where e.contact_person = 'M002'
  union all
  select gen_random_uuid(), 'Laurita', e.id, 41.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0053' from entities e where e.contact_person = 'M002'
  union all
  select gen_random_uuid(), 'Appelkloof', e.id, 75.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0364' from entities e where e.contact_person = 'M004'
  union all
  select gen_random_uuid(), 'Botshabelo', e.id, 3.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'M005'
  union all
  select gen_random_uuid(), 'Morceaux', e.id, 69.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0097' from entities e where e.contact_person = 'M006'
  union all
  select gen_random_uuid(), 'Waveren', e.id, 37.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 0, false, now(), now(), 'T0342' from entities e where e.contact_person = 'M007'
  union all
  select gen_random_uuid(), 'Morning star', e.id, 10.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'M008'
  union all
  select gen_random_uuid(), 'Kromkraans', e.id, 10.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'D9283' from entities e where e.contact_person = 'M009'
  union all
  select gen_random_uuid(), 'Na die Oes', e.id, 0.42, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Y0020' from entities e where e.contact_person = 'N001'
  union all
  select gen_random_uuid(), 'Protea', e.id, 38.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V1012' from entities e where e.contact_person = 'N002'
  union all
  select gen_random_uuid(), 'Stukkiewit', e.id, 55.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C2018' from entities e where e.contact_person = 'P001'
  union all
  select gen_random_uuid(), 'Haaswerf', e.id, 11.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG066' from entities e where e.contact_person = 'P002'
  union all
  select gen_random_uuid(), 'Stead Farm', e.id, 16.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'R001'
  union all
  select gen_random_uuid(), 'Langfontein', e.id, 78.18, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0408/L8068' from entities e where e.contact_person = 'R003'
  union all
  select gen_random_uuid(), 'Kleinrivier', e.id, 9.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0585' from entities e where e.contact_person = 'R004'
  union all
  select gen_random_uuid(), 'Groendal', e.id, 23.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG041' from entities e where e.contact_person = 'R004'
  union all
  select gen_random_uuid(), 'Die Nek', e.id, 21.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG040' from entities e where e.contact_person = 'R004'
  union all
  select gen_random_uuid(), 'Dagbreek', e.id, 19.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG037' from entities e where e.contact_person = 'R004'
  union all
  select gen_random_uuid(), 'Blou Swaan', e.id, 34.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG039' from entities e where e.contact_person = 'R004'
  union all
  select gen_random_uuid(), 'Rovon Middelplaas', e.id, 58.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'L0585X' from entities e where e.contact_person = 'R005'
  union all
  select gen_random_uuid(), 'Swartberg', e.id, 14.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'S001'
  union all
  select gen_random_uuid(), 'Loufontein', e.id, 44.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'H2610' from entities e where e.contact_person = 'S002'
  union all
  select gen_random_uuid(), 'Voorsorg', e.id, 49.35, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'T0381' from entities e where e.contact_person = 'S003'
  union all
  select gen_random_uuid(), 'TBC', e.id, 5.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 0, false, now(), now(), 'D15236' from entities e where e.contact_person = 'S004'
  union all
  select gen_random_uuid(), 'Suikerbosrand', e.id, 17.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 0, false, now(), now(), 'C3453' from entities e where e.contact_person = 'S005'
  union all
  select gen_random_uuid(), 'Buffelsfontein Farm', e.id, 10.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'Unknown' from entities e where e.contact_person = 'T001'
  union all
  select gen_random_uuid(), 'Lebanon Fruit farm', e.id, 24.93, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'E1017' from entities e where e.contact_person = 'T002'
  union all
  select gen_random_uuid(), 'Daytona', e.id, 28.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C0462' from entities e where e.contact_person = 'T003'
  union all
  select gen_random_uuid(), 'Aarnhemburg 155', e.id, 28.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'D14811' from entities e where e.contact_person = 'T004'
  union all
  select gen_random_uuid(), 'Klipkuil', e.id, 26.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'M0780' from entities e where e.contact_person = 'T005'
  union all
  select gen_random_uuid(), 'Berberhoek', e.id, 21.0, ARRAY_REMOVE(ARRAY['Pome', 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3337' from entities e where e.contact_person = 'T006'
  union all
  select gen_random_uuid(), 'Tulpieskraal Werknemers Trust', e.id, 16.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG0554' from entities e where e.contact_person = 'T007'
  union all
  select gen_random_uuid(), 'Uitvlugt', e.id, 42.0, ARRAY_REMOVE(ARRAY['Pome', NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'V0317' from entities e where e.contact_person = 'U001'
  union all
  select gen_random_uuid(), 'Rietvlei No 1 (Vredehoek)', e.id, 0.0, ARRAY_REMOVE(ARRAY[NULL, NULL]::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'M0001' from entities e where e.contact_person = 'V001'
  union all
  select gen_random_uuid(), 'Yeyethu', e.id, 3.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'HG145' from entities e where e.contact_person = 'W001'
  union all
  select gen_random_uuid(), 'Hillsight', e.id, 4.0, ARRAY_REMOVE(ARRAY[NULL, 'Stone']::text[], NULL), NULL, NULL, null, null, 1, false, now(), now(), 'C3291' from entities e where e.contact_person = 'W002';
