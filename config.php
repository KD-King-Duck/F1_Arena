<?php
// Réglages XAMPP par défaut : modifie-les si besoin.
const DB_HOST='localhost',DB_NAME='f1_arena',DB_USER='root',DB_PASS='';
function db(){static $p;return $p??=new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',DB_USER,DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);}
