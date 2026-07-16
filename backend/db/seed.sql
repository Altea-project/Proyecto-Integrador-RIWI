
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



-- ------------------------------------------------------------
-- Usuarios de prueba adicionales, un rol cada uno.
-- Password en texto plano (todos tienen la misma): Prueba123!
-- must_change_password = false para que no bloqueen el login
-- durante pruebas de otras funcionalidades

INSERT INTO users (name, email, password_hash, document, role_id, must_change_password)
VALUES
    (
    'Instructor Prueba',
    'proyecto.altea.riwi@gmail.com',
    '$2b$10$1SGV0D1FMD4ps9p2POl3W.g8iumWwD7frOzuvS2gq/eWoKz9R99sO',
    'DOC-INSTRUCTOR-001',
    (SELECT id FROM roles WHERE name = 'instructor'),
    false
    ),
    (
    'Coder Prueba',
    'coder@altea.com',
    '$2b$10$1SGV0D1FMD4ps9p2POl3W.g8iumWwD7frOzuvS2gq/eWoKz9R99sO',
    'DOC-CODER-001',
    (SELECT id FROM roles WHERE name = 'coder'),
    false
    ),
    (
    'Recruiter Prueba',
    'recruiter@altea.com',
    '$2b$10$1SGV0D1FMD4ps9p2POl3W.g8iumWwD7frOzuvS2gq/eWoKz9R99sO',
    'DOC-RECRUITER-001',
    (SELECT id FROM roles WHERE name = 'recruiter'),
    false
    )
ON CONFLICT (email) DO NOTHING;