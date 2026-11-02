/**
 * Initialise le tableau de bord de la page d'accueil.
 *
 * Affiche :
 * - Le premier GP sans résultat enregistré, par ordre chronologique.
 * - Les cinq premiers pilotes du classement de la saison.
 * - Les cinq premières écuries du classement de la saison.
 *
 * @param {Object} data Données de l'application fournies par boot.
 */
boot((data) => {
  const seasonData = compute(data);

  // Une course est considérée comme renseignée dès qu'un résultat existe.
  const racesWithResults = new Set(
    data.results.map((result) => String(result.race_id))
  );

  // ------------------------------------------------------------------
  // Prochain GP : première course sans résultat, triée par date.
  // ------------------------------------------------------------------
  const nextRace = seasonData.races
    .filter((race) => !racesWithResults.has(String(race.id)))
    .sort((first, second) =>
      first.race_date.localeCompare(second.race_date)
    )[0];

  $("#next").innerHTML =
    "<h2>Prochain GP</h2>" +
    (nextRace
      ? `
        <p class="big">${esc(nextRace.name)}</p>

        <p class="mut">
          ${esc(nextRace.circuit || "")}
          · ${fmt(nextRace.race_date)}
          ${+nextRace.has_sprint ? " · Sprint" : ""}
        </p>

        <a class="btn small" href="results.html">
          Saisir les résultats
        </a>
      `
      : `
        <p class="empty">
          Aucun GP à venir.
          <a href="calendar.html">Ajoutes-en un</a>.
        </p>
      `);

  /**
   * Génère les lignes HTML d'un classement limité aux cinq premiers.
   *
   * Conserve l'ordre du tableau fourni, sans effectuer de nouveau tri.
   * Le callback doit retourner un contenu HTML correctement échappé.
   *
   * @param {Array<Object>} participants Participants déjà classés.
   * @param {function(Object): string} renderLabel Contenu du libellé.
   * @returns {string} Lignes de liste ou message d'absence de données.
   */
  const renderTopList = (participants, renderLabel) =>
    participants.length
      ? participants
          .slice(0, 5)
          .map(
            (participant, index) => `
              <li>
                <i>${index + 1}</i>
                <span>${renderLabel(participant)}</span>
                <b>${participant.pts}</b>
              </li>
            `
          )
          .join("")
      : '<li class="empty">Rien à afficher pour l’instant.</li>';

  // ------------------------------------------------------------------
  // Classements synthétiques des pilotes et des écuries.
  // ------------------------------------------------------------------
  $("#topD").innerHTML = renderTopList(
    seasonData.drivers,
    (driver) => esc(driver.name)
  );

  $("#topT").innerHTML = renderTopList(
    seasonData.teams,
    (team) => `
      <em style="background:${esc(team.color)}"></em>
      ${esc(team.name)}
    `
  );
});