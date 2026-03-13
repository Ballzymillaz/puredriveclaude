-- ═══════════════════════════════════════════════════════════
--  PureDrivePT — Schéma + données réelles Base44
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(24) PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255), hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'driver', is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, phone VARCHAR(50),
    profile_photo_url VARCHAR(500), linked_entity_id VARCHAR(24),
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS fleet_managers (
    id VARCHAR(24) PRIMARY KEY, full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(50), nif VARCHAR(20),
    iban VARCHAR(50), status VARCHAR(20) DEFAULT 'pending',
    referral_code VARCHAR(50) UNIQUE, total_drivers INTEGER DEFAULT 0,
    total_earnings FLOAT DEFAULT 0, profile_photo_url VARCHAR(500),
    notes TEXT, user_id VARCHAR(24),
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS fleets (
    id VARCHAR(24) PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT,
    fleet_manager_id VARCHAR(24), fleet_manager_name VARCHAR(255),
    vehicle_ids JSONB DEFAULT '[]', driver_ids JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active', upi_enabled BOOLEAN DEFAULT true,
    notes TEXT, created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(24) PRIMARY KEY, brand VARCHAR(100) NOT NULL, model VARCHAR(100) NOT NULL,
    first_registration_date VARCHAR(20), license_plate VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(50), vin VARCHAR(50), status VARCHAR(20) DEFAULT 'available',
    assigned_driver_id VARCHAR(24), assigned_driver_name VARCHAR(255),
    fleet_id VARCHAR(24), fleet_manager_id VARCHAR(24),
    weekly_rental_price FLOAT, base_purchase_price FLOAT, market_price FLOAT,
    fuel_type VARCHAR(20), mileage FLOAT, insurance_expiry VARCHAR(20),
    inspection_expiry VARCHAR(20), photo_url VARCHAR(500), notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(24) PRIMARY KEY, full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL, phone VARCHAR(50), nif VARCHAR(20),
    address TEXT, date_of_birth VARCHAR(20), status VARCHAR(20) DEFAULT 'pending',
    contract_type VARCHAR(30), slot_fee FLOAT DEFAULT 0, commission_rate FLOAT DEFAULT 20,
    assigned_vehicle_id VARCHAR(24), assigned_vehicle_plate VARCHAR(20),
    fleet_id VARCHAR(24), fleet_manager_id VARCHAR(24), fleet_manager_name VARCHAR(255),
    commercial_id VARCHAR(24), commercial_name VARCHAR(255), referred_by VARCHAR(50),
    iva_regime VARCHAR(20) DEFAULT 'exempt', irs_retention_rate FLOAT,
    vehicle_deposit FLOAT DEFAULT 500, vehicle_deposit_paid BOOLEAN DEFAULT false,
    iban VARCHAR(50), uber_uuid VARCHAR(100), bolt_id VARCHAR(100),
    upi_balance FLOAT DEFAULT 0, profile_photo_url VARCHAR(500), notes TEXT,
    start_date VARCHAR(20), user_id VARCHAR(24),
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS weekly_payments (
    id VARCHAR(24) PRIMARY KEY, driver_id VARCHAR(24) NOT NULL,
    driver_name VARCHAR(255), fleet_manager_id VARCHAR(24),
    week_start VARCHAR(20) NOT NULL, week_end VARCHAR(20), period_label VARCHAR(100),
    uber_gross FLOAT DEFAULT 0, bolt_gross FLOAT DEFAULT 0,
    other_platform_gross FLOAT DEFAULT 0, total_gross FLOAT DEFAULT 0,
    commission_amount FLOAT DEFAULT 0, slot_fee FLOAT DEFAULT 0,
    vehicle_rental FLOAT DEFAULT 0, via_verde_amount FLOAT DEFAULT 0,
    myprio_amount FLOAT DEFAULT 0, miio_amount FLOAT DEFAULT 0,
    loan_installment FLOAT DEFAULT 0, vehicle_purchase_installment FLOAT DEFAULT 0,
    reimbursement_credit FLOAT DEFAULT 0, goal_bonus FLOAT DEFAULT 0,
    iva_amount FLOAT DEFAULT 0, irs_retention FLOAT DEFAULT 0,
    upi_earned FLOAT DEFAULT 0, total_deductions FLOAT DEFAULT 0,
    net_amount FLOAT DEFAULT 0, proof_document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft', submitted_by VARCHAR(255),
    approved_by VARCHAR(255), notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(24) PRIMARY KEY, driver_id VARCHAR(24) NOT NULL,
    driver_name VARCHAR(255), amount FLOAT NOT NULL, interest_rate_weekly FLOAT DEFAULT 1,
    total_with_interest FLOAT, duration_weeks FLOAT, weekly_installment FLOAT,
    remaining_balance FLOAT, paid_amount FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'requested', request_date VARCHAR(20),
    approval_date VARCHAR(20), approved_by VARCHAR(255), notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vehicle_purchases (
    id VARCHAR(24) PRIMARY KEY, driver_id VARCHAR(24) NOT NULL,
    driver_name VARCHAR(255), vehicle_id VARCHAR(24) NOT NULL,
    vehicle_info VARCHAR(255), base_price FLOAT NOT NULL, total_price FLOAT,
    duration_months INTEGER NOT NULL, weekly_installment FLOAT,
    remaining_balance FLOAT, paid_amount FLOAT DEFAULT 0,
    prepayment_amount FLOAT DEFAULT 0, status VARCHAR(20) DEFAULT 'requested',
    start_date VARCHAR(20), approved_by VARCHAR(255), notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS upi_transactions (
    id VARCHAR(24) PRIMARY KEY, driver_id VARCHAR(24) NOT NULL,
    driver_name VARCHAR(255), type VARCHAR(20), amount FLOAT NOT NULL,
    source VARCHAR(100), week_label VARCHAR(100), notes TEXT,
    processed_by VARCHAR(255), created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(24) PRIMARY KEY, owner_type VARCHAR(30),
    owner_id VARCHAR(24) NOT NULL, owner_name VARCHAR(255),
    document_type VARCHAR(50), file_url VARCHAR(500), expiry_date VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', rejection_reason TEXT,
    approved_by VARCHAR(255), version INTEGER DEFAULT 1, notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS maintenance_records (
    id VARCHAR(24) PRIMARY KEY, vehicle_id VARCHAR(24) NOT NULL,
    vehicle_info VARCHAR(255), type VARCHAR(50), description TEXT, cost FLOAT,
    mileage_at_service FLOAT, service_date VARCHAR(20) NOT NULL,
    next_service_date VARCHAR(20), next_service_mileage FLOAT,
    performed_by VARCHAR(255), receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'done', alert_triggered BOOLEAN DEFAULT false,
    notes TEXT, created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(24) PRIMARY KEY, title VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'direct', participants JSONB DEFAULT '[]',
    participant_names VARCHAR(500), created_by VARCHAR(255),
    last_message TEXT, last_message_at VARCHAR(50), fleet_manager_id VARCHAR(24),
    created_date TIMESTAMPTZ DEFAULT NOW(), updated_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(24) PRIMARY KEY, conversation_id VARCHAR(24) NOT NULL,
    sender_id VARCHAR(255) NOT NULL, sender_name VARCHAR(255),
    sender_role VARCHAR(50), content TEXT NOT NULL,
    read_by JSONB DEFAULT '[]', created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(24) PRIMARY KEY, title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL, type VARCHAR(20) DEFAULT 'info',
    category VARCHAR(50) DEFAULT 'general', recipient_email VARCHAR(255),
    recipient_role VARCHAR(50), related_entity VARCHAR(100),
    is_read BOOLEAN DEFAULT false, read_by JSONB DEFAULT '[]',
    action_url VARCHAR(255), sent_email BOOLEAN DEFAULT false,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_drivers_fm    ON drivers(fleet_manager_id);
CREATE INDEX IF NOT EXISTS idx_payments_drv  ON weekly_payments(driver_id);
CREATE INDEX IF NOT EXISTS idx_payments_week ON weekly_payments(week_start);
CREATE INDEX IF NOT EXISTS idx_loans_drv     ON loans(driver_id);
CREATE INDEX IF NOT EXISTS idx_upi_drv       ON upi_transactions(driver_id);
CREATE INDEX IF NOT EXISTS idx_msgs_conv     ON messages(conversation_id);

-- Trigger updated_date
CREATE OR REPLACE FUNCTION set_updated_date() RETURNS TRIGGER AS $$
BEGIN NEW.updated_date = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY['users','fleet_managers','fleets','vehicles','drivers',
    'weekly_payments','loans','vehicle_purchases','documents','maintenance_records','conversations'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_upd_%s ON %s', t, t);
    EXECUTE format('CREATE TRIGGER trg_upd_%s BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION set_updated_date()', t, t);
  END LOOP;
END $$;

-- ── Données réelles ────────────────────────────────────────
-- Mot de passe par défaut: PureDrive2026!  (changer immédiatement)
INSERT INTO users VALUES
('69a2213fe7f79c3d28d97cb4','millaballzy@gmail.com','Admin PureDrive','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','admin',true,true,NULL,NULL,NULL,NOW(),NOW()),
('69b06e06bf1fa47319067c58','danyelagsilva@gmail.com','Danyela Galvão','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','fleet_manager',true,true,NULL,NULL,'69b07114d3f6619b8ff02bfa',NOW(),NOW()),
('usr_jose','josecabeca.uberdriver@gmail.com','José Nascimento Cabeça','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','driver',true,false,NULL,NULL,'69b07bc3f22ffe917105c62a',NOW(),NOW()),
('usr_alex','xandinhoreis88@gmail.com','Alexandre Reis Resende','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','driver',true,false,NULL,NULL,'69b07c78baeac49ac9b3f6e2',NOW(),NOW()),
('usr_nuno','nunofernandes8655@gmail.com','Nuno Miguel De Jesus Fernandes','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','driver',true,false,NULL,NULL,'69b07c40843cbd0eda48553d',NOW(),NOW()),
('usr_thiago','aymeesegundo1@gmail.com','Thiago Fernandes Pereira','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','driver',true,false,NULL,NULL,'69b07bfea304239d15622c49',NOW(),NOW()),
('usr_ismael','gipsyisma1986@gmail.com','Ismael Dos Santos Silva','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaAXH.3vFt.nMoNHtXUxM6vWG','driver',true,false,NULL,NULL,'69b07b4ba57182eb3c0ccf2b',NOW(),NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO fleet_managers VALUES
('69b07114d3f6619b8ff02bfa','Danyela Galvão','danyelagsilva@gmail.com','999999999','300300300',NULL,'active','15',5,0,NULL,NULL,'69b06e06bf1fa47319067c58',NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO fleets VALUES
('69ab17fe96fd05abc94492f3','PureDrive Setubal',NULL,'69b07114d3f6619b8ff02bfa','Danyela Galvão',
'["69a2da9cb7bc2aa7bca0a08a","69a23652c9c67c73987d32ff","69a2d555abe55442fa1be7b9","69a2d44db72532b308e20c9f","69a2d974601c2ba4a6cd8a6f"]',
'["69b07c78baeac49ac9b3f6e2","69b07c40843cbd0eda48553d","69b07bfea304239d15622c49","69b07bc3f22ffe917105c62a","69b07b4ba57182eb3c0ccf2b"]',
'active',false,NULL,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id,brand,model,license_plate,first_registration_date,status,market_price,base_purchase_price,weekly_rental_price,fuel_type,mileage,color,insurance_expiry,photo_url,created_by) VALUES
('69a2d555abe55442fa1be7b9','Tesla','3 Standard Range +','BX-95-FQ','2020-12-10','available',20000,16100,325,'electric',147000,'Cinzento','2026-03-06','https://i.postimg.cc/8113j0fN/Tesla-Grise-2020.png','millaballzy@gmail.com'),
('69a2d974601c2ba4a6cd8a6f','Ford','Focus 1,5 Ecoblue','BP-31-IE','2020-01-22','assigned',15250,10600,230,'diesel',145000,'Azul',NULL,'https://i.postimg.cc/nnLBrKcM/Chat-GPT-Image-2-mars-2026-02-05-12.png','millaballzy@gmail.com'),
('69a2da9cb7bc2aa7bca0a08a','Peugeot','308 1,5HDI','BM-60-VB','2021-03-15','assigned',17000,12100,225,'diesel',130000,'Branca',NULL,'https://i.postimg.cc/RMLBYtKT/308-HDI-2021.png','millaballzy@gmail.com'),
('69a2db79ab9e89397512deae','Peugeot','508 SW 1,5 HDI','BO-99-LZ','2021-04-12','available',21000,14700,260,'diesel',105000,'Cinzento',NULL,'https://i.postimg.cc/yV11snVX/Peugeot-508-SW--HDI-2021.png','millaballzy@gmail.com'),
('69a2dc26ad6bd8c5272191be','Citroën','C4 SpaceTourer 7L','BP-31-LR','2019-09-27','available',16500,11900,240,'diesel',148000,'Azul/Verde',NULL,'https://i.postimg.cc/Ykfdm3kz/Citroen-C4-Space-Tourer-2019.png','millaballzy@gmail.com'),
('69a2dd614bc057a7dd0ce2d9','Peugeot','508 1,2 Active','BR-80-EL','2022-08-01','available',19500,15510,275,'gasoline',85000,'Preto',NULL,'https://i.postimg.cc/5xdz3hSB/Peugeot-508-1-2i-Active-2022.png','millaballzy@gmail.com'),
('69a23652c9c67c73987d32ff','Peugeot','508 2,0 HDI','BX-70-UJ','2020-06-15','assigned',18500,13200,325,'diesel',138000,'Preto',NULL,NULL,'millaballzy@gmail.com'),
('69a2d44db72532b308e20c9f','Ford','Focus 1,5 Ecoblue','BX-13-FR','2020-03-10','assigned',14800,10200,325,'diesel',152000,'Branco',NULL,NULL,'millaballzy@gmail.com')
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO drivers (id,full_name,email,phone,status,contract_type,commission_rate,assigned_vehicle_id,assigned_vehicle_plate,fleet_id,fleet_manager_id,fleet_manager_name,iva_regime,vehicle_deposit,upi_balance,notes,created_by) VALUES
('69b07bc3f22ffe917105c62a','José Nascimento Cabeça','josecabeca.uberdriver@gmail.com','924238143','active','location',20,'69a23652c9c67c73987d32ff','BX-70-UJ','69ab17fe96fd05abc94492f3','69b07114d3f6619b8ff02bfa','Danyela Galvão','exempt',350,31.02,'Viatura retirada em 04/03/2026','millaballzy@gmail.com'),
('69b07c78baeac49ac9b3f6e2','Alexandre Reis Resende','xandinhoreis88@gmail.com','938487954','active','location',20,'69a2d974601c2ba4a6cd8a6f','BP-31-IE','69ab17fe96fd05abc94492f3','69b07114d3f6619b8ff02bfa','Danyela Galvão','exempt',300,25.63,'Viatura retirada em 10/03/2026','millaballzy@gmail.com'),
('69b07c40843cbd0eda48553d','Nuno Miguel De Jesus Fernandes','nunofernandes8655@gmail.com','934885532','active','location',20,'69a2d44db72532b308e20c9f','BX-13-FR','69ab17fe96fd05abc94492f3','69b07114d3f6619b8ff02bfa','Danyela Galvão','exempt',300,27.37,'Viatura retirada em 10/03/2026','millaballzy@gmail.com'),
('69b07bfea304239d15622c49','Thiago Fernandes Pereira','aymeesegundo1@gmail.com','928291300','active','location',20,'69a2d555abe55442fa1be7b9','BX-95-FQ','69ab17fe96fd05abc94492f3','69b07114d3f6619b8ff02bfa','Danyela Galvão','exempt',300,0,'Viatura retirada em 08/02/2026','millaballzy@gmail.com'),
('69b07b4ba57182eb3c0ccf2b','Ismael Dos Santos Silva','gipsyisma1986@gmail.com','935589706','active','location',20,'69a2da9cb7bc2aa7bca0a08a','BM-60-VB','69ab17fe96fd05abc94492f3','69b07114d3f6619b8ff02bfa','Danyela Galvão','exempt',300,0,'Viatura retirada em 04/03/2026','millaballzy@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weekly_payments (id,driver_id,driver_name,fleet_manager_id,week_start,week_end,period_label,uber_gross,bolt_gross,total_gross,vehicle_rental,via_verde_amount,myprio_amount,miio_amount,irs_retention,iva_amount,upi_earned,total_deductions,net_amount,status,approved_by,created_by) VALUES
('69b09b382452f8812123e2e1','69b07bc3f22ffe917105c62a','José Nascimento Cabeça','69b07114d3f6619b8ff02bfa','2026-03-09','2026-03-15','Semana 09/03 - 15/03/2026',475.25,300.28,775.53,325.00,52.08,0,75.80,50,46.53,31.02,580.43,195.10,'paid','millaballzy@gmail.com','millaballzy@gmail.com'),
('69b07f72a5fd6c11d0b369c7','69b07c78baeac49ac9b3f6e2','Alexandre Reis Resende','69b07114d3f6619b8ff02bfa','2026-03-09','2026-03-15','Semana 09/03 - 15/03/2026',258.51,382.12,640.63,230.00,51.25,89.51,0,50,38.44,25.63,484.83,155.80,'paid','millaballzy@gmail.com','danyelagsilva@gmail.com'),
('69b07de9142b62a9616276cb','69b07c40843cbd0eda48553d','Nuno Miguel De Jesus Fernandes','69b07114d3f6619b8ff02bfa','2026-03-09','2026-03-15','Semana 09/03 - 15/03/2026',358.85,325.51,684.36,325.00,25.28,0,75.54,50,35.01,27.37,510.83,173.53,'paid','millaballzy@gmail.com','danyelagsilva@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO loans VALUES ('69b09b99290fda6a127dff2b','69b07c78baeac49ac9b3f6e2','Alexandre Reis Resende',500,1,520,4,130,520,0,'rejected','2026-03-10',NULL,NULL,NULL,NOW(),NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO upi_transactions VALUES ('69b09b4369bd46fd4688a995','69b07bc3f22ffe917105c62a','José Nascimento Cabeça','earned',31.02,'weekly_payment','Semana 09/03 - 15/03/2026',NULL,'system',NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO upi_transactions VALUES ('69b07f78f7aea3c1ede851b0','69b07c78baeac49ac9b3f6e2','Alexandre Reis Resende','earned',25.63,'weekly_payment','Semana 09/03 - 15/03/2026',NULL,'system',NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO upi_transactions VALUES ('69b07f31e3b9a8c8c9150f28','69b07c40843cbd0eda48553d','Nuno Miguel De Jesus Fernandes','earned',27.37,'weekly_payment','Semana 09/03 - 15/03/2026',NULL,'system',NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO conversations VALUES ('conv_jose_admin','José Cabeça — Admin','direct','["millaballzy@gmail.com","josecabeca.uberdriver@gmail.com"]','José Cabeça, Admin','millaballzy@gmail.com',NULL,NULL,NULL,NOW(),NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO messages VALUES ('msg_001','conv_jose_admin','josecabeca.uberdriver@gmail.com','José Cabeça','driver','Olá, quando recebo o pagamento desta semana?','["millaballzy@gmail.com","josecabeca.uberdriver@gmail.com"]',NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO messages VALUES ('msg_002','conv_jose_admin','millaballzy@gmail.com','Admin','admin','Olá José, o pagamento foi processado hoje. Deve aparecer na conta amanhã.','["millaballzy@gmail.com"]',NOW()) ON CONFLICT (id) DO NOTHING;
