import { useState } from "react";
import { useTheme } from "@/context";
import { Header } from "@/components/common";

export const TasbihPage = () => {
  const { darkMode } = useTheme();
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [vibrate, setVibrate] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const dhikrList = [
    { 
      id: 0,
      arabic: "سُبْحَانَ اللَّٰهِ", 
      latin: "Subhanallah", 
      meaning: "Maha Suci Allah",
      target: 33,
      color: "from-blue-500 to-blue-600"
    },
    { 
      id: 1,
      arabic: "اَلْحَمْدُ لِلَّٰهِ", 
      latin: "Alhamdulillah", 
      meaning: "Segala Puji Bagi Allah",
      target: 33,
      color: "from-green-500 to-green-600"
    },
    { 
      id: 2,
      arabic: "اَللَّٰهُ أَكْبَرُ", 
      latin: "Allahu Akbar", 
      meaning: "Allah Maha Besar",
      target: 34,
      color: "from-purple-500 to-purple-600"
    },
    { 
      id: 3,
      arabic: "لَا إِلَٰهَ إِلَّا اللَّٰهُ", 
      latin: "La ilaha illallah", 
      meaning: "Tiada Tuhan Selain Allah",
      target: 100,
      color: "from-amber-500 to-amber-600"
    },
    { 
      id: 4,
      arabic: "أَسْتَغْفِرُ اللَّٰهَ", 
      latin: "Astaghfirullah", 
      meaning: "Aku Memohon Ampun kepada Allah",
      target: 100,
      color: "from-rose-500 to-rose-600"
    },
    { 
      id: 5,
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّٰهِ", 
      latin: "La hawla wa la quwwata illa billah", 
      meaning: "Tiada daya dan kekuatan kecuali dengan Allah",
      target: 33,
      color: "from-teal-500 to-teal-600"
    }
  ];

  const currentDhikr = dhikrList[selectedDhikr];

  const handleCount = () => {
    if (vibrate && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    const newCount = count + 1;
    setCount(newCount);
    setTotalToday(totalToday + 1);
    
    if (newCount === currentDhikr.target) {
      setShowCelebration(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleSelectDhikr = (index) => {
    setSelectedDhikr(index);
    setCount(0);
  };

  const progress = (count / currentDhikr.target) * 100;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="tasbih-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Dhikr Selector */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-4 shadow-sm mb-6 overflow-x-auto`}>
          <div className="flex space-x-2 min-w-max">
            {dhikrList.map((dhikr, index) => (
              <button
                key={dhikr.id}
                onClick={() => handleSelectDhikr(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedDhikr === index
                    ? `bg-gradient-to-r ${dhikr.color} text-white shadow-lg`
                    : darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {dhikr.latin}
              </button>
            ))}
          </div>
        </div>

        {/* Main Counter */}
        <div className={`bg-gradient-to-br ${currentDhikr.color} rounded-3xl p-8 text-white shadow-xl mb-6 relative overflow-hidden`}>
          {/* Celebration Effect */}
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <div className="text-center animate-bounce">
                <span className="text-6xl">🎉</span>
                <p className="text-2xl font-bold mt-2">Alhamdulillah!</p>
                <p className="text-lg">Target tercapai!</p>
              </div>
            </div>
          )}
          
          {/* Arabic Text */}
          <div className="text-center mb-6">
            <p className="text-4xl md:text-5xl font-arabic mb-3" style={{ fontFamily: "'Amiri', serif" }}>
              {currentDhikr.arabic}
            </p>
            <p className="text-xl font-semibold">{currentDhikr.latin}</p>
            <p className="text-white/80 text-sm mt-1">{currentDhikr.meaning}</p>
          </div>
          
          {/* Counter Display */}
          <div className="text-center mb-8">
            <div className="text-8xl md:text-9xl font-bold mb-2">
              {count}
            </div>
            <p className="text-white/80">
              Target: {currentDhikr.target}x
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/30 rounded-full h-3 mb-6">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          
          {/* Count Button */}
          <button
            onClick={handleCount}
            data-testid="tasbih-tap-button"
            className="w-full py-6 bg-white/20 hover:bg-white/30 rounded-2xl text-2xl font-bold transition-all active:scale-95 backdrop-blur-sm"
          >
            TAP UNTUK MENGHITUNG
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleReset}
            data-testid="tasbih-reset-button"
            className={`py-4 rounded-xl font-semibold transition-colors ${
              darkMode 
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            }`}
          >
            🔄 Reset
          </button>
          <button
            onClick={() => setVibrate(!vibrate)}
            className={`py-4 rounded-xl font-semibold transition-colors ${
              darkMode 
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {vibrate ? "📳 Getar: ON" : "📴 Getar: OFF"}
          </button>
        </div>

        {/* Today's Stats */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl p-4 shadow-sm border`}>
          <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-3`}>
            📊 Statistik Hari Ini
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Dzikir</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{totalToday}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dzikir Sekarang</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{count}/{currentDhikr.target}</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`mt-6 p-4 rounded-xl ${darkMode ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-100"} border`}>
          <p className={`text-sm ${darkMode ? "text-green-300" : "text-green-700"}`}>
            💡 <strong>Tips:</strong> Dzikir setelah shalat: Subhanallah 33x, Alhamdulillah 33x, Allahu Akbar 34x = 100x
          </p>
        </div>
      </main>
    </div>
  );
};

export default TasbihPage;
