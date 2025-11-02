document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const includeLiveGamesCheckbox = document.getElementById('include-live-games');

    const players = Object.keys(window.mockPicks);
    const games = window.mockResults.games;

    function calculateScores(includeLive, games) {
        const scores = {};
        players.forEach(player => {
            scores[player] = 0;
            const playerPicks = window.mockPicks[player];
            playerPicks.forEach(pick => {
                const game = games.find(g => g.id === pick.gameId);
                if (game && (game.status === 'STATUS_FINAL' || (includeLive && game.status === 'STATUS_IN_PROGRESS'))) {
                    if (game.winner && pick.pick.includes(game.winner)) {
                        scores[player] += pick.confidence;
                    }
                }
            });
        });
        return scores;
    }

    function renderCards(scores, games) {
        let cardsHtml = '';

        games.forEach(game => {
            cardsHtml += `
                <div class="card">
                    <div class="card-header">
                        ${game.away} @ ${game.home}
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <h5>Result: ${game.winner || '-'}</h5>
                            </div>
                            <div class="col-md-8">
                                <div class="row">
            `;

            players.forEach(player => {
                const pick = window.mockPicks[player].find(p => p.gameId === game.id);
                if (pick) {
                    let cellClass = '';
                    if (game.status === 'STATUS_FINAL' || (includeLiveGamesCheckbox.checked && game.status === 'STATUS_IN_PROGRESS')) {
                        if (game.winner && pick.pick.includes(game.winner)) {
                            cellClass = 'correct-pick';
                        } else {
                            cellClass = 'incorrect-pick';
                        }
                    }
                    cardsHtml += `
                        <div class="col-md-3 player-pick ${cellClass}">
                            <strong>${player}:</strong> ${pick.pick} (${pick.confidence})
                        </div>
                    `;
                } else {
                    cardsHtml += `
                        <div class="col-md-3 player-pick">
                            <strong>${player}:</strong> -
                        </div>
                    `;
                }
            });

            cardsHtml += `
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        app.innerHTML = cardsHtml;
    }


    const fetchDataButton = document.getElementById('fetch-data');

    let fetchedGames = null;

    async function fetchData() {
        try {
            const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
            const data = await response.json();
            fetchedGames = data.events.map(event => {
                return {
                    id: event.id,
                    home: event.competitions[0].competitors.find(c => c.homeAway === 'home').team.displayName,
                    away: event.competitions[0].competitors.find(c => c.homeAway === 'away').team.displayName,
                    status: event.status.type.name,
                    winner: event.competitions[0].competitors.find(c => c.winner)?.team.displayName
                };
            });
            updateView();
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please try again later.');
        }
    }

    fetchDataButton.addEventListener('click', fetchData);

    function updateView() {
        const games = fetchedGames || window.mockResults.games;
        const includeLive = includeLiveGamesCheckbox.checked;
        const scores = calculateScores(includeLive, games);
        renderScores(scores);
        renderCards(scores, games);
    }

    function renderScores(scores) {
        const scoresDiv = document.getElementById('scores');
        let scoresHtml = '<div class="row">';
        players.forEach(player => {
            scoresHtml += `
                <div class="col-md-2">
                    <strong>${player}:</strong> ${scores[player]}
                </div>
            `;
        });
        scoresHtml += '</div>';
        scoresDiv.innerHTML = scoresHtml;
    }

    includeLiveGamesCheckbox.addEventListener('change', updateView);

    // Initial render
    updateView();
});
