/*
 * F1 Arena — interactions du navigateur.
 * Le contenu des pages reste écrit directement dans le HTML.
 */
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".navlinks");

    // Navigation mobile
    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            const isOpen = navigation.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        });
    }

    // Page active dans le menu
    document.querySelectorAll(".navlinks a").forEach(function (link) {
        if (link.dataset.page === page) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    // Filtre du calendrier : les lignes sont déjà présentes dans calendar.html.
    const raceFilter = document.querySelector("#race-filter");
    const calendarList = document.querySelector("#calendar-list");
    if (raceFilter && calendarList) {
        raceFilter.addEventListener("change", function () {
            calendarList.querySelectorAll("[data-status]").forEach(function (row) {
                row.hidden = raceFilter.value !== "all" && row.dataset.status !== raceFilter.value;
            });
        });
    }

    // Recherche dans les cartes de pilotes écrites dans drivers.html.
    const driverSearch = document.querySelector("#driver-search");
    const driverGrid = document.querySelector("#drivers-grid");
    if (driverSearch && driverGrid) {
        driverSearch.addEventListener("input", function () {
            const query = driverSearch.value.trim().toLocaleLowerCase();
            driverGrid.querySelectorAll(".driver-card").forEach(function (card) {
                card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
            });
        });
    }

    // Recherche dans le tableau de classement écrit dans standings.html.
    const standingsSearch = document.querySelector("#driver-search");
    const standingsBody = document.querySelector("#standings-body");
    if (standingsSearch && standingsBody) {
        standingsSearch.addEventListener("input", function () {
            const query = standingsSearch.value.trim().toLocaleLowerCase();
            standingsBody.querySelectorAll("tr").forEach(function (row) {
                const searchableText = (row.dataset.search || row.textContent).toLocaleLowerCase();
                row.hidden = !searchableText.includes(query);
            });
        });
    }

    // Sauvegarde des pronostics sur cet appareil, sans backend.
    const predictionForm = document.querySelector("#prediction-form");
    const predictionMessage = document.querySelector("#prediction-message");
    const clearButton = document.querySelector("#clear-predictions");
    const storageKey = "f1arena-prediction";

    if (predictionForm && predictionMessage) {
        try {
            const savedPicks = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (savedPicks && typeof savedPicks === "object") {
                Object.entries(savedPicks).forEach(function ([name, value]) {
                    const field = predictionForm.elements.namedItem(name);
                    if (field) field.value = value;
                });
                predictionMessage.textContent = "Your saved picks have been restored on this device.";
                predictionMessage.hidden = false;
            }
        } catch (error) {
            predictionMessage.textContent = "Saved picks could not be read from this browser.";
            predictionMessage.hidden = false;
        }

        predictionForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const picks = {};
            new FormData(predictionForm).forEach(function (value, name) {
                picks[name] = value;
            });

            if (new Set([picks.winner, picks.podium2, picks.podium3]).size !== 3) {
                predictionMessage.textContent = "Choose three different drivers for the podium.";
                predictionMessage.hidden = false;
                return;
            }

            try {
                localStorage.setItem(storageKey, JSON.stringify(picks));
                predictionMessage.textContent = "Predictions saved on this device. They are not sent to the MySQL database.";
                predictionMessage.hidden = false;
            } catch (error) {
                predictionMessage.textContent = "The browser could not save your predictions.";
                predictionMessage.hidden = false;
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                predictionForm.reset();
                localStorage.removeItem(storageKey);
                predictionMessage.textContent = "Your saved picks have been cleared.";
                predictionMessage.hidden = false;
            });
        }
    }
});
