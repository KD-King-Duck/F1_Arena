# F1 Arena

F1 Arena est un prototype de site consacré à la Formule 1 : calendrier, pilotes, écuries, classements et pronostics.

## Structure du projet

```text
F1_Arena/
├── index.html
├── calendar.html
├── standings.html
├── drivers.html
├── teams.html
├── predictions.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── data.js
├── Algo_Vpython.py
└── F1_BDD.sql
```

## Choix d'implémentation

- Les contenus visibles des pages sont écrits directement dans chaque fichier HTML.
- Le JavaScript ne génère plus les cartes, les lignes de tableau ou les champs du formulaire : il gère seulement le menu mobile, les filtres, la recherche et la sauvegarde locale des pronostics.
- `data.js` conserve un jeu de données de démonstration pour les prochaines étapes d'intégration.
- `F1_BDD.sql` contient le schéma MySQL/MariaDB prévu pour XAMPP.
- `Algo_Vpython.py` reste le prototype métier Python.

## Lancement en local avec XAMPP

1. Décompresser le projet dans `C:\xampp\htdocs\F1_Arena`.
2. Démarrer Apache depuis le panneau de contrôle XAMPP.
3. Ouvrir `http://localhost/F1_Arena/`.

Pour importer la base de données : ouvrir phpMyAdmin, importer `F1_BDD.sql`, puis vérifier la création de la base `f1_arena`.

## Limites actuelles

Le site utilise des données fictives de démonstration. Les pronostics sont sauvegardés dans le `localStorage` du navigateur ; ils ne sont pas encore enregistrés dans MySQL. Une API/backend PHP devra assurer la connexion à la base, l'authentification et la validation des pronostics.

Les informations de calendrier et de classement ne constituent pas un flux officiel en temps réel.
