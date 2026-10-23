CREATE DATABASE IF NOT EXISTS f1_arena CHARACTER SET utf8mb4;
USE f1_arena;
CREATE TABLE seasons(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE teams(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(80) NOT NULL UNIQUE,color CHAR(7) NOT NULL DEFAULT '#FF1801');
CREATE TABLE drivers(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(80) NOT NULL,number SMALLINT NULL UNIQUE,team_id INT NULL,
  FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL);
CREATE TABLE races(id INT AUTO_INCREMENT PRIMARY KEY,season_id INT NOT NULL,name VARCHAR(120) NOT NULL,circuit VARCHAR(120),race_date DATE NOT NULL,has_sprint TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY(season_id) REFERENCES seasons(id) ON DELETE CASCADE);
CREATE TABLE results(id INT AUTO_INCREMENT PRIMARY KEY,race_id INT NOT NULL,kind ENUM('gp','sprint') NOT NULL,position SMALLINT NOT NULL,driver_id INT NOT NULL,team_id INT NULL,
  UNIQUE(race_id,kind,position),UNIQUE(race_id,kind,driver_id),
  FOREIGN KEY(race_id) REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY(driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL);
CREATE TABLE scoring(id INT AUTO_INCREMENT PRIMARY KEY,kind ENUM('gp','sprint') NOT NULL,position SMALLINT NOT NULL,points INT NOT NULL,UNIQUE(kind,position));
INSERT INTO seasons(name) VALUES('Saison 1');
INSERT INTO scoring(kind,position,points) VALUES
('gp',1,25),('gp',2,18),('gp',3,15),('gp',4,12),('gp',5,10),('gp',6,8),('gp',7,6),('gp',8,4),('gp',9,2),('gp',10,1),
('sprint',1,8),('sprint',2,7),('sprint',3,6),('sprint',4,5),('sprint',5,4),('sprint',6,3),('sprint',7,2),('sprint',8,1);
