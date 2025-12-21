import React, { useState, useEffect, useCallback } from 'react';
import { X, HelpCircle, Check, AlertTriangle, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PhaseDetail from './components/PhaseDetail';
import { stepFormConfigs, initialPhases, STORAGE_KEYS } from './data/config';

// ひらがな→ローマ字変換テーブル
const hiraganaToRomaji = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  'ー': '', 'っ': '',
};

// カタカナ→ひらがな変換
const katakanaToHiragana = (str) => {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
};

// 名前をローマ字に変換
const toRomaji = (name) => {
  const hiragana = katakanaToHiragana(name.toLowerCase());
  let result = '';
  let i = 0;
  while (i < hiragana.length) {
    // 2文字の組み合わせを先にチェック
    if (i < hiragana.length - 1) {
      const twoChar = hiragana.substring(i, i + 2);
      if (hiraganaToRomaji[twoChar]) {
        result += hiraganaToRomaji[twoChar];
        i += 2;
        continue;
      }
    }
    // 1文字
    const oneChar = hiragana[i];
    if (hiraganaToRomaji[oneChar]) {
      result += hiraganaToRomaji[oneChar];
    } else if (/[a-z]/.test(oneChar)) {
      result += oneChar;
    }
    i++;
  }
  return result;
};

// ジャンル→英語変換
const genreToEnglish = {
  '美容': 'beauty',
  '育児': 'parenting',
  '子育て': 'parenting',
  'ファッション': 'fashion',
  '服': 'fashion',
  '暮らし': 'lifestyle',
  '雑貨': 'zakka',
  'インテリア': 'interior',
  '家具': 'furniture',
  '便利グッズ': 'goods',
  '旅行': 'travel',
  'コスメ': 'cosme',
  'ダイエット': 'diet',
  '料理': 'cooking',
  'レシピ': 'recipe',
  '節約': 'saving',
  'ガジェット': 'gadget',
};

const getGenreEnglish = (genre) => {
  if (!genre) return 'lifestyle';
  for (const [jp, en] of Object.entries(genreToEnglish)) {
    if (genre.includes(jp)) return en;
  }
  return 'lifestyle';
};

export default function Dashboard() {
  const [phases, setPhases] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHASES);
    return saved ? JSON.parse(saved) : initialPhases;
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

  // プロフィール自動生成
  const generateProfile = () => {
    const step11 = userData['1-1'] || {};
    const step12 = userData['1-2'] || {};
    const step13 = userData['1-3'] || {};

    const name = step13.characterName || 'なまえ';
    const genre = step11.selectedGenre || 'ライフスタイル';
    const empathy = step13.empathyPoint || '';
    const targetAge = step12.targetAge || '20-30';
    const targetGender = step12.targetGender === 'male' ? '男性' : step12.targetGender === 'female' ? '女性' : 'みんな';

    // アカウント名生成
    const accountName = `${name}｜${genre}の人`;

    // ユーザーID生成
    const nameRomaji = toRomaji(name);
    const genreEn = getGenreEnglish(genre);
    const userId = `@${nameRomaji}_${genreEn}`;

    // プロフィール文生成
    let profileText = '';
    if (empathy) {
      profileText += `${empathy}\n`;
    }
    profileText += `${targetAge}代${targetGender}向けに${genre}を毎日発信中！\n`;
    profileText += `仲良くしてね♡`;

    // 更新
    setUserData(prev => ({
      ...prev,
      '1-3': {
        ...prev['1-3'],
        accountName,
        userId,
        fullProfile: profileText,
      }
    }));
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
      const canGenerate = data.characterName && data.personality && data.speakingStyle;

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
              プロフィールを自動生成
            </button>
            {!canGenerate && (
              <p className="text-xs text-gray-500 text-center mt-2">
                名前・性格・話し方を入力すると生成できます
              </p>
            )}

            {/* 生成結果セクション */}
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
          {/* サイドバー - フェーズ一覧 */}
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
          />

          {/* メインコンテンツ */}
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
