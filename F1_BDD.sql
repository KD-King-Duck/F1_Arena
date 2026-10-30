CREATE DATABASE IF NOT EXISTS f1_arena CHARACTER SET utf8mb4;
USE f1_arena;

CREATE TABLE championships (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE seasons (
 id INT AUTO_INCREMENT PRIMARY KEY, championship_id INT NOT NULL, name VARCHAR(80) NOT NULL,
 UNIQUE(championship_id,name), FOREIGN KEY(championship_id) REFERENCES championships(id) ON DELETE CASCADE
);
CREATE TABLE teams (
 id INT AUTO_INCREMENT PRIMARY KEY, championship_id INT NOT NULL, name VARCHAR(80) NOT NULL, color CHAR(7) NOT NULL DEFAULT '#FF1801',
 UNIQUE(championship_id,name), FOREIGN KEY(championship_id) REFERENCES championships(id) ON DELETE CASCADE
);
CREATE TABLE drivers (
 id INT AUTO_INCREMENT PRIMARY KEY, championship_id INT NOT NULL, name VARCHAR(80) NOT NULL,
 UNIQUE(championship_id,name), FOREIGN KEY(championship_id) REFERENCES championships(id) ON DELETE CASCADE
);
CREATE TABLE season_teams (
 id INT AUTO_INCREMENT PRIMARY KEY, season_id INT NOT NULL, team_id INT NOT NULL, UNIQUE(season_id,team_id),
 FOREIGN KEY(season_id) REFERENCES seasons(id) ON DELETE CASCADE, FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE TABLE season_drivers (
 id INT AUTO_INCREMENT PRIMARY KEY, season_id INT NOT NULL, driver_id INT NOT NULL, team_id INT NULL, number SMALLINT NULL,
 UNIQUE(season_id,driver_id), UNIQUE(season_id,number), FOREIGN KEY(season_id) REFERENCES seasons(id) ON DELETE CASCADE,
 FOREIGN KEY(driver_id) REFERENCES drivers(id) ON DELETE CASCADE, FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
);
CREATE TABLE races (
 id INT AUTO_INCREMENT PRIMARY KEY, season_id INT NOT NULL, name VARCHAR(120) NOT NULL, circuit VARCHAR(120), race_date DATE NOT NULL,
 has_sprint TINYINT(1) NOT NULL DEFAULT 0, FOREIGN KEY(season_id) REFERENCES seasons(id) ON DELETE CASCADE
);
CREATE TABLE results (
 id INT AUTO_INCREMENT PRIMARY KEY, race_id INT NOT NULL, kind ENUM('gp','sprint') NOT NULL, position SMALLINT NOT NULL,
 driver_id INT NOT NULL, team_id INT NULL, UNIQUE(race_id,kind,position), UNIQUE(race_id,kind,driver_id),
 FOREIGN KEY(race_id) REFERENCES races(id) ON DELETE CASCADE, FOREIGN KEY(driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
 FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
);
CREATE TABLE fastest_laps (race_id INT PRIMARY KEY, driver_id INT NOT NULL,
 FOREIGN KEY(race_id) REFERENCES races(id) ON DELETE CASCADE, FOREIGN KEY(driver_id) REFERENCES drivers(id) ON DELETE CASCADE);
CREATE TABLE scoring (
 id INT AUTO_INCREMENT PRIMARY KEY, championship_id INT NOT NULL, kind ENUM('gp','sprint') NOT NULL, position SMALLINT NOT NULL, points INT NOT NULL,
 UNIQUE(championship_id,kind,position), FOREIGN KEY(championship_id) REFERENCES championships(id) ON DELETE CASCADE
);
