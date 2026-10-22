class Participant:

    def __init__(self, prenom, nom, tablename=None):
        
        self.prenom = prenom
        self.nom = nom
        self.nom_tableau = self.tablename(tablename)
        self.victoire = 0
        self.score = 0
        self.defaite = 0
        self.en_lice = True
    

    def __str__(self):

        return f"{self.prenom} {self.nom}"

    
    def str_classement(self):

        return f"{self.nom_tableau}"

    
    def tablename(self, name=None):

        if name == None:
            name = ""

            for i in range(3):
                name += self.nom[i]

            self.nom_tableau = name
        
        else:
            self.nom_tableau = name


    def match(self, score, resultat):

        self.score += score

        if resultat == Vic:
            self.victoire += 1
        else:
            self.defaite += 1


    def concoure(self, best, point):

        if self.score + point >= best:
            self.en_lice = True

        else:
            self.enlice = False