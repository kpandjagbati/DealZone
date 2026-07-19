-- =============================================================================
-- DealZone — Base de données complète (PostgreSQL)
-- À exécuter dans pgAdmin (Query Tool) connecté au serveur PostgreSQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CRÉATION DE LA BASE (à lancer en étant connecté à "postgres")
-- -----------------------------------------------------------------------------
-- Si la base existe déjà, ignore cette section ou commente-la.

-- CREATE DATABASE dealzone_db
--   WITH OWNER = postgres
--        ENCODING = 'UTF8'
--        TEMPLATE = template0;

-- Puis reconnecte-toi à dealzone_db et exécute le reste du script.


-- -----------------------------------------------------------------------------
-- 2. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()


-- -----------------------------------------------------------------------------
-- 3. TYPES ENUM
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'GESTIONNAIRE', 'MAGASINIER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('IN', 'OUT', 'ADJUST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- -----------------------------------------------------------------------------
-- 4. TABLE : users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(180)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  role            user_role     NOT NULL DEFAULT 'MAGASINIER',
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);


-- -----------------------------------------------------------------------------
-- 5. TABLE : categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120)  NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT categories_name_unique UNIQUE (name)
);


-- -----------------------------------------------------------------------------
-- 6. TABLE : suppliers (fournisseurs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(180)  NOT NULL,
  email           VARCHAR(180),
  phone           VARCHAR(40),
  address         TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers (name);


-- -----------------------------------------------------------------------------
-- 7. TABLE : products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku               VARCHAR(80)   NOT NULL,
  name              VARCHAR(180)  NOT NULL,
  description       TEXT,
  unit              VARCHAR(40)   NOT NULL DEFAULT 'pièce',
  purchase_price    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity          INTEGER       NOT NULL DEFAULT 0,
  alert_threshold   INTEGER       NOT NULL DEFAULT 5,
  category_id       UUID          NOT NULL,
  supplier_id       UUID,
  image_url         VARCHAR(500),
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT products_sku_unique UNIQUE (sku),
  CONSTRAINT products_purchase_price_check CHECK (purchase_price >= 0),
  CONSTRAINT products_sale_price_check CHECK (sale_price >= 0),
  CONSTRAINT products_quantity_check CHECK (quantity >= 0),
  CONSTRAINT products_alert_threshold_check CHECK (alert_threshold >= 0),

  CONSTRAINT products_category_fk
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT products_supplier_fk
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products (quantity);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);


-- -----------------------------------------------------------------------------
-- 8. TABLE : stock_movements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID          NOT NULL,
  type              movement_type NOT NULL,
  quantity          INTEGER       NOT NULL,
  quantity_before   INTEGER       NOT NULL,
  quantity_after    INTEGER       NOT NULL,
  reason            VARCHAR(120)  NOT NULL,
  reference         VARCHAR(120),
  note              TEXT,
  user_id           UUID          NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT stock_movements_quantity_check CHECK (quantity > 0),
  CONSTRAINT stock_movements_qty_before_check CHECK (quantity_before >= 0),
  CONSTRAINT stock_movements_qty_after_check CHECK (quantity_after >= 0),

  CONSTRAINT stock_movements_product_fk
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT stock_movements_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON stock_movements (user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements (type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created
  ON stock_movements (product_id, created_at DESC);


-- -----------------------------------------------------------------------------
-- 9. TABLE : company_settings (1 ligne attendue)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name              VARCHAR(180)  NOT NULL DEFAULT 'DealZone',
  address                   TEXT,
  currency                  VARCHAR(10)   NOT NULL DEFAULT 'XOF',
  default_alert_threshold   INTEGER       NOT NULL DEFAULT 5,
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT company_settings_threshold_check CHECK (default_alert_threshold >= 0)
);


-- -----------------------------------------------------------------------------
-- 10. TRIGGER : updated_at automatique
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON suppliers;
CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_company_settings_updated_at ON company_settings;
CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


-- -----------------------------------------------------------------------------
-- 11. VUE : produits avec statut stock + infos liées
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_products_stock_status AS
SELECT
  p.id,
  p.sku,
  p.name,
  p.unit,
  p.purchase_price,
  p.sale_price,
  p.quantity,
  p.alert_threshold,
  p.is_active,
  c.name AS category_name,
  s.name AS supplier_name,
  (p.quantity * p.purchase_price) AS stock_value,
  CASE
    WHEN p.quantity = 0 THEN 'RUPTURE'
    WHEN p.quantity <= p.alert_threshold THEN 'BAS'
    ELSE 'OK'
  END AS stock_status
FROM products p
JOIN categories c ON c.id = p.category_id
LEFT JOIN suppliers s ON s.id = p.supplier_id;


-- -----------------------------------------------------------------------------
-- 12. VUE : dashboard résumé
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS total_products,
  (SELECT COUNT(*) FROM categories) AS total_categories,
  (SELECT COUNT(*) FROM suppliers) AS total_suppliers,
  (SELECT COALESCE(SUM(quantity * purchase_price), 0) FROM products WHERE is_active = TRUE) AS total_stock_value,
  (SELECT COUNT(*) FROM products WHERE is_active = TRUE AND quantity <= alert_threshold) AS low_stock_count,
  (SELECT COUNT(*) FROM stock_movements WHERE created_at::date = CURRENT_DATE) AS movements_today;


-- =============================================================================
-- FIN DU SCHÉMA
-- Données de démo : voir seed-dealzone.sql
-- =============================================================================
