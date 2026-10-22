# F1 Arena

**F1 Arena** est un projet de gestion et de simulation d'un championnat de Formule 1. Il permet de modéliser les pilotes, les écuries, les Grands Prix et les classements des championnats pilotes et constructeurs.

Le projet repose actuellement sur un prototype algorithmique développé en Python. Ce prototype sert à définir, tester et clarifier les règles métier avant leur intégration dans une application web utilisant HTML, CSS, JavaScript et une base de données.

## Objectifs du projet

- Reproduire le fonctionnement d'un championnat de Formule 1.
- Gérer les pilotes, leurs numéros, leurs écuries et leurs statistiques.
- Enregistrer les résultats des Grands Prix et des courses sprint.
- Calculer automatiquement les points et les classements.
- Vérifier les possibilités mathématiques de remporter un championnat.
- Gérer les titres mondiaux et les titres constructeurs.
- Préparer une architecture métier réutilisable dans une future application web.

## Fonctionnalités

### Gestion des pilotes

La classe `Driver` représente un pilote et contient ses informations ainsi que ses statistiques de carrière et de saison.

Fonctionnalités principales :
- Attribution et gestion du numéro de course.
- Gestion du numéro `1`, réservé au champion du monde en titre dans le modèle.
- Transfert entre les écuries.
- Suivi des points de carrière et de saison.
- Suivi des titres mondiaux et constructeurs.
- Historique des écuries fréquentées.
- Vérification de l'éligibilité mathématique au titre mondial.
- Réinitialisation des statistiques saisonnières.

### Gestion des écuries

La classe `Team` représente une écurie et ses deux emplacements de pilotes.

Fonctionnalités principales :
- Création et renommage d'une écurie.
- Attribution des pilotes aux positions 1 et 2.
- Gestion des transferts entre écuries.
- Calcul des points de saison et de carrière.
- Suivi des titres constructeurs.
- Vérification des possibilités mathématiques de remporter le championnat constructeurs.
- Réinitialisation des statistiques de saison.

### Gestion des courses

La classe `Race` représente un Grand Prix, avec la possibilité d'inclure une course sprint.

Fonctionnalités principales :
- Création d'une course associée à une année.
- Définition de la présence ou non d'un sprint.
- Enregistrement des ordres d'arrivée.
- Attribution automatique des points aux pilotes.
- Attribution des mêmes points aux écuries des pilotes concernés.
- Contrôle de l'état de la course.

### Gestion du championnat

La classe `Saison` centralise la gestion du championnat pour une année donnée.

Fonctionnalités principales :
- Inscription des pilotes et des écuries.
- Création du calendrier des courses.
- Validation des classements avant leur traitement.
- Gestion des résultats des Grands Prix et des sprints.
- Calcul des classements pilotes et constructeurs.
- Mise à jour de l'éligibilité aux titres.
- Désignation des champions.
- Réinitialisation des statistiques après la clôture de la saison.

## Barème des points

Le prototype utilise les barèmes suivants :

| Position | Grand Prix | Sprint |
|---:|---:|---:|
| 1re | 25 | 8 |
| 2e | 18 | 7 |
| 3e | 15 | 6 |
| 4e | 12 | 5 |
| 5e | 10 | 4 |
| 6e | 8 | 3 |
| 7e | 6 | 2 |
| 8e | 4 | 1 |
| 9e | 2 | 0 |
| 10e | 1 | 0 |

Les pilotes classés au-delà des positions récompensées ne reçoivent aucun point. Les points des pilotes sont également ajoutés au total de leur écurie.

> **Remarque :** ce barème correspond à l'implémentation actuelle du prototype. Il ne constitue pas une garantie de conformité aux règlements officiels de chaque saison de Formule 1.

## Architecture du projet

Le prototype est organisé autour de quatre classes principales :

| Classe | Responsabilité |
|---|---|
| `Driver` | Informations, statistiques et titres des pilotes |
| `Team` | Gestion des écuries, des pilotes et des points constructeurs |
| `Race` | Résultats des courses et attribution des points |
| `Saison` | Orchestration du championnat, classements et clôture de saison |

Les relations principales sont les suivantes :

- Une saison regroupe plusieurs pilotes, écuries et courses.
- Une écurie peut accueillir jusqu'à deux pilotes.
- Un pilote peut changer d'écurie au cours de sa carrière.
- Une course possède un classement principal et, si nécessaire, un classement sprint.
- La saison centralise la validation des résultats et le calcul des classements.

## Prérequis

- Python 3.10 ou version ultérieure recommandée.
- Aucun package externe nécessaire pour le prototype fourni.

Le code utilise uniquement des fonctionnalités natives de Python.

## Installation et lancement

### 1. Récupérer le projet

Clonez le dépôt Git :

```bash
git clone <URL_DU_DEPOT>
cd F1_Classement
```

Remplacez `<URL_DU_DEPOT>` par l'adresse réelle du dépôt.

### 2. Préparer le fichier Python

Placez le code du prototype dans un fichier nommé `main.py`.

### 3. Exécuter le programme

```bash
python main.py
```

Selon votre environnement, utilisez `python3 main.py` à la place.

Le programme exécute un exemple de championnat 2026 avec les écuries Ferrari et Mercedes, quatre pilotes et un Grand Prix comprenant un sprint. Il affiche ensuite les classements des pilotes et des constructeurs.

## Exemple d'utilisation

Le scénario intégré au prototype suit les étapes suivantes :

1. Création d'une saison pour l'année 2026.
2. Inscription des écuries Ferrari et Mercedes.
3. Création et inscription de quatre pilotes.
4. Attribution des pilotes aux deux écuries.
5. Création du Grand Prix de France avec un sprint.
6. Enregistrement des résultats du sprint et du Grand Prix.
7. Distribution automatique des points.
8. Affichage des classements pilotes et constructeurs.

Ce scénario permet de vérifier le fonctionnement général du système sans interface graphique ni base de données.

## Validation des données

Le prototype intègre plusieurs contrôles pour limiter les incohérences :

- Refus d'inscrire plusieurs fois le même pilote, la même écurie ou la même course.
- Vérification de l'année associée à une course.
- Vérification de l'appartenance des pilotes et de leurs écuries à la saison.
- Refus d'un classement vide ou contenant plusieurs fois le même pilote.
- Vérification de la présence obligatoire d'un classement sprint lorsqu'une course en comporte un.
- Blocage de certaines opérations lorsque la saison est terminée.
- Vérification des valeurs lors de l'attribution des numéros et du renommage des écuries.

## État actuel du projet

Le projet est actuellement au stade du **prototype algorithmique Python**.

Le code fourni définit les principales règles métier, mais ne comprend pas encore :
- Une interface utilisateur HTML/CSS/JavaScript.
- Une API ou un backend web.
- Une base de données persistante.
- Un système d'authentification.
- Des tests automatisés dédiés.
- Une synchronisation avec les résultats officiels de la Formule 1.

Les données manipulées par le prototype sont stockées en mémoire. Elles ne sont donc pas conservées automatiquement après la fermeture du programme.

## Évolutions envisagées

La prochaine étape consiste à transformer le prototype en une application web complète.

Pistes d'évolution :
- **Frontend :** interface en HTML, CSS et JavaScript.
- **Backend :** implémentation des règles métier et exposition d'une API.
- **Base de données :** persistance des pilotes, écuries, saisons, courses et résultats.
- **Classements dynamiques :** mise à jour automatique après chaque résultat.
- **Historique :** consultation des saisons précédentes et des statistiques de carrière.
- **Tests :** validation des règles de calcul, des transferts et des conditions de victoire.
- **Données officielles :** possibilité d'intégrer ultérieurement une source fiable de résultats de Formule 1.

## Licence

Aucune licence spécifique n'est définie dans le prototype fourni. Une licence pourra être ajoutée au dépôt lorsque les conditions de réutilisation du projet auront été décidées.

---

**F1 Arena —** un moteur de championnat de Formule 1 conçu pour évoluer d'un prototype Python vers une application web complète.