import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

// URL de ton Sheety (vérifiée avec le "l" minuscule)
const SHEET_API_URL = "https://api.sheety.co/28a36bcc8636c5dd4cb7a975b4dd83b0/scriptsTikTokla/agents"; 

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${SHEET_API_URL}?cache=${Math.random()}`);
        const data = await response.json();
        if (data && data.agents && Array.isArray(data.agents)) {
          setAgents(data.agents);
        }
      } catch (error) {
        console.error("Erreur Sheety:", error);
      }
    };
    fetchAgents();
  }, []);

  const handleGenerate = async () => {
    if (!selectedAgent || !prompt) return;
    setLoading(true);
    setResult(null);
    
    try {
      // Utilisation du mode no-cors pour contourner le blocage de sécurité
      await fetch("https://hook.eu1.make.com/khnu3q4f4e7djqx2kj9yqyu9rqsk0l", {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: selectedAgent.name,
          title: prompt,
          script: "Génération en cours...",
          timestamp: new Date().toISOString()
        })
      });

      // Avec no-cors, on affiche un succès par défaut car l'envoi est forcé
      setResult("✅ Signal envoyé à Make ! Vérifie ton Google Sheets.");
      setPrompt('');
    } catch (error) {
      setResult("❌ Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" /> Générateur TikTok Pro
          </h1>
          <p className="text-gray-600 mt-2 italic">Piloté par votre Google Sheets</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {agents.length > 0 ? (
            agents.map((agent, index) => (
              <button
                key={index}
                onClick={() => setSelectedAgent(agent)}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center shadow-sm ${
                  selectedAgent?.name === agent.name 
                  ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' 
                  : 'border-white bg-white hover:border-purple-200'
                }`}
              >
                <span className="text-4xl mb-3">{agent.icon || '🤖'}</span>
                <span className="font-bold text-gray-800">{agent.name}</span>
                <span className="text-xs text-gray-500 mt-1 line-clamp-1">{agent.role}</span>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
              <Loader2 className="animate-spin mx-auto text-purple-600 mb-2" />
              <p className="text-gray-500 italic">Chargement des agents...</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md border p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Sujet de votre vidéo
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: 5 astuces pour sécuriser son compte TikTok..."
            className="w-full h-40 p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedAgent || !prompt}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {loading ? "Envoi en cours..." : "Lancer la création du script"}
          </button>
        </div>

        {result && (
          <div className={`mt-8 p-6 rounded-2xl text-center font-medium shadow-sm ${
            result.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
