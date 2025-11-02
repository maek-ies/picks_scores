const { useState, useEffect } = React;

// Mock data for demonstration
const mockData = {
  week: {
    number: 9,
    text: "November 2-3, 2025"
  },
  events: [
    {
      id: "1",
      date: "2025-11-02T17:00Z",
      competitions: [{
        status: {
          type: {
            state: "post",
            completed: true,
            shortDetail: "Final"
          }
        },
        broadcast: [{ names: ["CBS"] }],
        venue: { fullName: "Arrowhead Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Las Vegas Raiders",
              abbreviation: "LV",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png"
            },
            score: "17",
            records: [{ summary: "4-4" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "Kansas City Chiefs",
              abbreviation: "KC",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
            },
            score: "31",
            records: [{ summary: "7-1" }]
          }
        ]
      }]
    },
    {
      id: "2",
      date: "2025-11-02T17:00Z",
      competitions: [{
        status: {
          type: {
            state: "post",
            completed: true,
            shortDetail: "Final"
          }
        },
        broadcast: [{ names: ["FOX"] }],
        venue: { fullName: "AT&T Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Philadelphia Eagles",
              abbreviation: "PHI",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png"
            },
            score: "28",
            records: [{ summary: "6-2" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "Dallas Cowboys",
              abbreviation: "DAL",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png"
            },
            score: "21",
            records: [{ summary: "5-3" }]
          }
        ]
      }]
    },
    {
      id: "3",
      date: "2025-11-02T20:15Z",
      competitions: [{
        status: {
          type: {
            state: "in",
            completed: false,
            shortDetail: "2nd 4:32"
          }
        },
        broadcast: [{ names: ["NBC"] }],
        venue: { fullName: "Lambeau Field" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Detroit Lions",
              abbreviation: "DET",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png"
            },
            score: "14",
            records: [{ summary: "7-1" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "Green Bay Packers",
              abbreviation: "GB",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png"
            },
            score: "10",
            records: [{ summary: "6-2" }]
          }
        ]
      }]
    },
    {
      id: "4",
      date: "2025-11-03T13:00Z",
      competitions: [{
        status: {
          type: {
            state: "in",
            completed: false,
            shortDetail: "1st 12:04"
          }
        },
        broadcast: [{ names: ["CBS"] }],
        venue: { fullName: "Gillette Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Buffalo Bills",
              abbreviation: "BUF",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png"
            },
            score: "7",
            records: [{ summary: "6-2" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "New England Patriots",
              abbreviation: "NE",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png"
            },
            score: "3",
            records: [{ summary: "2-6" }]
          }
        ]
      }]
    },
    {
      id: "5",
      date: "2025-11-03T13:00Z",
      competitions: [{
        status: {
          type: {
            state: "in",
            completed: false,
            shortDetail: "1st 8:21"
          }
        },
        broadcast: [{ names: ["FOX"] }],
        venue: { fullName: "Levi's Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Seattle Seahawks",
              abbreviation: "SEA",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"
            },
            score: "0",
            records: [{ summary: "5-3" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "San Francisco 49ers",
              abbreviation: "SF",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png"
            },
            score: "3",
            records: [{ summary: "4-4" }]
          }
        ]
      }]
    },
    {
      id: "6",
      date: "2025-11-03T17:00Z",
      competitions: [{
        status: {
          type: {
            state: "pre",
            completed: false,
            shortDetail: "4:25 PM"
          }
        },
        broadcast: [{ names: ["CBS"] }],
        venue: { fullName: "SoFi Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Tampa Bay Buccaneers",
              abbreviation: "TB",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png"
            },
            score: "0",
            records: [{ summary: "5-3" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "Los Angeles Rams",
              abbreviation: "LAR",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png"
            },
            score: "0",
            records: [{ summary: "3-5" }]
          }
        ]
      }]
    },
    {
      id: "7",
      date: "2025-11-04T00:20Z",
      competitions: [{
        status: {
          type: {
            state: "pre",
            completed: false,
            shortDetail: "8:20 PM"
          }
        },
        broadcast: [{ names: ["ESPN"] }],
        venue: { fullName: "Raymond James Stadium" },
        competitors: [
          {
            homeAway: "away",
            team: {
              displayName: "Baltimore Ravens",
              abbreviation: "BAL",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png"
            },
            score: "0",
            records: [{ summary: "6-2" }]
          },
          {
            homeAway: "home",
            team: {
              displayName: "Tampa Bay Buccaneers",
              abbreviation: "TB2",
              logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png"
            },
            score: "0",
            records: [{ summary: "5-3" }]
          }
        ]
      }]
    }
  ]
};

// Mock confidence picks for 5 players
const mockPicks = {
  "Alice": {
    "1": { pick: "KC", confidence: 7 },
    "2": { pick: "PHI", confidence: 6 },
    "3": { pick: "DET", confidence: 5 },
    "4": { pick: "BUF", confidence: 4 },
    "5": { pick: "SF", confidence: 3 },
    "6": { pick: "TB", confidence: 2 },
    "7": { pick: "BAL", confidence: 1 }
  },
  "Bob": {
    "1": { pick: "KC", confidence: 5 },
    "2": { pick: "DAL", confidence: 7 },
    "3": { pick: "GB", confidence: 6 },
    "4": { pick: "BUF", confidence: 4 },
    "5": { pick: "SEA", confidence: 3 },
    "6": { pick: "LAR", confidence: 2 },
    "7": { pick: "BAL", confidence: 1 }
  },
  "Charlie": {
    "1": { pick: "LV", confidence: 2 },
    "2": { pick: "PHI", confidence: 7 },
    "3": { pick: "DET", confidence: 6 },
    "4": { pick: "BUF", confidence: 5 },
    "5": { pick: "SF", confidence: 4 },
    "6": { pick: "TB", confidence: 3 },
    "7": { pick: "TB2", confidence: 1 }
  },
  "Diana": {
    "1": { pick: "KC", confidence: 6 },
    "2": { pick: "PHI", confidence: 5 },
    "3": { pick: "DET", confidence: 7 },
    "4": { pick: "NE", confidence: 1 },
    "5": { pick: "SEA", confidence: 4 },
    "6": { pick: "LAR", confidence: 3 },
    "7": { pick: "BAL", confidence: 2 }
  },
  "Ethan": {
    "1": { pick: "KC", confidence: 7 },
    "2": { pick: "PHI", confidence: 6 },
    "3": { pick: "GB", confidence: 3 },
    "4": { pick: "BUF", confidence: 5 },
    "5": { pick: "SF", confidence: 4 },
    "6": { pick: "TB", confidence: 2 },
    "7": { pick: "BAL", confidence: 1 }
  }
};

function NFLScoresTracker() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [weekInfo, setWeekInfo] = useState(null);
  const [useMockData, setUseMockData] = useState(true);
  const [activeTab, setActiveTab] = useState('confidence');
  const [confidenceView, setConfidenceView] = useState('overview');
  const [includeLiveGames, setIncludeLiveGames] = useState(false);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setGames(mockData.events);
        setWeekInfo(mockData.week);
        setLastUpdate(new Date());
      } else {
        // In a real app, you would fetch from an API here.
        // For this example, we'll just use the mock data.
        setGames(mockData.events);
        setWeekInfo(mockData.week);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to fetch live data. Please try again or use mock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [useMockData]);

  const calculateConfidencePoints = () => {
    const results = {};
    
    Object.keys(mockPicks).forEach(player => {
      results[player] = { total: 0, correct: 0, possible: 0, details: [] };
      
      games.forEach(game => {
        const pick = mockPicks[player][game.id];
        if (!pick) return;
        
        const competition = game.competitions[0];
        const isComplete = competition.status.type.completed;
        const isLiveGame = competition.status.type.state === 'in';
        
        results[player].possible += pick.confidence;
        
        const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
        const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
        
        let winner = null;
        if (isComplete || (includeLiveGames && isLiveGame)) {
          if (parseInt(homeTeam.score) > parseInt(awayTeam.score)) {
            winner = homeTeam.team.abbreviation;
          } else if (parseInt(awayTeam.score) > parseInt(homeTeam.score)) {
            winner = awayTeam.team.abbreviation;
          }
        }
        
        const isCorrect = winner === pick.pick;
        
        results[player].details.push({
          gameId: game.id,
          pick: pick.pick,
          confidence: pick.confidence,
          winner: winner,
          correct: (isComplete || (includeLiveGames && isLiveGame)) ? isCorrect : null,
          homeTeam: homeTeam.team.abbreviation,
          awayTeam: awayTeam.team.abbreviation,
          score: (isComplete || (includeLiveGames && isLiveGame)) ? `${awayTeam.score}-${homeTeam.score}${isLiveGame ? ' (Live)' : ''}` : 'Pending',
          isLive: isLiveGame
        });
        
        if ((isComplete || (includeLiveGames && isLiveGame)) && isCorrect) {
          results[player].total += pick.confidence;
          results[player].correct++;
        }
      });
    });
    
    return results;
  };

  const getGameStatus = (competition) => {
    const status = competition.status;
    if (status.type.completed) return 'FINAL';
    if (status.type.state === 'in') return status.type.shortDetail;
    return status.type.shortDetail || 'Scheduled';
  };

  const isLive = (competition) => {
    return competition.status.type.state === 'in';
  };

  const gamesByDate = games.reduce((acc, game) => {
    const date = new Date(game.date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {});

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
                weekInfo && (
                  React.createElement("div", { className: "flex items-center gap-2 text-slate-400 text-sm mt-1" },
                    React.createElement("span", null, "\uD83D\uDCC5"),
                    `Week ${weekInfo.number}`
                  )
                )
              )
            ),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement("button", {
                onClick: () => setUseMockData(!useMockData),
                className: `px-3 py-2 text-sm rounded-lg transition-colors ${
                  useMockData 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`
              },
                useMockData ? 'Mock' : 'Live'
              ),
              React.createElement("button", {
                onClick: fetchScores,
                disabled: loading,
                className: "flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors text-sm"
              },
                React.createElement("span", { className: loading ? 'animate-spin' : '' }, "\u21BB"),
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

        loading && games.length === 0 ? (
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
                        Object.entries(confidenceResults).sort((a, b) => b[1].total - a[1].total).map(([player, data]) => (
                          React.createElement("th", { key: player, className: "px-4 py-3 text-center border-l border-slate-700" },
                            React.createElement("div", { className: "text-white font-semibold text-sm" }, player),
                            React.createElement("div", { className: "text-yellow-400 text-lg font-bold mt-1" }, data.total),
                            React.createElement("div", { className: "text-slate-400 text-xs" }, `${data.correct}/${games.length}`)
                          )
                        ))
                      )
                    ),
                    React.createElement("tbody", null,
                      games.map((game) => {
                        const competition = game.competitions[0];
                        const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
                        const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
                        const isComplete = competition.status.type.completed;
                        const isLiveGame = competition.status.type.state === 'in';
                        
                        let winner = null;
                        if (isComplete || (includeLiveGames && isLiveGame)) {
                          if (parseInt(homeTeam.score) > parseInt(awayTeam.score)) {
                            winner = homeTeam.team.abbreviation;
                          } else if (parseInt(awayTeam.score) > parseInt(homeTeam.score)) {
                            winner = awayTeam.team.abbreviation;
                          }
                        }

                        return (
                          React.createElement("tr", { key: game.id, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-white text-sm font-medium" },
                                `${awayTeam.team.abbreviation} @ ${homeTeam.team.abbreviation}`
                              )
                            ),
                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-sm" },
                                isComplete ? (
                                  React.createElement("span", { className: "text-white font-semibold" }, `${awayTeam.score}-${homeTeam.score}`)
                                ) : isLiveGame ? (
                                  React.createElement("span", { className: "text-green-400 font-semibold" }, `${awayTeam.score}-${homeTeam.score} \uD83D\uDD34`)
                                ) : (
                                  React.createElement("span", { className: "text-slate-400" }, "-")
                                )
                              )
                            ),
                            Object.entries(confidenceResults).sort((a, b) => b[1].total - a[1].total).map(([player, data]) => {
                              const picks = mockPicks[player];
                              const pick = picks[game.id];
                              if (!pick) return React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-500 border-l border-slate-700/50" }, "-");
                              
                              const isCorrect = (isComplete || (includeLiveGames && isLiveGame)) && winner === pick.pick;
                              const isWrong = (isComplete || (includeLiveGames && isLiveGame)) && winner && winner !== pick.pick;
                              
                              return (
                                React.createElement("td", { key: player, className: "px-4 py-3 text-center border-l border-slate-700/50" },
                                  React.createElement("div", { className: `inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-semibold ${
                                    isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                    isWrong ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                    'bg-slate-700/50 text-slate-300 border border-slate-600'
                                  }` },
                                    React.createElement("span", null, pick.pick),
                                    React.createElement("span", { className: `text-xs px-1.5 py-0.5 rounded ${
                                      isCorrect ? 'bg-green-500 text-white' :
                                      isWrong ? 'bg-red-500 text-white' :
                                      'bg-slate-600 text-slate-200'
                                    }` },
                                      pick.confidence
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
                ),
                
                React.createElement("div", { className: "px-4 py-3 bg-slate-700/30 border-t border-slate-700 flex items-center gap-6 text-xs text-slate-400" },
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 bg-green-500/20 border border-green-500/40 rounded" }),
                    React.createElement("span", null, "Correct Pick")
                  ),
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 bg-red-500/20 border border-red-500/40 rounded" }),
                    React.createElement("span", null, "Wrong Pick")
                  ),
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 bg-slate-700/50 border border-slate-600 rounded" }),
                    React.createElement("span", null, "Pending")
                  ),
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("span", { className: "text-green-400" }, "\uD83D\uDD34"),
                    React.createElement("span", null, "Live Game")
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
                          React.createElement("div", { className: "text-xs text-slate-400" }, `${data.correct} correct / ${data.possible} possible`)
                        )
                      )
                    ))
                  )
                ),

                React.createElement("div", { className: "space-y-4" },
                  Object.entries(confidenceResults).map(([player, data]) => (
                    React.createElement("div", { key: player, className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden" },
                      React.createElement("div", { className: "bg-slate-700/50 px-4 py-3 flex items-center justify-between" },
                        React.createElement("span", { className: "font-bold text-white" }, player),
                        React.createElement("span", { className: "text-sm text-slate-300" }, `${data.total} points`)
                      ),
                      React.createElement("div", { className: "p-4" },
                        React.createElement("div", { className: "grid grid-cols-1 gap-2" },
                          data.details.map((detail, idx) => (
                            React.createElement("div", { key: idx, className: `flex items-center justify-.between p-2 rounded ${
                              detail.correct === true ? 'bg-green-500/10 border border-green-500/30' :
                              detail.correct === false ? 'bg-red-500/10 border border-red-500/30' :
                              'bg-slate-700/20'
                            }` },
                              React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("span", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  detail.correct === true ? 'bg-green-500 text-white' :
                                  detail.correct === false ? 'bg-red-500 text-white' :
                                  'bg-slate-600 text-slate-300'
                                }` },
                                  detail.confidence
                                ),
                                React.createElement("span", { className: "text-white text-sm font-medium" }, `${detail.awayTeam} @ ${detail.homeTeam}`),
                                detail.isLive && includeLiveGames && (
                                  React.createElement("span", { className: "text-xs text-green-400 font-semibold" }, "LIVE")
                                )
                              ),
                              React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("span", { className: "text-slate-300 text-sm" }, detail.score),
                                React.createElement("span", { className: `text-sm font-semibold px-2 py-1 rounded ${
                                  detail.correct === true ? 'text-green-400' :
                                  detail.correct === false ? 'text-red-400' :
                                  'text-slate-400'
                                }` },
                                  `Pick: ${detail.pick}`
                                )
                              )
                            )
                          ))
                        )
                      )
                    )
                  ))
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
                    const competition = game.competitions[0];
                    const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
                    const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
                    const live = isLive(competition);
                    const status = getGameStatus(competition);

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
                              React.createElement("img", { src: awayTeam.team.logo, alt: awayTeam.team.abbreviation, className: "w-8 h-8" }),
                              React.createElement("span", { className: "text-white font-semibold" }, awayTeam.team.displayName),
                              React.createElement("span", { className: "text-slate-400 text-sm" }, `(${awayTeam.records?.[0]?.summary})`)
                            ),
                            React.createElement("span", { className: "text-2xl font-bold text-white" }, awayTeam.score)
                          ),

                          React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                              React.createElement("img", { src: homeTeam.team.logo, alt: homeTeam.team.abbreviation, className: "w-8 h-8" }),
                              React.createElement("span", { className: "text-white font-semibold" }, homeTeam.team.displayName),
                              React.createElement("span", { className: "text-slate-400 text-sm" }, `(${homeTeam.records?.[0]?.summary})`)
                            ),
                            React.createElement("span", { className: "text-2xl font-bold text-white" }, homeTeam.score)
                          ),

                          competition.broadcast?.[0] && (
                            React.createElement("div", { className: "mt-2 pt-2 border-t border-slate-700/50 text-slate-400 text-xs" },
                              `\uD83D\uDCFA ${competition.broadcast[0].names.join(', ')}`
                            )
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

ReactDOM.render(React.createElement(NFLScoresTracker), document.getElementById('root'));