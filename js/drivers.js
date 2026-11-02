/**
 * Initialise la page de gestion des pilotes.
 *
 * Permet de :
 * - Créer un pilote et l'engager dans la saison sélectionnée.
 * - Engager un pilote existant du championnat.
 * - Modifier son nom, son numéro et son écurie.
 * - Retirer son engagement de la saison.
 *
 * Le pilote appartient au championnat.
 * Son numéro et son écurie appartiennent à son engagement saisonnier.
 *
 * @param {Object} data Données de l'application fournies par boot.
 */
boot((data) => {
  const seasonData = compute(data);
  const form = $("#f");

  // ------------------------------------------------------------------
  // Pilotes existants disponibles pour un engagement.
  // Exclut ceux qui sont déjà engagés dans la saison sélectionnée.
  // ------------------------------------------------------------------
  form.existing.innerHTML =
    '<option value="">— nouveau pilote —</option>' +
    data.drivers
      .filter(
        (driver) =>
          driver.championship_id == data.cid &&
          !seasonData.seasonDrivers.some(
            (entry) => entry.driver_id == driver.id
          )
      )
      .map(
        (driver) => `
          <option value="${driver.id}">${esc(driver.name)}</option>
        `
      )
      .join("");

  form.existing.onchange = () => {
    const driver = data.drivers.find(
      (item) => item.id == form.existing.value
    );

    if (driver) {
      form.nm.value = driver.name;
      form.driverid.value = driver.id;
    }
  };

  // ------------------------------------------------------------------
  // Écuries disponibles : uniquement celles engagées dans la saison.
  // Une valeur vide correspond à un pilote sans écurie.
  // ------------------------------------------------------------------
  form.team.innerHTML =
    '<option value="">Sans écurie</option>' +
    seasonData.seasonTeams
      .map(
        (team) => `
          <option value="${team.id}">${esc(team.name)}</option>
        `
      )
      .join("");

  // ------------------------------------------------------------------
  // Enregistrement du pilote puis de son engagement saisonnier.
  //
  // driverid : identifiant du pilote dans le championnat.
  // rid : identifiant de son engagement dans la saison.
  // ------------------------------------------------------------------
  form.onsubmit = async (event) => {
    event.preventDefault();

    if (!data.sid) {
      return toast("Crée d’abord une saison", 1);
    }

    try {
      let driverId = +form.driverid.value;

      if (driverId) {
        // Met à jour l'identité du pilote existant.
        await post({
          t: "drivers",
          id: driverId,
          data: {
            championship_id: data.cid,
            name: form.nm.value.trim(),
          },
        });

        // Met à jour l'engagement, ou le crée si rid est vide.
        await post({
          t: "season_drivers",
          id: form.rid.value,
          data: {
            season_id: data.sid,
            driver_id: driverId,
            team_id: form.team.value ? +form.team.value : null,
            number: form.num.value ? +form.num.value : null,
          },
        });
      } else {
        // Crée d'abord le pilote pour récupérer son identifiant.
        const response = await post({
          t: "drivers",
          data: {
            championship_id: data.cid,
            name: form.nm.value.trim(),
          },
        });

        driverId = +response.id;

        // Engage ensuite le nouveau pilote dans la saison.
        await post({
          t: "season_drivers",
          data: {
            season_id: data.sid,
            driver_id: driverId,
            team_id: form.team.value ? +form.team.value : null,
            number: form.num.value ? +form.num.value : null,
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
      form.driverid.value = "";
    }, 0);
  };

  // ------------------------------------------------------------------
  // Affichage des pilotes dans l'ordre du classement calculé.
  // La couleur de l'écurie personnalise la bordure de chaque carte.
  // ------------------------------------------------------------------
  $("#list").innerHTML = seasonData.drivers.length
    ? seasonData.drivers
        .map((driver) => {
          const team = data.teams.find(
            (item) => item.id == driver.team_id
          );

          return `
            <article
              class="card"
              style="--c:${esc(team?.color || "#555")}"
            >
              <span class="num">${driver.number ?? "–"}</span>

              <div>
                <h3>${esc(driver.name)}</h3>
                <p>
                  ${team ? esc(team.name) : "Sans écurie"}
                  · ${driver.pts} pts
                </p>
              </div>

              <div class="acts">
                <button data-e="${driver.id}">Modifier</button>
                <button
                  class="del"
                  data-d="${driver.season_entry_id}"
                >Retirer de la saison</button>
              </div>
            </article>
          `;
        })
        .join("")
    : '<p class="empty">Aucun pilote engagé dans cette saison.</p>';

  // ------------------------------------------------------------------
  // Actions de la liste par délégation d'événements.
  //
  // data-e : identifiant du pilote à modifier.
  // data-d : identifiant de l'engagement saisonnier à supprimer.
  // ------------------------------------------------------------------
  $("#list").onclick = async (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    const driver = seasonData.drivers.find(
      (item) =>
        item.id == button.dataset.e ||
        item.season_entry_id == button.dataset.d
    );

    if (button.dataset.e) {
      form.nm.value = driver.name;
      form.num.value = driver.number ?? "";
      form.team.value = driver.team_id ?? "";
      form.rid.value = driver.season_entry_id;
      form.driverid.value = driver.driver_id;

      form.scrollIntoView({
        behavior: "smooth",
      });
    }

    // Cible l'engagement saisonnier, pas directement le pilote.
    if (
      button.dataset.d &&
      confirm("Retirer ce pilote de cette saison ?")
    ) {
      await del("season_drivers", button.dataset.d);

      location.reload();
    }
  };
});