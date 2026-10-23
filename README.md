# F1 Arena

Site de suivi de championnat pour un jeu inventé : écuries, pilotes, calendrier, résultats et classements. La base de données est **vierge** : tout se crée depuis le site.

**Stack :** HTML / CSS / JavaScript (front), PHP (`api.php`), MySQL / MariaDB.

## Structure

```text
F1_Arena/
├── index.html        Accueil (prochain GP, tops)
├── calendar.html     Saisons et Grands Prix
├── results.html      Saisie des résultats + barème de points
├── standings.html    Classements pilotes et écuries
├── drivers.html      Gestion des pilotes
├── teams.html        Gestion des écuries
├── css/style.css     Styles (DA Arena)
├── js/               Un fichier JS par page + common.js
├── api.php           API entre le site et la base
├── config.php        Identifiants MySQL
├── F1_BDD.sql        Création de la base (vide)
└── README.md
```

## 1. Installer XAMPP

1. Télécharge XAMPP sur https://www.apachefriends.org (version avec PHP 8.x).
2. Installe-le (dossier par défaut : `C:\xampp`).
3. Ouvre le **XAMPP Control Panel**.

## 2. Placer le projet

Copie le dossier `F1_Arena` dans :

```text
C:\xampp\htdocs\F1_Arena
```

Les fichiers (`index.html`, `api.php`, etc.) doivent se trouver directement dans ce dossier, pas dans un sous-dossier en plus.

## 3. Démarrer les services

Dans le XAMPP Control Panel, clique sur **Start** pour :

- **Apache** (serveur web et PHP)
- **MySQL** (base de données)

Les deux doivent passer au vert. Si Apache ne démarre pas, le port 80 est probablement pris (Skype, IIS, autre serveur) : ferme le programme concerné ou change le port dans `Config > httpd.conf`.

## 4. Créer la base de données

1. Ouvre http://localhost/phpmyadmin
2. Clique sur l'onglet **Importer**.
3. Choisis le fichier `F1_BDD.sql`, puis clique sur **Importer** en bas de page.

La base `f1_arena` est créée avec toutes ses tables, sans aucune donnée.

> **Attention :** `F1_BDD.sql` commence par `DROP DATABASE IF EXISTS f1_arena`. Le réimporter **efface toutes tes données**. Ne le refais que pour repartir de zéro.

## 5. Vérifier la connexion

Par défaut, `config.php` utilise les réglages XAMPP :

```php
const DB_HOST='localhost', DB_NAME='f1_arena', DB_USER='root', DB_PASS='';
```

Si tu as mis un mot de passe à MySQL, modifie `DB_PASS`.

## 6. Ouvrir le site

http://localhost/F1_Arena/index.html

N'ouvre pas les fichiers en double-cliquant dessus (`file://...`) : le PHP ne fonctionnerait pas.

## 7. Premiers pas (dans cet ordre)

1. **Calendrier** : crée une saison, puis ajoute tes Grands Prix (case « Course sprint » si besoin).
2. **Écuries** : crée tes écuries (nom + couleur).
3. **Pilotes** : crée tes pilotes (nom, numéro, écurie).
4. **Résultats** : dans la section « Barème de points », renseigne les points par position et enregistre. Tant que le barème est vide, chaque position rapporte 0 point.
5. **Résultats** : choisis un GP, saisis l'ordre d'arrivée et enregistre.
6. **Classement** : consulte les classements pilotes et écuries.

Le sélecteur de saison en haut à droite change la saison affichée sur toutes les pages.

## Bon à savoir

- L'écurie d'un pilote est enregistrée avec chaque résultat : un changement d'écurie en cours de saison ne modifie pas les points déjà marqués.
- Supprimer un pilote, un GP ou une saison supprime aussi les résultats liés.
- Les polices (Exo 2, Inter) viennent de Google Fonts : sans internet, le site utilise des polices de secours.

## Problèmes fréquents

| Message ou symptôme | Solution |
|---|---|
| « API injoignable… » | Apache ou MySQL n'est pas démarré, ou le site est ouvert en `file://`. |
| Erreur `Unknown database 'f1_arena'` | Importe `F1_BDD.sql` (étape 4). |
| Erreur `Access denied for user` | Vérifie `DB_USER` et `DB_PASS` dans `config.php`. |
| Page blanche ou code PHP affiché | Le dossier n'est pas dans `htdocs`, ou Apache n'est pas lancé. |
| « Valeur déjà utilisée (doublon) » | Un nom d'écurie, un numéro de pilote ou un nom de saison existe déjà. |
| `#1050 La table existe déjà` à l'import | Utilise la version de `F1_BDD.sql` fournie ici, qui supprime et recrée la base. |
