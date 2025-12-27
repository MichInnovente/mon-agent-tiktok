import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const SHEET_API_URL = "https://api.sheety.co/28a36bcc8636c5dd4cb7a975b4dd83b0/scriptsTikTokIa/agents"; 

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();
        if (data && data.agents) {
          setAgents(data.agents);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    fetchAgents();
  }, []);

  const handleGenerate = async () => {
    if (!selectedAgent || !prompt) return;
    setLoading(true);
    try {
      const response = await fetch("https://hook.eu1.make.com/khnu3q4f4e7djqx2kj9yqyu9rqsk0l", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: selectedAgent.name,
          title: prompt,
          script: "Génération en cours...",
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        setResult("Script généré et envoyé vers Google Sheets !");
      }
    } catch (error) {
      setResult("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" /> Générateur TikTok Pro
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {agents.map((agent, index) => (
            <button
              key={index}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedAgent?.name === agent.name ? 'border-purple-600 bg-purple-50' : 'border-white bg-white'
              }`}
            >
              <span className="text-3xl mb-2 block">{agent.icon}</span>
              <span className="font-semibold">{agent.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="De quoi doit parler le script ?"
            className="w-full h-32 p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedAgent}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Générer avec la vraie IA
          </button>
        </div>

        {result && <div className="mt-8 p-6 bg-green-50 text-green-700 rounded-2xl border border-green-200">{result}</div>}
      </div>
    </div>
  );
}

export default App;
