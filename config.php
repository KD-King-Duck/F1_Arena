<?php

// Configuration locale XAMPP.
// À adapter à ton environnement ; ne pas utiliser le compte root en production.
const DB_HOST = 'localhost';
const DB_NAME = 'f1_arena';
const DB_USER = 'root';
const DB_PASS = '';

/**
 * Retourne la connexion PDO à la base de données.
 *
 * La variable statique conserve la connexion entre les appels à cette
 * fonction pendant l'exécution du script, afin d'éviter de la recréer.
 *
 * Configuration :
 * - utf8mb4 : prise en charge complète des caractères Unicode.
 * - ERRMODE_EXCEPTION : les erreurs SQL déclenchent des exceptions.
 * - FETCH_ASSOC : les résultats sont retournés sous forme de tableaux
 *   associatifs, avec les noms de colonnes comme clés.
 *
 * @return PDO Connexion à la base de données.
 *
 * @throws PDOException Si la connexion à la base de données échoue.
 */
function db()
{
    static $connection;

    return $connection ??= new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
}