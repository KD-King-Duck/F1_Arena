/* ==========================================================================
   Estimation des possibilités de titre
   ========================================================================== */

/**
 * Estime les participants encore en course pour le titre et recherche
 * une condition de victoire au prochain GP.
 *
 * Ce calcul utilise les points maximaux du barème et les GP sans résultat
 * enregistré. Il ne constitue pas une simulation exhaustive des scénarios.
 *
 * @param {Object} data Données de l'application.
 * @param {Object} seasonData Classements et participants de la saison.
 * @param {"drivers"|"teams"} type Classement à analyser.
 * @returns {Object} Identifiants encore en course, message et GP restants.
 */
function titleData(data, seasonData, type) {
  const participants =
    type === "drivers" ? seasonData.drivers : seasonData.teams;

  const remainingRaces = seasonData.races.filter(
    (race) =>
      !data.results.some(
        (result) => result.race_id == race.id && result.kind === "gp"
      )
  );

  const points = scoreMap(data);

  /**
   * Retourne le maximum de points du barème pour un type de course.
   *
   * @param {string} kind Préfixe des clés : "gp" ou "sprint".
   * @returns {number} Maximum, ou zéro si aucun point n'est défini.
   */
  const maxPoints = (kind) =>
    Math.max(
      0,
      ...Object.keys(points)
        .filter((key) => key.startsWith(kind))
        .map((key) => points[key])
    );

  /**
   * Retourne le nombre de pilotes utilisé pour l'estimation.
   *
   * Pour une écurie, le calcul conserve un minimum d'un pilote,
   * même si aucun engagement n'est trouvé.
   *
   * @param {Object} participant Pilote ou écurie.
   * @returns {number} Nombre retenu.
   */
  const driverCount = (participant) =>
    type === "drivers"
      ? 1
      : Math.max(
          1,
          seasonData.seasonDrivers.filter(
            (entry) => entry.team_id == participant.id
          ).length
        );

  /**
   * Estime les points maximaux d'un participant sur un week-end.
   *
   * Additionne les maxima du GP, du sprint éventuel et le point
   * du meilleur tour.
   *
   * @param {Object} race Grand Prix.
   * @param {Object} participant Pilote ou écurie.
   * @returns {number} Maximum estimé.
   */
  const pointsPerRace = (race, participant) =>
    driverCount(participant) *
      (
        maxPoints("gp") +
        (race.has_sprint ? maxPoints("sprint") : 0)
      ) +
    (
      type === "drivers"
        ? 1
        : driverCount(participant) > 0
          ? 1
          : 0
    );

  /**
   * Estime les points encore accessibles à un participant.
   *
   * @param {Object} participant Pilote ou écurie.
   * @returns {number} Total estimé sur les GP restants.
   */
  const possiblePoints = (participant) =>
    remainingRaces.reduce(
      (total, race) => total + pointsPerRace(race, participant),
      0
    );

  const leader = participants[0];
  const live = new Set();

  // L'égalité de points avec le leader suffit ici à rester en course.
  // Les critères de départage ne sont pas analysés.
  if (leader) {
    participants.forEach((participant) => {
      if (
        participant === leader ||
        participant.pts + possiblePoints(participant) >= leader.pts
      ) {
        live.add(participant.id);
      }
    });
  }

  let titleMessage = "";

  const nextRace = remainingRaces.sort((first, second) =>
    first.race_date.localeCompare(second.race_date)
  )[0];

  if (leader && nextRace) {
    // Comparaison d'origine conservée ; voir le point signalé après le code.
    const laterRaces = remainingRaces.filter(
      (race) => race.id != nextRace
    );

    // Recherche de la première position satisfaisant le test actuel.
    for (let position = 1; position <= 30; position++) {
      const gainedPoints =
        (points["gp" + position] || 0) +
        (type === "drivers" && position <= 10 ? 1 : 0);

      const titleSecured = participants.slice(1).every((participant) =>
        leader.pts + gainedPoints >
        participant.pts +
          laterRaces.reduce(
            (total, race) => total + pointsPerRace(race, participant),
            0
          ) +
          pointsPerRace(nextRace, participant)
      );

      if (titleSecured) {
        titleMessage =
          `${type === "drivers" ? "Pilote" : "Écurie"} : ` +
          `P${position} ou mieux au ${esc(nextRace.name)} assure le titre.`;

        break;
      }
    }
  }

  return {
    live,
    ball: titleMessage,
    remaining: remainingRaces.length,
  };
}

/* ==========================================================================
   Affichage des classements
   ========================================================================== */

/**
 * Initialise les classements de saison et de championnat.
 *
 * Les quatre onglets utilisent les valeurs data-t :
 * - drivers
 * - teams
 * - globalDrivers
 * - globalTeams
 *
 * Les indicateurs de titre sont affichés uniquement pour la saison.
 *
 * @param {Object} data Données de l'application fournies par boot.
 */
boot((data) => {
  const seasonStandings = compute(data);
  const championshipStandings = globalCompute(data);

  let currentTab = "drivers";

  const tableContainer = $("#tbl");

  /**
   * Reconstruit le tableau et les informations de titre de l'onglet actif.
   */
  const draw = () => {
    const isGlobal = currentTab.startsWith("global");

    const type = currentTab.toLowerCase().includes("driver")
      ? "drivers"
      : "teams";

    const standings = (
      isGlobal ? championshipStandings : seasonStandings
    )[type];

    const titleInfo = !isGlobal
      ? titleData(data, seasonStandings, type)
      : null;

    // ------------------------------------------------------------------
    // Informations sur les GP restants et la possibilité de titre.
    // ------------------------------------------------------------------
    $("#titleInfo").innerHTML = titleInfo
      ? `
        <p class="title-note">
          ${
            titleInfo.remaining
              ? `${titleInfo.remaining} GP restant(s). ${
                  titleInfo.ball ||
                  "Aucune balle de match calculable pour le prochain GP."
                }`
              : "Saison terminée."
          }
        </p>
      `
      : "";

    // ------------------------------------------------------------------
    // Tableau : statistiques et indicateurs de titre.
    // La colonne Écurie apparaît uniquement pour les pilotes de saison.
    // ------------------------------------------------------------------
    tableContainer.innerHTML = standings.length
      ? `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${type === "drivers" ? "Pilote" : "Écurie"}</th>

              ${
                type === "drivers" && !isGlobal
                  ? "<th>Écurie</th>"
                  : ""
              }

              <th>Départs</th>
              <th>Victoires</th>
              <th>Podiums</th>
              <th>MT</th>
              <th>Pos. moy.</th>
              <th>Meilleur</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            ${standings
              .map((participant, index) => {
                const team =
                  type === "drivers"
                    ? data.teams.find(
                        (item) => item.id == participant.team_id
                      )
                    : participant;

                const titleMark = titleInfo
                  ? titleInfo.live.has(participant.id)
                    ? '<span title="Toujours en course pour le titre">🏁</span>'
                    : '<span title="Éliminé mathématiquement">○</span>'
                  : "";

                return `
                  <tr class="r${index + 1}">
                    <td>${index + 1}</td>

                    <td>
                      <em
                        class="dot"
                        style="background:${esc(team?.color || "#555")}"
                      ></em>${
                        type === "drivers" && participant.number != null
                          ? `<small>#${esc(participant.number)}</small> `
                          : ""
                      }${esc(participant.name)} ${titleMark}
                    </td>

                    ${
                      type === "drivers" && !isGlobal
                        ? `<td>${team ? esc(team.name) : "—"}</td>`
                        : ""
                    }

                    <td>${participant.starts}</td>
                    <td>${participant.wins}</td>
                    <td>${participant.podiums}</td>
                    <td>${participant.fastest}</td>
                    <td>${participant.avg}</td>
                    <td>P${participant.best}</td>
                    <td><b>${participant.pts}</b></td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      `
      : '<p class="empty">Rien à classer.</p>';
  };

  // ------------------------------------------------------------------
  // Changement d'onglet et mise à jour de son état visuel.
  // ------------------------------------------------------------------
  $$(".tabs button").forEach((button) => {
    button.onclick = () => {
      currentTab = button.dataset.t;

      $$(".tabs button").forEach((other) => {
        other.classList.toggle("on", other === button);
      });

      draw();
    };
  });

  draw();
});