# Ce code python est un simple code qui sert a expliquer l'algoritme de façon plus claire en python pour,
# le vrais logiciel qui sera en html css javascript avec une bdd.

# Le code est pour la plus par avec de nom Anglais car l'outil finale sera en Anglais,
# mais les anotation son en Francais pour la compréhention.

class Driver:
    """Représente un pilote de Formule 1."""

    def __init__(self, name, surname):
        self.name = name
        self.surname = surname
        self.tabname = surname[:3].upper()

        self.num_pilot = None
        self.rescu_num_pilot = None
        self.team = None
        self.world_champion = False

        # Statistiques de carrière
        self.c_points = 0
        self.c_world_title = 0
        self.c_constructor_title = 0
        self.c_teams = []
        self.c_num_teams = 0

        # Statistiques de saison
        self.s_points = 0
        self.s_world_title = True
        self.s_constructor_title = True

    def number(self, new_number):
        """Attribue un numéro au pilote."""

        if not isinstance(new_number, int) or isinstance(new_number, bool):
            raise ValueError("Le numéro doit être un entier.")

        if new_number == 1:
            if not self.world_champion:
                raise ValueError("Le numéro 1 est réservé au champion en titre.")

            if self.num_pilot != 1:
                self.rescu_num_pilot = self.num_pilot

            self.num_pilot = 1

        elif 2 <= new_number <= 99:
            self.num_pilot = new_number
            self.rescu_num_pilot = new_number

        else:
            raise ValueError("Le numéro doit être compris entre 1 et 99.")

    def contract(self, team):
        """Transfère le pilote vers une écurie."""

        if self.team is team:
            return

        if self.team is not None:
            old_team = self.team

            if old_team.first_driver is self:
                old_team.first_driver = None

            if old_team.second_driver is self:
                old_team.second_driver = None

        self.team = team

        if team.name not in self.c_teams:
            self.c_teams.append(team.name)
            self.c_num_teams = len(self.c_teams)

    def race_result(self, points):
        """Ajoute les points de course."""

        self.s_points += points
        self.c_points += points

    def season_winner(self):
        """Attribue le titre de champion du monde."""

        self.world_champion = True
        self.c_world_title += 1

    def lose_champion_status(self):
        """Retire le statut de champion et restaure son numéro."""

        self.world_champion = False

        if self.num_pilot == 1:
            self.num_pilot = self.rescu_num_pilot
            self.rescu_num_pilot = None

    def title(self, remaining_races, remaining_sprints, best_opponent):
        """Vérifie si le titre pilote reste mathématiquement possible."""

        maximum = (
            self.s_points
            + remaining_races * 25
            + remaining_sprints * 8
        )

        self.s_world_title = maximum >= best_opponent

    def reset_season(self):
        """Réinitialise les statistiques de saison."""

        self.s_points = 0
        self.s_world_title = True
        self.s_constructor_title = True


class Team:
    """Représente une écurie et ses deux pilotes."""

    def __init__(self, name):
        self.name = name
        self.first_driver = None
        self.second_driver = None

        # Statistiques de saison
        self.s_points = 0
        self.s_title = True
        self.title = False

        # Statistiques de carrière
        self.c_points = 0
        self.c_title = 0

    def rename(self, new_name):
        """Renomme l'écurie."""

        if not isinstance(new_name, str) or not new_name.strip():
            raise ValueError("Le nom de l'écurie est invalide.")

        old_name = self.name
        new_name = new_name.strip()

        for driver in self.drivers():
            driver.c_teams = [
                new_name if name == old_name else name
                for name in driver.c_teams
            ]

        self.name = new_name

    def drivers(self):
        """Retourne les pilotes de l'écurie."""

        return [
            driver
            for driver in (self.first_driver, self.second_driver)
            if driver is not None
        ]

    def add_driver(self, driver, position):
        """Affecte un pilote à la place 1 ou 2."""

        if position not in (1, 2):
            raise ValueError("La position doit être 1 ou 2.")

        if not isinstance(driver, Driver):
            raise TypeError("Le pilote doit être un objet Driver.")

        attribute = "first_driver" if position == 1 else "second_driver"
        other_attribute = (
            "second_driver" if position == 1 else "first_driver"
        )

        if getattr(self, attribute) is driver:
            return

        # Retire le pilote de son ancienne place dans cette écurie.
        if getattr(self, other_attribute) is driver:
            setattr(self, other_attribute, None)

        # Libère la place cible.
        previous_driver = getattr(self, attribute)

        if previous_driver is not None:
            previous_driver.team = None

        # Le transfert retire le pilote de son ancienne écurie.
        driver.contract(self)

        setattr(self, attribute, driver)

    def add_points(self, points):
        """Ajoute les points de l'écurie."""

        self.s_points += points
        self.c_points += points

    def award_title(self):
        """Attribue le titre constructeur."""

        self.title = True
        self.c_title += 1

    def reset_season(self):
        """Réinitialise les statistiques de saison."""

        self.s_points = 0
        self.s_title = True
        self.title = False


class Race:
    """Représente un Grand Prix avec ou sans sprint."""

    RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
    SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1]

    def __init__(self, name, year, sprint=False):
        self.name = name
        self.year = year
        self.sprint = sprint

        self.lst_ordre_arriver = []
        self.sprint_results = []

        self.completed = False

    def set_results(self, drivers, is_sprint=False):
        """Enregistre l'ordre d'arrivée."""

        if self.completed:
            raise ValueError("Cette course est déjà terminée.")

        if is_sprint and not self.sprint:
            raise ValueError("Cette course ne comporte pas de sprint.")

        if not is_sprint:
            self.lst_ordre_arriver = list(drivers)
        else:
            self.sprint_results = list(drivers)

    def award_points(self, drivers, is_sprint=False):
        """Distribue les points aux pilotes et aux écuries."""

        points_table = (
            self.SPRINT_POINTS if is_sprint else self.RACE_POINTS
        )

        for position, driver in enumerate(drivers):
            points = (
                points_table[position]
                if position < len(points_table)
                else 0
            )

            driver.race_result(points)

            if driver.team is not None:
                driver.team.add_points(points)


class Saison:
    """Gère l'ensemble du championnat."""

    def __init__(self, year):
        self.year = year

        self.lst_race = []
        self.lst_team = []
        self.lst_driver = []

        self.finished = False

    def _check_active(self):
        if self.finished:
            raise ValueError("La saison est terminée.")

    def add_driver(self, driver):
        """Inscrit un pilote."""

        self._check_active()

        if not isinstance(driver, Driver):
            raise TypeError("Le pilote doit être un objet Driver.")

        if driver in self.lst_driver:
            raise ValueError("Ce pilote est déjà inscrit.")

        self.lst_driver.append(driver)

    def add_team(self, team):
        """Inscrit une écurie."""

        self._check_active()

        if not isinstance(team, Team):
            raise TypeError("L'écurie doit être un objet Team.")

        if team in self.lst_team:
            raise ValueError("Cette écurie est déjà inscrite.")

        self.lst_team.append(team)

    def add_race(self, race):
        """Ajoute une course au calendrier."""

        self._check_active()

        if not isinstance(race, Race):
            raise TypeError("La course doit être un objet Race.")

        if race.year != self.year:
            raise ValueError("L'année de la course est incorrecte.")

        if race in self.lst_race:
            raise ValueError("Cette course existe déjà.")

        self.lst_race.append(race)

    def _validate_results(self, race, drivers):
        """Vérifie les résultats avant l'attribution des points."""

        if race not in self.lst_race:
            raise ValueError("Cette course n'appartient pas à la saison.")

        if race.completed:
            raise ValueError("Cette course est déjà terminée.")

        if not drivers:
            raise ValueError("Le classement ne peut pas être vide.")

        if len(set(drivers)) != len(drivers):
            raise ValueError("Un pilote apparaît plusieurs fois.")

        for driver in drivers:
            if driver not in self.lst_driver:
                raise ValueError("Un pilote n'est pas inscrit à la saison.")

            if driver.team not in self.lst_team:
                raise ValueError(
                    f"{driver.name} {driver.surname} "
                    "n'appartient à aucune écurie inscrite."
                )

    def run_race(self, race, arrival_order, sprint_order=None):
        """Termine un Grand Prix et distribue les points."""

        self._check_active()
        self._validate_results(race, arrival_order)

        if race.sprint:
            if sprint_order is None:
                raise ValueError("Le classement sprint est obligatoire.")

            self._validate_results(race, sprint_order)

        elif sprint_order is not None:
            raise ValueError("Cette course ne comporte pas de sprint.")

        # Enregistre et distribue les points du sprint.
        if sprint_order is not None:
            race.set_results(sprint_order, is_sprint=True)
            race.award_points(sprint_order, is_sprint=True)

        # Enregistre et distribue les points du Grand Prix.
        race.set_results(arrival_order)
        race.award_points(arrival_order)

        # La course est terminée uniquement après tous les résultats.
        race.completed = True

        self.update_title_eligibility()

    def driver_standings(self):
        """Retourne le classement des pilotes."""

        return sorted(
            self.lst_driver,
            key=lambda driver: driver.s_points,
            reverse=True
        )

    def team_standings(self):
        """Retourne le classement des constructeurs."""

        return sorted(
            self.lst_team,
            key=lambda team: team.s_points,
            reverse=True
        )

    def update_title_eligibility(self):
        """Vérifie les possibilités mathématiques de titre."""

        remaining_races = [
            race for race in self.lst_race if not race.completed
        ]

        remaining_sprints = sum(
            1 for race in remaining_races if race.sprint
        )

        for driver in self.lst_driver:
            opponents = [
                other.s_points
                for other in self.lst_driver
                if other is not driver
            ]

            best_opponent = max(opponents, default=0)

            driver.title(
                len(remaining_races),
                remaining_sprints,
                best_opponent
            )

        for team in self.lst_team:
            opponents = [
                other.s_points
                for other in self.lst_team
                if other is not team
            ]

            best_opponent = max(opponents, default=0)

            # Maximum constructeurs : les deux meilleurs résultats
            # possibles d'une même écurie à chaque course.
            drivers_count = len(team.drivers())

            race_max = sum(
                Race.RACE_POINTS[:drivers_count]
            )

            sprint_max = sum(
                Race.SPRINT_POINTS[:drivers_count]
            )

            maximum = (
                team.s_points
                + len(remaining_races) * race_max
                + remaining_sprints * sprint_max
            )

            team.s_title = maximum >= best_opponent

            for driver in team.drivers():
                driver.s_constructor_title = team.s_title

    def end_season(self):
        """Attribue les titres puis réinitialise les statistiques."""

        self._check_active()

        if not self.lst_race or any(
            not race.completed for race in self.lst_race
        ):
            raise ValueError(
                "Toutes les courses doivent être terminées."
            )

        if not self.lst_driver or not self.lst_team:
            raise ValueError(
                "Le championnat doit comporter des pilotes et des écuries."
            )

        driver_ranking = self.driver_standings()
        team_ranking = self.team_standings()

        champion = driver_ranking[0]
        constructor_champion = team_ranking[0]

        # Sauvegarde des résultats avant la remise à zéro.
        results = {
            "year": self.year,
            "champion": champion,
            "constructor_champion": constructor_champion,
            "driver_ranking": driver_ranking,
            "team_ranking": team_ranking,
        }

        # Gestion du changement de champion.
        for driver in self.lst_driver:
            if driver.world_champion and driver is not champion:
                driver.lose_champion_status()

        champion.season_winner()
        constructor_champion.award_title()

        # Remise à zéro des statistiques saisonnières.
        for driver in self.lst_driver:
            driver.reset_season()

        for team in self.lst_team:
            team.reset_season()

        self.finished = True

        return results


# ==================================================
# EXEMPLE D'UTILISATION
# ==================================================

if __name__ == "__main__":

    season = Saison(2026)

    # Création des écuries
    ferrari = Team("Ferrari")
    mercedes = Team("Mercedes")

    season.add_team(ferrari)
    season.add_team(mercedes)

    # Création des pilotes
    leclerc = Driver("Charles", "Leclerc")
    hamilton = Driver("Lewis", "Hamilton")
    russell = Driver("George", "Russell")
    antonelli = Driver("Andrea", "Antonelli")

    for driver in (leclerc, hamilton, russell, antonelli):
        season.add_driver(driver)

    # Attribution des pilotes
    ferrari.add_driver(leclerc, 1)
    ferrari.add_driver(hamilton, 2)

    mercedes.add_driver(russell, 1)
    mercedes.add_driver(antonelli, 2)

    # Création d'un Grand Prix avec sprint
    race = Race("Grand Prix de France", 2026, sprint=True)
    season.add_race(race)

    # Classements d'arrivée
    season.run_race(
        race,
        arrival_order=[
            leclerc,
            russell,
            hamilton,
            antonelli
        ],
        sprint_order=[
            russell,
            leclerc,
            antonelli,
            hamilton
        ]
    )

    # Affichage du classement pilotes
    print("\nCLASSEMENT PILOTES")

    for position, driver in enumerate(
        season.driver_standings(), start=1
    ):
        print(
            f"{position}. {driver.name} {driver.surname} "
            f"- {driver.s_points} points"
        )

    # Affichage du classement constructeurs
    print("\nCLASSEMENT CONSTRUCTEURS")

    for position, team in enumerate(
        season.team_standings(), start=1
    ):
        print(f"{position}. {team.name} - {team.s_points} points")
