-- ============================================================
-- F1 Arena - Schéma de base de données MySQL / MariaDB
-- Compatible avec XAMPP (phpMyAdmin / MySQL ou MariaDB)
-- Encodage : utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS f1_arena
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE f1_arena;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_driver_standings;
DROP VIEW IF EXISTS v_constructor_standings;

DROP TABLE IF EXISTS prediction_picks;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS race_results;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS season_drivers;
DROP TABLE IF EXISTS season_teams;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS circuits;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. Utilisateurs et rôles
-- ------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    avatar_url VARCHAR(500) NULL,
    bio VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_created_at (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Pilotes (identité stable, statistiques calculables)
-- ------------------------------------------------------------
CREATE TABLE drivers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    driver_code CHAR(3) NULL,
    nationality VARCHAR(100) NULL,
    country_code CHAR(3) NULL,
    date_of_birth DATE NULL,
    permanent_number TINYINT UNSIGNED NULL,
    photo_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_drivers_code (driver_code),
    UNIQUE KEY uq_drivers_permanent_number (permanent_number),
    KEY idx_drivers_name (last_name, first_name),
    CONSTRAINT chk_driver_number CHECK (permanent_number IS NULL OR permanent_number BETWEEN 1 AND 99)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Écuries
-- ------------------------------------------------------------
CREATE TABLE teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(60) NULL,
    nationality VARCHAR(100) NULL,
    country_code CHAR(3) NULL,
    logo_url VARCHAR(500) NULL,
    primary_color CHAR(7) NULL,
    secondary_color CHAR(7) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teams_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Circuits
-- ------------------------------------------------------------
CREATE TABLE circuits (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NULL,
    country VARCHAR(100) NULL,
    country_code CHAR(3) NULL,
    length_km DECIMAL(6,3) NULL,
    lap_record VARCHAR(30) NULL,
    lap_record_driver_id BIGINT UNSIGNED NULL,
    image_url VARCHAR(500) NULL,
    map_image_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_circuits_country (country),
    CONSTRAINT fk_circuits_lap_record_driver
        FOREIGN KEY (lap_record_driver_id) REFERENCES drivers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_circuit_length CHECK (length_km IS NULL OR length_km > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. Saisons / championnats
-- ------------------------------------------------------------
CREATE TABLE seasons (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    year SMALLINT UNSIGNED NOT NULL,
    name VARCHAR(100) NULL,
    status ENUM('planned', 'active', 'finished', 'archived') NOT NULL DEFAULT 'planned',
    start_date DATE NULL,
    end_date DATE NULL,
    champion_driver_id BIGINT UNSIGNED NULL,
    champion_team_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seasons_year (year),
    CONSTRAINT fk_seasons_champion_driver
        FOREIGN KEY (champion_driver_id) REFERENCES drivers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_seasons_champion_team
        FOREIGN KEY (champion_team_id) REFERENCES teams(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_season_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. Écuries inscrites à une saison
-- ------------------------------------------------------------
CREATE TABLE season_teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    season_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    team_display_name VARCHAR(120) NULL,
    points_override DECIMAL(7,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_season_team (season_id, team_id),
    UNIQUE KEY uq_season_team_id_pair (season_id, id),
    CONSTRAINT fk_season_teams_season
        FOREIGN KEY (season_id) REFERENCES seasons(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_season_teams_team
        FOREIGN KEY (team_id) REFERENCES teams(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. Pilotes inscrits à une saison
-- team_position : 1 ou 2, selon le siège dans l'écurie
-- car_number : numéro utilisé cette saison (peut être le 1)
-- ------------------------------------------------------------
CREATE TABLE season_drivers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    season_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    season_team_id BIGINT UNSIGNED NOT NULL,
    car_number TINYINT UNSIGNED NOT NULL,
    team_position TINYINT UNSIGNED NULL,
    is_world_champion BOOLEAN NOT NULL DEFAULT FALSE,
    points_override DECIMAL(7,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_season_driver (season_id, driver_id),
    UNIQUE KEY uq_season_car_number (season_id, car_number),
    UNIQUE KEY uq_season_team_position (season_team_id, team_position),
    UNIQUE KEY uq_season_driver_id_pair (season_id, id),
    KEY idx_season_drivers_team (season_team_id),
    CONSTRAINT fk_season_drivers_season_team
        FOREIGN KEY (season_id, season_team_id)
        REFERENCES season_teams(season_id, id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_season_drivers_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_season_car_number CHECK (car_number BETWEEN 1 AND 99),
    CONSTRAINT chk_season_team_position CHECK (team_position IS NULL OR team_position IN (1, 2))
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. Courses / Grands Prix
-- ------------------------------------------------------------
CREATE TABLE races (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    season_id BIGINT UNSIGNED NOT NULL,
    circuit_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    round_number TINYINT UNSIGNED NOT NULL,
    race_date DATETIME NULL,
    sprint_date DATETIME NULL,
    has_sprint BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    race_distance_laps SMALLINT UNSIGNED NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_season_round (season_id, round_number),
    UNIQUE KEY uq_season_race_name (season_id, name),
    KEY idx_races_date (race_date),
    CONSTRAINT fk_races_season
        FOREIGN KEY (season_id) REFERENCES seasons(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_races_circuit
        FOREIGN KEY (circuit_id) REFERENCES circuits(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_race_round CHECK (round_number >= 1)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. Résultats par session : Grand Prix ou sprint
-- points est conservé comme résultat historique, même si le barème change.
-- season_team_id enregistre l'écurie représentée au moment de la course.
-- ------------------------------------------------------------
CREATE TABLE race_results (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    race_id BIGINT UNSIGNED NOT NULL,
    season_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    season_team_id BIGINT UNSIGNED NOT NULL,
    session_type ENUM('race', 'sprint') NOT NULL DEFAULT 'race',
    position SMALLINT UNSIGNED NULL,
    points DECIMAL(5,2) NOT NULL DEFAULT 0,
    status ENUM('finished', 'dnf', 'dns', 'dsq', 'nc') NOT NULL DEFAULT 'finished',
    grid_position SMALLINT UNSIGNED NULL,
    fastest_lap BOOLEAN NOT NULL DEFAULT FALSE,
    time_or_gap VARCHAR(40) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_result_driver_session (race_id, driver_id, session_type),
    UNIQUE KEY uq_result_position_session (race_id, session_type, position),
    KEY idx_results_season_driver (season_id, driver_id),
    KEY idx_results_team (season_team_id),
    CONSTRAINT fk_results_race_season
        FOREIGN KEY (race_id) REFERENCES races(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_results_season_driver
        FOREIGN KEY (season_id, driver_id)
        REFERENCES season_drivers(season_id, driver_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_results_season_team
        FOREIGN KEY (season_id, season_team_id)
        REFERENCES season_teams(season_id, id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_result_points CHECK (points >= 0),
    CONSTRAINT chk_result_position CHECK (position IS NULL OR position >= 1)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. Pronostics : un bulletin par utilisateur et par Grand Prix
-- ------------------------------------------------------------
CREATE TABLE predictions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    race_id BIGINT UNSIGNED NOT NULL,
    status ENUM('draft', 'submitted', 'locked', 'scored') NOT NULL DEFAULT 'draft',
    score DECIMAL(7,2) NOT NULL DEFAULT 0,
    submitted_at DATETIME NULL,
    locked_at DATETIME NULL,
    scored_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_prediction_user_race (user_id, race_id),
    KEY idx_predictions_race_status (race_id, status),
    KEY idx_predictions_user (user_id, created_at),
    CONSTRAINT fk_predictions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_predictions_race
        FOREIGN KEY (race_id) REFERENCES races(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_prediction_score CHECK (score >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. Choix d'un pronostic
-- pick_type : winner, podium, pole_position, fastest_lap,
-- best_team, safety_car
-- driver_id/team_id sont utilisés selon le type de choix.
-- ------------------------------------------------------------
CREATE TABLE prediction_picks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    prediction_id BIGINT UNSIGNED NOT NULL,
    pick_type ENUM('winner', 'podium', 'pole_position', 'fastest_lap', 'best_team', 'safety_car') NOT NULL,
    driver_id BIGINT UNSIGNED NULL,
    team_id BIGINT UNSIGNED NULL,
    predicted_position TINYINT UNSIGNED NULL,
    predicted_boolean BOOLEAN NULL,
    points_awarded DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_picks_prediction_type (prediction_id, pick_type),
    KEY idx_picks_driver (driver_id),
    KEY idx_picks_team (team_id),
    CONSTRAINT fk_picks_prediction
        FOREIGN KEY (prediction_id) REFERENCES predictions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_picks_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_picks_team
        FOREIGN KEY (team_id) REFERENCES teams(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_pick_points CHECK (points_awarded >= 0),
    CONSTRAINT chk_pick_position CHECK (predicted_position IS NULL OR predicted_position BETWEEN 1 AND 3)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. Vues de classement : points calculés depuis les résultats
-- Les résultats sont la source de vérité ; ces vues ne dupliquent
-- pas les points dans une table de classement.
-- ------------------------------------------------------------
CREATE VIEW v_driver_standings AS
SELECT
    sd.season_id,
    d.id AS driver_id,
    d.first_name,
    d.last_name,
    d.driver_code,
    st.team_id,
    COALESCE(SUM(rr.points), 0) AS total_points,
    COUNT(DISTINCT CASE
        WHEN rr.session_type = 'race' AND rr.position = 1 AND rr.status = 'finished'
        THEN rr.race_id END) AS race_wins
FROM season_drivers sd
JOIN drivers d ON d.id = sd.driver_id
JOIN season_teams st ON st.id = sd.season_team_id
LEFT JOIN race_results rr
    ON rr.season_id = sd.season_id
   AND rr.driver_id = sd.driver_id
GROUP BY sd.season_id, d.id, d.first_name, d.last_name, d.driver_code, st.team_id;

CREATE VIEW v_constructor_standings AS
SELECT
    st.season_id,
    t.id AS team_id,
    COALESCE(st.team_display_name, t.name) AS team_name,
    COALESCE(SUM(rr.points), 0) AS total_points,
    COUNT(DISTINCT CASE
        WHEN rr.session_type = 'race' AND rr.position = 1 AND rr.status = 'finished'
        THEN rr.race_id END) AS race_wins
FROM season_teams st
JOIN teams t ON t.id = st.team_id
LEFT JOIN race_results rr
    ON rr.season_id = st.season_id
   AND rr.season_team_id = st.id
GROUP BY st.season_id, t.id, COALESCE(st.team_display_name, t.name);

-- ------------------------------------------------------------
-- FIN DU SCHÉMA
-- ------------------------------------------------------------
-- Sécurité / bonnes pratiques :
-- * Générer password_hash côté backend avec password_hash() en PHP.
-- * Ne jamais stocker de mot de passe en clair.
-- * Vérifier côté backend que les pronostics sont verrouillés à l'heure
--   de fermeture avant d'accepter une modification.
-- * Insérer les résultats et mettre à jour le statut de la course dans
--   une transaction SQL.
-- * Les classements sont basés sur les points persistés dans race_results.
