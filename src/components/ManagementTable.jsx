
import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Trash2, Edit3, Check, X,
  ExternalLink, Copy, Calendar, Link as LinkIcon, Sparkles, Search, DownloadCloud, Image as ImageIcon, UploadCloud
} from 'lucide-react';

const STORAGE_KEY = 'threads-affiliate-management';

export default function ManagementTable(props) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 検索関連のState (廃止)
  // const [searchKeyword, setSearchKeyword] = useState('');
  // const [isSearching, setIsSearching] = useState(false);

  // Threads検索して自動追加 (廃止)
  // const searchAndImport = async () => { ... };

  // Gemini APIで投稿文を生成
  const generatePostText = async (item) => {
    // 必須チェック（どれか一つあればOKにする柔軟性を持たせるが、最低限のネタは必要）
    if (!item.buzzUrl && !item.rakutenUrl && !item.referenceText && !item.image) {
      alert('情報を入力してください（URL、参考テキスト、画像のいずれか）');
      return;
    }

    setIsGenerating(true);
    try {
      // 共通設定からプロンプトを取得 (1-5: AI生成指示設定)
      const globalCustomPrompt = props.userData?.['1-5']?.globalCustomPrompt;
      // 個別のcustomPromptは廃止したが、念のため後方互換でチェック（または無視）
      // ここではGlobal設定を優先利用する

      // 画像が設定されている場合、Base64に変換
      let imageBase64 = null;
      if (item.image instanceof File) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(item.image);
        });
      } else if (typeof item.image === 'string' && item.image.startsWith('data:')) {
        // 既にBase64文字列の場合
        imageBase64 = item.image;
      }

      const response = await fetch('http://localhost:3001/api/generate-post-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style: item.postStyle || 'rewrite',
          referenceText: item.referenceText || '',
          customPrompt: globalCustomPrompt || '', // 共通設定を送信
          modelName: props.userData?.['1-5']?.modelName || 'gemini-1.5-pro', // モデル指定 (デフォルト: 1.5 Pro)
          rakutenUrl: item.rakutenUrl || '',
          image: imageBase64,
          characterSettings: props.userData // ペルソナ情報全体も送る
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (Array.isArray(data.text)) {
          // 3パターン返ってきた場合
          updateField(item.id, 'candidates', data.text);
          // デフォルトで最初のパターンを入れておく（または空にして選択させる）
          // updateField(item.id, 'postText', data.text[0].text);
          alert('3つのパターンが生成されました！好みのものを選択してください。');
        } else {
          // 文字列で返ってきた場合（フォールバック）
          updateField(item.id, 'postText', data.text);
          alert('投稿文を生成しました！');
        }
      } else {
        alert('生成に失敗しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // localStorage保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // 新規アイテム追加
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      buzzUrl: '',       // バズった投稿URL
      rakutenUrl: '',    // 楽天商品URL
      referenceText: '', // 参考テキスト（バズ構文メモなど）
      customPrompt: '',  // カスタム指示（プロンプト）
      postStyle: 'rewrite', // 投稿スタイル
      image: null,       // アップロード画像
      postText: '',      // 投稿文
      candidates: [],    // 生成された候補リスト
      scheduleTime: '',  // 投稿予定日時
      status: 'draft',
      type: 'product',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
    setEditingField('buzzUrl');
    setEditValue('');
  };

  // アイテム削除
  const deleteItem = (id) => {
    if (window.confirm('このアイテムを削除しますか?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // フィールド更新
  const updateField = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, [field]: value, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  // 編集完了
  const saveEdit = () => {
    if (editingId && editingField) {
      updateField(editingId, editingField, editValue);
    }
    setEditingId(null);
    setEditingField(null);
    setEditValue('');
  };

  // 編集開始
  const startEdit = (id, field, currentValue) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  // ステータス変更
  const toggleStatus = (id, currentStatus) => {
    const statusOrder = ['draft', 'ready', 'scheduled', 'posted'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateField(id, 'status', nextStatus);
  };

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

  // フィルタリング
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const statusLabels = {
    draft: { label: '下書き', color: 'bg-gray-600 text-gray-200' },
    ready: { label: '準備完了', color: 'bg-yellow-600 text-yellow-100' },
    scheduled: { label: '予約済み', color: 'bg-purple-600 text-purple-100' },
    posted: { label: '投稿済み', color: 'bg-green-600 text-green-100' },
  };

  // URL入力フィールドのレンダリングヘルパー
  const renderUrlField = (item, field, placeholder, icon) => {
    const isEditing = editingId === item.id && editingField === field;
    const value = item[field];

    if (isEditing) {
      return (
        <div className="flex gap-1 items-center min-w-[200px]">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          />
          <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-gray-600 rounded">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditingId(null); setEditingField(null); }} className="p-1 text-gray-400 hover:bg-gray-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group max-w-[200px]">
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline truncate text-xs flex items-center gap-1"
          >
            {icon}
            {value}
          </a>
        ) : (
          <span className="text-gray-600 text-xs italic truncate">{placeholder}</span>
        )}
        <button
          onClick={() => startEdit(item.id, field, value)}
          className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-900 min-h-screen overflow-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">一元管理表</h1>
          <span className="text-sm text-gray-400">({items.length}件)</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 検索機能は廃止されました */}
          <button
            onClick={addItem}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            新規追加
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-750 border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-12">No.</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-64">バズ投稿URL / 生成設定</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-64">楽天商品URL / 画像</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">投稿文 (生成予定)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-48">投稿予定日時</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-24">ステータス</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium w-16">削除</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-700 hover:bg-gray-750 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                >
                  <td className="py-3 px-4 text-gray-500">{items.length - index}</td>

                  {/* バズ投稿URL / 参考文 */}
                  <td className="py-3 px-4 space-y-2">
                    {renderUrlField(item, 'buzzUrl', 'スレッズ投稿URL...', <LinkIcon className="w-3 h-3" />)}

                    {/* 参考テキストエリア */}
                    {editingId === item.id && editingField === 'referenceText' ? (
                      <div className="flex gap-1 items-start min-w-[200px]">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs resize-none"
                          rows={2}
                          autoFocus
                          placeholder="参考にする文章..."
                        />
                        <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-gray-600 rounded"><Check className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div
                        className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 truncate max-w-[200px] border-t border-gray-700 pt-1 mt-1"
                        onClick={() => startEdit(item.id, 'referenceText', item.referenceText)}
                      >
                        {item.referenceText || '＋参考メモを追加'}
                      </div>
                    )}

                    {/* AI生成ボタン & カスタム指示 (編集中でない場合のみ表示) */}
                    {(!editingId || editingId !== item.id) && (
                      <div className="mt-4 border-t border-gray-700 pt-2 space-y-2">
                        {/* スタイル選択 & 生成ボタン */}
                        <div className="flex items-center gap-2 justify-between">
                          <select
                            value={item.postStyle || 'rewrite'}
                            onChange={(e) => updateField(item.id, 'postStyle', e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-gray-300 text-xs rounded px-1 py-1 outline-none focus:border-blue-500 max-w-[120px]"
                          >
                            <option value="rewrite">構造トレース</option>
                            <option value="empathy">共感・ネタ</option>
                            <option value="review">商品レビュー</option>
                          </select>

                          <button
                            onClick={() => generatePostText(item)}
                            disabled={isGenerating}
                            className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-all ${isGenerating
                              ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                              : 'bg-purple-900/30 text-purple-300 border-purple-500/30 hover:bg-purple-900/50 hover:text-purple-200'
                              }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {isGenerating ? '...' : '生成'}
                          </button>
                        </div>
                        {item.postStyle === 'rewrite' && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            ※「やることリスト 1-5」の設定を使用します
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* 楽天商品URL / 画像 */}
                  <td className="py-3 px-4 space-y-2">
                    {renderUrlField(item, 'rakutenUrl', '楽天商品URL...', < ExternalLink className="w-3 h-3" />)}

                    {/* 画像アップロード */}
                    <div className="flex items-center gap-2 mt-1">
                      <label className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all">
                        <ImageIcon className="w-3 h-3" />
                        <span>{item.image ? '画像あり' : '画像追加'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // ファイルオブジェクトを直接保存（シリアライズできないので注意が必要だが、今回は簡易的に）
                              // 本来はBase64化してStateに入れるか、一時保存すべき
                              updateField(item.id, 'image', file);
                            }
                          }}
                        />
                      </label>
                      {item.image && (
                        <button
                          onClick={() => updateField(item.id, 'image', null)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* 投稿文 */}
                  <td className="py-3 px-4">
                    {editingId === item.id && editingField === 'postText' ? (
                      <div className="flex gap-1 items-start">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm resize-none"
                          rows={2}
                          autoFocus
                          placeholder="AIで生成、または手動入力..."
                        />
                        <div className="flex flex-col gap-1">
                          <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-gray-600 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingId(null); setEditingField(null); }} className="p-1 text-gray-400 hover:bg-gray-600 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <p
                          className={`text-sm line-clamp-2 cursor-pointer p-1 rounded hover:bg-gray-700 ${item.postText ? 'text-gray-300' : 'text-gray-600 italic'}`}
                          onClick={() => startEdit(item.id, 'postText', item.postText)}
                        >
                          {item.postText || 'クリックして投稿文を入力...'}
                        </p>
                      </div>
                    )}

                    {/* 候補選択UI */}
                    {item.candidates && item.candidates.length > 0 && (!editingId || editingId !== item.id) && (
                      <div className="mt-2 space-y-2">
                        <div className="text-[10px] text-gray-500 font-medium">✨ 生成された候補 (クリックで採用)</div>
                        <div className="space-y-1">
                          {item.candidates.map((cand, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                updateField(item.id, 'postText', cand.text);
                                // 採用したら候補はクリアしてもいいが、再選択できるように残す
                              }}
                              className="w-full text-left p-2 rounded bg-gray-800 border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-blue-300">{cand.title}</span>
                                {item.postText === cand.text && <Check className="w-3 h-3 text-green-500" />}
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-200">{cand.text}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 投稿予定日時 */}
                  < td className="py-3 px-4" >
                    {editingId === item.id && editingField === 'scheduleTime' ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="datetime-local"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                        />
                        <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-gray-600 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => startEdit(item.id, 'scheduleTime', item.scheduleTime)}
                      >
                        <Calendar className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                        <span className={item.scheduleTime ? 'text-white' : 'text-gray-600 italic'}>
                          {item.scheduleTime ? new Date(item.scheduleTime).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未設定'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* ステータス */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[item.status]?.color || statusLabels.draft.color}`}
                    >
                      {statusLabels[item.status]?.label || '下書き'}
                    </button>
                  </td>

                  {/* 削除 */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    アイテムがありません。「新規追加」ボタンを押して始めましょう。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div >
    </div >
  );
}
