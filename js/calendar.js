/**
 * Initialise la page de gestion du calendrier.
 *
 * Affiche le championnat, la saison et les Grands Prix sélectionnés,
 * puis configure les actions de création, modification, suppression
 * et duplication du calendrier.
 *
 * Dépend des fonctions utilitaires :
 * boot, $, bindForm, bindList, del, post, toast, esc et fmt.
 *
 * @param {Object} data Données fournies par boot.
 * @param {Array<Object>} data.championships Championnats disponibles.
 * @param {Array<Object>} data.seasons Saisons disponibles.
 * @param {Array<Object>} data.races Grands Prix disponibles.
 * @param {Array<Object>} data.results Résultats enregistrés.
 * @param {number|string} data.cid Identifiant du championnat sélectionné.
 * @param {number|string} data.sid Identifiant de la saison sélectionnée.
 */
boot((data) => {
  // ------------------------------------------------------------------
  // Formulaires et données de la sélection courante.
  // ------------------------------------------------------------------
  const championshipForm = $("#cf");
  const seasonForm = $("#sf");
  const raceForm = $("#rf");

  // Les comparaisons non strictes sont conservées pour accepter des
  // identifiants représentés par des nombres ou des chaînes.
  const championship = data.championships.find(
    (item) => item.id == data.cid
  );

  const season = data.seasons.find(
    (item) => item.id == data.sid
  );

  const championshipSeasons = data.seasons.filter(
    (item) => item.championship_id == data.cid
  );

  const seasonRaces = data.races
    .filter((race) => race.season_id == data.sid)
    .sort((first, second) =>
      first.race_date.localeCompare(second.race_date)
    );

  // Une course est considérée comme renseignée dès qu'un résultat existe.
  // Les identifiants sont normalisés en chaînes pour les recherches.
  const racesWithResults = new Set(
    data.results.map((result) => String(result.race_id))
  );

  // ------------------------------------------------------------------
  // Préremplissage des formulaires du championnat et de la saison.
  // ------------------------------------------------------------------
  if (championship) {
    championshipForm.nm.value = championship.name;
    championshipForm.rid.value = championship.id;
  }

  if (season) {
    seasonForm.sn.value = season.name;
    seasonForm.rid.value = season.id;
  }

  // ------------------------------------------------------------------
  // Enregistrement des formulaires.
  // Les noms des champs correspondent au contrat de l'API PHP.
  // ------------------------------------------------------------------
  bindForm(championshipForm, "championships", (form) => ({
    name: form.nm.value.trim(),
  }));

  bindForm(seasonForm, "seasons", (form) => ({
    championship_id: data.cid,
    name: form.sn.value.trim(),
  }));

  bindForm(raceForm, "races", (form) => ({
    season_id: data.sid,
    name: form.nm.value.trim(),
    circuit: form.circ.value.trim(),
    race_date: form.dt.value,
    has_sprint: form.spr.checked ? 1 : 0,
  }));

  // ------------------------------------------------------------------
  // Suppression du championnat ou de la saison après confirmation.
  // La sélection locale est effacée après la réponse de l'API.
  // ------------------------------------------------------------------
  $("#delChamp").onclick = async () => {
    if (
      data.cid &&
      confirm("Supprimer ce championnat et toutes ses saisons ?")
    ) {
      await del("championships", data.cid);

      localStorage.championship = "";
      localStorage.season = "";

      location.reload();
    }
  };

  $("#delSeason").onclick = async () => {
    if (
      data.sid &&
      confirm("Supprimer cette saison, ses GP et ses résultats ?")
    ) {
      await del("seasons", data.sid);

      localStorage.season = "";

      location.reload();
    }
  };

  // ------------------------------------------------------------------
  // Duplication du calendrier depuis une autre saison du championnat.
  // La saison courante est exclue des sources proposées.
  // ------------------------------------------------------------------
  $("#copyBox").innerHTML = !data.sid
    ? '<p class="empty">Crée ou sélectionne une saison pour gérer son calendrier.</p>'
    : `
      <label>
        Reprendre le calendrier de
        <select id="copyFrom">
          <option value="">— choisir une saison —</option>
          ${championshipSeasons
            .filter((item) => item.id != data.sid)
            .map(
              (item) => `
                <option value="${item.id}">${esc(item.name)}</option>
              `
            )
            .join("")}
        </select>
      </label>
      <button id="copy">Dupliquer les GP</button>
    `;

  // Le bouton n'existe que lorsqu'une saison est sélectionnée.
  $("#copy")?.addEventListener("click", async () => {
    const sourceSeasonId = $("#copyFrom").value;

    if (!sourceSeasonId) {
      return toast("Choisis une saison", 1);
    }

    if (
      !confirm("Ajouter les GP de cette saison au calendrier actuel ?")
    ) {
      return;
    }

    // La duplication ajoute des courses sans remplacer le calendrier cible.
    await post({
      t: "duplicate_calendar",
      season_id: data.sid,
      source_season_id: +sourceSeasonId,
    });

    location.reload();
  });

  // ------------------------------------------------------------------
  // Affichage des Grands Prix dans l'ordre chronologique.
  // Les noms et circuits sont échappés avant insertion dans le HTML.
  // ------------------------------------------------------------------
  $("#list").innerHTML = seasonRaces.length
    ? seasonRaces
        .map(
          (race, index) => `
            <article class="card">
              <span class="num">${index + 1}</span>

              <div>
                <h3>${esc(race.name)}</h3>
                <p>
                  ${esc(race.circuit || "Circuit non précisé")}
                  · ${fmt(race.race_date)}
                  ${+race.has_sprint ? ' · <b class="tag">Sprint</b>' : ""}
                  · ${
                    racesWithResults.has(String(race.id))
                      ? "Résultats saisis"
                      : "À venir"
                  }
                </p>
              </div>

              <div class="acts">
                <button data-e="${race.id}">Modifier</button>
                <button class="del" data-d="${race.id}">Supprimer</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<p class="empty">Aucun GP dans cette saison.</p>';

  // ------------------------------------------------------------------
  // Actions de la liste : modification et suppression.
  // Le callback renseigne les champs visibles du formulaire d'édition.
  // ------------------------------------------------------------------
  bindList(
    $("#list"),
    "races",
    seasonRaces,
    (race) => {
      raceForm.nm.value = race.name;
      raceForm.circ.value = race.circuit || "";
      raceForm.dt.value = race.race_date;

      // Convertit une valeur numérique ou une chaîne "0"/"1" en booléen.
      raceForm.spr.checked = !!+race.has_sprint;
    },
    raceForm
  );
});