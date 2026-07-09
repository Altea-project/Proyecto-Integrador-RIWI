
-- ============================================================
-- Altea — Datos iniciales (seed) ya agregado a Supabase
-- ============================================================

-- Roles del sistema (necesarios para que users.role_id funcione)
INSERT INTO roles (name) VALUES
    ('admin'),
    ('instructor'),
    ('coder'),
    ('recruiter');

-- ------------------------------------------------------------
-- Usuario de prueba para login (HU-00)
-- Password en texto plano: Prueba123!
-- ON CONFLICT evita error si el seed se corre más de una vez.
-- ------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role_id, must_change_password)
VALUES (
    'Usuario Prueba',
    'prueba@altea.com',
    '$2b$10$k.OBIrk7/rn8/9RX3.nDOe4HlRS4JV1iaIaF7RxrI1UTAw9DdfBpi',
    (SELECT id FROM roles WHERE name = 'admin'),
    true
)
ON CONFLICT (email) DO NOTHING;