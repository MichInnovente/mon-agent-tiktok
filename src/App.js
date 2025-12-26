import React, { useState } from 'react';
import { Play, Pause, Settings, Plus, Trash2, Video, Edit3, Zap, Download, Upload, Copy, CheckCircle, ExternalLink } from 'lucide-react';

export default function SocialContentAgents() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Agent Tech & IA',
      platform: 'tiktok',
      topics: 'Intelligence artificielle, nouvelles technologies, gadgets innovants',
      tone: 'informatif',
      frequency: 'daily',
      active: true,
      hashtags: '#IA #Tech #Innovation #TikTokTech'
    },
    {
      id: 2,
      name: 'Agent Motivation',
      platform: 'youtube',
      topics: 'Citations inspirantes, développement personnel, success stories',
      tone: 'inspirant',
      frequency: 'daily',
      active: true,
      hashtags: '#Motivation #Success #Mindset #Inspiration'
    },
    {
      id: 3,
      name: 'Agent Comedy',
      platform: 'tiktok',
      topics: 'Situations du quotidien, sketches courts, humour relateable',
      tone: 'humoristique',
      frequency: 'biweekly',
      active: true,
      hashtags: '#Humour #Comedy #Funny #LOL'
    }
  ]);

  const [showAddAgent, setShowAddAgent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([
    {
      id: 100,
      agentName: 'Agent Tech & IA',
      platform: 'tiktok',
      script: `🎬 HOOK (0-3s):
"ChatGPT vient de sortir une fonctionnalité qui va tout changer..."

📱 CONTENU (3-45s):
La nouvelle mise à jour permet maintenant de générer des vidéos complètes à partir d'un simple texte ! Imagine : tu écris "un chat qui fait du skateboard" et BOOM, tu as ta vidéo en 30 secondes.

Les créateurs de contenu vont pouvoir multiplier leur production par 10. Plus besoin de filmer, tout est généré par l'IA.

Mais attention : est-ce que ça va remplacer les vrais créateurs ? Pas sûr, car l'authenticité compte toujours plus.

🎯 CALL-TO-ACTION (45-60s):
Dis-moi en commentaire si tu testerais cette techno ! Et suis pour plus d'actus IA 🚀`,
      hashtags: '#IA #Tech #Innovation #TikTokTech',
      title: 'ChatGPT génère des vidéos maintenant !',
      timestamp: new Date().toLocaleString('fr-FR')
    }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showWebhookSetup, setShowWebhookSetup] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);

  const [newAgent, setNewAgent] = useState({
    name: '',
    platform: 'tiktok',
    topics: '',
    tone: 'informatif',
    frequency: 'daily',
    active: true,
    hashtags: ''
  });

  const addAgent = () => {
    if (newAgent.name && newAgent.topics) {
      setAgents([...agents, { ...newAgent, id: Date.now() }]);
      setNewAgent({
        name: '',
        platform: 'tiktok',
        topics: '',
        tone: 'informatif',
        frequency: 'daily',
        active: true,
        hashtags: ''
      });
      setShowAddAgent(false);
    }
  };

  const deleteAgent = (id) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  const toggleAgent = (id) => {
    setAgents(agents.map(a => a.id === id ? {...a, active: !a.active} : a));
  };

  const generateContent = async (agent) => {
    setIsGenerating(true);
    
    const prompt = `Crée un script de vidéo ${agent.platform === 'tiktok' ? 'TikTok (30-60 secondes)' : 'YouTube Shorts (60 secondes)'} sur le sujet: ${agent.topics}. 

Ton: ${agent.tone}. 

Structure OBLIGATOIRE:
🎬 HOOK (0-3s): Une phrase ultra-accrocheuse qui fait arrêter le scroll
📱 CONTENU (3-50s): Le contenu principal avec des faits, des exemples concrets
🎯 CALL-TO-ACTION (50-60s): Appel à l'action clair

Aussi, crée un TITRE accrocheur de 60 caractères max pour la vidéo.

Utilise des emojis, sois dynamique et percutant !`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Extraire le titre si présent
      const titleMatch = content.match(/TITRE\s*[:：]\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Nouvelle vidéo ${agent.platform}`;
      const scriptContent = content.replace(/TITRE\s*[:：]\s*.+/i, '').trim();

      const newContent = {
        id: Date.now(),
        agentName: agent.name,
        platform: agent.platform,
        script: scriptContent,
        title: title,
        hashtags: agent.hashtags || '',
        timestamp: new Date().toLocaleString('fr-FR')
      };

      setGeneratedContent([newContent, ...generatedContent]);
      
      // Envoi automatique au webhook si configuré
      if (webhookUrl) {
        sendToWebhook(newContent);
      }
    } catch (error) {
      console.error("Erreur de génération:", error);
      alert("Erreur lors de la génération. Vérifie ta connexion.");
    }
    
    setIsGenerating(false);
  };

  const generateAllActive = () => {
    const activeAgents = agents.filter(a => a.active);
    activeAgents.forEach((agent, index) => {
      setTimeout(() => generateContent(agent), index * 3000);
    });
  };

  const exportToJSON = (content) => {
    const exportData = {
      platform: content.platform,
      title: content.title,
      description: content.script,
      hashtags: content.hashtags,
      agent: content.agentName,
      timestamp: content.timestamp,
      metadata: {
        duration: content.platform === 'tiktok' ? '30-60s' : '60s',
        format: 'vertical_9:16'
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_${content.platform}_${Date.now()}.json`;
    a.click();
  };

  const exportToCSV = () => {
    const headers = ['Plateforme', 'Titre', 'Script', 'Hashtags', 'Agent', 'Date'];
    const rows = generatedContent.map(c => [
      c.platform,
      c.title,
      c.script.replace(/\n/g, ' '),
      c.hashtags,
      c.agentName,
      c.timestamp
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_content_${Date.now()}.csv`;
    a.click();
  };

  const copyToClipboard = (content) => {
    const fullText = `${content.title}\n\n${content.script}\n\n${content.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(content.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendToWebhook = async (content) => {
    if (!webhookUrl) return;
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: content.platform,
          title: content.title,
          script: content.script,
          hashtags: content.hashtags,
          agent: content.agentName,
          timestamp: content.timestamp
        })
      });
      console.log('Envoyé au webhook avec succès');
    } catch (error) {
      console.error('Erreur webhook:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">🤖 Agents de Contenu Autonomes</h1>
          <p className="text-purple-200 text-lg">Système hybride avec export automatique & intégration Zapier/Make</p>
          <div className="mt-4 inline-block bg-green-500/20 border border-green-400 text-green-200 px-4 py-2 rounded-lg">
            ✅ MODE HYBRIDE - Export JSON, CSV, Webhook activés
          </div>
        </div>

        {/* Webhook Configuration - SUPER VISIBLE */}
        <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border-4 border-orange-400 shadow-2xl animate-pulse">
          <button
            onClick={() => setShowWebhookSetup(!showWebhookSetup)}
            className="w-full flex items-center justify-center gap-3 text-white font-bold text-2xl mb-3 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl transition"
          >
            <Zap className="w-8 h-8" />
            🔥 CLIQUE ICI - Configuration Make.com 🔥 {showWebhookSetup ? '▼' : '►'}
          </button>
          
          {showWebhookSetup && (
            <div className="mt-4 bg-white/10 rounded-xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">📍 COLLE TON URL WEBHOOK ICI :</h3>
              <p className="text-orange-200 text-base mb-4">
                ✅ Ton URL Make.com : <code className="bg-black/40 px-2 py-1 rounded text-green-300">https://hook.eu1.make.com/s07wlcxtflr8z74kkkm4jhhw74x3qybp</code>
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Colle ton URL ici..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-white/20 text-white px-6 py-4 rounded-xl border-2 border-white/30 placeholder-purple-300 text-lg"
                />
                <button
                  onClick={() => {
                    if (webhookUrl) {
                      setWebhookSaved(true);
                      setTimeout(() => setShowWebhookSetup(false), 2000);
                      alert('✅ WEBHOOK CONFIGURÉ AVEC SUCCÈS !\n\nMaintenant, clique sur "Générer Tout" pour tester !');
                    } else {
                      alert('❌ Colle d\'abord ton URL webhook !');
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-105"
                >
                  {webhookSaved ? '✅ SAUVEGARDÉ' : '💾 SAUVEGARDER'}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://zapier.com/apps/webhook/integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-200 text-sm flex items-center gap-1"
                >
                  📘 Guide Zapier <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.make.com/en/help/tools/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-200 text-sm flex items-center gap-1"
                >
                  📗 Guide Make.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {webhookSaved && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-400 rounded-xl p-4 text-center animate-bounce">
            <p className="text-green-200 font-bold text-xl">
              ✅ WEBHOOK CONNECTÉ ! Prêt à envoyer vers Make.com !
            </p>
          </div>
        )}

        {/* Boutons Actions Principales */}
        <div className="mb-6 flex gap-4 justify-center flex-wrap">
          <button
            onClick={generateAllActive}
            disabled={isGenerating}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-3 shadow-2xl transform hover:scale-105 transition"
          >
            <Zap className="w-6 h-6" />
            {isGenerating ? 'Génération...' : 'Générer Tout'}
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={generatedContent.length === 0}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-4 rounded-xl text-lg font-bold flex items-center gap-3 shadow-2xl transform hover:scale-105 transition"
          >
            <Download className="w-6 h-6" />
            Export CSV Complet
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Agents */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Mes Agents ({agents.filter(a => a.active).length} actifs)
              </h2>
              <button
                onClick={() => setShowAddAgent(!showAddAgent)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Nouveau
              </button>
            </div>

            {showAddAgent && (
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <input
                  type="text"
                  placeholder="Nom de l'agent"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20 placeholder-purple-300"
                />
                
                <select
                  value={newAgent.platform}
                  onChange={(e) => setNewAgent({...newAgent, platform: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20"
                >
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="youtube">▶️ YouTube Shorts</option>
                </select>

                <textarea
                  placeholder="Sujets à traiter"
                  value={newAgent.topics}
                  onChange={(e) => setNewAgent({...newAgent, topics: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20 h-24 placeholder-purple-300"
                />

                <input
                  type="text"
                  placeholder="Hashtags (ex: #Tech #IA)"
                  value={newAgent.hashtags}
                  onChange={(e) => setNewAgent({...newAgent, hashtags: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20 placeholder-purple-300"
                />

                <select
                  value={newAgent.tone}
                  onChange={(e) => setNewAgent({...newAgent, tone: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20"
                >
                  <option value="informatif">📚 Informatif</option>
                  <option value="humoristique">😂 Humoristique</option>
                  <option value="inspirant">💪 Inspirant</option>
                  <option value="educatif">🎓 Éducatif</option>
                </select>

                <select
                  value={newAgent.frequency}
                  onChange={(e) => setNewAgent({...newAgent, frequency: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3 border border-white/20"
                >
                  <option value="daily">📅 Quotidien</option>
                  <option value="weekly">📆 Hebdomadaire</option>
                  <option value="biweekly">🗓️ Bi-hebdomadaire</option>
                </select>

                <button
                  onClick={addAgent}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-bold"
                >
                  ✨ Créer l'Agent
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${agent.platform === 'tiktok' ? 'bg-pink-500/30 text-pink-200' : 'bg-red-500/30 text-red-200'}`}>
                        {agent.platform === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={`p-2 rounded-lg transition transform hover:scale-110 ${agent.active ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-300'}`}
                      >
                        {agent.active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/50 transition transform hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm mb-2">📝 {agent.topics}</p>
                  <p className="text-purple-300 text-xs mb-2">🏷️ {agent.hashtags}</p>
                  <p className="text-purple-300 text-xs mb-3">Ton: {agent.tone} • Fréquence: {agent.frequency}</p>
                  <button
                    onClick={() => generateContent(agent)}
                    disabled={isGenerating || !agent.active}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105 font-semibold"
                  >
                    <Video className="w-4 h-4" />
                    {isGenerating ? '⏳ Génération...' : '🚀 Générer'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Contenu Généré */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              Contenu Généré ({generatedContent.length})
            </h2>

            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {generatedContent.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-200">Génère du contenu pour commencer !</p>
                </div>
              ) : (
                generatedContent.map(content => (
                  <div key={content.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{content.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${content.platform === 'tiktok' ? 'bg-pink-500/30 text-pink-200' : 'bg-red-500/30 text-red-200'}`}>
                            {content.platform === 'tiktok' ? 'TikTok' : 'YouTube'}
                          </span>
                          <span className="text-xs text-purple-300">{content.agentName}</span>
                        </div>
                      </div>
                      <span className="text-xs text-purple-300">{content.timestamp}</span>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3 text-white text-sm whitespace-pre-wrap font-mono border border-purple-500/30 mb-3 max-h-60 overflow-y-auto">
                      {content.script}
                    </div>
                    
                    <div className="bg-blue-500/10 rounded-lg p-2 mb-3">
                      <p className="text-blue-200 text-xs">{content.hashtags}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => copyToClipboard(content)}
                        className="flex-1 p-2 bg-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/50 transition flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        {copiedId === content.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedId === content.id ? 'Copié !' : 'Copier'}
                      </button>
                      <button
                        onClick={() => exportToJSON(content)}
                        className="flex-1 p-2 bg-green-500/30 text-green-200 rounded-lg hover:bg-green-500/50 transition flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        JSON
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Guide Intégration */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            🔗 Guide d'Intégration Automatique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-orange-300 font-bold mb-2">1️⃣ Zapier/Make.com</p>
              <p className="text-purple-200 mb-2">Configure un webhook pour recevoir automatiquement chaque contenu généré</p>
              <p className="text-xs text-purple-300">Connexion directe vers tes plateformes</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-green-300 font-bold mb-2">2️⃣ Export JSON</p>
              <p className="text-purple-200 mb-2">Exporte chaque contenu au format JSON pour l'importer dans tes outils</p>
              <p className="text-xs text-purple-300">Compatible avec Buffer, Hootsuite, etc.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-blue-300 font-bold mb-2">3️⃣ Copier/Coller</p>
              <p className="text-purple-200 mb-2">Copie le contenu complet (titre + script + hashtags) en un clic</p>
              <p className="text-xs text-purple-300">Prêt à coller dans TikTok/YouTube</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
