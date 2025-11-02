const { useState, useEffect } = React;

function NFLScoresTracker() {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('confidence');
  const [confidenceView, setConfidenceView] = useState('overview');
  const [includeLiveGames, setIncludeLiveGames] = useState(false);

  useEffect(() => {
    const allWeeks = window.weeks || [];
    setWeeks(allWeeks);
    if (allWeeks.length > 0) {
      setSelectedWeek(allWeeks[allWeeks.length - 1].week);
    }
    setLoading(false);
    setLastUpdate(new Date());
  }, []);

  const calculateConfidencePoints = () => {
    const results = {};
    const mockPicks = window.mockPicks || {};

    Object.keys(mockPicks).forEach(player => {
      results[player] = { total: 0, weekly: 0, correct: 0, possible: 0, details: [] };
    });

    weeks.forEach(weekData => {
      weekData.games.forEach(game => {
        Object.keys(mockPicks).forEach(player => {
          const playerPicks = mockPicks[player];
          const pick = playerPicks.find(p => p.gameId === game.id);
          if (!pick) return;

          const isComplete = game.status === 'final';
          const isLiveGame = game.status === 'live';

          results[player].possible += pick.confidence;

          let winner = null;
          if (isComplete || (includeLiveGames && isLiveGame)) {
            winner = game.winner;
          }

          const isCorrect = winner === pick.pick;

          if ((isComplete || (includeLiveGames && isLiveGame)) && isCorrect) {
            results[player].total += pick.confidence;
            if (weekData.week === selectedWeek) {
              results[player].weekly += pick.confidence;
            }
            results[player].correct++;
          }
          
          if (weekData.week === selectedWeek) {
              results[player].details.push({
                gameId: game.id,
                pick: pick.pick,
                confidence: pick.confidence,
                winner: winner,
                correct: (isComplete || (includeLiveGames && isLiveGame)) ? isCorrect : null,
                homeTeam: game.home,
                awayTeam: game.away,
                score: (isComplete || (includeLiveGames && isLiveGame)) ? `${game.awayScore}-${game.homeScore}${isLiveGame ? ' (Live)' : ''}` : 'Pending',
                isLive: isLiveGame
              });
          }
        });
      });
    });

    return results;
  };

  const getGameStatus = (game) => {
    if (game.status === 'final') return 'FINAL';
    if (game.status === 'live') return 'LIVE';
    return 'Scheduled';
  };

  const isLive = (game) => {
    return game.status === 'live';
  };

  const displayedWeek = weeks.find(w => w.week === selectedWeek);
  const gamesByDate = displayedWeek ? displayedWeek.games.reduce((acc, game) => {
    const date = new Date(game.date || Date.now()).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {}) : {};

  const confidenceResults = calculateConfidencePoints();
  const leaderboard = Object.entries(confidenceResults)
    .sort((a, b) => b[1].total - a[1].total);

  return (
    React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" },
      React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10" },
        React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-4" },
          React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-4" },
            React.createElement("div", { className: "flex items-center gap-3" },
              React.createElement("span", null, "\uD83D\uDCFA"),
              React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-white" }, "NFL Tracker"),
                selectedWeek && (
                  React.createElement("div", { className: "flex items-center gap-2 text-slate-400 text-sm mt-1" },
                    React.createElement("span", null, "\uD83D\uDCC5"),
                    `Week ${selectedWeek}`
                  )
                )
              )
            ),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement("select", { onChange: (e) => setSelectedWeek(parseInt(e.target.value)), value: selectedWeek, className: "bg-slate-700 text-white rounded-lg px-3 py-2" },
                weeks.map(w => React.createElement("option", { key: w.week, value: w.week }, `Week ${w.week}`))
              )
            )
          ),
          React.createElement("div", { className: "flex gap-2 mt-4" },
            React.createElement("button", {
              onClick: () => setActiveTab('confidence'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'confidence'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              React.createElement("span", null, "\uD83C\uDFC6"),
              "Confidence Pool"
            ),
            React.createElement("button", {
              onClick: () => setActiveTab('scores'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scores'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Scores"
            )
          )
        )
      ),
      React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-6" },
        error && (
          React.createElement("div", { className: "bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm" },
            error
          )
        ),
        loading ? (
          React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement("div", { className: "text-center" },
              React.createElement("span", { className: "w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" }, "\u21BB"),
              React.createElement("p", { className: "text-slate-300" }, "Loading...")
            )
          )
        ) : activeTab === 'confidence' ? (
          React.createElement("div", null,
            React.createElement("div", { className: "flex items-center justify-between mb-6" },
              React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", {
                  onClick: () => setConfidenceView('overview'),
                  className: `px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    confidenceView === 'overview'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`
                },
                  React.createElement("span", null, "\uD83D\uDDB7"),
                  "Overview Table"
                ),
                React.createElement("button", {
                  onClick: () => setConfidenceView('leaderboard'),
                  className: `px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    confidenceView === 'leaderboard'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`
                },
                  React.createElement("span", null, "\uD83C\uDFC6"),
                  "Leaderboard"
                )
              ),
              React.createElement("button", {
                onClick: () => setIncludeLiveGames(!includeLiveGames),
                className: `px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                  includeLiveGames
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700'
                }`
              },
                React.createElement("span", { className: `w-2 h-2 rounded-full ${includeLiveGames ? 'bg-white animate-pulse' : 'bg-slate-500'}` }),
                includeLiveGames ? 'Including Live Games' : 'Final Games Only'
              )
            ),
            confidenceView === 'overview' ? (
              React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden" },
                React.createElement("div", { className: "overflow-x-auto" },
                  React.createElement("table", { className: "w-full" },
                    React.createElement("thead", null,
                      React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Game"),
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Result"),
                        leaderboard.map(([player, data]) => (
                          React.createElement("th", { key: player, className: "px-4 py-3 text-center border-l border-slate-700" },
                            React.createElement("div", { className: "text-white font-semibold text-sm" }, player),
                            React.createElement("div", { className: "text-yellow-400 text-lg font-bold mt-1" }, data.total),
                            React.createElement("div", { className: "text-slate-400 text-xs" }, `This Week: ${data.weekly}`)
                          )
                        ))
                      )
                    ),
                    React.createElement("tbody", null,
                      (displayedWeek ? displayedWeek.games : []).map((game) => {
                        return (
                          React.createElement("tr", { key: game.id, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-white text-sm font-medium" },
                                `${game.away} @ ${game.home}`
                              )
                            ),
                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-sm" },
                                game.status === 'final' || (includeLiveGames && game.status === 'live') ? (
                                  React.createElement("span", { className: "text-white font-semibold" }, `${game.awayScore}-${game.homeScore}`)
                                ) : (
                                  React.createElement("span", { className: "text-slate-400" }, "-")
                                )
                              )
                            ),
                            leaderboard.map(([player, data]) => {
                                const detail = data.details.find(d => d.gameId === game.id);
                                if (!detail) return React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-500 border-l border-slate-700/50" }, "-");

                                const isCorrect = detail.correct;
                                const isWrong = detail.correct === false;

                                return (
                                    React.createElement("td", { key: player, className: "px-4 py-3 text-center border-l border-slate-700/50" },
                                        React.createElement("div", { className: `inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-semibold ${
                                            isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                            isWrong ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                            'bg-slate-700/50 text-slate-300 border border-slate-600'
                                        }` },
                                            React.createElement("span", null, detail.pick),
                                            React.createElement("span", { className: `text-xs px-1.5 py-0.5 rounded ${
                                                isCorrect ? 'bg-green-500 text-white' :
                                                isWrong ? 'bg-red-500 text-white' :
                                                'bg-slate-600 text-slate-200'
                                            }` },
                                                detail.confidence
                                            )
                                        )
                                    )
                                );
                            })
                          )
                        );
                      })
                    )
                  )
                )
              )
            ) : (
              React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 p-6" },
                  React.createElement("h2", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2" },
                    React.createElement("span", null, "\uD83C\uDFC6"),
                    "Leaderboard"
                  ),
                  React.createElement("div", { className: "space-y-2" },
                    leaderboard.map(([player, data], idx) => (
                      React.createElement("div", { key: player, className: "flex items-center justify-between bg-slate-700/30 rounded-lg p-3" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                          React.createElement("div", { className: `w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-slate-900' :
                            idx === 1 ? 'bg-slate-400 text-slate-900' :
                            idx === 2 ? 'bg-amber-700 text-white' :
                            'bg-slate-600 text-slate-300'
                          }` },
                            idx + 1
                          ),
                          React.createElement("span", { className: "text-white font-semibold" }, player)
                        ),
                        React.createElement("div", { className: "text-right" },
                          React.createElement("div", { className: "text-2xl font-bold text-white" }, data.total),
                          React.createElement("div", { className: "text-xs text-slate-400" }, `This Week: ${data.weekly}`)
                        )
                      )
                    ))
                  )
                )
              )
            )
          )
        ) : (
          React.createElement("div", { className: "space-y-6" },
            Object.entries(gamesByDate).map(([date, dateGames]) => (
              React.createElement("div", { key: date },
                React.createElement("h2", { className: "text-lg font-bold text-white mb-3 flex items-center gap-2" },
                  React.createElement("div", { className: "w-1 h-5 bg-blue-500 rounded" }),
                  date
                ),
                React.createElement("div", { className: "space-y-3" },
                  dateGames.map((game) => {
                    const live = isLive(game);
                    const status = getGameStatus(game);

                    return (
                      React.createElement("div",
                        { key: game.id,
                        className: `bg-slate-800/50 rounded-lg border ${
                          live ? 'border-green-500' : 'border-slate-700'
                        } overflow-hidden`
                      },
                        React.createElement("div", { className: `px-3 py-1.5 text-xs font-semibold text-center ${
                          live ? 'bg-green-500 text-white' : 'bg-slate-700/50 text-slate-300'
                        }` },
                          live && React.createElement("span", { className: "inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" }),
                          status
                        ),
                        React.createElement("div", { className: "p-4" },
                          React.createElement("div", { className: "flex items-center justify-between mb-2" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                              React.createElement("img", { src: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.away.split(' ').pop().toLowerCase()}.png`, alt: game.away, className: "w-8 h-8" }),
                              React.createElement("span", { className: "text-white font-semibold" }, game.away),
                            ),
                            React.createElement("span", { className: "text-2xl font-bold text-white" }, game.awayScore)
                          ),
                          React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                              React.createElement("img", { src: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.home.split(' ').pop().toLowerCase()}.png`, alt: game.home, className: "w-8 h-8" }),
                              React.createElement("span", { className: "text-white font-semibold" }, game.home),
                            ),
                            React.createElement("span", { className: "text-2xl font-bold text-white" }, game.homeScore)
                          )
                        )
                      )
                    );
                  })
                )
              )
            ))
          )
        )
      )
    )
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(NFLScoresTracker));
