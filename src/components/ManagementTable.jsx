
import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Trash2, Edit3, Check, X,
  ExternalLink, Copy, Calendar, Link as LinkIcon
} from 'lucide-react';

const STORAGE_KEY = 'threads-affiliate-management';

export default function ManagementTable() {
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
      postText: '',      // 投稿文
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
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          新規追加
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-750 border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-12">No.</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-64">バズ投稿URL (参考)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-64">楽天商品URL</th>
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

                  {/* バズ投稿URL */}
                  <td className="py-3 px-4">
                    {renderUrlField(item, 'buzzUrl', 'スレッズ投稿URLを入力...', <LinkIcon className="w-3 h-3" />)}
                  </td>

                  {/* 楽天商品URL */}
                  <td className="py-3 px-4">
                    {renderUrlField(item, 'rakutenUrl', '楽天商品URLを入力...', <ExternalLink className="w-3 h-3" />)}
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
                  </td>

                  {/* 投稿予定日時 */}
                  <td className="py-3 px-4">
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
      </div>
    </div>
  );
}
