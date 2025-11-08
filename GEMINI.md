# Project Overview

This project is an NFL Pick'em Confidence Scores tracker. It comprises an R script for data extraction and processing, and a web application (HTML, CSS, JavaScript with React) for displaying the scores and confidence picks. The R script scrapes data from ESPN, processes it, and generates a `picks.json` file. The web application then consumes this `picks.json` file along with live ESPN API data to display real-time scores, confidence picks, and a leaderboard.

# Technologies Used

*   **Backend (Data Processing):** R (with `chromote`, `rvest`, `data.table`, `httr`, `glue`, `jsonlite` packages)
*   **Frontend (Web Application):** HTML, CSS, JavaScript (React)
*   **Automation:** GitHub Actions

# Building and Running

## Data Extraction (R Script)

The `process_picks_gh.R` script is responsible for scraping NFL pick'em data. It uses `chromote` for web scraping, which requires a headless browser (Chrome).

**To run the R script manually:**

```bash
Rscript process_picks_gh.R
```

This script generates the following files: `all_picks_gh.gz`, `dt_picks_gh.gz`, `list_of_games_gh.gz`, and `picks.json`.

**Dependencies:**

*   **R Packages:** `chromote`, `httpuv`, `data.table`, `rvest`, `xml2`, `httr`, `glue`, `jsonlite`, `R.utils`.
*   **System Dependencies (for `chromote`):** `libnss3`, `libxss1`, `libasound2t64`, `libatk1.0-0`, `libatk-bridge2.0-0`, `libgtk-3-0`, `libdrm2`, `libgbm1`, `libxkbcommon0`, `libpango-1.0-0`, `libpangocairo-1.0-0`, `libatspi2.0-0`, `xvfb`.

## Web Application

The web application is a static site.

**To view the application:**

1.  Open `index.html` in a web browser.

The application uses React, which is loaded via CDN in `index.html`. `script.js` contains the React components and logic for fetching and displaying data. `style.css` provides the styling (likely using Tailwind CSS classes).

## Automation (GitHub Actions)

The `.github/workflows/run_picks_extract.yml` workflow automates the execution of `process_picks_gh.R`.

**Triggers:**

*   On a schedule (Thursday, Sunday, Monday, Tuesday).
*   On pushes to `process_picks_gh.R`.

**Workflow Steps:**

1.  Checks out the repository.
2.  Sets up R.
3.  Installs system dependencies required for `chromote`.
4.  Installs R package dependencies.
5.  Installs Chrome.
6.  Runs the `process_picks_gh.R` script using `xvfb-run`.
7.  Uploads the generated data files (`all_picks_gh.gz`, `dt_picks_gh.gz`, `list_of_games_gh.gz`, `picks.json`) as artifacts.
8.  Commits the generated files back to the repository.

# Development Conventions

*   **R Script:** Uses `data.table` for efficient data manipulation.
*   **JavaScript:** Uses React for UI development, employing functional components with `useState` and `useEffect` hooks.
*   **Styling:** Appears to use Tailwind CSS classes directly within the JSX for styling.
*   **Data Flow:** The R script generates `picks.json` and other gzipped data files. The `script.js` reads `picks.json` and `data/games_of_the_week.txt` and fetches live data from the ESPN API to render the UI.

# Future Enhancements (from README.md)

1.  [x] Add a chart with cumulative points over weeks.
2.  Prepare better week result chart.
3.  Add an average deviation table by game.
4.  [x] Add an "Odds" tab to integrate betting odds data.
5.  Integrate FPI (Football Power Index) picks.

# Session Summary (2025-11-05)

*   **Implemented "Odds" Tab:** Added a new "Odds" tab to the main interface to display betting information for the selected week.
*   **Integrated API Data:** The new tab fetches and displays:
    *   **Moneyline Odds:** From the `summary` API endpoint (`pickcenter` object).
    *   **Win Probability:** Uses `predictor.gameProjection` for upcoming games (statuses `'pre'` and `'scheduled'`) and the `winprobability` object for live/finished games.
*   **Improved UX:**
    *   The week selector now includes all 18 weeks of the season.
    *   The application now defaults to the calculated *current* week of the season on startup.