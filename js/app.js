/* Interactions uniquement : le contenu HTML reste écrit manuellement. */
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".navlinks a").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navlinks");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const search = document.querySelector("#driver-search");
  const driverRows = document.querySelectorAll("#drivers-table tbody tr");
  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase("fr");
      driverRows.forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase("fr").includes(query);
      });
    });
  }

  const raceFilter = document.querySelector("#race-filter");
  const raceRows = document.querySelectorAll("#calendar-table tbody tr");
  if (raceFilter) {
    raceFilter.addEventListener("change", () => {
      raceRows.forEach((row) => {
        const sprint = row.dataset.sprint === "yes";
        row.hidden = raceFilter.value === "sprint" ? !sprint
          : raceFilter.value === "grand-prix" ? sprint
          : false;
      });
    });
  }
});
