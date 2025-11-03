const { useState, useEffect } = React;

const teamAbbreviations = {
  "Kansas City Chiefs": "KC",
  "Denver Broncos": "DEN",
  "Green Bay Packers": "GB",
  "Detroit Lions": "DET",
  "Philadelphia Eagles": "PHI",
  "Washington Commanders": "WAS",
  "Arizona Cardinals": "ARI",
  "Seattle Seahawks": "SEA",
  "New York Giants": "NYG",
  "Las Vegas Raiders": "LV",
  "Dallas Cowboys": "DAL",
  "Buffalo Bills": "BUF",
  "New England Patriots": "NE",
  "San Francisco 49ers": "SF",
  "Tampa Bay Buccaneers": "TB",
  "Los Angeles Rams": "LAR",
  "Baltimore Ravens": "BAL",
  "Miami Dolphins": "MIA",
  "Cincinnati Bengals": "CIN",
  "Cleveland Browns": "CLE",
  "Atlanta Falcons": "ATL",
  "Pittsburgh Steelers": "PIT",
};

function WeeklyPointsChart({ confidenceResults }) {
  const [activePoint, setActivePoint] = useState(null);
  const players = Object.keys(confidenceResults);
  const weeks = confidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];
  const maxPoints = Math.max(1, ...Object.values(confidenceResults).flatMap(p => p.pointsPerWeek.map(w => w.points)));

  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 50;

  const xScale = (week) => padding + (week - 1) * (chartWidth - 2 * padding) / (weeks.length - 1);
  const yScale = (points) => chartHeight - padding - (points / maxPoints) * (chartHeight - 2 * padding);

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7"];

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    let closestPoint = null;
    let minDistance = Infinity;

    players.forEach((player, playerIndex) => {
      confidenceResults[player].pointsPerWeek.forEach(d => {
        const pointX = xScale(d.week);
        const pointY = yScale(d.points);
        const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));

        if (distance < minDistance && distance < 20) {
          minDistance = distance;
          closestPoint = { player, week: d.week, points: d.points, x: pointX, y: pointY, color: colors[playerIndex % colors.length] };
        }
      });
    });

    setActivePoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 p-6" },
      React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "Points per Week"),
      React.createElement("svg", { width: chartWidth, height: chartHeight, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave },
        // X-axis
        React.createElement("line", { x1: padding, y1: chartHeight - padding, x2: chartWidth - padding, y2: chartHeight - padding, stroke: "#64748b" }),
        weeks.map(week => (
          React.createElement("text", { key: week, x: xScale(week), y: chartHeight - padding + 20, fill: "#94a3b8", textAnchor: "middle" }, `W${week}`)
        )),

        // Y-axis
        React.createElement("line", { x1: padding, y1: padding, x2: padding, y2: chartHeight - padding, stroke: "#64748b" }),
        Array.from({ length: 5 }).map((_, i) => {
          const points = Math.round(maxPoints / 4 * i);
          return React.createElement("text", { key: i, x: padding - 10, y: yScale(points), fill: "#94a3b8", textAnchor: "end" }, points);
        }),

        // Lines
        players.map((player, playerIndex) => (
          React.createElement("polyline", {
            key: player,
            fill: "none",
            stroke: colors[playerIndex % colors.length],
            strokeWidth: 2,
            points: confidenceResults[player].pointsPerWeek.map(d => `${xScale(d.week)},${yScale(d.points)}`).join(' ')
          })
        )),

        // Active point
        activePoint && React.createElement("g", null,
          React.createElement("circle", { cx: activePoint.x, cy: activePoint.y, r: 5, fill: activePoint.color }),
          React.createElement("rect", { x: activePoint.x + 10, y: activePoint.y - 20, width: 120, height: 40, fill: "#1e293b", stroke: activePoint.color, rx: 5 }),
          React.createElement("text", { x: activePoint.x + 20, y: activePoint.y - 5, fill: "#fff" }, `${activePoint.player}`),
          React.createElement("text", { x: activePoint.x + 20, y: activePoint.y + 10, fill: "#94a3b8" }, `W${activePoint.week}: ${activePoint.points} pts`)
        ),

        // Legend
        players.map((player, playerIndex) => (
          React.createElement("g", { key: player, transform: `translate(${chartWidth - 100}, ${padding + playerIndex * 20})` },
            React.createElement("rect", { x: 0, y: 0, width: 10, height: 10, fill: colors[playerIndex % colors.length] }),
            React.createElement("text", { x: 15, y: 10, fill: "#94a3b8" }, player)
          )
        ))
      )
    )
  );
}

function WeeklyPointsTable({ confidenceResults }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const players = Object.keys(confidenceResults);
    const weeks = confidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];

    const sortedWeeks = React.useMemo(() => {
        let sortableWeeks = [...weeks];
        if (sortConfig.key !== null) {
            sortableWeeks.sort((a, b) => {
                const aPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === a)?.points || 0;
                const bPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === b)?.points || 0;
                if (aPoints < bPoints) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aPoints > bPoints) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableWeeks;
    }, [weeks, sortConfig, confidenceResults]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mt-6" },
            React.createElement("table", { className: "w-full" },
                React.createElement("thead", null,
                    React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Week"),
                        players.map(player => 
                            React.createElement("th", { key: player, className: "px-4 py-3 text-center text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort(player) }, 
                                player,
                                sortConfig.key === player && (sortConfig.direction === 'ascending' ? ' \u25B2' : ' \u25BC')
                            )
                        )
                    )
                ),
                React.createElement("tbody", null,
                    sortedWeeks.map(week => (
                        React.createElement("tr", { key: week, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                            React.createElement("td", { className: "px-4 py-3 text-white font-semibold" }, `Week ${week}`),
                            players.map(player => (
                                React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-300" }, 
                                    confidenceResults[player].pointsPerWeek.find(d => d.week === week)?.points || 0
                                )
                            ))
                        )
                    ))
                )
            )
        )
    );
}

function CumulativePointsChart({ confidenceResults }) {
  const [activePoint, setActivePoint] = useState(null);
  const players = Object.keys(confidenceResults);
  const weeks = confidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];
  const maxPoints = Math.max(1, ...Object.values(confidenceResults).flatMap(p => p.pointsPerWeek.map(w => Math.abs(w.relativePoints))));

  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 50;

  const xScale = (week) => padding + (week - 1) * (chartWidth - 2 * padding) / (weeks.length - 1);
  const yScale = (points) => chartHeight - padding - ((points + maxPoints) / (maxPoints * 2)) * (chartHeight - 2 * padding);

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7"];

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    let closestPoint = null;
    let minDistance = Infinity;

    players.forEach((player, playerIndex) => {
      confidenceResults[player].pointsPerWeek.forEach(d => {
        const pointX = xScale(d.week);
        const pointY = yScale(d.relativePoints);
        const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));

        if (distance < minDistance && distance < 20) {
          minDistance = distance;
          closestPoint = { player, week: d.week, relativePoints: d.relativePoints, x: pointX, y: pointY, color: colors[playerIndex % colors.length] };
        }
      });
    });

    setActivePoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 p-6 mt-6" },
      React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "Cumulative Points vs. Leader"),
      React.createElement("svg", { width: chartWidth, height: chartHeight, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave },
        // X-axis
        React.createElement("line", { x1: padding, y1: chartHeight - padding, x2: chartWidth - padding, y2: chartHeight - padding, stroke: "#64748b" }),
        weeks.map(week => (
          React.createElement("text", { key: week, x: xScale(week), y: chartHeight - padding + 20, fill: "#94a3b8", textAnchor: "middle" }, `W${week}`)
        )),

        // Y-axis
        React.createElement("line", { x1: padding, y1: padding, x2: padding, y2: chartHeight - padding, stroke: "#64748b" }),
        Array.from({ length: 5 }).map((_, i) => {
          const points = Math.round(-maxPoints + (i * maxPoints / 2));
          return React.createElement("text", { key: i, x: padding - 10, y: yScale(points), fill: "#94a3b8", textAnchor: "end" }, points);
        }),

        // Lines
        players.map((player, playerIndex) => (
          React.createElement("polyline", {
            key: player,
            fill: "none",
            stroke: colors[playerIndex % colors.length],
            strokeWidth: 2,
            points: confidenceResults[player].pointsPerWeek.map(d => `${xScale(d.week)},${yScale(d.relativePoints)}`).join(' ')
          })
        )),

        // Active point
        activePoint && React.createElement("g", null,
          React.createElement("circle", { cx: activePoint.x, cy: activePoint.y, r: 5, fill: activePoint.color }),
          React.createElement("rect", { x: activePoint.x + 10, y: activePoint.y - 20, width: 120, height: 40, fill: "#1e293b", stroke: activePoint.color, rx: 5 }),
          React.createElement("text", { x: activePoint.x + 20, y: activePoint.y - 5, fill: "#fff" }, `${activePoint.player}`),
          React.createElement("text", { x: activePoint.x + 20, y: activePoint.y + 10, fill: "#94a3b8" }, `W${activePoint.week}: ${activePoint.relativePoints} pts`)
        ),

        // Legend
        players.map((player, playerIndex) => (
          React.createElement("g", { key: player, transform: `translate(${chartWidth - 100}, ${padding + playerIndex * 20})` },
            React.createElement("rect", { x: 0, y: 0, width: 10, height: 10, fill: colors[playerIndex % colors.length] }),
            React.createElement("text", { x: 15, y: 10, fill: "#94a3b8" }, player)
          )
        ))
      )
    )
  );
}

function CumulativePointsTable({ confidenceResults }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const players = Object.keys(confidenceResults);
    const weeks = confidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];

    const sortedWeeks = React.useMemo(() => {
        let sortableWeeks = [...weeks];
        if (sortConfig.key !== null) {
            sortableWeeks.sort((a, b) => {
                const aPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === a)?.cumulativePoints || 0;
                const bPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === b)?.cumulativePoints || 0;
                if (aPoints < bPoints) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aPoints > bPoints) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableWeeks;
    }, [weeks, sortConfig, confidenceResults]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mt-6" },
            React.createElement("h2", { className: "text-xl font-bold text-white mb-4 p-6" }, "Cumulative Points Table"),
            React.createElement("table", { className: "w-full" },
                React.createElement("thead", null,
                    React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Week"),
                        players.map(player => 
                            React.createElement("th", { key: player, className: "px-4 py-3 text-center text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort(player) }, 
                                player,
                                sortConfig.key === player && (sortConfig.direction === 'ascending' ? ' \u25B2' : ' \u25BC')
                            )
                        )
                    )
                ),
                React.createElement("tbody", null,
                    sortedWeeks.map(week => (
                        React.createElement("tr", { key: week, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                            React.createElement("td", { className: "px-4 py-3 text-white font-semibold" }, `Week ${week}`),
                            players.map(player => (
                                React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-300" }, 
                                    confidenceResults[player].pointsPerWeek.find(d => d.week === week)?.relativePoints || 0
                                )
                            ))
                        )
                    ))
                )
            )
        )
    );
}

function NFLScoresTracker() {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('confidence');
  const [confidenceView, setConfidenceView] = useState('overview');
  const [includeLiveGames, setIncludeLiveGames] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [mockPicks, setMockPicks] = useState({});
  const [gamesOfTheWeek, setGamesOfTheWeek] = useState([]);

  const transformEspnData = (data) => {
    return data.events.map(event => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
      const awayTeam = competition.competitors.find(t => t.homeAway === 'away');

      return {
        id: parseInt(event.id),
        date: event.date,
        home: homeTeam.team.abbreviation,
        away: awayTeam.team.abbreviation,
        status: event.status.type.state,
        winner: event.status.type.state === 'post' ? (parseInt(homeTeam.score) > parseInt(awayTeam.score) ? homeTeam.team.abbreviation : awayTeam.team.abbreviation) : null,
        homeScore: parseInt(homeTeam.score),
        awayScore: parseInt(awayTeam.score),
        displayClock: event.status.type.detail, // Assuming this path for clock
        period: event.status.period, // Assuming this path for period
      };
    });
  };

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const gamesOfTheWeekResponse = await fetch('data/games_of_the_week.txt').then(res => res.text());
      const gamesOfTheWeekIds = gamesOfTheWeekResponse.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      setGamesOfTheWeek(gamesOfTheWeekIds);

      if (useMockData) {
        const [weeksResponse, picksResponse] = await Promise.all([
          fetch('data/weeks.json').then(res => res.json()),
          fetch('picks.json').then(res => res.json())
        ]);

        setWeeks(weeksResponse);
        if (weeksResponse.length > 0 && !selectedWeek) {
          setSelectedWeek(weeksResponse[weeksResponse.length - 1].week);
        }

        const transformedPicks = {};
        picksResponse.forEach(pick => {
          if (!transformedPicks[pick.name]) {
            transformedPicks[pick.name] = [];
          }
          transformedPicks[pick.name].push({
            gameId: pick.game_id,
            pick: pick.picked,
            confidence: parseInt(pick.confidence) || 0
          });
        });
        setMockPicks(transformedPicks);

      } else {
        const weekPromises = Array.from({ length: 9 }, (_, i) => i + 1).map(weekNum =>
          fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${weekNum}`)
            .then(res => res.json())
            .then(data => ({ week: weekNum, games: transformEspnData(data) }))
        );
        const allWeeks = await Promise.all(weekPromises);
        setWeeks(allWeeks);
        if (allWeeks.length > 0 && !selectedWeek) {
          setSelectedWeek(allWeeks[allWeeks.length - 1].week);
        }

        // Fetch win probabilities for all games across all weeks
        const allGamesWithSummaryPromises = allWeeks.flatMap(weekData =>
          weekData.games.map(async (game) => {
            try {
              console.log(`Fetching summary for game ID: ${game.id}`);
              const summaryResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`);
              const summaryData = await summaryResponse.json();
              console.log(`Summary data for game ${game.id}:`, summaryData);
              console.log(`Game ${game.id} status: ${game.status}`);

              let homeWinProbability = null;
              let awayWinProbability = null;

              if (summaryData.winprobability && summaryData.winprobability.length > 0) {
                const winProbabilities = summaryData.winprobability;

                if (game.status === 'post') {
                  homeWinProbability = winProbabilities[0].homeWinPercentage * 100;
                  awayWinProbability = (1 - winProbabilities[0].homeWinPercentage) * 100;
                } else if (game.status === 'in' || game.status === 'live') {
                  const latestWinProbability = winProbabilities[winProbabilities.length - 1];
                  homeWinProbability = latestWinProbability.homeWinPercentage * 100;
                  awayWinProbability = (1 - latestWinProbability.homeWinPercentage) * 100;
                }
              } else if (summaryData.gameInfo && summaryData.gameInfo.predictor && summaryData.gameInfo.predictor.homeTeam && summaryData.gameInfo.predictor.awayTeam) {
                homeWinProbability = summaryData.gameInfo.predictor.homeTeam.gameProjection * 100;
                awayWinProbability = summaryData.gameInfo.predictor.awayTeam.gameProjection * 100;
              }
              console.log(`Assigned Win Probabilities for game ${game.id}: Home - ${homeWinProbability}, Away - ${awayWinProbability}`);

              return { ...game, homeWinProbability, awayWinProbability };
            } catch (summaryError) {
              console.error(`Error fetching summary for game ${game.id}:`, summaryError);
              return game; // Return original game if summary fetch fails
            }
          })
        );
        const allGamesWithSummaries = await Promise.all(allGamesWithSummaryPromises);

        const updatedWeeks = allWeeks.map(weekData => ({
          ...weekData,
          games: weekData.games.map(game => {
            const summaryGame = allGamesWithSummaries.find(sg => sg.id === game.id);
            return summaryGame || game;
          })
        }));
        setWeeks(updatedWeeks);

        // When using live data, we still need mock picks
        const picksResponse = await fetch('picks.json').then(res => res.json());
        const transformedPicks = {};
        picksResponse.forEach(pick => {
          if (!transformedPicks[pick.name]) {
            transformedPicks[pick.name] = [];
          }
          transformedPicks[pick.name].push({
            gameId: pick.game_id,
            pick: pick.picked,
            confidence: pick.confidence
          });
        });
        setMockPicks(transformedPicks);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch data. Please try again or use mock data.");
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchScores(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchScores(); // Fetch every minute
    }, 60 * 1000); // 1 minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [useMockData]); // Re-run if useMockData changes

  const calculateConfidencePoints = () => {
    const results = {};

    Object.keys(mockPicks).forEach(player => {
      results[player] = { total: 0, weekly: 0, correct: 0, possible: 0, details: [], pointsPerWeek: [], remainingPossible: 0, totalConfidenceFromPlayedGames: 0 };
    });

    weeks.forEach(weekData => {
      let weeklyPoints = {};
      Object.keys(mockPicks).forEach(player => {
        weeklyPoints[player] = 0;
      });

      weekData.games.forEach(game => {
        Object.keys(mockPicks).forEach(player => {
          const playerPicks = mockPicks[player];
          const pick = playerPicks.find(p => p.gameId === game.id);
          if (!pick) return;

          const isComplete = game.status === 'final' || game.status === 'post';
          const isLiveGame = game.status === 'in' || game.status === 'live';
          const isScheduled = game.status === 'scheduled';

          let confidence = pick.confidence;
          if (gamesOfTheWeek.includes(game.id) && (isComplete || isLiveGame)) {
            confidence += 5;
          }

          if(weekData.week === 1) results[player].possible += confidence;

          if (isComplete || isLiveGame) {
            results[player].totalConfidenceFromPlayedGames += confidence;
          }

          let winner = null;
          if (isComplete) {
            winner = game.winner;
          } else if (includeLiveGames && isLiveGame) {
            if (game.homeScore > game.awayScore) {
              winner = game.home;
            } else if (game.awayScore > game.homeScore) {
              winner = game.away;
            } else if (game.homeWinProbability !== null && game.awayWinProbability !== null) {
              if (game.homeWinProbability > game.awayWinProbability) {
                winner = game.home;
              } else if (game.awayWinProbability > game.homeWinProbability) {
                winner = game.away;
              }
            }
          }

          const pickAbbreviation = teamAbbreviations[pick.pick] || pick.pick;
          const isCorrect = winner === pickAbbreviation;

          if ((isComplete || (includeLiveGames && isLiveGame)) && isCorrect) {
            results[player].total += confidence;
            if (weekData.week === selectedWeek) {
              results[player].weekly += confidence;
            }
            weeklyPoints[player] += confidence;
            results[player].correct++;
          }
          
          if (weekData.week === selectedWeek) {
              results[player].details.push({
                gameId: game.id,
                pick: pick.pick,
                confidence: confidence,
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

      Object.keys(mockPicks).forEach(player => {
        const previousCumulativePoints = results[player].pointsPerWeek.length > 0
          ? results[player].pointsPerWeek[results[player].pointsPerWeek.length - 1].cumulativePoints
          : 0;
        const currentCumulativePoints = previousCumulativePoints + weeklyPoints[player];
        results[player].pointsPerWeek.push({ week: weekData.week, points: weeklyPoints[player], cumulativePoints: currentCumulativePoints });
      });

      // Calculate points relative to leader for the current week
      let leaderPoints = 0;
      Object.keys(mockPicks).forEach(player => {
        const weekInfo = results[player].pointsPerWeek.find(p => p.week === weekData.week);
        if (weekInfo && weekInfo.cumulativePoints > leaderPoints) {
          leaderPoints = weekInfo.cumulativePoints;
        }
      });

      Object.keys(mockPicks).forEach(player => {
        const weekInfo = results[player].pointsPerWeek.find(p => p.week === weekData.week);
        if (weekInfo) {
          weekInfo.relativePoints = weekInfo.cumulativePoints - leaderPoints;
        }
      });
    });

    // Calculate remainingPossible based on the new logic
    if (selectedWeek) {
      const selectedWeekData = weeks.find(w => w.week === selectedWeek);
      console.log('Debug: selectedWeek', selectedWeek);
      console.log('Debug: selectedWeekData', selectedWeekData);
      if (selectedWeekData) {
        const numberOfGamesInWeek = selectedWeekData.games.length;
        const maxPossiblePointsForWeek = (numberOfGamesInWeek / 2) * (1 + numberOfGamesInWeek) + 5; // Global for the week

        Object.keys(mockPicks).forEach(player => {
          let totalConfidenceFromPlayedGamesForSelectedWeek = 0;
          selectedWeekData.games.forEach(game => {
            const playerPicks = mockPicks[player];
            const pick = playerPicks.find(p => p.gameId === game.id);
            if (pick) {
              const isComplete = game.status === 'final' || game.status === 'post';
              const isLiveGame = game.status === 'in' || game.status === 'live';
              if (isComplete || (includeLiveGames && isLiveGame)) {
                let confidence = Number(pick.confidence) || 0;
                if (gamesOfTheWeek.includes(game.id)) {
                  confidence += 5;
                }
                totalConfidenceFromPlayedGamesForSelectedWeek += confidence;
              }
            }
          });
          results[player].remainingPossible = maxPossiblePointsForWeek - totalConfidenceFromPlayedGamesForSelectedWeek;
        });
      }
    }

    return results;
  };

  const getGameStatus = (game) => {
    if (game.status === 'final' || game.status === 'post') return 'FINAL';
    if (game.status === 'in' || game.status === 'live') return 'LIVE';
    return 'Scheduled';
  };

  const isLive = (game) => {
    return game.status === 'in' || game.status === 'live';
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
              React.createElement("button", { onClick: () => setUseMockData(!useMockData), className: `px-3 py-2 text-sm rounded-lg transition-colors ${
                  useMockData 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }` },
                useMockData ? "Using Mock Data" : "Using Live Data"
              ),
              React.createElement("button", { onClick: fetchScores, className: "px-3 py-2 text-sm rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white" },
                "Refresh Scores"
              ),
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
            ),
            React.createElement("button", {
              onClick: () => setActiveTab('chart'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Chart"
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
        ) : activeTab === 'chart' ? (
          React.createElement("div", null, 
            React.createElement(WeeklyPointsChart, { confidenceResults: confidenceResults }),
            React.createElement(WeeklyPointsTable, { confidenceResults: confidenceResults }),
            React.createElement(CumulativePointsChart, { confidenceResults: confidenceResults }),
            React.createElement(CumulativePointsTable, { confidenceResults: confidenceResults })
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
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
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
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Win Prob."),
                        leaderboard.map(([player, data], idx) => {
                          const firstPlacePoints = leaderboard.length > 0 ? leaderboard[0][1].total : 0;
                          const pointsBehind = firstPlacePoints - data.total;
                          return (
                            React.createElement("th", { key: player, className: "px-4 py-3 text-center border-l border-slate-700" },
                              React.createElement("div", { className: "text-white font-semibold text-sm" }, player),
                              React.createElement("div", { className: "text-yellow-400 text-lg font-bold mt-1" }, data.total),
                              idx === 0 ? React.createElement("div", { className: "text-xs text-green-400" }, "Leader") : pointsBehind > 0 && React.createElement("div", { className: "text-xs text-red-400" }, `-${pointsBehind} behind`),
                              React.createElement("div", { className: "text-slate-400 text-xs" }, `This Week: ${data.weekly}`),
                              React.createElement("div", { className: "text-xs text-blue-400" }, `Remaining: ${data.remainingPossible}`)
                            )
                          );
                        })
                      )
                    ),
                                      React.createElement("tbody", null,
                                        (displayedWeek ? [...displayedWeek.games].sort((a, b) => {
                                          const aIsLive = isLive(a);
                                          const bIsLive = isLive(b);

                                          if (aIsLive && !bIsLive) return -1; // a (live) comes before b (not live)
                                          if (!aIsLive && bIsLive) return 1;  // b (live) comes before a (not live)

                                          return new Date(a.date) - new Date(b.date); // Sort by date if both are live or both are not live
                                        }) : []).map((game) => {
                                          const isGameOfTheWeek = gamesOfTheWeek.includes(game.id);
                                          const live = isLive(game);
                                          console.log('Game object in overview table:', game);
                                          return (
                                            React.createElement("tr", { key: game.id, className: `border-b border-slate-700/50 hover:bg-slate-700/20 ${live ? 'bg-green-500/10' : ''}` },                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-white text-sm font-medium flex items-center gap-2" },
                                `${game.away} @ ${game.home}`,
                                isGameOfTheWeek && (
                                  React.createElement("span", { className: "bg-yellow-500 text-slate-900 text-xs font-semibold px-2 py-0.5 rounded-full" }, "GotW")
                                )
                              )
                            ),
                            React.createElement("td", { className: "px-4 py-3" },
                              React.createElement("div", { className: "text-sm" },
                                game.status === 'final' || game.status === 'post' || (includeLiveGames && (game.status === 'in' || game.status === 'live')) ? (
                                  React.createElement("span", { className: "text-white font-semibold" }, 
                                    `${game.awayScore}-${game.homeScore}`,
                                    (game.status === 'in' || game.status === 'live') && game.displayClock && game.period && 
                                      React.createElement("span", { className: "text-xs text-slate-400" }, ` (Q${game.period} - ${game.displayClock.split(' - ')[0]})`)
                                  )
                                ) : (
                                  getGameStatus(game) === 'Scheduled' && game.date ? (
                                    React.createElement("span", { className: "text-slate-400 text-xs" }, new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(game.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
                                  ) : (
                                    React.createElement("span", { className: "text-slate-400 text-xs" }, "-")
                                  )
                                )
                              )
                            ),
                            React.createElement("td", { className: "px-4 py-3" },
                              game.homeWinProbability !== null && game.awayWinProbability !== null && (isLive(game) || (game.status === 'final' || game.status === 'post')) ? (
                                React.createElement("div", { className: "text-sm" },
                                  React.createElement("div", { className: "text-white" }, `${game.home}: ${game.homeWinProbability.toFixed(1)}%`),
                                  React.createElement("div", { className: "text-white" }, `${game.away}: ${game.awayWinProbability.toFixed(1)}%`)
                                )
                              ) : (
                                React.createElement("span", { className: "text-slate-400" }, "N/A")
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
                                            React.createElement("span", null, teamAbbreviations[detail.pick] || detail.pick),
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
                    leaderboard.map(([player, data], idx) => {
                      const firstPlacePoints = leaderboard.length > 0 ? leaderboard[0][1].total : 0;
                      const pointsBehind = firstPlacePoints - data.total;
                      return (
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
                            pointsBehind > 0 && React.createElement("div", { className: "text-xs text-red-400" }, `-${pointsBehind} behind`),
                            React.createElement("div", { className: "text-xs text-slate-400" }, `This Week: ${data.weekly}`),
                            React.createElement("div", { className: "text-xs text-blue-400" }, `Remaining: ${data.remainingPossible}`)
                          )
                        )
                      );
                    })
                  )
                )
              )
            )
          )
        ) : (
          React.createElement("div", { className: "space-y-6" },
            (displayedWeek ? [...displayedWeek.games].sort((a, b) => new Date(a.date) - new Date(b.date)) : []).map((game) => {
              const live = isLive(game);
              const status = getGameStatus(game);
              const isGameOfTheWeek = gamesOfTheWeek.includes(game.id);

              return (
                React.createElement("div",
                  { key: game.id,
                  className: `bg-slate-800/50 rounded-lg border ${
                    live ? 'border-green-500' : 'border-slate-700'
                  } overflow-hidden`
                },
                  React.createElement("div", { className: `px-2 py-1 text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                    live ? 'bg-green-500 text-white' : 'bg-slate-700/50 text-slate-300'
                  }` },
                    live && React.createElement("span", { className: "inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" }),
                    status,
                    (status === 'FINAL' || status === 'LIVE') && game.date && React.createElement("span", null, new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(game.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })),
                    live && game.displayClock && game.period && React.createElement("span", null, `Q${game.period} - ${game.displayClock.split(' - ')[0]}`),
                    !live && status === 'Scheduled' && game.date && React.createElement("span", null, new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(game.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })),
                    isGameOfTheWeek && (
                      React.createElement("span", { className: "bg-yellow-500 text-slate-900 text-xs font-semibold px-2 py-0.5 rounded-full" }, "GOTW")
                    )
                  ),
                  React.createElement("div", { className: "p-3" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                      React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                        React.createElement("img", { src: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.away.toLowerCase()}.png`, alt: game.away, className: "w-8 h-8" }),
                        React.createElement("span", { className: "text-white font-semibold" }, game.away),
                        game.awayWinProbability && (isLive(game) || (game.status === 'final' || game.status === 'post')) && React.createElement("span", { className: "text-slate-400 text-xs" }, `(${game.awayWinProbability.toFixed(1)}%)`)
                      ),
                      React.createElement("span", { className: "text-2xl font-bold text-white" }, game.awayScore)
                    ),
                    React.createElement("div", { className: "flex items-center justify-between" },
                      React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                        React.createElement("img", { src: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.home.toLowerCase()}.png`, alt: game.home, className: "w-8 h-8" }),
                        React.createElement("span", { className: "text-white font-semibold" }, game.home),
                        game.homeWinProbability && (isLive(game) || (game.status === 'final' || game.status === 'post')) && React.createElement("span", { className: "text-slate-400 text-xs" }, `(${game.homeWinProbability.toFixed(1)}%)`)
                      ),
                      React.createElement("span", { className: "text-2xl font-bold text-white" }, game.homeScore)
                    )
                  )
                )
              );
            })
          )
        )
      )
    )
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(NFLScoresTracker));