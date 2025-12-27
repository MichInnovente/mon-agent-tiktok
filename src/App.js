import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

// URL CORRIGÉE : Utilise bien le "l" minuscule comme indiqué sur ton Sheety
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
        console.error("Erreur de chargement:", error);
      }
    };
    fetchAgents();
  }, []);

  const handleGenerate = async () => {
    if (!selectedAgent || !prompt) return;
    setLoading(true);
    setResult(null);
    
    try {
      // Envoi forcé vers Make (mode no-cors pour éviter les blocages de sécurité)
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

      setResult("✅ Signal envoyé ! Vérifie ton Google Sheets d'ici 1 minute.");
      setPrompt('');
    } catch (error) {
      setResult("❌ Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto font-sans">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" /> Générateur TikTok Pro
          </h1>
          <p className="text-gray-600 mt-2">Connecté à votre Google Sheets</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {agents.length > 0 ? (
            agents.map((agent, index) => (
              <button
                key={index}
                onClick={() => setSelectedAgent(agent)}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  selectedAgent?.name === agent.name 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-white bg-white shadow-sm'
                }`}
              >
                <span className="text-4xl mb-2">{agent.icon || '🤖'}</span>
                <span className="font-bold">{agent.name}</span>
                <span className="text-xs text-gray-500">{agent.role}</span>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Loader2 className="animate-spin mx-auto text-purple-600 mb-2" />
              <p className="text-gray-500">Chargement des agents depuis Sheets...</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="De quoi doit parler le script ?"
            className="w-full h-32 p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedAgent || !prompt}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {loading ? "Traitement..." : "Lancer la création du script"}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-bold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
