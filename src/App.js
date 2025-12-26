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
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showWebhookSetup, setShowWebhookSetup] = useState(false);
 const [webhookUrl, setWebhookUrl] = useState('https://hook.eu1.make.com/khnu3q4f4e7djqx2kj9yqyu9rqsk0lc8');
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
        name: '', platform: 'tiktok', topics: '', tone: 'informatif', frequency: 'daily', active: true, hashtags: ''
      });
      setShowAddAgent(false);
    }
  };

  const deleteAgent = (id) => setAgents(agents.filter(a => a.id !== id));
  const toggleAgent = (id) => setAgents(agents.map(a => a.id === id ? {...a, active: !a.active} : a));

  const sendToWebhook = async (content) => {
    if (!webhookUrl) return;
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(content)
      });
      if (response.ok) console.log('✅ Envoyé à Make');
    } catch (error) {
      console.error('Erreur webhook:', error);
    }
  };

  const generateContent = async (agent) => {
    setIsGenerating(true);
    // Simulation de génération (car la clé API Anthropic ne doit pas être exposée côté client)
    setTimeout(() => {
      const newContent = {
        id: Date.now(),
        agentName: agent.name,
        platform: agent.platform,
        title: `Nouveau contenu pour ${agent.name}`,
        script: `🎬 HOOK: Super news sur ${agent.topics} !\n\n📱 CONTENU: Voici pourquoi c'est important...\n\n🎯 CTA: Abonne-toi !`,
        hashtags: agent.hashtags || '',
        timestamp: new Date().toLocaleString('fr-FR')
      };
      setGeneratedContent(prev => [newContent, ...prev]);
      if (webhookUrl) sendToWebhook(newContent);
      setIsGenerating(false);
    }, 1500);
  };

  const generateAllActive = () => {
    const activeAgents = agents.filter(a => a.active);
    activeAgents.forEach((agent, index) => {
      setTimeout(() => generateContent(agent), index * 2000);
    });
  };

  const copyToClipboard = (content) => {
    const fullText = `${content.title}\n\n${content.script}\n\n${content.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(content.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['Plateforme', 'Titre', 'Script', 'Hashtags', 'Agent', 'Date'];
    const rows = generatedContent.map(c => [c.platform, c.title, c.script.replace(/\n/g, ' '), c.hashtags, c.agentName, c.timestamp]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scripts_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">🤖 Agents de Contenu</h1>
          <div className="mt-4 inline-block bg-green-500/20 border border-green-400 text-green-200 px-4 py-2 rounded-lg">
            ✅ SYSTÈME OPÉRATIONNEL
          </div>
        </div>

        {/* Webhook Setup */}
        <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-6 border-4 border-orange-400 shadow-2xl">
          <button onClick={() => setShowWebhookSetup(!showWebhookSetup)} className="w-full flex items-center justify-center gap-3 text-white font-bold text-2xl mb-3 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl transition">
            <Zap className="w-8 h-8" /> 🔥 CONFIGURATION MAKE.COM {showWebhookSetup ? '▼' : '►'}
          </button>
          {showWebhookSetup && (
            <div className="mt-4 bg-white/10 rounded-xl p-6">
              <input type="text" placeholder="Colle ton URL Make ici..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full bg-white/20 text-white px-6 py-4 rounded-xl border-2 border-white/30 mb-4" />
              <button onClick={() => { setWebhookSaved(true); alert('Lien enregistré !'); }} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold">💾 SAUVEGARDER</button>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          <button onClick={generateAllActive} disabled={isGenerating} className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transform hover:scale-105 transition">
            <Zap className="w-6 h-6" /> {isGenerating ? 'Génération...' : 'Générer Tout'}
          </button>
          <button onClick={exportToCSV} className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transform hover:scale-105 transition">
            <Download className="w-6 h-6" /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Agents */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="w-6 h-6" /> Mes Agents</h2>
            <div className="space-y-4">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-white font-bold">{agent.name}</h3>
                    <div className="flex gap-2">
                       <button onClick={() => toggleAgent(agent.id)} className="p-1 bg-white/10 rounded text-white">{agent.active ? <Pause size={16}/> : <Play size={16}/>}</button>
                       <button onClick={() => deleteAgent(agent.id)} className="p-1 bg-red-500/20 text-red-200 rounded"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <button onClick={() => generateContent(agent)} disabled={isGenerating || !agent.active} className="w-full bg-purple-500 text-white py-2 rounded-lg mt-2">🚀 Générer</button>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Contenu */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Edit3 className="w-6 h-6" /> Contenu</h2>
            <div className="space-y-4">
              {generatedContent.map(content => (
                <div key={content.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-bold mb-2">{content.title}</h4>
                  <pre className="text-xs text-purple-200 whitespace-pre-wrap mb-3">{content.script}</pre>
                  <button onClick={() => copyToClipboard(content)} className="w-full bg-blue-500/40 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                    {copiedId === content.id ? <CheckCircle size={16}/> : <Copy size={16}/>} Copier
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
