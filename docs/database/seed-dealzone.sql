-- =============================================================================
-- DealZone — Données de démonstration (SEED)
-- Exécuter APRÈS schema-dealzone.sql, connecté à dealzone_db
-- =============================================================================
-- NOTE : password_hash ci-dessous = bcrypt de "Password123!"
--        (à remplacer par un vrai hash généré par l'app en prod)
-- Hash bcrypt exemple pour "Password123!" :
-- $2b$10$rQZ8K8Y5Y5Y5Y5Y5Y5Y5YuGKxPLACEHOLDER_REMPLACER_PAR_VRAI_HASH
--
-- Pour la démo SQL pure, on met un marqueur ; l'app Next.js générera les vrais hash.


-- Nettoyage optionnel (ordre FK)
-- TRUNCATE stock_movements, products, categories, suppliers, users, company_settings RESTART IDENTITY CASCADE;


-- -----------------------------------------------------------------------------
-- Utilisateurs (3 rôles)
-- password_hash : à remplacer après setup Auth (bcrypt de Password123!)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin DealZone', 'admin@dealzone.local',
   '$2b$10$DemohashRemplacerParBcryptPassword123xxxxxxxxx', 'ADMIN', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Gestionnaire Stock', 'gestionnaire@dealzone.local',
   '$2b$10$DemohashRemplacerParBcryptPassword123xxxxxxxxx', 'GESTIONNAIRE', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Magasinier Terrain', 'magasinier@dealzone.local',
   '$2b$10$DemohashRemplacerParBcryptPassword123xxxxxxxxx', 'MAGASINIER', TRUE)
ON CONFLICT (email) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Paramètres entreprise
-- -----------------------------------------------------------------------------
INSERT INTO company_settings (id, company_name, address, currency, default_alert_threshold)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'DealZone',
  'Lomé, Togo',
  'XOF',
  5
)
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Catégories
-- -----------------------------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Électronique', 'Appareils et accessoires électroniques'),
  ('c2222222-2222-2222-2222-222222222222', 'Alimentaire', 'Produits alimentaires'),
  ('c3333333-3333-3333-3333-333333333333', 'Bureautique', 'Fournitures de bureau')
ON CONFLICT (name) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Fournisseurs
-- -----------------------------------------------------------------------------
INSERT INTO suppliers (id, name, email, phone, address) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'TechSupply SA', 'contact@techsupply.local', '+228 90 00 00 01', 'Lomé'),
  ('s2222222-2222-2222-2222-222222222222', 'AgroDistrib', 'info@agrodistrib.local', '+228 90 00 00 02', 'Kara'),
  ('s3333333-3333-3333-3333-333333333333', 'OfficePlus', 'vente@officeplus.local', '+228 90 00 00 03', 'Lomé')
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Produits
-- -----------------------------------------------------------------------------
INSERT INTO products (
  id, sku, name, description, unit,
  purchase_price, sale_price, quantity, alert_threshold,
  category_id, supplier_id, is_active
) VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'ELEC-001', 'Écouteurs Bluetooth', 'Écouteurs sans fil',
    'pièce', 8000, 12000, 25, 5,
    'c1111111-1111-1111-1111-111111111111',
    's1111111-1111-1111-1111-111111111111',
    TRUE
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'ELEC-002', 'Chargeur USB-C', 'Chargeur rapide 25W',
    'pièce', 3000, 5000, 8, 10,
    'c1111111-1111-1111-1111-111111111111',
    's1111111-1111-1111-1111-111111111111',
    TRUE
  ),
  (
    'p3333333-3333-3333-3333-333333333333',
    'ALI-001', 'Riz 25kg', 'Sac de riz local',
    'sac', 15000, 18000, 40, 10,
    'c2222222-2222-2222-2222-222222222222',
    's2222222-2222-2222-2222-222222222222',
    TRUE
  ),
  (
    'p4444444-4444-4444-4444-444444444444',
    'BUR-001', 'Ramette A4', 'Papier 500 feuilles',
    'pièce', 2000, 3000, 0, 5,
    'c3333333-3333-3333-3333-333333333333',
    's3333333-3333-3333-3333-333333333333',
    TRUE
  ),
  (
    'p5555555-5555-5555-5555-555555555555',
    'BUR-002', 'Stylos bleu (boîte)', 'Boîte de 50 stylos',
    'boîte', 3500, 5000, 15, 5,
    'c3333333-3333-3333-3333-333333333333',
    's3333333-3333-3333-3333-333333333333',
    TRUE
  )
ON CONFLICT (sku) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Mouvements d'exemple
-- -----------------------------------------------------------------------------
INSERT INTO stock_movements (
  product_id, type, quantity, quantity_before, quantity_after,
  reason, reference, note, user_id
) VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'IN', 30, 0, 30,
    'Achat', 'BL-2026-001', 'Réception initiale',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'p1111111-1111-1111-1111-111111111111',
    'OUT', 5, 30, 25,
    'Vente', 'FAC-2026-010', NULL,
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'IN', 20, 0, 20,
    'Achat', 'BL-2026-002', NULL,
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'OUT', 12, 20, 8,
    'Vente', 'FAC-2026-011', NULL,
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'p4444444-4444-4444-4444-444444444444',
    'OUT', 5, 5, 0,
    'Vente', 'FAC-2026-012', 'Dernière unité vendue',
    '33333333-3333-3333-3333-333333333333'
  );


-- =============================================================================
-- Vérifications rapides
-- =============================================================================
-- SELECT * FROM v_dashboard_summary;
-- SELECT sku, name, quantity, stock_status, stock_value FROM v_products_stock_status;
-- SELECT type, COUNT(*) FROM stock_movements GROUP BY type;
