/**
 * Gère les interactions des pages sans générer leur contenu HTML.
 *
 * Fonctionnalités :
 * - Identification du lien de navigation actif.
 * - Ouverture et fermeture du menu.
 * - Recherche dans le tableau des pilotes.
 * - Filtrage du calendrier selon la présence d'une course sprint.
 *
 * Chaque interaction est activée uniquement si son contrôle existe.
 */
document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------
  // Navigation : identifier la page courante.
  // Le body et les liens utilisent l'attribut data-page.
  // ------------------------------------------------------------------
  const currentPage = document.body.dataset.page;
  const navigationLinks = document.querySelectorAll(".navlinks a");

  navigationLinks.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // ------------------------------------------------------------------
  // Menu : basculer son affichage et son état d'accessibilité.
  // La classe "open" doit être prise en charge par le CSS.
  // ------------------------------------------------------------------
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navlinks");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // ------------------------------------------------------------------
  // Pilotes : rechercher dans tout le texte de chaque ligne.
  // La recherche ignore la casse, mais pas les accents.
  // ------------------------------------------------------------------
  const driverSearch = document.querySelector("#driver-search");
  const driverRows = document.querySelectorAll("#drivers-table tbody tr");

  if (driverSearch) {
    driverSearch.addEventListener("input", () => {
      const query = driverSearch.value.trim().toLocaleLowerCase("fr");

      driverRows.forEach((row) => {
        const rowText = row.textContent.toLocaleLowerCase("fr");

        // Une recherche vide rend toutes les lignes visibles.
        row.hidden = !rowText.includes(query);
      });
    });
  }

  // ------------------------------------------------------------------
  // Calendrier : filtrer les lignes selon leur attribut data-sprint.
  // Valeurs du filtre :
  // - "sprint" : lignes avec data-sprint="yes".
  // - "grand-prix" : toutes les autres lignes.
  // - Autre valeur : afficher toutes les lignes.
  // ------------------------------------------------------------------
  const raceFilter = document.querySelector("#race-filter");
  const raceRows = document.querySelectorAll("#calendar-table tbody tr");

  if (raceFilter) {
    raceFilter.addEventListener("change", () => {
      raceRows.forEach((row) => {
        const hasSprint = row.dataset.sprint === "yes";

        if (raceFilter.value === "sprint") {
          row.hidden = !hasSprint;
        } else if (raceFilter.value === "grand-prix") {
          row.hidden = hasSprint;
        } else {
          row.hidden = false;
        }
      });
    });
  }
});