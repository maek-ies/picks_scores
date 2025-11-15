# NFL Pick'em Confidence Scores

A simple web app to compute and display scores for an NFL pick'em confidence game.

## How to Use

1.  Open `index.html` in a web browser.
2.  The app will load with mock data by default.
3.  Click the "Refresh Scores" button to get the latest NFL scores from the ESPN API.
4.  Use the "Including Live Games" button to toggle whether live games are included in the score calculation.

## Recent Updates & Features

*   **Sticky Headers & Enhanced Disagreement Metrics (2025-11-15):**
    *   **Sticky Table Headers (Attempted):** An attempt was made to implement sticky (frozen) headers for all major tables. However, the `position: sticky` CSS approach was not successful, and this feature remains an unsolved issue.
    *   **Enhanced Disagreement Calculation:** The disagreement metrics in the "Win Probs." tab have been updated to be more informative:
        *   When FPI and Moneyline models pick the **same team**, the metric shows the absolute difference between their confidence values (a positive number).
        *   When they pick **different teams**, the metric now shows a **negative number** representing the sum of their confidences, clearly flagging a conflict in their predictions.
    *   **UI Margin Adjustments:** Further refined the vertical spacing in the header to minimize the gap between the main title and the control buttons.

*   **Disagreement Measures & UI Tweaks (2025-11-15):**
    *   **Disagreement Measures:**
        *   Added a new disagreement measure based on the absolute difference between FPI and Moneyline confidence ranks.
        *   The "Show Disagreement" button in the "Win Probs." tab now cycles through three modes:
            1.  `Hidden`: No disagreement metric is shown.
            2.  `WP`: Shows the disagreement based on Win Probability (`(WP: X.X%)`).
            3.  `Confidence`: Shows the disagreement based on confidence rank (`(Conf: X)`).
        *   This metric is displayed in the "Agg Pick" column of the top summary table.
    *   **UI/UX Refinements:**
        *   Adjusted vertical spacing (margins) between the different rows of buttons in the header for better visual separation.

*   **Chart UI Enhancements (2025-11-15):**
    *   Renamed the "Odds" tab to "Win Probs.".
    *   Removed titles from all charts in the "Charts" tab for a cleaner look.
    *   Moved the view-mode toggle buttons to the top-right corner of the "Points per Week" and "GotW Points" charts.
    *   Standardized the height of the "GotW Points" chart to match the other charts.
    *   Implemented a centralized CSS class (`.chart-text`) to control chart font sizes, with the current size set to 36px.

*   **Charts and Odds Tab Enhancements (2025-11-12):**
    *   **Charts Tab:**
        *   The "Points per Week" and "Cumulative Points vs. Leader" line charts now only display data up to the currently selected week, preventing extrapolation to week 18.
    *   **Odds Tab:**
        *   The "Win Probability" column was split into "Away WP" and "Home WP".
        *   Added an "Abs Diff" column showing the absolute difference between "Away WP" and "Home WP".
        *   Added an "FPI Conf." column with a rank based on the "Abs Diff" (lower difference is a lower rank).
        *   The "Moneyline" column was split into "awayML" and "homeML".
        *   Added "awayML_WP" and "homeML_WP" columns showing win probabilities converted from the moneyline odds.
        *   Added an "Abs ML Diff" column showing the absolute difference between "awayML_WP" and "homeML_WP".
        *   Added an "ML Conf." column with a rank based on the "Abs ML Diff".
        *   Implemented sorting for all columns in the "Odds" tab.

*   **Charts Tab Refactoring & GOTW Chart:**
    *   The "Charts" tab has been reorganized into three sub-tabs: "Points per Week", "Cumulative Points vs. Leader", and "GOTW Points".
    *   The "GOTW Points" sub-tab now features an improved bar chart and a detailed table.
    *   The bar chart correctly reflects total points, with bars sorted in descending order and a value label on top of each bar.
    *   Fixed a bug that caused a duplicate label to appear on the first bar.
*   **UI/UX Enhancements:**
    *   The "Dev" column in the "Week Overview" table now displays an empty string for `NaN` values.
    *   The TV icon in the main title has been replaced with an American football icon (🏈).
    *   Added a "Points Lost" metric to the player column headers in the "Week Overview" table.
*   **Week Overview Table Enhancements:**
    *   Live game clock and period information is now displayed as a third row in the "Game" column, enclosed in parentheses and styled for better visibility.
    *   The "Score" column now exclusively displays the game scores.
    *   "Dev" column values are rounded to one decimal place for improved readability.
    *   Fixed a React syntax error related to element rendering in the game column.

*   **Player Column Tooltips:**
    *   Added descriptive tooltips to the player column headers in the "Week Overview" table for:
        *   "Total points for the season"
        *   "Total points behind the leader"
        *   "Points this week"
        *   "Remaining potential points this week"


*   **Win Probability Display:**
    *   Corrected win probability calculations for proper percentage display.
    *   Win probabilities are now displayed for both live and finished games, using the first observation for finished games.
*   **Game Information Enhancements:**
    *   Added game clock and period display for live games in both the main Scores tab and the Confidence Pool Overview table.
    *   Displayed date and time of game start for scheduled games in both the Scores tab and the Confidence Pool Overview table.
    *   Ordered games in the Scores tab by start date and time, removing date headings.
*   **Confidence Pool Overview Table Improvements:**
    *   Live games are now highlighted with a green background.
    *   "Points behind first place" is displayed for each player.
    *   The first-place player is labeled "Leader".
*   **Remaining Points Calculation:**
    *   Implemented a new, more accurate calculation for "remaining possible confidence points" per week. This calculation considers the maximum possible points for the week (based on the number of games) and subtracts confidence points from games that have started and for which a pick was made.
    *   The calculation now correctly handles the "Final Games Only" option, only subtracting finished games' confidence when active.
*   **File Management:**
    *   Moved `picks.json` to the main project folder and updated its loading path in `script.js`.
    *   Moved `games_of_the_week.txt` back to the `data` subfolder and updated its loading path in `script.js`.
*   **GitHub Actions Workflow (`.github/workflows/run_picks_extract.yml`):**
    *   Modified the workflow to trigger only on schedule or when `process_picks_gh.R` is committed, removing the `pull_request` trigger.

## Enhancements Status

*   **Charts Tab Enhancements:**
    *   Close tables by default.
    *   Improve current charts' visual presentation and functionality.
    *   Add more charts.
### Completed Enhancements

*   [x] Added a chart with cumulative points over weeks.
*   [x] Added an average deviation table by game.
*   [x] Added an "Odds" tab to integrate betting odds data.
*   [x] Organize charts by sub-tab.

### Future Enhancements

*   Integrate FPI (Football Power Index) picks.
*   Consider removing space in game name.
*   Consider better visualization of Game of the week (e.g., color instead of badge).
*   Find alternative for tooltips on mobiles.
*   Work on odds tab to be usable for picking games (e.g. picks by source + average).
*   Fix: Points percentage in GotW does not always work (seems to be related to situations when the previous week's "Game of the Week" result is not yet known).