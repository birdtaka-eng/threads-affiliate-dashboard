import React, { useState, useEffect, useCallback } from 'react';
import { X, HelpCircle, Check, AlertTriangle, Sparkles, Image, Download, Plus, Trash2, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PhaseDetail from './components/PhaseDetail';
import ItemBox from './components/ItemBox';
import { stepFormConfigs, initialPhases, STORAGE_KEYS } from './data/config';

// URLテーブルコンポーネント
function URLTableField({ field, value, onChange, placeholder }) {
  const [newUrl, setNewUrl] = useState('');
  const urls = Array.isArray(value) ? value : [];

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl && !urls.includes(trimmedUrl)) {
      onChange([...urls, trimmedUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  };

  return (
    <div className="space-y-3">
      {/* URL入力欄 */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'URLを入力...'}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={addUrl}
          disabled={!newUrl.trim()}
          className={`px-4 py-2 rounded-lg flex items-center gap-1 font-medium transition-all ${
            newUrl.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {/* URLテーブル */}
      {urls.length > 0 && (
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 w-12">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">投稿URL</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 w-16">削除</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {urls.map((url, index) => (
                <tr key={index} className="hover:bg-gray-750">
                  <td className="px-3 py-2 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 break-all"
                    >
                      <span className="truncate max-w-md">{url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeUrl(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-all"
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
      )}

      {urls.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <p className="text-sm">URLを追加してください</p>
        </div>
      )}

      {/* カウント表示 */}
      <div className="text-xs text-gray-400">
        登録済み: {urls.length}件
      </div>
    </div>
  );
}

// 楽天商品URL + ROOMチェックボックス テーブルコンポーネント
function RakutenProductTable({ value, onChange, placeholder }) {
  const [newUrl, setNewUrl] = useState('');
  const products = Array.isArray(value) ? value : [];

  const addProduct = () => {
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl && !products.some(p => p.url === trimmedUrl)) {
      onChange([...products, { url: trimmedUrl, roomRegistered: false }]);
      setNewUrl('');
    }
  };

  const removeProduct = (index) => {
    onChange(products.filter((_, i) => i !== index));
  };

  const toggleRoomRegistered = (index) => {
    onChange(products.map((p, i) =>
      i === index ? { ...p, roomRegistered: !p.roomRegistered } : p
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProduct();
    }
  };

  const registeredCount = products.filter(p => p.roomRegistered).length;

  return (
    <div className="space-y-3">
      {/* URL入力欄 */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'https://item.rakuten.co.jp/...'}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={addProduct}
          disabled={!newUrl.trim()}
          className={`px-4 py-2 rounded-lg flex items-center gap-1 font-medium transition-all ${
            newUrl.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {/* 商品テーブル */}
      {products.length > 0 && (
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 w-12">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">楽天商品URL</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 w-28">ROOMに登録</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 w-16">削除</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product, index) => (
                <tr
                  key={index}
                  className={`transition-all ${product.roomRegistered ? 'bg-green-900/20 opacity-60' : 'hover:bg-gray-750'}`}
                >
                  <td className="px-3 py-2 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm flex items-center gap-1 break-all ${product.roomRegistered ? 'text-green-400/70' : 'text-blue-400 hover:text-blue-300'}`}
                    >
                      <span className="truncate max-w-md">{product.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.roomRegistered || false}
                        onChange={() => toggleRoomRegistered(index)}
                        className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className={`text-xs ${product.roomRegistered ? 'text-green-400' : 'text-gray-500'}`}>
                        {product.roomRegistered ? '済み' : '未'}
                      </span>
                    </label>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeProduct(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-all"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-700 px-3 py-2 text-xs text-gray-400 flex justify-between">
            <span>ROOM登録: {registeredCount} / {products.length}件</span>
            {registeredCount === products.length && products.length > 0 && (
              <span className="text-green-400">✓ 全て完了!</span>
            )}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <p className="text-sm">楽天商品URLを追加してください</p>
        </div>
      )}
    </div>
  );
}

// バズ投稿URL → 楽天商品URL マッピングテーブル
function BuzzToRakutenTable({ buzzUrls, value, onChange, placeholder }) {
  const mapping = value || {};

  const updateMapping = (index, field, newValue) => {
    onChange({
      ...mapping,
      [index]: {
        ...mapping[index],
        [field]: newValue,
      },
    });
  };

  const registeredCount = buzzUrls.filter((_, index) => mapping[index]?.roomRegistered).length;

  if (buzzUrls.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
        <p className="text-sm">📜 調査報告書でURLを追加してください</p>
        <p className="text-xs mt-1 text-gray-600">リサーチ → 商品候補リストアップ で登録できます</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border border-gray-600 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 w-10">#</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">バズ投稿URL</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">楽天商品URL</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-400 w-24">ROOM登録</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {buzzUrls.map((buzzUrl, index) => {
              const rowData = mapping[index] || {};
              const isRegistered = rowData.roomRegistered;
              return (
                <tr
                  key={index}
                  className={`transition-all ${isRegistered ? 'bg-green-900/20 opacity-70' : 'hover:bg-gray-750'}`}
                >
                  <td className="px-2 py-2 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-2 py-2">
                    <a
                      href={buzzUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs flex items-center gap-1 ${isRegistered ? 'text-green-400/70' : 'text-blue-400 hover:text-blue-300'}`}
                    >
                      <span className="truncate max-w-[180px]">{buzzUrl}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="url"
                        value={rowData.rakutenUrl || ''}
                        onChange={(e) => updateMapping(index, 'rakutenUrl', e.target.value)}
                        placeholder={placeholder || 'https://item.rakuten.co.jp/...'}
                        className={`flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isRegistered ? 'text-green-400/70' : 'text-white'}`}
                      />
                      {rowData.rakutenUrl && (
                        <a
                          href={rowData.rakutenUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-900/30 rounded transition-all flex-shrink-0"
                          title="楽天ページを開く"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRegistered || false}
                        onChange={() => updateMapping(index, 'roomRegistered', !isRegistered)}
                        className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className={`text-xs ${isRegistered ? 'text-green-400' : 'text-gray-500'}`}>
                        {isRegistered ? '済' : '未'}
                      </span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="bg-gray-700 px-3 py-2 text-xs text-gray-400 flex justify-between">
          <span>ROOM登録: {registeredCount} / {buzzUrls.length}件</span>
          {registeredCount === buzzUrls.length && buzzUrls.length > 0 && (
            <span className="text-green-400">✓ 全て完了!</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [phases, setPhases] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHASES);
    if (saved) {
      // localStorageから読み込んだデータにiconと新しいステップを復元
      const savedPhases = JSON.parse(saved);
      return initialPhases.map((initialPhase) => {
        const savedPhase = savedPhases.find(p => p.id === initialPhase.id);
        if (!savedPhase) return initialPhase;

        // 保存されたステップと新規ステップをマージ
        const mergedSteps = initialPhase.steps.map((initialStep) => {
          const savedStep = savedPhase.steps.find(s => s.id === initialStep.id);
          return savedStep ? { ...initialStep, status: savedStep.status } : initialStep;
        });

        return {
          ...initialPhase,
          steps: mergedSteps,
        };
      });
    }
    return initialPhases;
  });
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE);
    return saved || 'beginner';
  });
  const [showPatterns, setShowPatterns] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  const [showItemBox, setShowItemBox] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedStepId, setExpandedStepId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [showHints, setShowHints] = useState(() => {
    const saved = localStorage.getItem('threads-affiliate-showHints');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [openExplanation, setOpenExplanation] = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [showIntroSection, setShowIntroSection] = useState(true);
  const [generatedProfiles, setGeneratedProfiles] = useState([]);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [isGeneratingIcons, setIsGeneratingIcons] = useState(false);

  // ユーザー入力データ
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return saved ? JSON.parse(saved) : {};
  });

  // アカウント情報
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : [];
  });
  const [editingAccount, setEditingAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({ service: '', userId: '', password: '', memo: '' });

  // localStorageに自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHASES, JSON.stringify(phases));
  }, [phases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('threads-affiliate-showHints', JSON.stringify(showHints));
  }, [showHints]);

  // ユーザーデータを更新
  const updateUserData = useCallback((stepId, fieldId, value) => {
    setUserData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldId]: value,
      }
    }));
  }, []);

  // ステップのデータをリセット（やり直す）
  const resetStepData = (stepId) => {
    setUserData(prev => {
      const newData = { ...prev };
      delete newData[stepId];
      return newData;
    });
    updateStepStatus(stepId, 'pending');
  };

  // 全設定をリセット
  const resetAllSettings = () => {
    if (window.confirm('全ての設定をリセットしますか？入力内容が全て削除されます。')) {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PHASES);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.MODE);
      setUserData({});
      setPhases(initialPhases);
      setAccounts([]);
      setMode('beginner');
      setSelectedStep(null);
      setShowIntroSection(true);
    }
  };

  // アカウント追加
  const addAccount = () => {
    if (!newAccount.service) return;
    setAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]);
    setNewAccount({ service: '', userId: '', password: '', memo: '' });
  };

  // アカウント更新
  const updateAccount = (id, updates) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
  };

  // アカウント削除
  const deleteAccount = (id) => {
    if (window.confirm('このアカウント情報を削除しますか？')) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  // ステップの状態を更新
  const updateStepStatus = (stepId, newStatus) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      steps: phase.steps.map(step =>
        step.id === stepId ? { ...step, status: newStatus } : step
      )
    })));
  };

  // ステップを完了にする
  const completeStep = (stepId) => {
    updateStepStatus(stepId, 'completed');
    unlockNextStep(stepId);
    setExpandedStepId(null);

    // 達成ポップアップを表示
    const messages = [
      '🎮 QUEST CLEAR!',
      '⭐ LEVEL UP!',
      '🏆 MISSION COMPLETE!',
      '✨ NICE WORK!',
      '🌟 GREAT JOB!',
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setAchievement({ message: randomMessage, type: 'complete' });

    // 2秒後に非表示
    setTimeout(() => setAchievement(null), 2000);
  };

  // ステップをスキップする
  const skipStep = (stepId) => {
    updateStepStatus(stepId, 'skipped');
    unlockNextStep(stepId);
    setExpandedStepId(null);
  };

  // 次のステップをアンロック
  const unlockNextStep = (stepId) => {
    let foundCurrent = false;
    phases.forEach(phase => {
      phase.steps.forEach(step => {
        if (foundCurrent && step.status === 'locked') {
          updateStepStatus(step.id, 'pending');
          foundCurrent = false;
        }
        if (step.id === stepId) foundCurrent = true;
      });
    });
  };

  // 進捗率を計算
  const calculateProgress = () => {
    const allSteps = phases.flatMap(p => p.steps);
    const completed = allSteps.filter(s => s.status === 'completed').length;
    return Math.round((completed / allSteps.length) * 100);
  };

  // プロフィール自動生成（10パターン）
  const generateProfile = () => {
    const step11 = userData['1-1'] || {};
    const step12 = userData['1-2'] || {};
    const step13 = userData['1-3'] || {};

    const name = step13.characterName || 'なまえ';
    const title = step13.title || '';
    const genre = step11.selectedGenre || 'ライフスタイル';
    const empathy = step13.empathyPoint || '';
    const authority = step13.authority || '';
    const tone = step13.tone || 'fun';
    const targetAge = step12.targetAge || '20-30';
    const targetGender = step12.targetGender === 'male' ? '男性' : step12.targetGender === 'female' ? '女性' : 'みんな';
    const target = `${targetAge}代${targetGender}`;

    const isFun = tone === 'fun';

    // 10パターンのテンプレート
    const templates = [
      // パターン1: シンプル権威性重視
      {
        accountName: `${name}｜${title || genre + 'の人'}`,
        profile: [
          authority ? (isFun ? `${authority}😳` : authority) : null,
          isFun ? `${genre}好きが本当に良かったものだけ紹介✨` : `${genre}好きが本当に良かったものだけ紹介`,
          empathy || null,
        ].filter(Boolean).join('\n')
      },
      // パターン2: フレンドリー
      {
        accountName: `${name}｜${title || genre + 'の人'}`,
        profile: [
          authority ? (isFun ? `\\${authority}/` : authority) : null,
          isFun ? `${name}です！${genre}のこと語らせて♡` : `${name}です。${genre}について発信中`,
          isFun ? `${target}さん一緒に楽しもう！` : `${target}の方に向けて発信しています`,
        ].filter(Boolean).join('\n')
      },
      // パターン3: スタンダード
      {
        accountName: `${name}｜${title || genre + 'の人'}`,
        profile: [
          empathy || null,
          isFun ? `${target}向けに${genre}を毎日発信中！` : `${target}向けに${genre}を毎日発信中`,
          isFun ? `仲良くしてね♡` : `フォローお待ちしています`,
        ].filter(Boolean).join('\n')
      },
      // パターン4: オタク系
      {
        accountName: isFun ? `${genre}オタクの${name}` : `${name}｜${genre}専門`,
        profile: [
          authority || null,
          isFun ? `使って良かったものを本音レビュー🔍` : `使って良かったものを本音でレビュー`,
          empathy || null,
        ].filter(Boolean).join('\n')
      },
      // パターン5: 自信系
      {
        accountName: `${name}`,
        profile: [
          empathy || null,
          isFun ? `だから${genre}には詳しいよ！` : `${genre}に詳しいです`,
          isFun ? `フォローして損させません✨` : `有益な情報をお届けします`,
        ].filter(Boolean).join('\n')
      },
      // パターン6: 実績アピール
      {
        accountName: `${name}｜${title || genre + 'マニア'}`,
        profile: [
          authority ? (isFun ? `【${authority}】` : authority) : null,
          isFun ? `${genre}の最新情報をお届け📢` : `${genre}の最新情報をお届け`,
          isFun ? `${target}さんフォローしてね！` : `${target}の方はぜひフォローを`,
        ].filter(Boolean).join('\n')
      },
      // パターン7: 共感重視
      {
        accountName: `${name}｜${title || genre + '発信'}`,
        profile: [
          empathy || null,
          isFun ? `同じ悩みを持つあなたへ💕` : `同じ悩みを持つ方へ`,
          isFun ? `${genre}で人生変わりました！` : `${genre}で生活が変わりました`,
        ].filter(Boolean).join('\n')
      },
      // パターン8: プロフェッショナル
      {
        accountName: `${name}｜${title || genre + '情報'}`,
        profile: [
          authority || null,
          `${target}に向けて${genre}情報を発信`,
          isFun ? `気軽にフォローしてください🙌` : `お気軽にフォローください`,
        ].filter(Boolean).join('\n')
      },
      // パターン9: カジュアル
      {
        accountName: isFun ? `${name}🌸${genre}` : `${name}｜${genre}`,
        profile: [
          isFun ? `${genre}大好き${name}です💗` : `${genre}が好きな${name}です`,
          empathy || null,
          isFun ? `毎日おすすめ紹介してます！` : `毎日おすすめを紹介しています`,
        ].filter(Boolean).join('\n')
      },
      // パターン10: シンプル
      {
        accountName: `${name}｜${title || genre}`,
        profile: [
          authority || empathy || null,
          `${genre}を${target}向けに紹介`,
          isFun ? `いいね・フォローで応援してね♡` : `フォローよろしくお願いします`,
        ].filter(Boolean).join('\n')
      },
    ];

    setGeneratedProfiles(templates);
  };

  // パターン選択
  const selectProfile = (pattern) => {
    setUserData(prev => ({
      ...prev,
      '1-3': {
        ...prev['1-3'],
        accountName: pattern.accountName,
        fullProfile: pattern.profile,
      }
    }));
    setGeneratedProfiles([]);
  };

  // アイコン生成プロンプト作成（プレビュー用）
  const buildIconPrompt = () => {
    const step14 = userData['1-4'] || {};
    const kind = step14.characterKind || 'キャラクター';
    const expressionMap = {
      gentle: 'やさしい',
      energetic: '元気な',
      cool: 'クールな',
      friendly: '親しみやすい',
    };
    const expression = expressionMap[step14.expression] || 'やさしい';

    return `スレッズ用のSNSアイコン。色鉛筆で描いたシンプルでかわいい${kind}、${expression}雰囲気、単色背景、顔のアップ、ミニマル、丸いアイコン向け`;
  };

  // アイコン生成（DALL-E 3 API）
  const generateIcon = async () => {
    setIsGeneratingIcons(true);
    setGeneratedIcons([]);

    const step14 = userData['1-4'] || {};
    const characterKind = step14.characterKind || 'キャラクター';
    const expression = step14.expression || 'gentle';

    try {
      const response = await fetch('/api/generate-icon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterKind,
          expression,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アイコン生成に失敗しました');
      }

      if (data.success && data.images) {
        setGeneratedIcons(data.images);
      } else {
        throw new Error('画像データが取得できませんでした');
      }
    } catch (error) {
      console.error('Icon generation error:', error);
      alert(`エラー: ${error.message}`);
    } finally {
      setIsGeneratingIcons(false);
    }
  };

  // アイコン選択
  const selectIcon = (icon) => {
    setUserData(prev => ({
      ...prev,
      '1-4': {
        ...prev['1-4'],
        selectedIconId: icon.id,
        selectedIconUrl: icon.url,
      }
    }));
  };

  // アイコンダウンロード
  const downloadIcon = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `threads-icon-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // CORSエラーの場合は新しいタブで開く
      window.open(url, '_blank');
    }
  };

  // 説明ポップアップ - レンダー関数版
  const renderExplanationPopup = (field, onClose) => (
    <div className="mt-2 p-3 bg-blue-900/40 border border-blue-500/50 rounded-lg relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="pr-6">
        <p className="text-blue-200 text-sm leading-relaxed whitespace-pre-line">{field.explanation}</p>
      </div>
    </div>
  );

  // フォームフィールドレンダリング（RPG風：質問形式）- レンダー関数版
  const renderFormField = (field, stepId, data) => {
    const value = data?.[field.id] ?? '';
    const fieldKey = `${stepId}-${field.id}`;
    const isExplanationOpen = openExplanation === fieldKey;

    // showIfの条件をチェック
    if (field.showIf && !field.showIf(data)) {
      return null;
    }

    // 質問ラベル（showHintsがONで質問がある場合は質問を表示）
    const QuestionLabel = ({ className = "text-sm text-gray-300 mb-2" }) => (
      <div className={`flex items-start gap-2 ${className}`}>
        <span className="flex-1">
          {showHints && field.question ? (
            <span className="text-yellow-300">💬 {field.question}</span>
          ) : (
            field.label
          )}
        </span>
        {showHints && field.explanation && (
          <button
            onClick={() => setOpenExplanation(isExplanationOpen ? null : fieldKey)}
            className="text-blue-400 hover:text-blue-300 flex-shrink-0"
            title="詳しく見る"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    );

    switch (field.type) {
      case 'checkbox':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-all"
                 onClick={() => updateUserData(stepId, field.id, !value)}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateUserData(stepId, field.id, e.target.checked)}
                className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <div className="flex-1">
                {showHints && field.question ? (
                  <span className="text-yellow-300 text-sm">💬 {field.question}</span>
                ) : (
                  <span className={value ? 'text-green-400' : 'text-gray-300'}>{field.label}</span>
                )}
              </div>
              {showHints && field.explanation && (
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenExplanation(isExplanationOpen ? null : fieldKey); }}
                  className="text-blue-400 hover:text-blue-300"
                  title="詳しく見る"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
              {value && <Check className="w-4 h-4 text-green-500" />}
            </div>
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <input
              type="text"
              id={`input-${stepId}-${field.id}`}
              name={`${stepId}-${field.id}`}
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              placeholder={field.placeholder}
              autoComplete="off"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <textarea
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <select
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.difficulty ? ` (${opt.difficulty})` : ''}
                </option>
              ))}
            </select>
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
            {/* 選択肢に警告がある場合 */}
            {mode === 'beginner' && value && field.options.find(o => o.value === value)?.warning && (
              <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-400 text-sm">{field.options.find(o => o.value === value).warning}</span>
              </div>
            )}
          </div>
        );

      case 'number':
        const progress = field.target ? Math.min((value || 0) / field.target * 100, 100) : 0;
        return (
          <div className="space-y-2">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={value}
                onChange={(e) => updateUserData(stepId, field.id, parseInt(e.target.value) || 0)}
                min={field.min}
                max={field.max}
                className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {field.target && (
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{value || 0} / {field.target}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      case 'urlTable':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <URLTableField
              field={field}
              value={value}
              onChange={(newValue) => updateUserData(stepId, field.id, newValue)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'urlTableWithRoomCheck':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <RakutenProductTable
              value={value}
              onChange={(newValue) => updateUserData(stepId, field.id, newValue)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'buzzToRakutenTable':
        const buzzSourceData = userData[field.sourceStep] || {};
        const buzzUrls = Array.isArray(buzzSourceData[field.sourceField]) ? buzzSourceData[field.sourceField] : [];
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <BuzzToRakutenTable
              buzzUrls={buzzUrls}
              value={value}
              onChange={(newValue) => updateUserData(stepId, field.id, newValue)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'autoCount':
        const sourceValue = data?.[field.sourceField];
        const count = Array.isArray(sourceValue) ? sourceValue.length : 0;
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{count}</div>
              <div className="text-gray-400">件</div>
            </div>
          </div>
        );

      case 'readOnlyUrlTable':
        const sourceStepData = userData[field.sourceStep] || {};
        const urlList = Array.isArray(sourceStepData[field.sourceField]) ? sourceStepData[field.sourceField] : [];
        const roomRegistered = data?.roomRegistered || {};

        const toggleRoomRegistered = (index) => {
          const newRoomRegistered = { ...roomRegistered, [index]: !roomRegistered[index] };
          updateUserData(stepId, 'roomRegistered', newRoomRegistered);
        };

        const registeredCount = Object.values(roomRegistered).filter(Boolean).length;

        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && renderExplanationPopup(field, () => setOpenExplanation(null))}
            {urlList.length > 0 ? (
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 w-12">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">投稿URL</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 w-28">ROOM登録</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {urlList.map((url, index) => {
                      const isRegistered = roomRegistered[index];
                      return (
                        <tr key={index} className={`transition-all ${isRegistered ? 'bg-green-900/20 opacity-60' : 'hover:bg-gray-750'}`}>
                          <td className="px-3 py-2 text-sm text-gray-400">{index + 1}</td>
                          <td className="px-3 py-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm flex items-center gap-1 break-all ${isRegistered ? 'text-green-400/70' : 'text-blue-400 hover:text-blue-300'}`}
                            >
                              <span className="truncate max-w-md">{url}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <label className="flex items-center justify-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isRegistered || false}
                                onChange={() => toggleRoomRegistered(index)}
                                className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                              />
                              <span className={`text-xs ${isRegistered ? 'text-green-400' : 'text-gray-500'}`}>
                                {isRegistered ? '済み' : '未'}
                              </span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="bg-gray-700 px-3 py-2 text-xs text-gray-400 flex justify-between">
                  <span>登録済み: {registeredCount} / {urlList.length}件</span>
                  {registeredCount === urlList.length && urlList.length > 0 && (
                    <span className="text-green-400">✓ 全て完了!</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                <p className="text-sm">📜 調査報告書でURLを追加してください</p>
                <p className="text-xs mt-1 text-gray-600">リサーチ → 商品候補リストアップ で登録できます</p>
              </div>
            )}
            <div className="text-xs text-gray-400">
              登録済み: {urlList.length}件
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ステップフォームのレンダリング - レンダー関数版
  const renderStepForm = (stepId) => {
    const config = stepFormConfigs[stepId];
    const data = userData[stepId] || {};

    if (!config) return null;

    // 警告をチェック
    const activeWarnings = config.warnings?.filter(w => w.condition(data, mode)) || [];

    // プロフィール自動生成用の特別処理
    if (config.hasAutoGenerate) {
      const characterFields = config.fields.filter(f => f.section === 'character');
      const resultFields = config.fields.filter(f => f.section === 'result');
      const canGenerate = data.characterName && data.title;

      return (
        <div className="space-y-4 mt-6">
          <div className="border-t border-gray-700 pt-4">
            {/* 警告表示 */}
            {activeWarnings.map((warning, idx) => (
              <div
                key={idx}
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  warning.type === 'error'
                    ? 'bg-red-900/30 border border-red-500/50'
                    : 'bg-yellow-900/30 border border-yellow-500/50'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <span className={`text-sm ${warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {warning.message}
                </span>
              </div>
            ))}

            {/* キャラ設定セクション */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                キャラ設定
              </h4>
              <div className="space-y-3">
                {characterFields.map(field => (
                  <React.Fragment key={field.id}>
                    {renderFormField(field, stepId, data)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 自動生成ボタン */}
            <button
              onClick={generateProfile}
              disabled={!canGenerate}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                canGenerate
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              10パターン生成
            </button>
            {!canGenerate && (
              <p className="text-xs text-gray-500 text-center mt-2">
                名前・肩書きを入力すると生成できます
              </p>
            )}

            {/* パターン選択UI */}
            {generatedProfiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  10パターンから選択してください
                </h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                  {generatedProfiles.map((pattern, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectProfile(pattern)}
                      className="text-left p-4 bg-gray-800 border border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-750 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-purple-600/30 text-purple-400 px-2 py-0.5 rounded">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-white">{pattern.accountName}</span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{pattern.profile}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setGeneratedProfiles([])}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white transition-all"
                >
                  閉じる
                </button>
              </div>
            )}

            {/* 生成結果セクション */}
            {generatedProfiles.length === 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  生成結果（編集可能）
                </h4>
                <div className="space-y-3">
                  {resultFields.map(field => (
                    <React.Fragment key={field.id}>
                      {renderFormField(field, stepId, data)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* 完了チェック表示 */}
            {config.completionCheck && (
              <div className={`mt-4 p-3 rounded-lg ${
                config.completionCheck(data)
                  ? 'bg-green-900/30 border border-green-500/50'
                  : 'bg-gray-700/50 border border-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  {config.completionCheck(data) ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">入力完了！</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                      <span className="text-gray-400">必要な項目を入力してください</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // アイコン生成用の特別処理
    if (config.hasIconGenerator) {
      const generatorFields = config.fields.filter(f => f.section === 'generator');
      const completeFields = config.fields.filter(f => f.section === 'complete');
      const canGenerate = data.characterType && data.characterKind && data.expression;

      return (
        <div className="space-y-4 mt-6">
          <div className="border-t border-gray-700 pt-4">
            {/* アイコン生成セクション */}
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                アイコン生成
              </h4>
              <div className="space-y-3">
                {generatorFields.map(field => (
                  <React.Fragment key={field.id}>
                    {renderFormField(field, stepId, data)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 生成ボタン */}
            <button
              onClick={generateIcon}
              disabled={!canGenerate || isGeneratingIcons}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                canGenerate && !isGeneratingIcons
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGeneratingIcons ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Image className="w-5 h-5" />
                  4パターン生成
                </>
              )}
            </button>
            {!canGenerate && (
              <p className="text-xs text-gray-500 text-center mt-2">
                キャラタイプ・種類・雰囲気を入力すると生成できます
              </p>
            )}

            {/* 生成プロンプトプレビュー */}
            {canGenerate && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">生成プロンプト:</p>
                <p className="text-sm text-gray-300">{buildIconPrompt()}</p>
              </div>
            )}

            {/* 生成結果表示 */}
            {generatedIcons.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  生成結果（クリックで選択）
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {generatedIcons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => selectIcon(icon)}
                      className={`relative aspect-square bg-gray-700 rounded-lg border-2 transition-all flex items-center justify-center ${
                        data.selectedIconId === icon.id
                          ? 'border-cyan-500 ring-2 ring-cyan-500/50'
                          : 'border-gray-600 hover:border-cyan-400'
                      }`}
                    >
                      {icon.url ? (
                        <img src={icon.url} alt={`アイコン${icon.id}`} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center p-4">
                          <Image className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">パターン {icon.id}</p>
                          <p className="text-xs text-gray-600 mt-1">（API連携後に表示）</p>
                        </div>
                      )}
                      {data.selectedIconId === icon.id && (
                        <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {data.selectedIconId && data.selectedIconUrl && (
                  <button
                    className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center gap-2 text-white transition-all"
                    onClick={() => downloadIcon(data.selectedIconUrl)}
                  >
                    <Download className="w-4 h-4" />
                    選択したアイコンをダウンロード
                  </button>
                )}
              </div>
            )}

            {/* 完了チェック */}
            <div className="mt-4 space-y-3">
              {completeFields.map(field => (
                <React.Fragment key={field.id}>
                  {renderFormField(field, stepId, data)}
                </React.Fragment>
              ))}
            </div>

            {/* 完了チェック表示 */}
            {config.completionCheck && (
              <div className={`mt-4 p-3 rounded-lg ${
                config.completionCheck(data)
                  ? 'bg-green-900/30 border border-green-500/50'
                  : 'bg-gray-700/50 border border-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  {config.completionCheck(data) ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">入力完了！</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                      <span className="text-gray-400">Threadsにアイコンを設定したらチェック</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 通常のフォームレンダリング
    return (
      <div className="space-y-4 mt-6">
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            入力項目
          </h4>

          {/* 警告表示 */}
          {activeWarnings.map((warning, idx) => (
            <div
              key={idx}
              className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                warning.type === 'error'
                  ? 'bg-red-900/30 border border-red-500/50'
                  : 'bg-yellow-900/30 border border-yellow-500/50'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <span className={`text-sm ${warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                {warning.message}
              </span>
            </div>
          ))}

          <div className="space-y-3">
            {config.fields.map(field => (
              <React.Fragment key={field.id}>
                {renderFormField(field, stepId, data)}
              </React.Fragment>
            ))}
          </div>

          {/* 完了チェック表示 */}
          {config.completionCheck && (
            <div className={`mt-4 p-3 rounded-lg ${
              config.completionCheck(data)
                ? 'bg-green-900/30 border border-green-500/50'
                : 'bg-gray-700/50 border border-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                {config.completionCheck(data) ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-400">入力完了！</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                    <span className="text-gray-400">必要な項目を入力してください</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 達成ポップアップ */}
      {achievement && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="achievement-popup bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 px-8 py-6 rounded-lg shadow-2xl border-4 border-yellow-300">
            <div className="achievement-shine absolute inset-0 rounded-lg" />
            <div className="relative">
              <div className="pixel-font text-white text-2xl text-center drop-shadow-lg">
                {achievement.message}
              </div>
              <div className="flex justify-center mt-2 gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-200 sparkle" style={{ animationDelay: `${i * 0.1}s` }}>✦</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <Header
        mode={mode}
        setMode={setMode}
        showHints={showHints}
        setShowHints={setShowHints}
        resetAllSettings={resetAllSettings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        calculateProgress={calculateProgress}
        setAchievement={setAchievement}
      />

      {/* やることリストタブ */}
      {activeTab === 'tasks' && (
        <div className="flex">
          {/* サイドバー + アイテムBOX */}
          <div className="w-80 flex flex-col border-r border-gray-700">
            <Sidebar
              phases={phases}
              expandedPhase={expandedPhase}
              setExpandedPhase={setExpandedPhase}
              showIntroSection={showIntroSection}
              setShowIntroSection={setShowIntroSection}
              expandedStepId={expandedStepId}
              setExpandedStepId={setExpandedStepId}
              selectedStep={selectedStep}
              setSelectedStep={setSelectedStep}
              selectedFieldId={selectedFieldId}
              setSelectedFieldId={setSelectedFieldId}
              userData={userData}
              updateUserData={updateUserData}
              mode={mode}
              completeStep={completeStep}
              skipStep={skipStep}
              resetStepData={resetStepData}
              showPatterns={showPatterns}
              setShowPatterns={setShowPatterns}
              showModules={showModules}
              setShowModules={setShowModules}
              showSafetyInfo={showSafetyInfo}
              setShowSafetyInfo={setShowSafetyInfo}
              showItemBox={showItemBox}
              setShowItemBox={setShowItemBox}
            />
          </div>

          {/* メインコンテンツ */}
          {showItemBox ? (
            <ItemBox />
          ) : (
            <PhaseDetail
              showIntroSection={showIntroSection}
              setShowIntroSection={setShowIntroSection}
              setExpandedPhase={setExpandedPhase}
              setAchievement={setAchievement}
              showPatterns={showPatterns}
              showModules={showModules}
              showSafetyInfo={showSafetyInfo}
              selectedStep={selectedStep}
              setSelectedStep={setSelectedStep}
              mode={mode}
              renderStepForm={renderStepForm}
              completeStep={completeStep}
              skipStep={skipStep}
              resetStepData={resetStepData}
              activeTab={activeTab}
              accounts={accounts}
              setAccounts={setAccounts}
              editingAccount={editingAccount}
              setEditingAccount={setEditingAccount}
              newAccount={newAccount}
              setNewAccount={setNewAccount}
              addAccount={addAccount}
              updateAccount={updateAccount}
              deleteAccount={deleteAccount}
            />
          )}
        </div>
      )}

      {/* アカウント情報タブ */}
      {activeTab === 'accounts' && (
        <PhaseDetail
          showIntroSection={false}
          setShowIntroSection={setShowIntroSection}
          setExpandedPhase={setExpandedPhase}
          setAchievement={setAchievement}
          showPatterns={false}
          showModules={false}
          showSafetyInfo={false}
          selectedStep={null}
          setSelectedStep={setSelectedStep}
          mode={mode}
          renderStepForm={renderStepForm}
          completeStep={completeStep}
          skipStep={skipStep}
          resetStepData={resetStepData}
          activeTab={activeTab}
          accounts={accounts}
          setAccounts={setAccounts}
          editingAccount={editingAccount}
          setEditingAccount={setEditingAccount}
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          addAccount={addAccount}
          updateAccount={updateAccount}
          deleteAccount={deleteAccount}
        />
      )}
    </div>
  );
}
