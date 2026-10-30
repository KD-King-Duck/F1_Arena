# F1 Arena

Application web de suivi d'un championnat de Formule 1 fictif. Elle permet de gérer les saisons, les Grands Prix, les écuries et les pilotes, puis de saisir les résultats afin de calculer les classements.

## Fonctionnalités

- Gestion des saisons et des Grands Prix, avec prise en charge des courses sprint.
- Gestion des écuries (nom et couleur) et des pilotes (numéro et écurie).
- Saisie des résultats de Grand Prix et de sprint.
- Barème de points configurable.
- Classements pilotes et constructeurs calculés par saison.

## Technologies

- HTML, CSS et JavaScript côté client.
- PHP 8+ pour l'API (`api.php`).
- MySQL ou MariaDB pour les données.

## Démarrage rapide avec XAMPP

1. Installe [XAMPP](https://www.apachefriends.org/) avec PHP 8 ou une version plus récente.
2. Copie le dossier du projet dans `C:\xampp\htdocs\F1_Arena`.
3. Démarre **Apache** et **MySQL** depuis le panneau de contrôle XAMPP.
4. Ouvre [phpMyAdmin](http://localhost/phpmyadmin), puis importe `F1_BDD.sql`.
5. Vérifie les paramètres de connexion dans `config.php` si ton instance MySQL n'utilise pas les valeurs par défaut.
6. Ouvre <http://localhost/F1_Arena/index.html>.

> N'ouvre pas les fichiers HTML directement avec `file://` : l'API PHP doit être servie par Apache.

### Connexion à la base de données

La configuration XAMPP par défaut est déjà renseignée :

```php
const DB_HOST = 'localhost';
const DB_NAME = 'f1_arena';
const DB_USER = 'root';
const DB_PASS = '';
```

Modifie uniquement `DB_PASS` (et les autres constantes si nécessaire) dans `config.php`.

## Première utilisation

La base initiale contient une saison et le barème F1 standard, mais aucune écurie, aucun pilote, aucun Grand Prix ni résultat.

1. Crée ou renomme une saison dans **Calendrier**.
2. Ajoute les Grands Prix.
3. Ajoute les écuries, puis les pilotes.
4. Ajuste le barème dans **Résultats** si besoin.
5. Saisis les résultats et consulte les classements.

## Structure du projet

```text
.
├── asset/                 Images de l'identité visuelle
├── css/style.css          Feuille de styles
├── js/                    Scripts communs et scripts par page
├── api.php                API PHP / MySQL
├── config.php             Configuration de la base de données
├── F1_BDD.sql             Schéma et données initiales
├── Algo_Vpython.py        Prototype Python de l'algorithme métier
├── *.html                 Pages de l'application
└── README.md
```

## Données et réinitialisation

L'import de `F1_BDD.sql` est prévu pour une base neuve. Ne le relance pas sur une base déjà initialisée : les tables existantes sont conservées et les insertions initiales peuvent échouer car certaines valeurs sont uniques.

Pour repartir de zéro, supprime d'abord la base `f1_arena` dans phpMyAdmin, puis importe à nouveau le fichier SQL. Cette opération efface définitivement les données du championnat.

## Dépannage

| Symptôme | Piste de résolution |
| --- | --- |
| « API injoignable » | Vérifie qu'Apache et MySQL sont démarrés et que l'URL commence par `http://localhost/`. |
| `Unknown database 'f1_arena'` | Importe `F1_BDD.sql` dans phpMyAdmin. |
| `Access denied for user` | Vérifie les constantes dans `config.php`. |
| Une valeur est déjà utilisée | Les noms d'écuries, noms de saisons et numéros de pilotes doivent être uniques. |
