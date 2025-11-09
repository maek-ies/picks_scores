# NFL Pick'em Confidence Scores

A simple web app to compute and display scores for an NFL pick'em confidence game.

## How to Use

1.  Open `index.html` in a web browser.
2.  The app will load with mock data by default.
3.  Click the "Refresh Scores" button to get the latest NFL scores from the ESPN API.
4.  Use the "Including Live Games" button to toggle whether live games are included in the score calculation.

## Recent Updates & Features

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
    *   Organize charts by sub-tab.
    *   Close tables by default.
    *   Improve current charts' visual presentation and functionality.
    *   Add more charts.
### Completed Enhancements

*   [x] Added a chart with cumulative points over weeks.
*   [x] Added an average deviation table by game.
*   [x] Added an "Odds" tab to integrate betting odds data.

### Future Enhancements

*   Integrate FPI (Football Power Index) picks.
*   Consider removing space in game name.
*   Consider better visualization of Game of the week (e.g., color instead of badge).
*   Find alternative for tooltips on mobiles.
*   Work on odds tab to be usable for picking games (e.g. picks by source + average).