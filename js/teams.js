/**
 * Initialise la page de gestion des écuries.
 *
 * Permet de :
 * - Créer une écurie et l'engager dans la saison sélectionnée.
 * - Engager une écurie existante du championnat.
 * - Modifier son nom et sa couleur.
 * - Retirer son engagement de la saison.
 *
 * Le nom et la couleur appartiennent à l'écurie du championnat.
 * L'engagement dans une saison est enregistré séparément.
 *
 * @param {Object} data Données de l'application fournies par boot.
 */
boot((data) => {
  const seasonData = compute(data);
  const form = $("#f");

  // ------------------------------------------------------------------
  // Écuries existantes disponibles pour un engagement.
  // Exclut celles déjà engagées dans la saison sélectionnée.
  // ------------------------------------------------------------------
  form.existing.innerHTML =
    '<option value="">— nouvelle écurie —</option>' +
    data.teams
      .filter(
        (team) =>
          team.championship_id == data.cid &&
          !seasonData.seasonTeams.some(
            (entry) => entry.id == team.id
          )
      )
      .map(
        (team) => `
          <option value="${team.id}">${esc(team.name)}</option>
        `
      )
      .join("");

  form.existing.onchange = () => {
    const team = data.teams.find(
      (item) => item.id == form.existing.value
    );

    if (team) {
      form.nm.value = team.name;
      form.col.value = team.color;
      form.teamid.value = team.id;
    }
  };

  // ------------------------------------------------------------------
  // Enregistrement de l'écurie puis de son engagement saisonnier.
  //
  // teamid : identifiant de l'écurie dans le championnat.
  // rid : utilisé ici comme indicateur d'édition d'une écurie engagée.
  // ------------------------------------------------------------------
  form.onsubmit = async (event) => {
    event.preventDefault();

    if (!data.sid) {
      return toast("Crée d’abord une saison", 1);
    }

    try {
      let teamId = +form.teamid.value;

      if (teamId) {
        // Met à jour le nom et la couleur de l'écurie existante.
        await post({
          t: "teams",
          id: teamId,
          data: {
            championship_id: data.cid,
            name: form.nm.value.trim(),
            color: form.col.value,
          },
        });

        // En mode édition, l'engagement existe déjà.
        if (!form.rid.value) {
          await post({
            t: "season_teams",
            data: {
              season_id: data.sid,
              team_id: teamId,
            },
          });
        }
      } else {
        // Crée d'abord l'écurie pour récupérer son identifiant.
        const response = await post({
          t: "teams",
          data: {
            championship_id: data.cid,
            name: form.nm.value.trim(),
            color: form.col.value,
          },
        });

        teamId = +response.id;

        // Engage ensuite la nouvelle écurie dans la saison.
        await post({
          t: "season_teams",
          data: {
            season_id: data.sid,
            team_id: teamId,
          },
        });
      }

      location.reload();
    } catch (error) {
      toast(error.message, 1);
    }
  };

  // Attend la réinitialisation native avant de vider les identifiants.
  form.onreset = () => {
    setTimeout(() => {
      form.rid.value = "";
      form.teamid.value = "";
    }, 0);
  };

  // ------------------------------------------------------------------
  // Affichage des écuries dans l'ordre du classement calculé.
  // Chaque carte présente les pilotes engagés et le total de points.
  // ------------------------------------------------------------------
  $("#list").innerHTML = seasonData.teams.length
    ? seasonData.teams
        .map((team) => {
          const driverNames =
            seasonData.seasonDrivers
              .filter((driver) => driver.team_id == team.id)
              .map((driver) => esc(driver.name))
              .join(", ") || "Aucun pilote";

          return `
            <article class="card" style="--c:${esc(team.color)}">
              <span class="bar"></span>

              <div>
                <h3>${esc(team.name)}</h3>
                <p>${driverNames} · ${team.pts} pts</p>
              </div>

              <div class="acts">
                <button data-e="${team.id}">Modifier</button>
                <button
                  class="del"
                  data-d="${team.id}"
                >Retirer de la saison</button>
              </div>
            </article>
          `;
        })
        .join("")
    : '<p class="empty">Aucune écurie engagée dans cette saison.</p>';

  // ------------------------------------------------------------------
  // Actions de la liste par délégation d'événements.
  // Les deux boutons portent l'identifiant de l'écurie.
  // ------------------------------------------------------------------
  $("#list").onclick = async (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    const team = seasonData.teams.find(
      (item) =>
        item.id == button.dataset.e ||
        item.id == button.dataset.d
    );

    if (button.dataset.e) {
      form.nm.value = team.name;
      form.col.value = team.color;
      form.teamid.value = team.id;

      // Sert à éviter la création d'un nouvel engagement à l'enregistrement.
      form.rid.value = team.id;

      form.scrollIntoView({
        behavior: "smooth",
      });
    }

    if (button.dataset.d) {
      // Retrouve l'identifiant de la liaison saison-écurie à supprimer.
      const seasonEntry = data.season_teams.find(
        (entry) =>
          entry.season_id == data.sid &&
          entry.team_id == team.id
      );

      if (confirm("Retirer cette écurie de cette saison ?")) {
        await del("season_teams", seasonEntry.id);

        location.reload();
      }
    }
  };
});