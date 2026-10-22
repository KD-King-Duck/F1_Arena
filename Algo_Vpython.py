# Ce code python est un simple code qui sert a expliquer l'algoritme de façon plus claire en python.

# Le code est pour la plus par avec de nom Anglais car l'outil finale sera en Anglais,
# mais les anotation son en Francais pour la compréhention.

class Driver:

    def __init__(self, name, surname):

        # Identiter:
        self.name = name
        self.surname = surname
        self.tabname = ""
        self.num_pilot = None
        self.rescu_num_pilot = None
        self.team = None
        self.world_champion = False

        # Stats de carrière:
        self.c_points = 0
        self.c_world_title = 0
        self.c_constructor_title = 0
        self.c_teams = []
        self.c_num_teams = 0

        # Stats de saison:
        self.s_points = 0
        self.s_world_title = True
        self.s_constructor_title = True
        self.s_team_points = 0

        self.tab_name()


    def __str__(self):

        return f"{self.name} {self.surname}"


    def tab_name(self):
        """Methode pour creer le nom racourcie en trois lètres pour les classements (tableau)"""
        for i in range(3):
            self.tabname += self.surname[i]


    def number(self, new_number):
        """Méthode pour changer le numéro du pilots, avec vérification de droit"""

        if new_number == 1:
            if self.world_champion:
                self.rescu_num_pilot = self.num_pilot
                self.num_pilot = new_number

            else:
                return "Error: Le numéro 1 est réserver pour le championt du monde en titre."

        elif 4 <= new_number <= 99:
            self.num_pilot = new_number
            self.rescu_num_pilot = new_number

        else:
            return "Error: Le numéro de pilote doit être compris entre 4 et 99 inclue (exeption: numéro 1 pour le championt du monde en titre)."


    def contract(self, team):
        """Methode qui vas mettre a jour les infos des que l'ohn signe un contrat dans une ecurie"""

        self.team = team

        if team not in self.c_teams:
            self.c_num_teams += 1

        self.c_teams.append(team)


    def season_winer(self, winnerName):
        """Methode de fin de saison pour verifier si le pilot est le gagnant de la saison est mêtre a jour ses infos."""

        if winnerName == self.surname:
            self.world_champion = True
            self.c_world_title += 1

        else:
            self.world_champion = False

            if self.num_pilot == 1:
                self.num_pilot = self.rescu_num_pilot


    def constructor_winer(self, consrtuctor):
        """Methode pour le championat du monde constructeur."""

        if self.team == consrtuctor:
            self.c_constructor_title += 1


    def race_result(self, points, team_points):
        """Methode pour ajouter les points au score"""

        self.c_points += points
        self.s_points += points
        self.s_team_points = team_points


    def title(self, nb_race, nb_sprint, best_pilot, best_team):
        """Methode pour verifier si on est toujpurs en lice pour le titre"""

        # Pilot:
        max_possible_points = self.s_points + nb_race + nb_sprint + nb_race*25 + nb_sprint*8
        
        if max_possible_points <= best_pilot:
            self.s_world_title = False

        # Constructor:
        max_points_possible = self.s_team_points + nb_race + nb_sprint + nb_race*25 + nb_race*18 + nb_sprint*8 + nb_sprint*7

        if max_points_possible <= best_team:
            self.s_constructor_title = False