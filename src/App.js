import React, { useState } from 'react';

function App() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Agent Humour', topic: 'Les chats' },
    { id: 2, name: 'Agent Business', topic: 'Le Bitcoin' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://hook.eu1.make.com/khnu3q4f4e7djqx2kj9yqyu9rqsk0lc8');

  const generateWithAI = async () => {
    setIsGenerating(true);
    
    // On récupère ta clé cachée dans Vercel
    const apiKey = process.env.REACT_APP_GROQ_API_KEY;

    for (const agent of agents) {
      try {
        // 1. Appel à l'IA (Groq)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: `Tu es ${agent.name}. Rédige un script TikTok court et viral.` },
              { role: "user", content: `Sujet : ${agent.topic}` }
            ]
          })
        });

        const data = await response.json();
        const aiScript = data.choices[0].message.content;

        // 2. Envoi vers Make.com
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName: agent.name,
            topic: agent.topic,
            script: aiScript,
            date: new Date().toISOString()
          })
        });

      } catch (error) {
        console.error("Erreur avec l'agent " + agent.name, error);
      }
    }
    
    setIsGenerating(false);
    alert("Tous les scripts ont été générés par l'IA et envoyés à Make !");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mon Générateur de Scripts IA</h1>
      <button 
        onClick={generateWithAI} 
        disabled={isGenerating}
        style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {isGenerating ? 'IA en cours de rédaction...' : '🚀 Générer avec la vraie IA'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Agents actifs :</h3>
        {agents.map(a => <p key={a.id}>✅ {a.name} (Sujet: {a.topic})</p>)}
      </div>
    </div>
  );
}

export default App;
