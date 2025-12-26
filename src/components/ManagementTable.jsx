import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Trash2, Edit3, Check, X,
  ExternalLink, Copy, Image, FileText,
  ChevronDown, ChevronUp, Filter
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
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
      title: '',
      postText: '',
      imageUrl: '',
      productUrl: '',
      affiliateUrl: '',
      status: 'draft',
      type: 'product',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
    setEditingField('title');
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
    const statusOrder = ['draft', 'ready', 'posted'];
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

  // ソート
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const statusLabels = {
    draft: { label: '下書き', color: 'bg-gray-600 text-gray-200' },
    ready: { label: '準備完了', color: 'bg-yellow-600 text-yellow-100' },
    posted: { label: '投稿済み', color: 'bg-green-600 text-green-100' },
  };

  const typeLabels = {
    product: { label: '商品紹介', icon: '🛒' },
    text_only: { label: 'テキストのみ', icon: '📝' },
    image_only: { label: '画像のみ', icon: '🖼️' },
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

      {/* フィルター */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">フィルター:</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'すべて' },
            { value: 'draft', label: '下書き' },
            { value: 'ready', label: '準備完了' },
            { value: 'posted', label: '投稿済み' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* テーブル */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <ClipboardList className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">まだアイテムがありません</p>
          <p className="text-xs text-gray-600 mt-1">「新規追加」から投稿を管理しましょう</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-12">#</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">タイトル</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-32">タイプ</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">投稿文</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-24">ステータス</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-700 hover:bg-gray-750 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                  >
                    {/* 番号 */}
                    <td className="py-3 px-4 text-gray-500">
                      {index + 1}
                    </td>

                    {/* タイトル */}
                    <td className="py-3 px-4">
                      {editingId === item.id && editingField === 'title' ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
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
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={item.title ? 'text-white' : 'text-gray-500 italic'}>
                            {item.title || '(タイトルなし)'}
                          </span>
                          <button
                            onClick={() => startEdit(item.id, 'title', item.title)}
                            className="p-1 text-gray-400 hover:text-amber-400 opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* タイプ */}
                    <td className="py-3 px-4">
                      <select
                        value={item.type || 'product'}
                        onChange={(e) => updateField(item.id, 'type', e.target.value)}
                        className="bg-gray-700 border-0 rounded px-2 py-1 text-xs text-white cursor-pointer"
                      >
                        <option value="product">🛒 商品紹介</option>
                        <option value="text_only">📝 テキストのみ</option>
                        <option value="image_only">🖼️ 画像のみ</option>
                      </select>
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
                        <div className="flex items-start gap-2">
                          <p className={`text-sm line-clamp-2 max-w-xs ${item.postText ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                            {item.postText || '(投稿文なし)'}
                          </p>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEdit(item.id, 'postText', item.postText)}
                              className="p-1 text-gray-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {item.postText && (
                              <button
                                onClick={() => copyToClipboard(item.postText, item.id)}
                                className="p-1 text-gray-400 hover:text-cyan-400"
                              >
                                {copied === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
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

                    {/* 操作 */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteItem(item.id)}
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
  );
}
