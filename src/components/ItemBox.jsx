import React, { useState, useEffect } from 'react';
import {
  Sword, Key, Scroll, Gem,
  Download, Copy, Eye, EyeOff,
  X, Plus, ExternalLink, Check,
  Image, Trash2, User, Edit3, CheckSquare, Square
} from 'lucide-react';

const STORAGE_KEY = 'threads-affiliate-itembox';

export default function ItemBox() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [copied, setCopied] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [researchModal, setResearchModal] = useState(null);

  // 調査報告書用の状態
  const [newResearchUrl, setNewResearchUrl] = useState('');
  const [newResearchBuzz, setNewResearchBuzz] = useState('');
  const [editingRakutenId, setEditingRakutenId] = useState(null);
  const [editingRakutenUrl, setEditingRakutenUrl] = useState('');

  // アイテムBOXデータ
  const [itemData, setItemData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      equipment: {
        iconUrl: null,
        introduction: '',
      },
      keys: {
        threadsId: '',
        threadsPass: '',
        instagramId: '',
        instagramPass: '',
        rakutenId: '',
      },
      research: [],
      materials: [],
    };
  });

  // localStorage保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemData));
  }, [itemData]);

  // コピー機能
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // 画像ダウンロード
  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(url, '_blank');
    }
  };

  // 秘密の鍵更新
  const updateKeys = (field, value) => {
    setItemData(prev => ({
      ...prev,
      keys: {
        ...prev.keys,
        [field]: value,
      }
    }));
  };

  // リサーチ追加
  const addResearch = () => {
    if (!newResearchUrl.trim()) return;

    const newResearch = {
      id: Date.now(),
      threadsUrl: newResearchUrl.trim(),
      buzzCount: parseInt(newResearchBuzz) || 0,
      rakutenUrl: '',
      isRoomRegistered: false,
      createdAt: new Date().toISOString(),
    };
    setItemData(prev => ({
      ...prev,
      research: [newResearch, ...prev.research],
    }));
    setNewResearchUrl('');
    setNewResearchBuzz('');
  };

  // リサーチ削除
  const deleteResearch = (id) => {
    if (window.confirm('この調査報告書を削除しますか？')) {
      setItemData(prev => ({
        ...prev,
        research: prev.research.filter(r => r.id !== id),
      }));
    }
  };

  // 楽天URL更新
  const updateRakutenUrl = (id) => {
    setItemData(prev => ({
      ...prev,
      research: prev.research.map(r =>
        r.id === id ? { ...r, rakutenUrl: editingRakutenUrl } : r
      ),
    }));
    setEditingRakutenId(null);
    setEditingRakutenUrl('');
  };

  // ROOM登録状態の切り替え
  const toggleRoomRegistered = (id) => {
    setItemData(prev => ({
      ...prev,
      research: prev.research.map(r =>
        r.id === id ? { ...r, isRoomRegistered: !r.isRoomRegistered } : r
      ),
    }));
  };

  // 素材削除
  const deleteMaterial = (id) => {
    if (window.confirm('この素材を削除しますか？')) {
      setItemData(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.id !== id),
      }));
    }
  };

  const tabs = [
    { id: 'equipment', label: '装備', icon: '⚔️' },
    { id: 'keys', label: '秘密の鍵', icon: '🔑' },
    { id: 'research', label: '調査報告書', icon: '📜' },
    { id: 'materials', label: '素材倉庫', icon: '💎' },
  ];

  // 空の状態コンポーネント
  const EmptyState = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm">まだアイテムがありません</p>
      {message && <p className="text-xs text-gray-600 mt-1">{message}</p>}
    </div>
  );

  return (
    <div className="flex-1 bg-gray-900 min-h-screen overflow-auto">
      {/* ヘッダー */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎒</span>
          <div>
            <h1 className="text-xl font-bold text-white">冒険のカバン</h1>
            <p className="text-sm text-gray-400">集めたアイテムを管理しよう</p>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        {/* ⚔️ 装備タブ */}
        {activeTab === 'equipment' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* アイコン */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                アイコン画像
              </h3>
              {itemData.equipment.iconUrl ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden">
                    <img src={itemData.equipment.iconUrl} alt="icon" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => downloadImage(itemData.equipment.iconUrl, 'threads-icon.png')}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm text-white transition-all"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-500">まだアイテムがありません</span>
                </div>
              )}
            </div>

            {/* 紹介文 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                紹介文
              </h3>
              {itemData.equipment.introduction ? (
                <div>
                  <p className="text-gray-300 bg-gray-750 rounded-lg p-4 whitespace-pre-wrap">
                    {itemData.equipment.introduction}
                  </p>
                  <button
                    onClick={() => copyToClipboard(itemData.equipment.introduction, 'intro')}
                    className="flex items-center gap-2 mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm text-white transition-all"
                  >
                    {copied === 'intro' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === 'intro' ? 'コピーしました' : 'コピー'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">まだアイテムがありません</p>
              )}
            </div>
          </div>
        )}

        {/* 🔑 秘密の鍵タブ */}
        {activeTab === 'keys' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Threads */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs text-white font-bold">@</span>
                <h3 className="font-semibold text-white">Threads</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ユーザーID</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={itemData.keys.threadsId}
                    onChange={(e) => updateKeys('threadsId', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">パスワード</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={itemData.keys.threadsPass}
                      onChange={(e) => updateKeys('threadsPass', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Image className="w-3.5 h-3.5 text-white" />
                </span>
                <h3 className="font-semibold text-white">Instagram</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ユーザーID</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={itemData.keys.instagramId}
                    onChange={(e) => updateKeys('instagramId', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">パスワード</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={itemData.keys.instagramPass}
                      onChange={(e) => updateKeys('instagramPass', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 楽天アフィリエイトID */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-xs text-white font-bold">R</span>
                <h3 className="font-semibold text-white">楽天アフィリエイト</h3>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">アフィリエイトID</label>
                <input
                  type="text"
                  placeholder="アフィリエイトID"
                  value={itemData.keys.rakutenId}
                  onChange={(e) => updateKeys('rakutenId', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 📜 調査報告書タブ */}
        {activeTab === 'research' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 新規追加フォーム */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                新規追加
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Threads投稿URL"
                  value={newResearchUrl}
                  onChange={(e) => setNewResearchUrl(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="バズリ数"
                  value={newResearchBuzz}
                  onChange={(e) => setNewResearchBuzz(e.target.value)}
                  className="w-28 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={addResearch}
                  disabled={!newResearchUrl.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  追加
                </button>
              </div>
            </div>

            {/* テーブル一覧 */}
            {itemData.research.length === 0 ? (
              <EmptyState icon="📜" message="バズ投稿を追加してリサーチしよう" />
            ) : (
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-750 border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium border-r border-gray-600">投稿URL</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium border-r border-gray-600 w-24">バズリ数</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium border-r border-gray-600">商品URL</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium border-r border-gray-600 w-28">ROOM登録</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium border-r border-gray-600 w-36">追加日</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemData.research.map((research, index) => (
                        <tr
                          key={research.id}
                          className={`border-b border-gray-700 hover:bg-gray-750 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                        >
                          {/* 投稿URL */}
                          <td className="py-3 px-4 border-r border-gray-700">
                            <a
                              href={research.threadsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate max-w-xs"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{research.threadsUrl}</span>
                            </a>
                          </td>

                          {/* バズリ数 */}
                          <td className="py-3 px-4 text-center border-r border-gray-700">
                            <span className="font-bold text-amber-400">{research.buzzCount.toLocaleString()}</span>
                          </td>

                          {/* 商品URL */}
                          <td className="py-3 px-4 border-r border-gray-700">
                            {editingRakutenId === research.id ? (
                              <div className="flex gap-1 items-center">
                                <input
                                  type="text"
                                  placeholder="商品URLを入力"
                                  value={editingRakutenUrl}
                                  onChange={(e) => setEditingRakutenUrl(e.target.value)}
                                  className="flex-1 min-w-0 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateRakutenUrl(research.id)}
                                  className="p-1 text-green-400 hover:bg-gray-600 rounded"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setEditingRakutenId(null); setEditingRakutenUrl(''); }}
                                  className="p-1 text-gray-400 hover:bg-gray-600 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : research.rakutenUrl ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={research.rakutenUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate max-w-xs"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{research.rakutenUrl}</span>
                                </a>
                                <button
                                  onClick={() => { setEditingRakutenId(research.id); setEditingRakutenUrl(research.rakutenUrl); }}
                                  className="p-1 text-gray-400 hover:text-amber-400 hover:bg-gray-600 rounded flex-shrink-0"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingRakutenId(research.id); setEditingRakutenUrl(''); }}
                                className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                追加
                              </button>
                            )}
                          </td>

                          {/* ROOM登録 */}
                          <td className="py-3 px-4 text-center border-r border-gray-700">
                            <button
                              onClick={() => toggleRoomRegistered(research.id)}
                              className={`flex items-center justify-center gap-1 mx-auto ${
                                research.isRoomRegistered ? 'text-green-400' : 'text-gray-400 hover:text-amber-400'
                              }`}
                            >
                              {research.isRoomRegistered ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>

                          {/* 追加日 */}
                          <td className="py-3 px-4 text-center text-gray-400 text-xs border-r border-gray-700">
                            {new Date(research.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>

                          {/* 操作 */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteResearch(research.id)}
                              className="p-1.5 text-red-400 hover:bg-gray-700 rounded"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 💎 素材倉庫タブ */}
        {activeTab === 'materials' && (
          <div className="max-w-4xl mx-auto">
            {itemData.materials.length === 0 ? (
              <EmptyState icon="💎" message="投稿文や画像がここに保存されます" />
            ) : (
              <div className="space-y-4">
                {itemData.materials.map(material => (
                  <div
                    key={material.id}
                    className="bg-gray-800 rounded-xl p-4 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm text-gray-400">
                        {new Date(material.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      <button
                        onClick={() => deleteMaterial(material.id)}
                        className="p-1 text-red-400 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 投稿文 */}
                    {material.content && (
                      <div className="mb-3">
                        <p className="text-gray-300 bg-gray-750 rounded-lg p-3 whitespace-pre-wrap text-sm">
                          {material.content}
                        </p>
                        <button
                          onClick={() => copyToClipboard(material.content, `material-${material.id}`)}
                          className="flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          {copied === `material-${material.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === `material-${material.id}` ? 'コピーしました' : 'コピー'}
                        </button>
                      </div>
                    )}

                    {/* 画像 */}
                    {material.imageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-700 overflow-hidden">
                          <img src={material.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => downloadImage(material.imageUrl, `material-image-${material.id}.png`)}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          <Download className="w-3 h-3" />
                          ダウンロード
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* リサーチモーダル（フルスクリーン） */}
      {researchModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-xl">📜</span>
                <h2 className="text-lg font-bold text-white">{researchModal.title}</h2>
              </div>
              <button
                onClick={() => setResearchModal(null)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-all"
              >
                <X className="w-4 h-4" />
                閉じる
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="flex-1 overflow-auto p-6">
              {researchModal.data && researchModal.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">アカウント</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">フォロワー</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">ジャンル</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">メモ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchModal.data.map((item, index) => (
                        <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-750">
                          <td className="py-3 px-4 text-white">{item.account || '-'}</td>
                          <td className="py-3 px-4 text-white">{item.followers || '-'}</td>
                          <td className="py-3 px-4 text-white">{item.genre || '-'}</td>
                          <td className="py-3 px-4 text-gray-400">{item.memo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="📜" message="データを追加してください" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
