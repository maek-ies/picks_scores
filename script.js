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

    function renderTable(scores, games) {
        let tableHtml = '<table>';
        
        // Header
        tableHtml += '<thead><tr><th>Game</th><th>Result</th>';
        players.forEach(player => {
            tableHtml += `<th>${player}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Scores
        tableHtml += '<tbody><tr><td></td><td></td>';
        players.forEach(player => {
            tableHtml += `<td><strong>${scores[player]}</strong></td>`;
        });
        tableHtml += '</tr>';

        // Games
        games.forEach(game => {
            tableHtml += `<tr>`;
            tableHtml += `<td>${game.away} @ ${game.home}</td>`;
            tableHtml += `<td>${game.winner || '-'}</td>`;

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
                    tableHtml += `<td class="${cellClass}">${pick.pick} (${pick.confidence})</td>`;
                } else {
                    tableHtml += '<td>-</td>';
                }
            });

            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        app.innerHTML = tableHtml;
    }
        let tableHtml = '<table>';
        
        // Header
        tableHtml += '<thead><tr><th>Game</th><th>Result</th>';
        players.forEach(player => {
            tableHtml += `<th>${player}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Scores
        tableHtml += '<tbody><tr><td></td><td></td>';
        players.forEach(player => {
            tableHtml += `<td><strong>${scores[player]}</strong></td>`;
        });
        tableHtml += '</tr>';

        // Games
        games.forEach(game => {
            tableHtml += `<tr>`;
            tableHtml += `<td>${game.away} @ ${game.home}</td>`;
            tableHtml += `<td>${game.winner || '-'}</td>`;

            players.forEach(player => {
                const pick = window.mockPicks[player].find(p => p.gameId === game.id);
                if (pick) {
                    let cellClass = '';
                    if (game.status === 'final' || (includeLiveGamesCheckbox.checked && game.status === 'live')) {
                        if (game.winner === pick.pick) {
                            cellClass = 'correct-pick';
                        } else {
                            cellClass = 'incorrect-pick';
                        }
                    }
                    tableHtml += `<td class="${cellClass}">${pick.pick} (${pick.confidence})</td>`;
                } else {
                    tableHtml += '<td>-</td>';
                }
            });

            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        app.innerHTML = tableHtml;
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
        renderTable(scores, games);
    }

    includeLiveGamesCheckbox.addEventListener('change', updateView);

    // Initial render
    updateView();
});
