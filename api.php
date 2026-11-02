<?php

/**
 * Point d'entrée JSON pour la gestion du championnat.
 *
 * Opérations :
 * - GET : retourne les données des tables ou les compteurs d'intégrité.
 * - DELETE : supprime un enregistrement d'une table autorisée.
 * - Autres méthodes : lit le corps JSON et exécute l'opération demandée.
 *
 * Le champ "t" désigne une table ou une opération particulière :
 * - championships : création avec initialisation du barème de points.
 * - results : remplacement du classement d'une course.
 * - scoring : remplacement du barème d'un championnat.
 * - duplicate_calendar : copie des courses entre deux saisons.
 *
 * Les autres créations et modifications utilisent la liste des champs
 * autorisés ci-dessous.
 *
 * Dépendance : config.php doit fournir la fonction db().
 */

require 'config.php';

header('Content-Type: application/json');

/**
 * Tables accessibles aux opérations génériques d'écriture.
 *
 * Pour chaque table, seuls les champs listés peuvent être insérés ou modifiés.
 * Les suppressions sont également limitées à ces tables.
 */
$allowedFields = [
    'championships' => [
        'name',
    ],
    'seasons' => [
        'championship_id',
        'name',
    ],
    'teams' => [
        'championship_id',
        'name',
        'color',
    ],
    'drivers' => [
        'championship_id',
        'name',
    ],
    'season_teams' => [
        'season_id',
        'team_id',
    ],
    'season_drivers' => [
        'season_id',
        'driver_id',
        'team_id',
        'number',
    ],
    'races' => [
        'season_id',
        'name',
        'circuit',
        'race_date',
        'has_sprint',
    ],
];

try {
    $pdo = db();
    $method = $_SERVER['REQUEST_METHOD'];
    $table = $_GET['t'] ?? '';

    // ------------------------------------------------------------------
    // Lecture : contrôle d'intégrité ou récupération de toutes les données.
    // ------------------------------------------------------------------
    if ($method === 'GET') {
        if ($table === 'integrity') {
            // Compte les groupes de courses partageant la même saison,
            // le même nom et la même date, sans modifier les données.
            $sql = "
                SELECT
                    (SELECT COUNT(*) FROM races) AS races,
                    (SELECT COUNT(*) FROM results) AS results,
                    (SELECT COUNT(*) FROM fastest_laps) AS fastest_laps,
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT 1
                            FROM races
                            GROUP BY season_id, name, race_date
                            HAVING COUNT(*) > 1
                        ) AS d
                    ) AS duplicate_calendar_groups
            ";

            echo json_encode($pdo->query($sql)->fetch());
            exit;
        }

        $readableTables = [
            'championships',
            'seasons',
            'teams',
            'drivers',
            'season_teams',
            'season_drivers',
            'races',
            'results',
            'fastest_laps',
            'scoring',
        ];

        $output = [];

        foreach ($readableTables as $tableName) {
            // ORDER BY 1 trie sur la première colonne de chaque table.
            $output[$tableName] = $pdo
                ->query("SELECT * FROM $tableName ORDER BY 1")
                ->fetchAll();
        }

        echo json_encode($output);
        exit;
    }

    // ------------------------------------------------------------------
    // Suppression d'un enregistrement identifié par le paramètre GET "id".
    // ------------------------------------------------------------------
    if ($method === 'DELETE') {
        if (!isset($allowedFields[$table])) {
            throw new Exception('Table inconnue');
        }

        $statement = $pdo->prepare("DELETE FROM $table WHERE id=?");
        $statement->execute([$_GET['id']]);

        echo '{"ok":1}';
        exit;
    }

    // Les opérations suivantes utilisent le corps JSON de la requête.
    $body = json_decode(file_get_contents('php://input'), true);
    $table = $body['t'] ?? '';

    // ------------------------------------------------------------------
    // Création d'un championnat avec son barème de points initial.
    // ------------------------------------------------------------------
    if ($table === 'championships' && empty($body['id'])) {
        // La création et le barème doivent être enregistrés ensemble.
        $pdo->beginTransaction();

        $statement = $pdo->prepare(
            'INSERT INTO championships(name) VALUES(?)'
        );
        $statement->execute([$body['data']['name']]);

        $id = $pdo->lastInsertId();

        $scoringStatement = $pdo->prepare(
            'INSERT INTO scoring(championship_id,kind,position,points)
             VALUES(?,?,?,?)'
        );

        // Chaque entrée contient : [position, points].
        $gpScoring = [
            [1, 25],
            [2, 18],
            [3, 15],
            [4, 12],
            [5, 10],
            [6, 8],
            [7, 6],
            [8, 4],
            [9, 2],
            [10, 1],
        ];

        $sprintScoring = [
            [1, 8],
            [2, 7],
            [3, 6],
            [4, 5],
            [5, 4],
            [6, 3],
            [7, 2],
            [8, 1],
        ];

        foreach ($gpScoring as $row) {
            $scoringStatement->execute([
                $id,
                'gp',
                $row[0],
                $row[1],
            ]);
        }

        foreach ($sprintScoring as $row) {
            $scoringStatement->execute([
                $id,
                'sprint',
                $row[0],
                $row[1],
            ]);
        }

        $pdo->commit();

        echo json_encode(['ok' => 1, 'id' => $id]);
        exit;
    }

    // ------------------------------------------------------------------
    // Remplacement du classement pour une course et un type donnés.
    // ------------------------------------------------------------------
    if ($table === 'results') {
        $pdo->beginTransaction();

        $statement = $pdo->prepare(
            'DELETE FROM results WHERE race_id=? AND kind=?'
        );
        $statement->execute([
            $body['race_id'],
            $body['kind'],
        ]);

        $resultStatement = $pdo->prepare(
            'INSERT INTO results(race_id,kind,position,driver_id,team_id)
             VALUES(?,?,?,?,?)'
        );

        foreach ($body['rows'] as $row) {
            $resultStatement->execute([
                $body['race_id'],
                $body['kind'],
                $row['position'],
                $row['driver_id'],
                $row['team_id'] ?: null,
            ]);
        }

        // Le meilleur tour est remplacé uniquement pour une course "gp".
        if ($body['kind'] === 'gp') {
            $statement = $pdo->prepare(
                'DELETE FROM fastest_laps WHERE race_id=?'
            );
            $statement->execute([$body['race_id']]);

            if (!empty($body['fastest_driver_id'])) {
                $statement = $pdo->prepare(
                    'INSERT INTO fastest_laps(race_id,driver_id) VALUES(?,?)'
                );
                $statement->execute([
                    $body['race_id'],
                    $body['fastest_driver_id'],
                ]);
            }
        }

        $pdo->commit();

        echo '{"ok":1}';
        exit;
    }

    // ------------------------------------------------------------------
    // Remplacement complet du barème de points d'un championnat.
    // ------------------------------------------------------------------
    if ($table === 'scoring') {
        $pdo->beginTransaction();

        $statement = $pdo->prepare(
            'DELETE FROM scoring WHERE championship_id=?'
        );
        $statement->execute([$body['championship_id']]);

        $scoringStatement = $pdo->prepare(
            'INSERT INTO scoring(championship_id,kind,position,points)
             VALUES(?,?,?,?)'
        );

        foreach ($body['rows'] as $row) {
            $scoringStatement->execute([
                $body['championship_id'],
                $row['kind'],
                $row['position'],
                $row['points'],
            ]);
        }

        $pdo->commit();

        echo '{"ok":1}';
        exit;
    }

    // ------------------------------------------------------------------
    // Copie du calendrier d'une saison vers une autre.
    // ------------------------------------------------------------------
    if ($table === 'duplicate_calendar') {
        $pdo->beginTransaction();

        $sourceStatement = $pdo->prepare(
            'SELECT name,circuit,race_date,has_sprint
             FROM races
             WHERE season_id=?
             ORDER BY race_date,id'
        );
        $sourceStatement->execute([$body['source_season_id']]);

        $insertStatement = $pdo->prepare(
            'INSERT INTO races(season_id,name,circuit,race_date,has_sprint)
             VALUES(?,?,?,?,?)'
        );

        // Les courses sont ajoutées sans supprimer le calendrier cible.
        foreach ($sourceStatement->fetchAll() as $race) {
            $insertStatement->execute([
                $body['season_id'],
                $race['name'],
                $race['circuit'],
                $race['race_date'],
                $race['has_sprint'],
            ]);
        }

        $pdo->commit();

        echo '{"ok":1}';
        exit;
    }

    // ------------------------------------------------------------------
    // Création ou modification générique d'un enregistrement.
    // ------------------------------------------------------------------
    if (!isset($allowedFields[$table])) {
        throw new Exception('Table inconnue');
    }

    // Ignore les champs qui ne figurent pas dans la liste autorisée.
    $data = [];

    foreach ($allowedFields[$table] as $column) {
        if (array_key_exists($column, $body['data'])) {
            $data[$column] = $body['data'][$column];
        }
    }

    // Les noms SQL proviennent des listes autorisées.
    // Les valeurs utilisateur sont transmises par paramètres préparés.
    if (!empty($body['id'])) {
        $assignments = implode(
            ',',
            array_map(
                fn($column) => "$column=?",
                array_keys($data)
            )
        );

        $statement = $pdo->prepare(
            "UPDATE $table SET $assignments WHERE id=?"
        );
        $statement->execute([
            ...array_values($data),
            $body['id'],
        ]);

        $id = $body['id'];
    } else {
        $columns = implode(',', array_keys($data));
        $placeholders = implode(
            ',',
            array_fill(0, count($data), '?')
        );

        $statement = $pdo->prepare(
            "INSERT INTO $table($columns) VALUES($placeholders)"
        );
        $statement->execute(array_values($data));

        $id = $pdo->lastInsertId();
    }

    echo json_encode(['ok' => 1, 'id' => $id]);
} catch (Throwable $exception) {
    // Annule les opérations partielles lorsqu'une transaction est active.
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    // Le code SQLSTATE 23000 correspond aux violations d'intégrité.
    $errorMessage = $exception->getCode() === '23000'
        ? 'Valeur déjà utilisée ou donnée liée (doublon)'
        : $exception->getMessage();

    echo json_encode(['error' => $errorMessage]);
}