const { useState, useEffect, useCallback } = React;

const convertOddsToProbability = (odds) => {
  if (typeof odds === 'string') {
    if (odds.toUpperCase() === 'EVEN') {
      odds = 100;
    } else {
      odds = parseFloat(odds);
    }
  }

  if (isNaN(odds)) {
    return null;
  }

  if (odds > 0) {
    return 100 / (odds + 100);
  } else if (odds < 0) {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  } else { // odds === 0 or was 'EVEN' which becomes 100
    return 0.5;
  }
};

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

function WeeklyPointsChart({ confidenceResults, selectedWeek, weeks: allWeeks, gamesOfTheWeek, pointsPerWeekDisplayMode, setPointsPerWeekDisplayMode }) {
  const [activePoint, setActivePoint] = useState(null);
  const players = Object.keys(confidenceResults);

  const maxPointsPerWeek = React.useMemo(() => {
    const result = {};
    if (!allWeeks) return result;
    allWeeks.forEach(weekData => {
        const numGames = weekData.games.length;
        const gotwBonus = weekData.games.some(g => gamesOfTheWeek.includes(g.id)) ? 5 : 0;
        result[weekData.week] = (numGames * (numGames + 1) / 2) + gotwBonus;
    });
    return result;
  }, [allWeeks, gamesOfTheWeek]);

  const processedConfidenceResults = React.useMemo(() => {
    const processed = {};
    players.forEach(player => {
      if (confidenceResults[player]) {
        let processedPoints;
        const filteredPoints = confidenceResults[player].pointsPerWeek.filter(p => p.week <= selectedWeek);

        switch (pointsPerWeekDisplayMode) {
          case 'points_percentage':
            processedPoints = filteredPoints.map(p => ({
              ...p,
              points: maxPointsPerWeek[p.week] ? (p.points / maxPointsPerWeek[p.week]) * 100 : 0
            }));
            break;
          case 'correct_percentage':
            const correctPicksData = confidenceResults[player].correctPicksPerWeek.filter(p => p.week <= selectedWeek);
            processedPoints = correctPicksData.map(p => {
                const weekInfo = allWeeks.find(w => w.week === p.week);
                const numGames = weekInfo ? weekInfo.games.length : 0;
                return {
                    ...p,
                    points: numGames > 0 ? (p.correctPicks / numGames) * 100 : 0
                }
            });
            break;
          case 'absolute':
          default:
            processedPoints = filteredPoints;
            break;
        }
        processed[player] = { ...confidenceResults[player], pointsPerWeek: processedPoints };
      }
    });
    return processed;
  }, [confidenceResults, selectedWeek, pointsPerWeekDisplayMode, maxPointsPerWeek, players, allWeeks]);

  const weeks = processedConfidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];
  const maxPoints = pointsPerWeekDisplayMode === 'absolute' ? Math.max(1, ...Object.values(processedConfidenceResults).flatMap(p => p.pointsPerWeek.map(w => w.points))) : 100;

  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 50;

  const xScale = (week) => padding + (week - 1) * (chartWidth - 2 * padding) / (weeks.length > 1 ? weeks.length - 1 : 1);
  const yScale = (points) => chartHeight - padding - (points / maxPoints) * (chartHeight - 2 * padding);

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7"];

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    const scaleX = chartWidth / svgRect.width;
    const scaleY = chartHeight / svgRect.height;
    const transformedX = x * scaleX;
    const transformedY = y * scaleY;

    let closestPoint = null;
    let minDistance = Infinity;

    players.forEach((player, playerIndex) => {
      if (processedConfidenceResults[player]) {
        processedConfidenceResults[player].pointsPerWeek.forEach(d => {
          const pointX = xScale(d.week);
          const pointY = yScale(d.points);
          const distance = Math.sqrt(Math.pow(transformedX - pointX, 2) + Math.pow(transformedY - pointY, 2));

          if (distance < minDistance && distance < 20) {
            minDistance = distance;
            closestPoint = { player, week: d.week, points: d.points, x: pointX, y: pointY, color: colors[playerIndex % colors.length] };
          }
        });
      }
    });

    setActivePoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    React.createElement("div", { className: "relative bg-slate-800/50 rounded-lg border border-slate-700 p-6" },
      React.createElement("button", {
        onClick: () => {
          const modes = ['absolute', 'points_percentage', 'correct_percentage'];
          const nextIndex = (modes.indexOf(pointsPerWeekDisplayMode) + 1) % modes.length;
          setPointsPerWeekDisplayMode(modes[nextIndex]);
        },
        className: "absolute top-4 right-4 px-3 py-1 text-xs rounded-md font-medium transition-colors bg-slate-700/50 text-slate-300 hover:bg-slate-700"
      }, `View: ${pointsPerWeekDisplayMode.replace('_', ' ')}`),
      React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "Points per Week"),
      React.createElement("svg", {
        viewBox: `0 0 ${chartWidth} ${chartHeight}`,
        className: "w-full h-auto",
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave
      },
        // X-axis
        React.createElement("line", { x1: padding, y1: chartHeight - padding, x2: chartWidth - padding, y2: chartHeight - padding, stroke: "#64748b" }),
        weeks.map(week => (
          React.createElement("text", { key: week, x: xScale(week), y: chartHeight - padding + 20, fill: "#94a3b8", textAnchor: "middle" }, `W${week}`)
        )),

        // Y-axis
        React.createElement("line", { x1: padding, y1: padding, x2: padding, y2: chartHeight - padding, stroke: "#64748b" }),
        Array.from({ length: 5 }).map((_, i) => {
          const points = Math.round(maxPoints / 4 * i);
          return React.createElement("text", { key: i, x: padding - 10, y: yScale(points), fill: "#94a3b8", textAnchor: "end" }, `${points}${pointsPerWeekDisplayMode !== 'absolute' ? '%' : ''}`);
        }),

        // Lines
        players.map((player, playerIndex) => (
          processedConfidenceResults[player] && React.createElement("polyline", {
            key: player,
            fill: "none",
            stroke: colors[playerIndex % colors.length],
            strokeWidth: 2,
            points: processedConfidenceResults[player].pointsPerWeek.map(d => `${xScale(d.week)},${yScale(d.points)}`).join(' ')
          })
        )),

        // Active point
        activePoint && React.createElement("g", null,
          React.createElement("circle", { cx: activePoint.x, cy: activePoint.y, r: 5, fill: activePoint.color }),
          React.createElement("rect", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 130 : activePoint.x + 10, y: activePoint.y - 20, width: 120, height: 40, fill: "#1e293b", stroke: activePoint.color, rx: 5 }),
          React.createElement("text", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 120 : activePoint.x + 20, y: activePoint.y - 5, fill: "#fff" }, `${activePoint.player}`),
          React.createElement("text", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 120 : activePoint.x + 20, y: activePoint.y + 10, fill: "#94a3b8" }, `W${activePoint.week}: ${activePoint.points.toFixed(pointsPerWeekDisplayMode !== 'absolute' ? 1 : 0)}${pointsPerWeekDisplayMode !== 'absolute' ? '%' : ' pts'}`)
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

function WeeklyPointsTable({ confidenceResults, weeks: allWeeks, gamesOfTheWeek, pointsPerWeekDisplayMode }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const players = Object.keys(confidenceResults);
    const weeks = confidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];

    const maxPointsPerWeek = React.useMemo(() => {
        const result = {};
        if (!allWeeks) return result;
        allWeeks.forEach(weekData => {
            const numGames = weekData.games.length;
            const gotwBonus = weekData.games.some(g => gamesOfTheWeek.includes(g.id)) ? 5 : 0;
            result[weekData.week] = (numGames * (numGames + 1) / 2) + gotwBonus;
        });
        return result;
    }, [allWeeks, gamesOfTheWeek]);

    const sortedWeeks = React.useMemo(() => {
        let sortableWeeks = [...weeks];
        if (sortConfig.key !== null) {
            sortableWeeks.sort((a, b) => {
                let aValue, bValue;
                
                switch (pointsPerWeekDisplayMode) {
                    case 'points_percentage':
                        const aPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === a)?.points || 0;
                        const bPoints = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === b)?.points || 0;
                        aValue = maxPointsPerWeek[a] ? (aPoints / maxPointsPerWeek[a]) * 100 : 0;
                        bValue = maxPointsPerWeek[b] ? (bPoints / maxPointsPerWeek[b]) * 100 : 0;
                        break;
                    case 'correct_percentage':
                        const aCorrect = confidenceResults[sortConfig.key].correctPicksPerWeek.find(d => d.week === a)?.correctPicks || 0;
                        const bCorrect = confidenceResults[sortConfig.key].correctPicksPerWeek.find(d => d.week === b)?.correctPicks || 0;
                        const aNumGames = allWeeks.find(w => w.week === a)?.games.length || 0;
                        const bNumGames = allWeeks.find(w => w.week === b)?.games.length || 0;
                        aValue = aNumGames > 0 ? (aCorrect / aNumGames) * 100 : 0;
                        bValue = bNumGames > 0 ? (bCorrect / bNumGames) * 100 : 0;
                        break;
                    case 'absolute':
                    default:
                        aValue = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === a)?.points || 0;
                        bValue = confidenceResults[sortConfig.key].pointsPerWeek.find(d => d.week === b)?.points || 0;
                        break;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableWeeks;
    }, [weeks, sortConfig, confidenceResults, pointsPerWeekDisplayMode, maxPointsPerWeek, allWeeks]);

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
                            players.map(player => {
                                let displayValue;
                                switch (pointsPerWeekDisplayMode) {
                                    case 'points_percentage':
                                        const points = confidenceResults[player].pointsPerWeek.find(d => d.week === week)?.points || 0;
                                        const percentage = maxPointsPerWeek[week] ? (points / maxPointsPerWeek[week]) * 100 : 0;
                                        displayValue = `${percentage.toFixed(1)}%`;
                                        break;
                                    case 'correct_percentage':
                                        const correctPicks = confidenceResults[player].correctPicksPerWeek.find(d => d.week === week)?.correctPicks || 0;
                                        const numGames = allWeeks.find(w => w.week === week)?.games.length || 0;
                                        const correctPercentage = numGames > 0 ? (correctPicks / numGames) * 100 : 0;
                                        displayValue = `${correctPercentage.toFixed(1)}%`;
                                        break;
                                    case 'absolute':
                                    default:
                                        displayValue = confidenceResults[player].pointsPerWeek.find(d => d.week === week)?.points || 0;
                                        break;
                                }
                                return React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-300" }, displayValue)
                            })
                        )
                    ))
                )
            )
        )
    );
}

function CumulativePointsChart({ confidenceResults, selectedWeek }) {
  const [activePoint, setActivePoint] = useState(null);
  const players = Object.keys(confidenceResults);

  const filteredConfidenceResults = {};
  players.forEach(player => {
    if (confidenceResults[player]) {
      filteredConfidenceResults[player] = {
        ...confidenceResults[player],
        pointsPerWeek: confidenceResults[player].pointsPerWeek.filter(p => p.week <= selectedWeek)
      };
    }
  });

  const weeks = filteredConfidenceResults[players[0]]?.pointsPerWeek.map(p => p.week) || [];
  const maxPoints = Math.max(1, ...Object.values(filteredConfidenceResults).flatMap(p => p.pointsPerWeek.map(w => Math.abs(w.relativePoints))));

  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 50;

  const xScale = (week) => padding + (week - 1) * (chartWidth - 2 * padding) / (weeks.length > 1 ? weeks.length - 1 : 1);
  const yScale = (points) => chartHeight - padding - ((points + maxPoints) / (maxPoints * 2)) * (chartHeight - 2 * padding);

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7"];

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    const scaleX = chartWidth / svgRect.width;
    const scaleY = chartHeight / svgRect.height;
    const transformedX = x * scaleX;
    const transformedY = y * scaleY;

    let closestPoint = null;
    let minDistance = Infinity;

    players.forEach((player, playerIndex) => {
      if (filteredConfidenceResults[player]) {
        filteredConfidenceResults[player].pointsPerWeek.forEach(d => {
          const pointX = xScale(d.week);
          const pointY = yScale(d.relativePoints);
          const distance = Math.sqrt(Math.pow(transformedX - pointX, 2) + Math.pow(transformedY - pointY, 2));

          if (distance < minDistance && distance < 20) {
            minDistance = distance;
            closestPoint = { player, week: d.week, relativePoints: d.relativePoints, x: pointX, y: pointY, color: colors[playerIndex % colors.length] };
          }
        });
      }
    });

    setActivePoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 p-6 mt-6" },
      React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "Cumulative Points vs. Leader"),
      React.createElement("svg", {
        viewBox: `0 0 ${chartWidth} ${chartHeight}`,
        className: "w-full h-auto",
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave
      },
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
          filteredConfidenceResults[player] && React.createElement("polyline", {
            key: player,
            fill: "none",
            stroke: colors[playerIndex % colors.length],
            strokeWidth: 2,
            points: filteredConfidenceResults[player].pointsPerWeek.map(d => `${xScale(d.week)},${yScale(d.relativePoints)}`).join(' ')
          })
        )),

        // Active point
        activePoint && React.createElement("g", null,
          React.createElement("circle", { cx: activePoint.x, cy: activePoint.y, r: 5, fill: activePoint.color }),
          React.createElement("rect", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 130 : activePoint.x + 10, y: activePoint.y - 20, width: 120, height: 40, fill: "#1e293b", stroke: activePoint.color, rx: 5 }),
          React.createElement("text", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 120 : activePoint.x + 20, y: activePoint.y - 5, fill: "#fff" }, `${activePoint.player}`),
          React.createElement("text", { x: activePoint.x > chartWidth - 150 ? activePoint.x - 120 : activePoint.x + 20, y: activePoint.y + 10, fill: "#94a3b8" }, `W${activePoint.week}: ${activePoint.relativePoints} pts`)
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

function GamesOfTheWeekPointsChart({ confidenceResults, mockPicks, weeks, gamesOfTheWeek, includeLiveGames, gotwDisplayMode, setGotwDisplayMode }) {
    const players = Object.keys(confidenceResults);

    const chartData = React.useMemo(() => {
        let data = players.map(player => {
            let value;
            switch (gotwDisplayMode) {
                case 'points_percentage':
                    const possiblePoints = gamesOfTheWeek.reduce((acc, gameId) => {
                        const pick = mockPicks[player]?.find(p => p.gameId === gameId);
                        return acc + (pick ? pick.confidence + 5 : 0);
                    }, 0);
                    value = possiblePoints > 0 ? (confidenceResults[player].gotwPoints / possiblePoints) * 100 : 0;
                    break;
                case 'correct_percentage':
                    const playedGames = weeks.flatMap(w => w.games).filter(g => gamesOfTheWeek.includes(g.id) && (g.status === 'final' || g.status === 'post' || (includeLiveGames && (g.status === 'in' || g.status === 'live'))));
                    const correctPicks = playedGames.filter(game => {
                        const pick = mockPicks[player]?.find(p => p.gameId === game.id);
                        if (!pick) return false;
                        const pickAbbreviation = teamAbbreviations[pick.pick] || pick.pick;
                        return pickAbbreviation === game.winner;
                    }).length;
                    value = playedGames.length > 0 ? (correctPicks / playedGames.length) * 100 : 0;
                    break;
                case 'absolute':
                default:
                    value = confidenceResults[player].gotwPoints;
                    break;
            }
            return { player, value };
        });

        // Sort data
        data.sort((a, b) => b.value - a.value);
        return data;

    }, [confidenceResults, mockPicks, weeks, gamesOfTheWeek, includeLiveGames, gotwDisplayMode, players]);


    const maxPoints = gotwDisplayMode === 'absolute' ? Math.max(1, ...chartData.map(d => d.value)) : 100;

    const chartWidth = 800;
    const chartHeight = 250;
    const padding = 50;

    const xScale = (index) => padding + index * (chartWidth - 2 * padding) / (chartData.length - 1);
    const yScale = (points) => chartHeight - padding - (points / maxPoints) * (chartHeight - 2 * padding);

    const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7"];

    return (
        React.createElement("div", { className: "relative bg-slate-800/50 rounded-lg border border-slate-700 p-6 mt-6" },
            React.createElement("button", {
                onClick: () => {
                  const modes = ['absolute', 'points_percentage', 'correct_percentage'];
                  const nextIndex = (modes.indexOf(gotwDisplayMode) + 1) % modes.length;
                  setGotwDisplayMode(modes[nextIndex]);
                },
                className: "absolute top-4 right-4 px-3 py-1 text-xs rounded-md font-medium transition-colors bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }, `View: ${gotwDisplayMode.replace('_', ' ')}`),
            React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "GotW Points"),
            React.createElement("svg", {
                viewBox: `0 0 ${chartWidth} ${chartHeight}`,
                className: "w-full h-auto"
            },
                // X-axis
                React.createElement("line", { x1: padding, y1: chartHeight - padding, x2: chartWidth - padding, y2: chartHeight - padding, stroke: "#64748b" }),
                chartData.map(({ player }, index) => (
                    React.createElement("text", { key: player, x: xScale(index), y: chartHeight - padding + 20, fill: "#94a3b8", textAnchor: "middle" }, player)
                )),

                // Y-axis
                /* React.createElement("line", { x1: padding, y1: padding, x2: padding, y2: chartHeight - padding, stroke: "#64748b" }),
                Array.from({ length: 5 }).map((_, i) => {
                    const points = Math.round(maxPoints / 4 * i);
                    return React.createElement("text", { key: i, x: padding - 10, y: yScale(points), fill: "#94a3b8", textAnchor: "end" }, `${points}${gotwDisplayMode !== 'absolute' ? '%' : ''}`);
                }), */

                // Bars
                chartData.map(({ player, value }, index) => {
                    const barWidth = (chartWidth - 2 * padding) / chartData.length / 2;
                    const barX = xScale(index) - barWidth / 2;
                    const barHeight = chartHeight - padding - yScale(value);
                    const barY = yScale(value);

                    return (
                        React.createElement("g", { key: player },
                            React.createElement("rect", {
                                x: barX,
                                y: barY,
                                width: barWidth,
                                height: barHeight,
                                fill: colors[index % colors.length],
                                rx: 4 // rounded corners
                            }),
                            React.createElement("text", {
                                x: barX + barWidth / 2,
                                y: barY - 5,
                                fill: "#fff",
                                textAnchor: "middle",
                                fontSize: "12px"
                            }, gotwDisplayMode === 'absolute' ? value : `${value.toFixed(1)}%`)
                        )
                    );
                })
            )
        )
    );
}

function GamesOfTheWeekPointsTable({ mockPicks, weeks, gamesOfTheWeek, includeLiveGames }) {
    const players = Object.keys(mockPicks);

    const gotwGames = weeks.flatMap(weekData =>
        weekData.games
            .filter(game => gamesOfTheWeek.includes(game.id))
            .map(game => ({ ...game, week: weekData.week }))
    );

    return (
        React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mt-6" },
            React.createElement("h2", { className: "text-xl font-bold text-white mb-4 p-6" }, "GotW Points Details"),
            React.createElement("table", { className: "w-full" },
                React.createElement("thead", null,
                    React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Week"),
                        React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm" }, "Game"),
                        players.map(player =>
                            React.createElement("th", { key: player, className: "px-4 py-3 text-center text-white font-semibold text-sm" }, player)
                        )
                    )
                ),
                React.createElement("tbody", null,
                    gotwGames.map(game => (
                        React.createElement("tr", { key: game.id, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                            React.createElement("td", { className: "px-4 py-3 text-white" }, game.week),
                            React.createElement("td", { className: "px-4 py-3 text-white" }, `${game.away} @ ${game.home}`),
                            players.map(player => {
                                const playerPicks = mockPicks[player];
                                const pick = playerPicks.find(p => p.gameId === game.id);
                                if (!pick) return React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-300" }, "-");

                                const isComplete = game.status === 'final' || game.status === 'post';
                                const isLiveGame = game.status === 'in' || game.status === 'live';

                                let winner = null;
                                if (isComplete) {
                                    winner = game.winner;
                                } else if (includeLiveGames && isLiveGame) {
                                    if (game.homeScore > game.awayScore) winner = game.home;
                                    else if (game.awayScore > game.homeScore) winner = game.away;
                                }

                                const pickAbbreviation = teamAbbreviations[pick.pick] || pick.pick;
                                const isCorrect = winner === pickAbbreviation;

                                let points = 0;
                                if ((isComplete || (includeLiveGames && isLiveGame)) && isCorrect) {
                                    points = pick.confidence + 5;
                                }

                                return React.createElement("td", { key: player, className: "px-4 py-3 text-center text-slate-300" }, points);
                            })
                        )
                    ))
                )
            )
        )
    );
}

function OddsTable({ weeks, selectedWeek }) {
  const [sortConfig, setSortConfig] = useState({ key: 'fpiConfidence', direction: 'ascending' });

  if (!selectedWeek) return null;

  const weekData = weeks.find(w => w.week === selectedWeek);

  if (!weekData) {
    return React.createElement("div", { className: "text-white text-center py-10" }, "Data for this week is not available yet.");
  }

  const sortedGames = React.useMemo(() => {
    let sortableGames = [...weekData.games];

    // Pre-calculate derived values for sorting
    sortableGames = sortableGames.map(game => {
      const absDiff = (game.homeWinProbability && game.awayWinProbability)
        ? Math.abs(game.homeWinProbability - game.awayWinProbability)
        : -1;
      const awayML_WP = convertOddsToProbability(game.awayMoneyLine);
      const homeML_WP = convertOddsToProbability(game.homeMoneyLine);
      const absMlDiff = (awayML_WP && homeML_WP) ? Math.abs(awayML_WP - homeML_WP) : -1;
      return { ...game, absDiff, awayML_WP, homeML_WP, absMlDiff };
    });

    // Create ranks for fpiConfidence
    const rankedByFpi = [...sortableGames].sort((a, b) => a.absDiff - b.absDiff);
    const fpiRanks = {};
    rankedByFpi.forEach((game, index) => {
      fpiRanks[game.id] = game.absDiff === -1 ? Infinity : index + 1;
    });

    // Create ranks for mlConfidence
    const rankedByMl = [...sortableGames].sort((a, b) => a.absMlDiff - b.absMlDiff);
    const mlRanks = {};
    rankedByMl.forEach((game, index) => {
      mlRanks[game.id] = game.absMlDiff === -1 ? Infinity : index + 1;
    });

    sortableGames = sortableGames.map(game => ({
      ...game,
      fpiConfidence: fpiRanks[game.id],
      mlConfidence: mlRanks[game.id]
    }));


    if (sortConfig.key !== null) {
      sortableGames.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle N/A or null values
        if (aValue === null || aValue === "N/A" || aValue === Infinity || isNaN(aValue)) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        if (bValue === null || bValue === "N/A" || bValue === Infinity || isNaN(bValue)) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableGames;
  }, [weekData.games, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' \u25B2' : ' \u25BC';
    }
    return null;
  };

  return (
    React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden" },
      React.createElement("h2", { className: "text-xl font-bold text-white p-6" }, `Win Probs. for Week ${selectedWeek}`),
      React.createElement("table", { className: "w-full" },
        React.createElement("thead", null,
          React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('away') }, "Game", getSortIndicator('away')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('awayWinProbability') }, "Away WP", getSortIndicator('awayWinProbability')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('homeWinProbability') }, "Home WP", getSortIndicator('homeWinProbability')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('absDiff') }, "Abs Diff", getSortIndicator('absDiff')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('fpiConfidence') }, "FPI Conf.", getSortIndicator('fpiConfidence')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('awayMoneyLine') }, "Away ML", getSortIndicator('awayMoneyLine')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('homeMoneyLine') }, "Home ML", getSortIndicator('homeMoneyLine')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('awayML_WP') }, "Away ML WP", getSortIndicator('awayML_WP')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('homeML_WP') }, "Home ML WP", getSortIndicator('homeML_WP')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('absMlDiff') }, "Abs ML Diff", getSortIndicator('absMlDiff')),
            React.createElement("th", { className: "px-4 py-3 text-left text-white font-semibold text-sm cursor-pointer", onClick: () => requestSort('mlConfidence') }, "ML Conf.", getSortIndicator('mlConfidence'))
          )
        ),
        React.createElement("tbody", null,
          sortedGames.map(game => {
            const absDiffDisplay = game.absDiff !== -1 ? game.absDiff.toFixed(1) + '%' : "N/A";
            const absMlDiffDisplay = game.absMlDiff !== -1 ? `${(game.absMlDiff * 100).toFixed(1)}%` : "N/A";

            return (
              React.createElement("tr", { key: game.id, className: "border-b border-slate-700/50 hover:bg-slate-700/20" },
                React.createElement("td", { className: "px-4 py-3 text-white" }, `${game.away} @ ${game.home}`),
                React.createElement("td", { className: "px-4 py-3 text-white" },
                  game.awayWinProbability ? `${game.awayWinProbability.toFixed(1)}%` : "N/A"
                ),
                React.createElement("td", { className: "px-4 py-3 text-white" },
                  game.homeWinProbability ? `${game.homeWinProbability.toFixed(1)}%` : "N/A"
                ),
                React.createElement("td", { className: "px-4 py-3 text-white" }, absDiffDisplay),
                React.createElement("td", { className: "px-4 py-3 text-white" }, game.fpiConfidence === Infinity ? "N/A" : game.fpiConfidence),
                React.createElement("td", { className: "px-4 py-3 text-white" }, game.awayMoneyLine || "N/A"),
                React.createElement("td", { className: "px-4 py-3 text-white" }, game.homeMoneyLine || "N/A"),
                React.createElement("td", { className: "px-4 py-3 text-white" },
                  game.awayML_WP ? `${(game.awayML_WP * 100).toFixed(1)}%` : "N/A"
                ),
                React.createElement("td", { className: "px-4 py-3 text-white" },
                  game.homeML_WP ? `${(game.homeML_WP * 100).toFixed(1)}%` : "N/A"
                ),
                React.createElement("td", { className: "px-4 py-3 text-white" }, absMlDiffDisplay),
                React.createElement("td", { className: "px-4 py-3 text-white" }, game.mlConfidence === Infinity ? "N/A" : game.mlConfidence)
              )
            )
          })
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
  const [activeTab, setActiveTab] = useState('week-overview');
  const [includeLiveGames, setIncludeLiveGames] = useState(true);
  const [mockPicks, setMockPicks] = useState({});
  const [gamesOfTheWeek, setGamesOfTheWeek] = useState([]);
  const [deviationData, setDeviationData] = useState([]);
  const [deviationSortConfig, setDeviationSortConfig] = useState({ key: null, direction: 'ascending' });
  const [playerSortConfig, setPlayerSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showLogos, setShowLogos] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('cumulative-points');
  const [pointsPerWeekDisplayMode, setPointsPerWeekDisplayMode] = useState('absolute');
  const [gotwDisplayMode, setGotwDisplayMode] = useState('absolute');

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

      const weekPromises = Array.from({ length: 18 }, (_, i) => i + 1).map(weekNum =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${weekNum}`)
          .then(res => res.json())
          .then(data => ({ week: weekNum, games: transformEspnData(data) }))
      );
      const allWeeks = await Promise.all(weekPromises);
      setWeeks(allWeeks);
      if (allWeeks.length > 0 && !selectedWeek) {
        const seasonOrigin = new Date('2025-09-04');
        const today = new Date();
        seasonOrigin.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        const dayDiff = (today - seasonOrigin) / (1000 * 60 * 60 * 24);
        const currentWeek = Math.ceil((dayDiff + 1) / 7);
        const maxWeek = allWeeks[allWeeks.length - 1].week;
        const defaultWeek = Math.max(1, Math.min(currentWeek, maxWeek));
        setSelectedWeek(defaultWeek);
      }

      // Fetch win probabilities for all games across all weeks
      const allGamesWithSummaryPromises = allWeeks.flatMap(weekData =>
        weekData.games.map(async (game) => {
          try {
            const summaryResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`);
            const summaryData = await summaryResponse.json();

            let homeWinProbability = null;
            let awayWinProbability = null;
            let homeMoneyLine = null;
            let awayMoneyLine = null;

            if (summaryData.pickcenter && summaryData.pickcenter.length > 0 && summaryData.pickcenter[0].moneyline) {
                if(summaryData.pickcenter[0].moneyline.home && summaryData.pickcenter[0].moneyline.home.close) {
                    homeMoneyLine = summaryData.pickcenter[0].moneyline.home.close.odds;
                }
                if(summaryData.pickcenter[0].moneyline.away && summaryData.pickcenter[0].moneyline.away.close) {
                    awayMoneyLine = summaryData.pickcenter[0].moneyline.away.close.odds;
                }
            }

            const gameStatus = game.status;

            if (gameStatus === 'scheduled' || gameStatus === 'pre') {
                // For games that have not started, use the predictor
                if (summaryData.predictor && summaryData.predictor.homeTeam && summaryData.predictor.awayTeam) {
                    homeWinProbability = summaryData.predictor.homeTeam.gameProjection * 1;
                    awayWinProbability = summaryData.predictor.awayTeam.gameProjection * 1;
                }
            } else { // Game is 'in', 'live', 'post', or other state
                // For other states, use the winprobability array as it was before
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
                }
            }

            return { ...game, homeWinProbability, awayWinProbability, homeMoneyLine, awayMoneyLine };
          } catch (summaryError) {
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
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch data. Please try again or use mock data.");
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const refreshWeek = useCallback(async (weekNumber) => {
    if (!weekNumber) return;

    setIsRefreshing(true);
    try {
      // 1. Fetch scoreboard for the selected week
      const weekResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${weekNumber}`);
      const data = await weekResponse.json();
      const refreshedGames = transformEspnData(data);

      // 2. Fetch summary data for games in that week
      const gamesWithSummaryPromises = refreshedGames.map(async (game) => {
        try {
          const summaryResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`);
          const summaryData = await summaryResponse.json();

          let homeWinProbability = null;
          let awayWinProbability = null;
          let homeMoneyLine = null;
          let awayMoneyLine = null;

          if (summaryData.pickcenter && summaryData.pickcenter.length > 0 && summaryData.pickcenter[0].moneyline) {
              if(summaryData.pickcenter[0].moneyline.home && summaryData.pickcenter[0].moneyline.home.close) {
                  homeMoneyLine = summaryData.pickcenter[0].moneyline.home.close.odds;
              }
              if(summaryData.pickcenter[0].moneyline.away && summaryData.pickcenter[0].moneyline.away.close) {
                  awayMoneyLine = summaryData.pickcenter[0].moneyline.away.close.odds;
              }
          }

          const gameStatus = game.status;

          if (gameStatus === 'scheduled' || gameStatus === 'pre') {
              if (summaryData.predictor && summaryData.predictor.homeTeam && summaryData.predictor.awayTeam) {
                  homeWinProbability = summaryData.predictor.homeTeam.gameProjection * 1;
                  awayWinProbability = summaryData.predictor.awayTeam.gameProjection * 1;
              }
          } else {
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
              }
          }

          return { ...game, homeWinProbability, awayWinProbability, homeMoneyLine, awayMoneyLine };
        } catch (summaryError) {
          return game; // Return original game if summary fetch fails
        }
      });
      const gamesWithSummaries = await Promise.all(gamesWithSummaryPromises);

      // 3. Update the weeks state immutably
      setWeeks(currentWeeks => {
        const newWeeks = [...currentWeeks];
        const weekIndex = newWeeks.findIndex(w => w.week === weekNumber);
        if (weekIndex !== -1) {
          newWeeks[weekIndex] = {
            ...newWeeks[weekIndex],
            games: gamesWithSummaries
          };
        }
        return newWeeks;
      });

    } catch (err) {
      console.error("Refresh error:", err);
      // Optionally set a temporary error message
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    fetchScores(); // Initial fetch
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      const intervalId = setInterval(() => {
        refreshWeek(selectedWeek);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [selectedWeek, refreshWeek]);

  useEffect(() => {
    if (weeks.length > 0 && Object.keys(mockPicks).length > 0) {
      calculateDeviation();
    }
  }, [weeks, mockPicks]); // Re-run if weeks or mockPicks changes

  const calculateConfidencePoints = () => {
    const results = {};

    Object.keys(mockPicks).forEach(player => {
      results[player] = { total: 0, weekly: 0, correct: 0, possible: 0, details: [], pointsPerWeek: [], correctPicksPerWeek: [], remainingPossible: 0, totalConfidenceFromPlayedGames: 0, gotwPoints: 0, pointsLost: 0 };
    });

    weeks.forEach(weekData => {
      let weeklyPoints = {};
      let weeklyCorrectPicks = {};
      Object.keys(mockPicks).forEach(player => {
        weeklyPoints[player] = 0;
        weeklyCorrectPicks[player] = 0;
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
            weeklyCorrectPicks[player]++;
            results[player].correct++;
            if (gamesOfTheWeek.includes(game.id)) {
              results[player].gotwPoints += confidence;
            }
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
        results[player].correctPicksPerWeek.push({ week: weekData.week, correctPicks: weeklyCorrectPicks[player] });
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

    Object.keys(results).forEach(player => {
      const lost = results[player].details.reduce((acc, detail) => {
        if (detail.correct === false) {
          return acc + detail.confidence;
        }
        return acc;
      }, 0);
      results[player].pointsLost = lost;
    });

    return results;
  };

  const calculateDeviation = () => {
    const deviationResults = [];
    weeks.forEach(weekData => {
      weekData.games.forEach(game => {
        const players = Object.keys(mockPicks);
        const gamePicks = [];
        let sumRelConf = 0;

        players.forEach(player => {
          const pick = mockPicks[player].find(p => p.gameId === game.id);
          if (pick) {
            const pickAbbreviation = teamAbbreviations[pick.pick] || pick.pick;
            const relConf = pickAbbreviation === game.home ? pick.confidence : -1 * pick.confidence;
            gamePicks.push({ player, relConf });
            sumRelConf += relConf;
          }
        });

        if (gamePicks.length > 1) {
          let sumOfDeviations = 0;
          gamePicks.forEach(pick => {
            const avgConfOthers = (sumRelConf - pick.relConf) / (gamePicks.length - 1);
            const deviation = Math.abs(pick.relConf - avgConfOthers);
            sumOfDeviations += deviation;
          });
          const avgDeviation = sumOfDeviations / gamePicks.length;
          deviationResults.push({ gameId: game.id, avgDeviation });
        }
      });
    });
    setDeviationData(deviationResults);
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

  const requestPlayerSort = (key) => {
    let direction = 'ascending';
    if (playerSortConfig.key === key && playerSortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setPlayerSortConfig({ key, direction });
    setDeviationSortConfig({ key: null, direction: 'ascending' });
  };

  return (
    React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" },
      React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10" },
        React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-4" },
          React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-4" },
            React.createElement("div", { className: "flex items-center gap-3" },
              React.createElement("span", null, "\uD83C\uDFC8"),
              React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-white" }, "NFL Pickem Live Tracker"),
              )
            ),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement("button", { 
                onClick: () => refreshWeek(selectedWeek), 
                className: `px-3 py-2 text-sm rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`,
                disabled: isRefreshing
              },
                isRefreshing ? "Refreshing..." : "Refresh Scores"
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
                includeLiveGames ? 'Incl. Live Games' : 'Final Games Only'
              ),
              React.createElement("select", { onChange: (e) => setSelectedWeek(parseInt(e.target.value)), value: selectedWeek, className: "bg-slate-700 text-white rounded-lg px-3 py-2" },
                weeks.map(w => React.createElement("option", { key: w.week, value: w.week }, `Week ${w.week}`))
              )
            )
          ),
          React.createElement("div", { className: "flex gap-2 mt-4" },
            React.createElement("button", {
              onClick: () => setActiveTab('week-overview'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'week-overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Week Overview"
            ),

            React.createElement("button", {
              onClick: () => setActiveTab('chart'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Charts"
            ),
            React.createElement("button", {
              onClick: () => setActiveTab('odds'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'odds'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Win Probs."
            ),
            React.createElement("button", {
              onClick: () => setActiveTab('leaderboard'),
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`
            },
              "Leaderboard"
            )
          )
        )
      ),
      React.createElement("div", { className: `${activeTab === 'week-overview' ? 'max-w-full' : 'max-w-7xl'} mx-auto px-4 py-6` },
        error && (
          React.createElement("div", { className: "bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm" },
            error
          )
        ),
        loading ? (
          React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement("div", { className: "text-center" },
              React.createElement("span", { className: "w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" }, "🔄"),
              React.createElement("p", { className: "text-slate-300" }, "Loading...")
            )
          )
        ) : activeTab === 'chart' ? (
          React.createElement("div", null,
            React.createElement("div", { className: "flex gap-2 mb-4" },
              React.createElement("button", {
                onClick: () => setActiveChartTab('cumulative-points'),
                className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChartTab === 'cumulative-points' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`
              }, "Cumulative Points vs. Leader"),
              React.createElement("button", {
                onClick: () => setActiveChartTab('points-per-week'),
                className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChartTab === 'points-per-week' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`
              }, "Points per Week"),
              React.createElement("button", {
                onClick: () => setActiveChartTab('gotw-points'),
                className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChartTab === 'gotw-points' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`
              }, "GotW Points")
            ),
            activeChartTab === 'points-per-week' && React.createElement("div", null,
              React.createElement(WeeklyPointsChart, { confidenceResults: confidenceResults, selectedWeek: selectedWeek, weeks: weeks, gamesOfTheWeek: gamesOfTheWeek, pointsPerWeekDisplayMode: pointsPerWeekDisplayMode, setPointsPerWeekDisplayMode: setPointsPerWeekDisplayMode }),
              React.createElement(WeeklyPointsTable, { confidenceResults: confidenceResults, weeks: weeks, gamesOfTheWeek: gamesOfTheWeek, pointsPerWeekDisplayMode: pointsPerWeekDisplayMode })
            ),
            activeChartTab === 'cumulative-points' && React.createElement("div", null,
              React.createElement(CumulativePointsChart, { confidenceResults: confidenceResults, selectedWeek: selectedWeek }),
              React.createElement(CumulativePointsTable, { confidenceResults: confidenceResults })
            ),
            activeChartTab === 'gotw-points' && React.createElement("div", null,
              React.createElement(GamesOfTheWeekPointsChart, { 
                confidenceResults: confidenceResults,
                mockPicks: mockPicks,
                weeks: weeks,
                gamesOfTheWeek: gamesOfTheWeek,
                includeLiveGames: includeLiveGames,
                gotwDisplayMode: gotwDisplayMode,
                setGotwDisplayMode: setGotwDisplayMode
              }),
              React.createElement(GamesOfTheWeekPointsTable, { mockPicks: mockPicks, weeks: weeks, gamesOfTheWeek: gamesOfTheWeek, includeLiveGames: includeLiveGames })
            )
          )
        ) : activeTab === 'odds' ? (
          React.createElement(OddsTable, { weeks: weeks, selectedWeek: selectedWeek })
        ) : activeTab === 'week-overview' ? (
          React.createElement("div", null,
            React.createElement("div", { className: "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden" },
              React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full" },
                  React.createElement("thead", null,
                    React.createElement("tr", { className: "bg-slate-700/50 border-b border-slate-700" },
                      React.createElement("th", { className: "px-2 py-1 text-left text-white font-semibold text-xs" }, "Game"),
                      React.createElement("th", { className: "px-0 py-1 text-left text-white font-semibold text-xs" }, "Score"),
                      leaderboard.map(([player, data], idx) => {
                        const firstPlacePoints = leaderboard.length > 0 ? leaderboard[0][1].total : 0;
                        const pointsBehind = firstPlacePoints - data.total;
                        return (
                          React.createElement("th", { key: player, className: "px-2 py-1 text-center border-l border-slate-700 cursor-pointer", onClick: () => requestPlayerSort(player) },
                            React.createElement("div", { className: "text-white font-semibold text-xs" }, player.replace(/ /g, '\u00A0'), playerSortConfig.key === player && (playerSortConfig.direction === 'ascending' ? ' \u25B2' : ' \u25BC')),
                            React.createElement("div", { className: "text-yellow-400 text-xs font-bold mt-1", title: "Total points for the season" }, data.total),
                            idx === 0 ? React.createElement("div", { className: "text-xs text-green-400", title: "Total points behind the leader" }, "Lead") : pointsBehind > 0 && React.createElement("div", { className: "text-xs text-red-400", title: "Total points behind the leader" }, `-${pointsBehind}`),
                            React.createElement("div", { className: "text-slate-400 text-xs", title: "Points this week" }, `${data.weekly}`),
                            React.createElement("div", { className: "text-xs text-orange-400", title: "Points lost this week" }, `-${data.pointsLost}`),
                            React.createElement("div", { className: "text-xs text-blue-400", title: "Remaining potential points this week" }, `${data.remainingPossible}`)
                          )
                        );
                      }),
                      React.createElement("th", { className: "px-2 py-1 text-left text-white font-semibold text-xs cursor-pointer", onClick: () => {
                        setDeviationSortConfig(current => ({ key: 'dev', direction: current.key === 'dev' && current.direction === 'ascending' ? 'descending' : 'ascending' }));
                        setPlayerSortConfig({ key: null, direction: 'ascending' });
                      }},
                          "Dev",
                          deviationSortConfig.key === 'dev' && (deviationSortConfig.direction === 'ascending' ? ' \u25B2' : ' \u25BC')
                      )
                    )
                  ),
                  React.createElement("tbody", null,
                                      (displayedWeek ? [...displayedWeek.games].sort((a, b) => {
                                        if (playerSortConfig.key) {
                                          const player = playerSortConfig.key;
                                          const aConfidence = confidenceResults[player]?.details.find(d => d.gameId === a.id)?.confidence || 0;
                                          const bConfidence = confidenceResults[player]?.details.find(d => d.gameId === b.id)?.confidence || 0;
                                  
                                          if (aConfidence < bConfidence) {
                                              return playerSortConfig.direction === 'ascending' ? -1 : 1;
                                          }
                                          if (aConfidence > bConfidence) {
                                              return playerSortConfig.direction === 'ascending' ? 1 : -1;
                                          }
                                        }

                                        const aIsLive = isLive(a);
                                        const bIsLive = isLive(b);

                                        if (deviationSortConfig.key === 'dev') {
                                          const aDev = deviationData.find(d => d.gameId === a.id)?.avgDeviation || 0;
                                          const bDev = deviationData.find(d => d.gameId === b.id)?.avgDeviation || 0;
                                          if (aDev < bDev) {
                                              return deviationSortConfig.direction === 'ascending' ? -1 : 1;
                                          }
                                          if (aDev > bDev) {
                                              return deviationSortConfig.direction === 'ascending' ? 1 : -1;
                                          }
                                        }

                                        if (aIsLive && !bIsLive) return -1; // a (live) comes before b (not live)
                                        if (!aIsLive && bIsLive) return 1;  // b (live) comes before a (not live)

                                        return new Date(a.date) - new Date(b.date); // Sort by date if both are live or both are not live
                                      }) : []).map((game) => {
                                        const isGameOfTheWeek = gamesOfTheWeek.includes(game.id);
                                        const live = isLive(game);
                                        const trChildren = [
                                          React.createElement("td", { className: "px-2 py-1" },
                                            React.createElement("div", { className: "text-white text-sm font-medium flex items-center gap-2" },
                                              `${game.away} @ ${game.home}`,
                                              isGameOfTheWeek && (
                                                React.createElement("span", { className: "bg-yellow-500 text-slate-900 text-xs font-semibold px-2 py-0.5 rounded-full" }, "GotW")
                                              )
                                            ),
                                            game.homeWinProbability !== null && game.awayWinProbability !== null && (isLive(game) || (game.status === 'final' || game.status === 'post')) ? (
                                                React.createElement(React.Fragment, null,
                                                    React.createElement("div", { className: "text-xs text-slate-400" },
                                                        `${game.awayWinProbability.toFixed(1)}%-${game.homeWinProbability.toFixed(1)}%`
                                                    ),
                                                    (isLive(game) && game.displayClock && game.period) ? (
                                                        React.createElement("div", { className: "text-xs text-red-400 animate-pulse" }, 
                                                            `(${`Q${game.period} - ${game.displayClock.split(' - ')[0]}`})`
                                                        )
                                                    ) : null
                                                )
                                            ) : null                                          ),
                                          React.createElement("td", { className: "px-0 py-1" },
                                            React.createElement("div", { className: "text-sm" },
                                              game.status === 'final' || game.status === 'post' || (includeLiveGames && (game.status === 'in' || game.status === 'live')) ? (
                                                React.createElement("span", { className: "text-white font-semibold" }, 
                                                  `${game.awayScore}-${game.homeScore}`
                                                )
                                              ) : (
                                                getGameStatus(game) === 'Scheduled' && game.date ? (
                                                  React.createElement("span", { className: "text-slate-400 text-xs" }, new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(game.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }))
                                                ) : (
                                                  React.createElement("span", { className: "text-slate-400 text-xs" }, "-")
                                                )
                                              )
                                            )
                                          )
                                        ];

                                        const playerTds = leaderboard.map(([player, data]) => {
                                          const detail = data.details.find(d => d.gameId === game.id);
                                          if (!detail) return React.createElement("td", { key: player, className: "px-2 py-3 text-center text-slate-500 border-l border-slate-700/50" }, "-");

                                          const isCorrect = detail.correct;
                                          const isWrong = detail.correct === false;
                                          const pickAbbr = detail.pick ? (teamAbbreviations[detail.pick] || detail.pick) : null;

                                          return (
                                              React.createElement("td", { key: player, className: "px-2 py-1 text-center border-l border-slate-700/50" },
                                                  React.createElement("div", { className: `flex flex-col gap-px px-1 py-0 rounded text-sm font-semibold text-center ${
                                                      isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                                      isWrong ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                                      'bg-slate-700/50 text-slate-300 border border-slate-600'
                                                  }` },
                                                      showLogos && pickAbbr ?
                                                        React.createElement("img", {
                                                          src: `https://a.espncdn.com/i/teamlogos/nfl/500/${pickAbbr.toLowerCase()}.png`,
                                                          alt: detail.pick,
                                                          className: "w-6 h-6 mx-auto"
                                                        }) :
                                                        React.createElement("div", { }, pickAbbr || '-'),
                                                      React.createElement("div", { className: `text-xs ${
                                                          isCorrect ? 'text-green-400' :
                                                          isWrong ? 'text-red-400' :
                                                          'text-slate-300'
                                                      }` },
                                                          detail.confidence
                                                      )
                                                  )
                                              )
                                          );
                                        });

                                        trChildren.push(...playerTds);

                                        trChildren.push(
                                          React.createElement("td", { className: "px-2 py-1 text-white" },
                                            (deviationData.find(d => d.gameId === game.id) && !isNaN(deviationData.find(d => d.gameId === game.id).avgDeviation)) ? deviationData.find(d => d.gameId === game.id).avgDeviation.toFixed(1) : ""
                                          )
                                        );

                                        return React.createElement.apply(null, ["tr", { key: game.id, className: `border-b border-slate-700/50 hover:bg-slate-700/20 ${live ? 'bg-green-500/10' : ''}` }].concat(trChildren));
                    })
                  )
                )
              )
            )
          )
        ) : activeTab === 'leaderboard' ? (
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
        ) : null
      )
    )
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(NFLScoresTracker));