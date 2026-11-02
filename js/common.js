/* ==========================================================================
   Sélection DOM, échappement HTML et formatage
   ========================================================================== */

/**
 * Retourne le premier élément correspondant au sélecteur.
 *
 * @param {string} selector Sélecteur CSS.
 * @param {Document|Element} [root=document] Racine de la recherche.
 * @returns {Element|null} Élément trouvé, ou null.
 */
const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Retourne les éléments correspondant au sélecteur sous forme de tableau.
 *
 * @param {string} selector Sélecteur CSS.
 * @param {Document|Element} [root=document] Racine de la recherche.
 * @returns {Element[]} Éléments trouvés.
 */
const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector),
];

/**
 * Échappe les caractères spéciaux pour insérer du texte dans le HTML.
 *
 * Ne remplace pas une validation d'URL ou d'autres contextes spécifiques.
 *
 * @param {*} value Valeur à convertir en texte.
 * @returns {string} Texte échappé.
 */
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );

/**
 * Formate une date de calendrier en français.
 *
 * L'ajout de T00:00 interprète la date à minuit en heure locale.
 *
 * @param {string} value Date attendue au format YYYY-MM-DD.
 * @returns {string} Date au format français.
 */
const fmt = (value) =>
  new Date(value + "T00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ==========================================================================
   Communication avec l'API PHP
   ========================================================================== */

/**
 * Appelle l'API et retourne sa réponse JSON.
 *
 * @param {string} [query=""] Paramètres ajoutés à l'URL de l'API.
 * @param {RequestInit} [options] Options transmises à fetch.
 * @returns {Promise<*>} Réponse JSON décodée.
 * @throws {Error} Si la lecture JSON échoue ou si l'API retourne une erreur.
 */
async function api(query = "", options) {
  const response = await fetch("api.php" + query, options);

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      "API injoignable : démarre Apache et MySQL, puis importe F1_BDD.sql"
    );
  }

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload;
}

/**
 * Envoie une opération d'écriture à l'API.
 *
 * @param {Object} body Données de l'opération.
 * @returns {Promise<*>} Réponse de l'API.
 */
const post = (body) =>
  api("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

/**
 * Supprime un enregistrement.
 *
 * @param {string} table Nom de la table.
 * @param {number|string} id Identifiant de l'enregistrement.
 * @returns {Promise<*>} Réponse de l'API.
 */
const del = (table, id) =>
  api(`?t=${table}&id=${id}`, {
    method: "DELETE",
  });

/**
 * Charge toutes les données nécessaires à l'application.
 *
 * @returns {Promise<Object>} Données retournées par l'API.
 */
const load = () => api("?t=all");

/* ==========================================================================
   Notifications
   ========================================================================== */

/**
 * Affiche une notification pendant 3,5 secondes.
 *
 * Réutilise le conteneur existant et remplace son délai de disparition.
 *
 * @param {string} message Message à afficher.
 * @param {boolean|number} [bad] Valeur vraie pour le style d'erreur.
 */
function toast(message, bad) {
  let notification = $("#toast");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "toast";
    document.body.append(notification);
  }

  notification.textContent = message;
  notification.className = "show" + (bad ? " bad" : "");

  clearTimeout(notification._h);

  notification._h = setTimeout(() => {
    notification.className = "";
  }, 3500);
}

/* ==========================================================================
   Navigation et sélection du championnat / de la saison
   ========================================================================== */

const logo = `
  <svg viewBox="0 0 64 28" class="mark" aria-hidden="true">
    <path d="M0 4h17l-3 5H0zM0 12h12l-3 5H0zM24 2h40l-3 6H31l-2 4h24l-3 6H26l-3 8h-9z"/>
  </svg>
`;

const pages = [
  ["index", "Accueil"],
  ["calendar", "Calendrier"],
  ["results", "Résultats"],
  ["standings", "Classement"],
  ["drivers", "Pilotes"],
  ["teams", "Écuries"],
];

/**
 * Retrouve une sélection enregistrée dans localStorage.
 *
 * Si l'identifiant n'existe pas dans la liste, utilise le premier élément.
 * La comparaison stricte d'origine suppose des identifiants numériques.
 *
 * @param {string} key Clé de stockage.
 * @param {Array<Object>} items Éléments disponibles.
 * @returns {number|string|undefined} Identifiant retenu.
 */
const pick = (key, items) => {
  const storedId = +localStorage[key];

  return items.some((item) => item.id === storedId)
    ? storedId
    : items[0]?.id;
};

/**
 * Construit la navigation et les sélecteurs de contexte.
 *
 * Un changement de sélection est enregistré dans localStorage,
 * puis provoque le rechargement de la page.
 *
 * @param {Object} data Données de l'application.
 * @returns {Object} Identifiants sélectionnés : cid et sid.
 */
function nav(data) {
  const currentPage =
    location.pathname.split("/").pop().replace(".html", "") || "index";

  const championships = data.championships || [];
  const championshipId = pick("championship", championships);

  const seasons = (data.seasons || [])
    .filter((season) => season.championship_id == championshipId)
    .sort((first, second) =>
      first.name.localeCompare(second.name, "fr", {
        numeric: true,
      })
    );

  const seasonId = pick("season", seasons);

  $("#nav").innerHTML = `
    <a class="brand" href="index.html">
      ${logo}
      <b>Arena</b>
    </a>

    <nav>
      ${pages
        .map(
          ([page, label]) => `
            <a
              href="${page}.html"
              ${page === currentPage ? 'class="on"' : ""}
            >${label}</a>
          `
        )
        .join("")}
    </nav>

    <select id="champSel">
      <option value="">Championnat…</option>
      ${championships
        .map(
          (championship) => `
            <option
              value="${championship.id}"
              ${championship.id == championshipId ? "selected" : ""}
            >${esc(championship.name)}</option>
          `
        )
        .join("")}
    </select>

    <select id="seasonSel">
      <option value="">Saison…</option>
      ${seasons
        .map(
          (season) => `
            <option
              value="${season.id}"
              ${season.id == seasonId ? "selected" : ""}
            >${esc(season.name)}</option>
          `
        )
        .join("")}
    </select>
  `;

  $("#champSel").onchange = (event) => {
    localStorage.championship = event.target.value;
    localStorage.season = "";

    location.reload();
  };

  $("#seasonSel").onchange = (event) => {
    localStorage.season = event.target.value;

    location.reload();
  };

  return {
    cid: championshipId,
    sid: seasonId,
  };
}

/**
 * Charge les données, initialise la navigation puis exécute la page.
 *
 * Ajoute cid et sid aux données avant de les transmettre au callback.
 * En cas d'erreur, réinitialise la navigation et affiche une notification.
 *
 * @param {function(Object): *} initialize Initialisation propre à la page.
 * @returns {Promise<void>}
 */
async function boot(initialize) {
  try {
    const data = await load();
    const selection = nav(data);

    data.cid = selection.cid;
    data.sid = selection.sid;

    await initialize(data);
  } catch (error) {
    nav({});
    toast(error.message, 1);
  }
}

/* ==========================================================================
   Barème et départage des classements
   ========================================================================== */

/**
 * Construit le barème du championnat sélectionné.
 *
 * Les clés concatènent le type de course et la position :
 * par exemple, "gp1" ou "sprint2".
 *
 * @param {Object} data Données contenant scoring et cid.
 * @returns {Object<string, number>} Points par type et position.
 */
function scoreMap(data) {
  const points = {};

  data.scoring
    .filter((entry) => entry.championship_id == data.cid)
    .forEach((entry) => {
      points[entry.kind + entry.position] = +entry.points;
    });

  return points;
}

/**
 * Compare deux participants pour déterminer leur ordre au classement.
 *
 * Départage successif :
 * 1. Total de points décroissant.
 * 2. Nombre de premières places, puis de deuxièmes places, etc.
 * 3. Nom par ordre alphabétique.
 *
 * @param {Object} first Premier participant.
 * @param {Object} second Second participant.
 * @returns {number} Résultat utilisable par Array.sort.
 */
function rank(first, second) {
  if (second.pts !== first.pts) {
    return second.pts - first.pts;
  }

  for (let position = 1; position < 101; position++) {
    const firstCount = first.places[position] || 0;
    const secondCount = second.places[position] || 0;

    if (secondCount !== firstCount) {
      return secondCount - firstCount;
    }
  }

  return first.name.localeCompare(second.name);
}

/* ==========================================================================
   Calcul des statistiques
   ========================================================================== */

/**
 * Calcule les classements des pilotes et des écuries pour les courses données.
 *
 * Les points incluent les GP et les sprints.
 * Les autres compteurs sont alimentés uniquement par les résultats de GP.
 * Le meilleur tour rapporte un point si le pilote termine dans le top 10.
 *
 * Pour une écurie, les compteurs sont cumulés par résultat de pilote :
 * starts ne représente donc pas le nombre de GP distincts de l'écurie.
 *
 * @param {Object} data Données contenant le barème et les résultats.
 * @param {Array<Object>} races Courses prises en compte.
 * @param {Array<Object>} drivers Pilotes ou engagements saisonniers.
 * @param {Array<Object>} teams Écuries prises en compte.
 * @returns {Object} Classements triés : drivers et teams.
 */
function stats(data, races, drivers, teams) {
  const points = scoreMap(data);

  // Un engagement saisonnier utilise driver_id comme identité du pilote.
  const driverStats = Object.fromEntries(
    drivers.map((driver) => [
      driver.driver_id || driver.id,
      {
        ...driver,
        id: driver.driver_id || driver.id,
        pts: 0,
        wins: 0,
        podiums: 0,
        starts: 0,
        fastest: 0,
        sumPos: 0,
        finishes: 0,

        // L'indice correspond à la position ; l'indice 0 est inutilisé.
        places: Array(101).fill(0),
      },
    ])
  );

  const teamStats = Object.fromEntries(
    teams.map((team) => [
      team.id,
      {
        ...team,
        pts: 0,
        wins: 0,
        podiums: 0,
        starts: 0,
        fastest: 0,
        sumPos: 0,
        finishes: 0,
        places: Array(101).fill(0),
      },
    ])
  );

  const raceIds = new Set(
    races.map((race) => String(race.id))
  );

  const fastestLaps = Object.fromEntries(
    data.fastest_laps.map((entry) => [
      entry.race_id,
      entry.driver_id,
    ])
  );

  data.results
    .filter((result) => raceIds.has(String(result.race_id)))
    .forEach((result) => {
      const driver = driverStats[result.driver_id];
      const team = teamStats[result.team_id];

      const earnedPoints =
        (points[result.kind + result.position] || 0) +
        (
          result.kind === "gp" &&
          fastestLaps[result.race_id] == result.driver_id &&
          result.position <= 10
            ? 1
            : 0
        );

      // Le résultat alimente le pilote et son écurie, s'ils sont présents.
      for (const participant of [driver, team]) {
        if (participant) {
          participant.pts += earnedPoints;

          if (result.kind === "gp") {
            participant.starts++;
            participant.sumPos += +result.position;
            participant.finishes++;
            participant.places[result.position]++;

            if (result.position == 1) {
              participant.wins++;
            }

            if (result.position <= 3) {
              participant.podiums++;
            }

            // Compte uniquement les meilleurs tours donnant droit au point.
            if (
              fastestLaps[result.race_id] == result.driver_id &&
              result.position <= 10
            ) {
              participant.fastest++;
            }
          }
        }
      }
    });

  return {
    drivers: Object.values(driverStats)
      .map((driver) => ({
        ...driver,
        avg: driver.finishes
          ? (driver.sumPos / driver.finishes).toFixed(1)
          : "—",
        best: driver.finishes
          ? driver.places.findIndex((count) => count)
          : "—",
      }))
      .sort(rank),

    teams: Object.values(teamStats)
      .map((team) => ({
        ...team,
        avg: team.finishes
          ? (team.sumPos / team.finishes).toFixed(1)
          : "—",
        best: team.finishes
          ? team.places.findIndex((count) => count)
          : "—",
      }))
      .sort(rank),
  };
}

/**
 * Calcule les classements de la saison sélectionnée.
 *
 * Fusionne l'identité de chaque pilote avec son engagement saisonnier.
 * season_entry_id conserve l'identifiant de cet engagement.
 *
 * @param {Object} data Données de l'application avec sid et cid.
 * @returns {Object} Classements, courses et participants de la saison.
 */
function compute(data) {
  const races = data.races.filter(
    (race) => race.season_id == data.sid
  );

  const teamIds = new Set(
    data.season_teams
      .filter((entry) => entry.season_id == data.sid)
      .map((entry) => String(entry.team_id))
  );

  const teams = data.teams.filter(
    (team) => teamIds.has(String(team.id))
  );

  const seasonEntries = data.season_drivers.filter(
    (entry) => entry.season_id == data.sid
  );

  const drivers = seasonEntries.map((entry) => ({
    ...data.drivers.find((driver) => driver.id == entry.driver_id),
    ...entry,
    season_entry_id: entry.id,
  }));

  return {
    ...stats(data, races, drivers, teams),
    races,
    seasonDrivers: drivers,
    seasonTeams: teams,
  };
}

/**
 * Calcule les classements cumulés du championnat sélectionné.
 *
 * Inclut les courses de toutes ses saisons, ainsi que ses pilotes
 * et écuries, même sans engagement dans la saison courante.
 *
 * @param {Object} data Données de l'application avec cid.
 * @returns {Object} Classements cumulés des pilotes et des écuries.
 */
function globalCompute(data) {
  const races = data.races.filter((race) =>
    data.seasons.some(
      (season) =>
        season.id == race.season_id &&
        season.championship_id == data.cid
    )
  );

  const drivers = data.drivers.filter(
    (driver) => driver.championship_id == data.cid
  );

  const teams = data.teams.filter(
    (team) => team.championship_id == data.cid
  );

  return stats(data, races, drivers, teams);
}

/* ==========================================================================
   Gestion partagée des formulaires et des listes
   ========================================================================== */

/**
 * Configure l'enregistrement d'un formulaire via l'API.
 *
 * Le champ rid contient l'identifiant de l'enregistrement à modifier.
 * Lors d'un reset, il est vidé après la réinitialisation native des champs.
 *
 * @param {HTMLFormElement} form Formulaire contenant le champ rid.
 * @param {string} table Table ciblée.
 * @param {function(HTMLFormElement): Object} getData Extraction des données.
 */
function bindForm(form, table, getData) {
  form.onsubmit = async (event) => {
    event.preventDefault();

    try {
      await post({
        t: table,
        id: form.rid.value || null,
        data: getData(form),
      });

      location.reload();
    } catch (error) {
      toast(error.message, 1);
    }
  };

  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.rid.value = "";
    }, 0);
  });
}

/**
 * Configure les actions d'une liste par délégation d'événements.
 *
 * Attributs des boutons :
 * - data-d : identifiant à supprimer.
 * - data-e : identifiant à modifier.
 *
 * Le callback fill renseigne les champs visibles du formulaire.
 * Cette fonction renseigne ensuite rid et fait défiler vers le formulaire.
 *
 * @param {Element} element Conteneur de la liste.
 * @param {string} table Table ciblée.
 * @param {Array<Object>} rows Enregistrements affichés.
 * @param {function(Object): void} fill Préremplissage du formulaire.
 * @param {HTMLFormElement} form Formulaire d'édition.
 */
function bindList(element, table, rows, fill, form) {
  element.onclick = async (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    if (button.dataset.d) {
      if (
        !confirm(
          "Supprimer définitivement ? Les données liées seront aussi supprimées."
        )
      ) {
        return;
      }

      try {
        await del(table, button.dataset.d);

        location.reload();
      } catch (error) {
        toast(error.message, 1);
      }
    } else if (button.dataset.e) {
      const row = rows.find(
        (item) => item.id == button.dataset.e
      );

      fill(row);
      form.rid.value = button.dataset.e;

      form.scrollIntoView({
        behavior: "smooth",
      });
    }
  };
}