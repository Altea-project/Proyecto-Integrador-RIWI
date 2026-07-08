
-- ============================================================
-- Altea — Datos iniciales (seed) ya agregado a Supabase
-- ============================================================

-- Roles del sistema (necesarios para que users.role_id funcione)
INSERT INTO roles (name) VALUES
    ('admin'),
    ('instructor'),
    ('coder'),
    ('recruiter');