const { useState } = React;
const { Plus, Search, Calendar, TrendingUp, Egg, Building, AlertCircle } = lucide;

const LargeScaleEggTracker = () => {
  const [buildings, setBuildings] = useState([
    { id: 1, name: 'Bâtiment A', chickenCount: 150, breed: 'Pondeuses Rousses', avgEggsPerDay: 120 },
    { id: 2, name: 'Bâtiment B', chickenCount: 180, breed: 'Leghorn', avgEggsPerDay: 150 },
    { id: 3, name: 'Bâtiment C', chickenCount: 100, breed: 'ISA Brown', avgEggsPerDay: 85 }
  ]);

  const [dailyRecords, setDailyRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('matin');
  const [quickEntryMatin, setQuickEntryMatin] = useState('');
  const [quickEntrySoir, setQuickEntrySoir] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: '', chickenCount: '', breed: '', avgEggsPerDay: '' });

  // Enregistrer la production d'œufs pour un bâtiment (matin ou soir)
  const recordEggs = (buildingId, eggCount, session = selectedSession) => {
    const recordKey = `${buildingId}-${selectedDate}`;
    const newRecords = { ...dailyRecords };
    
    if (!newRecords[recordKey]) {
      newRecords[recordKey] = { matin: 0, soir: 0, timestamp: new Date().toISOString() };
    }
    
    if (eggCount >= 0) {
      newRecords[recordKey][session] = parseInt(eggCount) || 0;
      newRecords[recordKey].timestamp = new Date().toISOString();
    }
    
    setDailyRecords(newRecords);
  };

  // Obtenir le nombre d'œufs pour un bâtiment à une date donnée
  const getEggCount = (buildingId, date = selectedDate, session = null) => {
    const recordKey = `${buildingId}-${date}`;
    const record = dailyRecords[recordKey];
    
    if (!record) return session ? 0 : { matin: 0, soir: 0, total: 0 };
    
    if (session) {
      return record[session] || 0;
    }
    
    const matin = record.matin || 0;
    const soir = record.soir || 0;
    return { matin, soir, total: matin + soir };
  };

  // Calculer la production hebdomadaire
  const getWeeklyProduction = (buildingId) => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = getEggCount(buildingId, dateString);
      total += dayData.total;
    }
    return total;
  };

  // Ajouter un nouveau bâtiment
  const addBuilding = () => {
    if (newBuilding.name && newBuilding.chickenCount && newBuilding.breed) {
      const building = {
        id: Date.now(),
        name: newBuilding.name,
        chickenCount: parseInt(newBuilding.chickenCount),
        breed: newBuilding.breed,
        avgEggsPerDay: parseInt(newBuilding.avgEggsPerDay) || 0
      };
      setBuildings([...buildings, building]);
      setNewBuilding({ name: '', chickenCount: '', breed: '', avgEggsPerDay: '' });
      setShowAddBuilding(false);
    }
  };

  // Saisie rapide
  const handleQuickEntry = (session) => {
    const entryValue = session === 'matin' ? quickEntryMatin : quickEntrySoir;
    if (entryValue) {
      const values = entryValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
      values.forEach((count, index) => {
        if (buildings[index]) {
          recordEggs(buildings[index].id, count, session);
        }
      });
      if (session === 'matin') {
        setQuickEntryMatin('');
      } else {
        setQuickEntrySoir('');
      }
    }
  };

  // Obtenir les totaux quotidiens pour les 7 derniers jours
  const getDailyTotals = () => {
    const dailyTotals = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      let dayTotalMatin = 0;
      let dayTotalSoir = 0;
      
      buildings.forEach(building => {
        const dayData = getEggCount(building.id, dateString);
        dayTotalMatin += dayData.matin;
        dayTotalSoir += dayData.soir;
      });
      
      dailyTotals.push({
        date: dateString,
        matin: dayTotalMatin,
        soir: dayTotalSoir,
        total: dayTotalMatin + dayTotalSoir,
        displayDate: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
      });
    }
    return dailyTotals;
  };

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    building.breed.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const dailyTotals = getDailyTotals();
  const todayTotal = dailyTotals[dailyTotals.length - 1]?.total || 0;
  const todayMatin = dailyTotals[dailyTotals.length - 1]?.matin || 0;
  const todaySoir = dailyTotals[dailyTotals.length - 1]?.soir || 0;
  const weeklyTotal = dailyTotals.reduce((sum, day) => sum + day.total, 0);
  const totalChickens = buildings.reduce((sum, building) => sum + building.chickenCount, 0);
  const productionRate = totalChickens > 0 ? ((todayTotal / totalChickens) * 100).toFixed(1) : 0;

  return React.createElement('div', { className: "max-w-7xl mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen" }, 
    // En-tête avec statistiques
    React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 mb-6" },
      React.createElement('div', { className: "flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6" },
        React.createElement('h1', { className: "text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4 lg:mb-0" },
          React.createElement(Building, { className: "text-green-600", size: 36 }),
          `Gestion Avicole - ${totalChickens} Poules`
        ),
        React.createElement('button', {
          onClick: () => setShowAddBuilding(!showAddBuilding),
          className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        },
          React.createElement(Plus, { size: 20 }),
          "Ajouter Bâtiment"
        )
      ),
      
      // Statistiques principales
      React.createElement('div', { className: "grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6" },
        React.createElement('div', { className: "bg-orange-100 rounded-lg p-4" },
          React.createElement('div', { className: "flex items-center justify-between" },
            React.createElement('div', {},
              React.createElement('p', { className: "text-orange-600 text-sm font-medium" }, "Matin"),
              React.createElement('p', { className: "text-2xl font-bold text-orange-800" }, todayMatin)
            ),
            React.createElement(Calendar, { className: "text-orange-500", size: 24 })
          )
        ),
        React.createElement('div', { className: "bg-blue-100 rounded-lg p-4" },
          React.createElement('div', { className: "flex items-center justify-between" },
            React.createElement('div', {},
              React.createElement('p', { className: "text-blue-600 text-sm font-medium" }, "Soir"),
              React.createElement('p', { className: "text-2xl font-bold text-blue-800" }, todaySoir)
            ),
            React.createElement(Calendar, { className: "text-blue-500", size: 24 })
          )
        ),
        React.createElement('div', { className: "bg-green-100 rounded-lg p-4" },
          React.createElement('div', { className: "flex items-center justify-between" },
            React.createElement('div', {},
              React.createElement('p', { className: "text-green-600 text-sm font-medium" }, "Total Jour"),
              React.createElement('p', { className: "text-2xl font-bold text-green-800" }, todayTotal)
            ),
            React.createElement(TrendingUp, { className: "text-green-500", size: 24 })
          )
        ),
        React.createElement('div', { className: "bg-purple-100 rounded-lg p-4" },
          React.createElement('div', { className: "flex items-center justify-between" },
            React.createElement('div', {},
              React.createElement('p', { className: "text-purple-600 text-sm font-medium" }, "Semaine"),
              React.createElement('p', { className: "text-2xl font-bold text-purple-800" }, weeklyTotal)
            ),
            React.createElement(Egg, { className: "text-purple-500", size: 24 })
          )
        ),
        React.createElement('div', { className: "bg-amber-100 rounded-lg p-4" },
          React.createElement('div', { className: "flex items-center justify-between" },
            React.createElement('div', {},
              React.createElement('p', { className: "text-amber-600 text-sm font-medium" }, "Taux Prod."),
              React.createElement('p', { className: "text-2xl font-bold text-amber-800" }, `${productionRate}%`)
            ),
            React.createElement(Building, { className: "text-amber-500", size: 24 })
          )
        )
      ),

      // Saisie rapide
      React.createElement('div', { className: "bg-gray-50 rounded-lg p-4 mb-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-3" }, "Saisie Rapide par Session"),
        
        React.createElement('div', { className: "flex gap-2 mb-4" },
          React.createElement('button', {
            onClick: () => setSelectedSession('matin'),
            className: `px-4 py-2 rounded-lg font-medium ${
              selectedSession === 'matin' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`
          }, "🌅 Collecte Matin"),
          React.createElement('button', {
            onClick: () => setSelectedSession('soir'),
            className: `px-4 py-2 rounded-lg font-medium ${
              selectedSession === 'soir' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`
          }, "🌙 Collecte Soir")
        ),
        
        React.createElement('div', { className: "space-y-3" },
          React.createElement('div', { className: "flex flex-col sm:flex-row gap-3" },
            React.createElement('input', {
              type: "text",
              placeholder: "Collecte MATIN - Ex: 150,180,100",
              value: quickEntryMatin,
              onChange: (e) => setQuickEntryMatin(e.target.value),
              className: "flex-1 border rounded-lg px-3 py-2"
            }),
            React.createElement('button', {
              onClick: () => handleQuickEntry('matin'),
              className: "bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg whitespace-nowrap"
            }, "Saisir Matin")
          ),
          React.createElement('div', { className: "flex flex-col sm:flex-row gap-3" },
            React.createElement('input', {
              type: "text",
              placeholder: "Collecte SOIR - Ex: 120,140,80",
              value: quickEntrySoir,
              onChange: (e) => setQuickEntrySoir(e.target.value),
              className: "flex-1 border rounded-lg px-3 py-2"
            }),
            React.createElement('button', {
              onClick: () => handleQuickEntry('soir'),
              className: "bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg whitespace-nowrap"
            }, "Saisir Soir")
          )
        )
      ),

      // Formulaire d'ajout de bâtiment (conditionnel)
      showAddBuilding && React.createElement('div', { className: "bg-gray-50 rounded-lg p-4 mb-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "Nouveau Bâtiment"),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3" },
          React.createElement('input', {
            type: "text",
            placeholder: "Nom du bâtiment",
            value: newBuilding.name,
            onChange: (e) => setNewBuilding({...newBuilding, name: e.target.value}),
            className: "border rounded-lg px-3 py-2"
          }),
          React.createElement('input', {
            type: "number",
            placeholder: "Nombre de poules",
            value: newBuilding.chickenCount,
            onChange: (e) => setNewBuilding({...newBuilding, chickenCount: e.target.value}),
            className: "border rounded-lg px-3 py-2"
          }),
          React.createElement('input', {
            type: "text",
            placeholder: "Race/Type",
            value: newBuilding.breed,
            onChange: (e) => setNewBuilding({...newBuilding, breed: e.target.value}),
            className: "border rounded-lg px-3 py-2"
          }),
          React.createElement('input', {
            type: "number",
            placeholder: "Production moy/jour",
            value: newBuilding.avgEggsPerDay,
            onChange: (e) => setNewBuilding({...newBuilding, avgEggsPerDay: e.target.value}),
            className: "border rounded-lg px-3 py-2"
          }),
          React.createElement('button', {
            onClick: addBuilding,
            className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          }, "Ajouter")
        )
      ),

      // Contrôles
      React.createElement('div', { className: "flex flex-col sm:flex-row gap-4 items-center" },
        React.createElement('div', { className: "flex-1 w-full sm:w-auto" },
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "Date de production"),
          React.createElement('input', {
            type: "date",
            value: selectedDate,
            onChange: (e) => setSelectedDate(e.target.value),
            className: "w-full border rounded-lg px-3 py-2"
          })
        ),
        React.createElement('div', { className: "flex-1 w-full sm:w-auto" },
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "Rechercher"),
          React.createElement('div', { className: "relative" },
            React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }),
            React.createElement('input', {
              type: "text",
              placeholder: "Nom ou race...",
              value: searchFilter,
              onChange: (e) => setSearchFilter(e.target.value),
              className: "w-full pl-10 border rounded-lg px-3 py-2"
            })
          )
        )
      )
    ),

    // Liste des bâtiments
    React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6" },
      ...filteredBuildings.map(building => {
        const eggData = getEggCount(building.id);
        const todayEggs = eggData.total;
        const weeklyEggs = getWeeklyProduction(building.id);
        const buildingRate = building.chickenCount > 0 ? ((todayEggs / building.chickenCount) * 100).toFixed(1) : 0;
        const isLowProduction = buildingRate < 60;
        
        return React.createElement('div', {
          key: building.id,
          className: `bg-white rounded-xl shadow-lg overflow-hidden ${isLowProduction ? 'border-l-4 border-red-400' : ''}`
        },
          React.createElement('div', { className: "p-4" },
            React.createElement('div', { className: "flex items-start justify-between mb-3" },
              React.createElement('div', {},
                React.createElement('h3', { className: "text-lg font-semibold text-gray-800 flex items-center gap-2" },
                  building.name,
                  isLowProduction && React.createElement(AlertCircle, { className: "text-red-500", size: 20 })
                ),
                React.createElement('p', { className: "text-sm text-gray-600" }, building.breed),
                React.createElement('p', { className: "text-sm text-gray-500" }, `${building.chickenCount} poules`)
              ),
              React.createElement('div', { className: "text-right" },
                React.createElement('p', { className: "text-sm text-gray-600" }, `Taux: ${buildingRate}%`),
                React.createElement('p', { className: "text-xs text-gray-500" }, `Total: ${todayEggs}`)
              )
            ),
            
            React.createElement('div', { className: "space-y-3" },
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', {},
                  React.createElement('label', { className: "block text-sm font-medium text-orange-700 mb-1" }, "🌅 Matin"),
                  React.createElement('input', {
                    type: "number",
                    value: getEggCount(building.id, selectedDate, 'matin'),
                    onChange: (e) => recordEggs(building.id, e.target.value, 'matin'),
                    className: "w-full border rounded-lg px-3 py-2 text-center font-bold bg-orange-50",
                    placeholder: "0"
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', { className: "block text-sm font-medium text-blue-700 mb-1" }, "🌙 Soir"),
                  React.createElement('input', {
                    type: "number",
                    value: getEggCount(building.id, selectedDate, 'soir'),
                    onChange: (e) => recordEggs(building.id, e.target.value, 'soir'),
                    className: "w-full border rounded-lg px-3 py-2 text-center font-bold bg-blue-50",
                    placeholder: "0"
                  })
                )
              ),
              
              React.createElement('div', { className: "bg-green-50 rounded-lg p-2 text-center" },
                React.createElement('p', { className: "text-sm text-green-700" }, "Total Journée"),
                React.createElement('p', { className: "text-xl font-bold text-green-800" }, todayEggs)
              ),
              
              React.createElement('div', { className: "grid grid-cols-2 gap-4 pt-3 border-t" },
                React.createElement('div', {},
                  React.createElement('p', { className: "text-xs text-gray-500" }, "Cette semaine"),
                  React.createElement('p', { className: "font-semibold" }, `${weeklyEggs} œufs`)
                ),
                React.createElement('div', {},
                  React.createElement('p', { className: "text-xs text-gray-500" }, "Moyenne attendue"),
                  React.createElement('p', { className: "font-semibold" }, `${building.avgEggsPerDay}/jour`)
                )
              )
            )
          )
        );
      })
    ),

    // Aperçu hebdomadaire
    React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
      React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Production des 7 derniers jours"),
      React.createElement('div', { className: "grid grid-cols-7 gap-2" },
        ...dailyTotals.map((day, index) =>
          React.createElement('div', { key: index, className: "text-center" },
            React.createElement('div', { className: "text-xs text-gray-600 mb-1" }, day.displayDate),
            React.createElement('div', { className: "space-y-1" },
              React.createElement('div', { className: "bg-orange-100 rounded p-1" },
                React.createElement('div', { className: "text-sm font-bold text-orange-800" }, day.matin),
                React.createElement('div', { className: "text-xs text-orange-600" }, "matin")
              ),
              React.createElement('div', { className: "bg-blue-100 rounded p-1" },
                React.createElement('div', { className: "text-sm font-bold text-blue-800" }, day.soir),
                React.createElement('div', { className: "text-xs text-blue-600" }, "soir")
              ),
              React.createElement('div', { className: "bg-green-100 rounded p-1" },
                React.createElement('div', { className: "text-sm font-bold text-green-800" }, day.total),
                React.createElement('div', { className: "text-xs text-green-600" }, "total")
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: "mt-4 p-4 bg-gray-50 rounded-lg" },
        React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center" },
          React.createElement('div', {},
            React.createElement('p', { className: "text-sm text-gray-600" }, "Moyenne/jour"),
            React.createElement('p', { className: "text-xl font-bold" }, (weeklyTotal / 7).toFixed(0))
          ),
          React.createElement('div', {},
            React.createElement('p', { className: "text-sm text-gray-600" }, "Meilleur jour"),
            React.createElement('p', { className: "text-xl font-bold" }, Math.max(...dailyTotals.map(d => d.total)))
          ),
          React.createElement('div', {},
            React.createElement('p', { className: "text-sm text-gray-600" }, "Production moy/poule"),
            React.createElement('p', { className: "text-xl font-bold" }, (weeklyTotal / totalChickens / 7).toFixed(2))
          ),
          React.createElement('div', {},
            React.createElement('p', { className: "text-sm text-gray-600" }, "Efficacité"),
            React.createElement('p', { className: "text-xl font-bold" }, `${((weeklyTotal / totalChickens / 7) * 100).toFixed(0)}%`)
          )
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(LargeScaleEggTracker), document.getElementById('root'));