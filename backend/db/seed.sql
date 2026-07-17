
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

-- ------------------------------------------------------------
-- HU-12 · T1 — Proyectos y calificaciones de prueba para la galería
-- (GET /projects). Cubre los 3 casos que pide la HU:
--   1) "Altea Gallery"     -> puntaje alto y destacado (starred).
--   2) "Task Manager API"  -> puntaje más bajo, sin destacar.
--   3) "Portafolio Personal" -> SIN calificar a propósito, para
--      comprobar el badge "Sin calificar" (CA-02) y que quede al
--      final del listado (RN-04).
--
-- NOTA: a diferencia de "users" (UNIQUE en email), "projects" no
-- tiene una columna UNIQUE de negocio, así que este bloque NO es
-- 100% idempotente: si corres seed.sql más de una vez, se
-- duplicarán estas filas. Para desarrollo/pruebas no es un problema;
-- si se necesita idempotencia real, agregar una constraint UNIQUE
-- (ej. en (coder_id, title)) o limpiar la tabla antes de re-sembrar.
-- ------------------------------------------------------------
INSERT INTO projects (coder_id, title, description, image_url, repo_url, is_external)
VALUES
    (
    (SELECT id FROM users WHERE email = 'coder@altea.com'),
    'Altea Gallery',
    'Galería de proyectos de la plataforma Altea, construida con Vite y Express.',
    'https://picsum.photos/seed/altea1/400/300',
    'https://github.com/ejemplo/altea-gallery',
    false
    ),
    (
    (SELECT id FROM users WHERE email = 'coder@altea.com'),
    'Task Manager API',
    'API REST para gestión de tareas con autenticación JWT.',
    'https://picsum.photos/seed/altea2/400/300',
    'https://github.com/ejemplo/task-manager-api',
    false
    ),
    (
    (SELECT id FROM users WHERE email = 'coder@altea.com'),
    'Portafolio Personal',
    'Sitio estático de portafolio, proyecto externo al bootcamp.',
    'https://picsum.photos/seed/altea3/400/300',
    'https://github.com/ejemplo/portafolio-personal',
    true
    );

-- project_id SÍ es UNIQUE en "gradings" (RN-02: máximo 1 calificación
-- por proyecto), por eso aquí ON CONFLICT DO NOTHING sí es idempotente.
INSERT INTO gradings (project_id, instructor_id, score, comment, starred)
VALUES
    (
    (SELECT id FROM projects WHERE title = 'Altea Gallery'),
    (SELECT id FROM users WHERE email = 'proyecto.altea.riwi@gmail.com'),
    95,
    'Excelente estructura de carpetas y buenas prácticas.',
    true
    ),
    (
    (SELECT id FROM projects WHERE title = 'Task Manager API'),
    (SELECT id FROM users WHERE email = 'proyecto.altea.riwi@gmail.com'),
    78,
    'Buen manejo de JWT, falta validación de errores.',
    false
    )
ON CONFLICT (project_id) DO NOTHING;

-- ------------------------------------------------------------
-- HU-13 · T1 — Tecnologías de prueba para el detalle de proyecto
-- (GET /projects/:id). "skills" sí tiene UNIQUE en name, por eso
-- ON CONFLICT (name) DO NOTHING es idempotente.
-- ------------------------------------------------------------
INSERT INTO skills (name)
VALUES
    ('Node.js'),
    ('Express'),
    ('PostgreSQL'),
    ('JavaScript'),
    ('HTML/CSS')
ON CONFLICT (name) DO NOTHING;

-- Relación N:M proyecto-tecnología. "Portafolio Personal" se deja
-- sin tecnologías a propósito, para comprobar que el detalle
-- responde `skills: []` (y no un error) cuando no hay ninguna.
INSERT INTO project_skills (project_id, skill_id)
VALUES
    (
    (SELECT id FROM projects WHERE title = 'Altea Gallery'),
    (SELECT id FROM skills WHERE name = 'Node.js')
    ),
    (
    (SELECT id FROM projects WHERE title = 'Altea Gallery'),
    (SELECT id FROM skills WHERE name = 'Express')
    ),
    (
    (SELECT id FROM projects WHERE title = 'Altea Gallery'),
    (SELECT id FROM skills WHERE name = 'PostgreSQL')
    ),
    (
    (SELECT id FROM projects WHERE title = 'Task Manager API'),
    (SELECT id FROM skills WHERE name = 'Node.js')
    ),
    (
    (SELECT id FROM projects WHERE title = 'Task Manager API'),
    (SELECT id FROM skills WHERE name = 'JavaScript')
    )
ON CONFLICT (project_id, skill_id) DO NOTHING;