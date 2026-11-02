/**
 * Initialise la page de saisie des résultats et de gestion du barème.
 *
 * Fonctionnalités :
 * - Sélection d'un Grand Prix et de son type de course.
 * - Saisie des positions et du meilleur tour.
 * - Enregistrement du classement.
 * - Modification des points attribués en GP et en sprint.
 *
 * @param {Object} data Données de l'application fournies par boot.
 */
boot((data) => {
  const seasonData = compute(data);

  const races = seasonData.races.sort((first, second) =>
    first.race_date.localeCompare(second.race_date)
  );

  const raceSelect = $("#race");
  const kindSelect = $("#kind");
  const resultsContainer = $("#rows");

  // Trie les pilotes par numéro, puis par nom.
  // Les pilotes sans numéro sont placés après les pilotes numérotés.
  const drivers = [...seasonData.seasonDrivers].sort(
    (first, second) =>
      (first.number == null ? Infinity : +first.number) -
        (second.number == null ? Infinity : +second.number) ||
      first.name.localeCompare(second.name, "fr")
  );

  // Comportement actuel : deux positions de saisie par écurie engagée.
  const positionCount = seasonData.seasonTeams.length * 2;

  /* ======================================================================
     Saisie des résultats
     ====================================================================== */

  if (!races.length || !seasonData.seasonDrivers.length) {
    $("#entry").innerHTML = `
      <p class="empty">
        Il faut au moins un GP et un pilote engagé dans cette saison.
      </p>
    `;
  } else {
    raceSelect.innerHTML = races
      .map(
        (race) => `
          <option value="${race.id}">${esc(race.name)}</option>
        `
      )
      .join("");

    // Options partagées par tous les sélecteurs de position.
    const driverOptions =
      '<option value="">—</option>' +
      drivers
        .map(
          (driver) => `
            <option value="${driver.driver_id}">
              ${
                driver.number != null
                  ? "#" + esc(driver.number) + " "
                  : ""
              }${esc(driver.name)}
            </option>
          `
        )
        .join("");

    /**
     * Reconstruit les lignes de saisie pour la course sélectionnée.
     *
     * Préremplit les positions à partir des résultats chargés par boot.
     * Pour un GP, ajoute les cases de sélection du meilleur tour.
     */
    const fillResults = () => {
      const existingResults = data.results.filter(
        (result) =>
          result.race_id == raceSelect.value &&
          result.kind == kindSelect.value
      );

      const fastestDriverId = data.fastest_laps.find(
        (entry) => entry.race_id == raceSelect.value
      )?.driver_id;

      resultsContainer.innerHTML = Array.from(
        { length: positionCount },
        (_, index) => `
          <label class="pos">
            <span>P${index + 1}</span>

            <select data-p="${index + 1}">
              ${driverOptions}
            </select>

            ${
              kindSelect.value === "gp"
                ? `
                  <input
                    type="checkbox"
                    title="Meilleur tour"
                    data-fl="${index + 1}"
                  >
                  FL
                `
                : ""
            }
          </label>
        `
      ).join("");

      // Restaure le pilote enregistré pour chaque position.
      $$("select", resultsContainer).forEach((select) => {
        const result = existingResults.find(
          (entry) => entry.position == select.dataset.p
        );

        if (result) {
          select.value = result.driver_id;
        }
      });

      // Restaure le meilleur tour et limite la sélection à une seule case.
      $$("[data-fl]", resultsContainer).forEach((checkbox) => {
        const select = $(
          `select[data-p="${checkbox.dataset.fl}"]`,
          resultsContainer
        );

        checkbox.checked = select?.value == fastestDriverId;

        checkbox.onchange = () => {
          if (checkbox.checked) {
            $$("[data-fl]", resultsContainer).forEach((other) => {
              if (other !== checkbox) {
                other.checked = false;
              }
            });
          }
        };
      });
    };

    /**
     * Met à jour les types de course disponibles pour le GP sélectionné.
     *
     * Le sprint est proposé uniquement si has_sprint est activé.
     * Reconstruire les options sélectionne par défaut le Grand Prix.
     */
    const updateKinds = () => {
      const race = races.find(
        (entry) => entry.id == raceSelect.value
      );

      kindSelect.innerHTML =
        '<option value="gp">Grand Prix</option>' +
        (+race.has_sprint
          ? '<option value="sprint">Sprint</option>'
          : "");

      $("#flHint").hidden = kindSelect.value !== "gp";

      fillResults();
    };

    raceSelect.onchange = updateKinds;

    kindSelect.onchange = () => {
      $("#flHint").hidden = kindSelect.value !== "gp";

      fillResults();
    };

    updateKinds();

    /**
     * Enregistre les positions renseignées et le meilleur tour sélectionné.
     *
     * Les positions vides sont omises.
     * Un même pilote ne peut pas apparaître dans plusieurs positions.
     */
    $("#save").onclick = async () => {
      const rows = $$("select", resultsContainer)
        .filter((select) => select.value)
        .map((select) => {
          const driver = seasonData.seasonDrivers.find(
            (entry) => entry.driver_id == select.value
          );

          return {
            position: +select.dataset.p,
            driver_id: +select.value,
            team_id: driver.team_id ? +driver.team_id : null,
          };
        });

      const fastestCheckbox = $$(
        "[data-fl]",
        resultsContainer
      ).find((checkbox) => checkbox.checked);

      const fastestDriverId = fastestCheckbox
        ? $(
            `select[data-p="${fastestCheckbox.dataset.fl}"]`,
            resultsContainer
          ).value
        : null;

      const uniqueDriverIds = new Set(
        rows.map((row) => row.driver_id)
      );

      if (uniqueDriverIds.size < rows.length) {
        return toast("Un pilote apparaît deux fois", 1);
      }

      try {
        await post({
          t: "results",
          race_id: +raceSelect.value,
          kind: kindSelect.value,
          rows,
          fastest_driver_id: fastestDriverId
            ? +fastestDriverId
            : null,
        });

        toast("Résultats enregistrés");
      } catch (error) {
        toast(error.message, 1);
      }
    };
  }

  /* ======================================================================
     Gestion du barème de points
     ====================================================================== */

  // Clés du barème : type de course + position, par exemple "gp1".
  const scoringValues = {};

  const championshipScoring = data.scoring.filter(
    (entry) => entry.championship_id == data.cid
  );

  championshipScoring.forEach((entry) => {
    scoringValues[entry.kind + entry.position] = entry.points;
  });

  // Affiche au moins dix positions, ou davantage si le barème en contient.
  let scoringPositionCount = Math.max(
    10,
    ...championshipScoring.map((entry) => +entry.position),
    0
  );

  /**
   * Reconstruit le tableau du barème à partir des valeurs en mémoire.
   *
   * Les positions sans valeur définie sont affichées avec zéro point.
   */
  const drawScoring = () => {
    $("#scoring").innerHTML =
      `
        <tr>
          <th>Position</th>
          <th>Grand Prix</th>
          <th>Sprint</th>
        </tr>
      ` +
      Array.from(
        { length: scoringPositionCount },
        (_, index) => `
          <tr>
            <td>P${index + 1}</td>

            ${["gp", "sprint"]
              .map(
                (kind) => `
                  <td>
                    <input
                      type="number"
                      min="0"
                      data-k="${kind}"
                      data-p="${index + 1}"
                      value="${scoringValues[kind + (index + 1)] ?? 0}"
                    >
                  </td>
                `
              )
              .join("")}
          </tr>
        `
      ).join("");
  };

  // Conserve les modifications en mémoire avant un éventuel nouveau rendu.
  $("#scoring").oninput = (event) => {
    const input = event.target;
    const key = input.dataset.k + input.dataset.p;

    scoringValues[key] = +input.value || 0;
  };

  $("#addPos").onclick = () => {
    scoringPositionCount++;

    drawScoring();
  };

  /**
   * Enregistre le barème complet du championnat.
   *
   * Seules les valeurs évaluées comme vraies sont envoyées :
   * les positions à zéro point sont omises.
   */
  $("#saveScoring").onclick = async () => {
    const rows = [];

    for (
      let position = 1;
      position <= scoringPositionCount;
      position++
    ) {
      for (const kind of ["gp", "sprint"]) {
        const points = scoringValues[kind + position];

        if (points) {
          rows.push({
            kind,
            position,
            points,
          });
        }
      }
    }

    try {
      await post({
        t: "scoring",
        championship_id: data.cid,
        rows,
      });

      toast("Barème enregistré");
    } catch (error) {
      toast(error.message, 1);
    }
  };

  drawScoring();
});