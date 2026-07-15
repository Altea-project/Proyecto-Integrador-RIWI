
-- ============================================================
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- ESTE SCRIPT NO DEBE CORRERSE DIRECTAMENTE EN PRODUCCIÓN.
-- Usarlo solo en entornos de desarrollo o pruebas.
-- ESTE ES SCRIPT CONTIENE LA CONFIGURACION DE LAS TABLAS Y RELACIONES CREADAS EN SUPABASE
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- ============================================================


-- ============================================================
-- Altea — Esquema de base de datos (PostgreSQL / Supabase)
-- Basado en Altea_PDR_v1_3, sección 3.2 y 3.3
-- Ruta: backend/db/schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
CREATE TYPE availability_status_enum AS ENUM ('available', 'in_conversation', 'unavailable');
CREATE TYPE interest_status_enum AS ENUM ('open', 'closed');

-- ------------------------------------------------------------
-- 1. roles
-- Catálogo de roles: admin, instructor, coder, recruiter
-- ------------------------------------------------------------
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 2. users
-- Todos los usuarios del sistema, independientemente del rol.
-- Campos company / availability_status / tl_id / avatar_url son
-- opcionales según el rol (ver notas de modelado del PDR, 3.2).
-- ------------------------------------------------------------
CREATE TABLE users (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(150) NOT NULL,
    email                 VARCHAR(150) NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,          -- sugerido: necesario para JWT/login
    phone                 VARCHAR(20),
    document              VARCHAR(50) UNIQUE,
    company               VARCHAR(150),                    -- solo aplica a rol recruiter
    role_id               INT NOT NULL REFERENCES roles(id),
    tl_id                 INT REFERENCES users(id),         -- solo aplica a rol coder (auto-referencia)
    avatar_url            TEXT,                             -- solo aplica a rol coder
    availability_status   availability_status_enum NOT NULL DEFAULT 'available', -- solo coder
    status_changed_by     INT REFERENCES users(id),         -- sugerido: auditoría RN-10
    status_changed_at     TIMESTAMP,                        -- sugerido: auditoría RN-10
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP NOT NULL DEFAULT now(),  -- sugerido
    must_change_password  BOOLEAN NOT NULL DEFAULT true  -- para forzar cambio de contraseña al primer login
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_tl_id ON users(tl_id);
CREATE INDEX idx_users_availability_status ON users(availability_status);

-- ------------------------------------------------------------
-- 3. skills
-- Catálogo de habilidades / tecnologías
-- ------------------------------------------------------------
CREATE TABLE skills (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 4. projects
-- Proyectos subidos por el coder (formación o externos)
-- ------------------------------------------------------------
CREATE TABLE projects (
    id            SERIAL PRIMARY KEY,
    coder_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(150) NOT NULL,
    description   TEXT NOT NULL,
    image_url     TEXT,
    repo_url      TEXT NOT NULL,
    is_external   BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()  -- sugerido
);

CREATE INDEX idx_projects_coder_id ON projects(coder_id);

-- ------------------------------------------------------------
-- 5. project_skills
-- Relación N:M entre proyectos y habilidades
-- ------------------------------------------------------------
CREATE TABLE project_skills (
    project_id    INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id      INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

CREATE INDEX idx_project_skills_skill_id ON project_skills(skill_id);

-- ------------------------------------------------------------
-- 6. gradings
-- Calificación de un proyecto por un instructor.
-- UNIQUE en project_id: un proyecto tiene máximo 1 calificación (RN-02)
-- ------------------------------------------------------------
CREATE TABLE gradings (
    id              SERIAL PRIMARY KEY,
    project_id      INT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    instructor_id   INT NOT NULL REFERENCES users(id),
    score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
    comment         TEXT,
    starred         BOOLEAN NOT NULL DEFAULT false,
    graded_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_gradings_instructor_id ON gradings(instructor_id);
CREATE INDEX idx_gradings_score ON gradings(score DESC);

-- ------------------------------------------------------------
-- 7. recruiter_interests
-- Registro de interés de un reclutador en un coder.
-- Nombre y empresa del reclutador NO se duplican aquí (se
-- obtienen por JOIN a users) — respeta 3FN, ver PDR 3.2.
-- ------------------------------------------------------------
CREATE TABLE recruiter_interests (
    id             SERIAL PRIMARY KEY,
    recruiter_id   INT NOT NULL REFERENCES users(id),
    coder_id       INT NOT NULL REFERENCES users(id),
    sent_at        TIMESTAMP NOT NULL DEFAULT now(),
    status         interest_status_enum NOT NULL DEFAULT 'open'
);

CREATE INDEX idx_recruiter_interests_coder_id ON recruiter_interests(coder_id);
CREATE INDEX idx_recruiter_interests_recruiter_id ON recruiter_interests(recruiter_id);

-- ------------------------------------------------------------
-- 8. saved_searches
-- Búsquedas guardadas del reclutador — FASE 2, fuera del MVP.
-- Se incluye la tabla para no romper el modelo si se activa
-- luego, pero no es necesario crearla ahora si no la usarás
-- todavía (puedes comentar este bloque).
-- ------------------------------------------------------------
CREATE TABLE saved_searches (
    id             SERIAL PRIMARY KEY,
    recruiter_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name           VARCHAR(100) NOT NULL,
    filters_json   JSONB NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);