import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Lock, Play, Settings, User, Search, FileText, Calendar, BarChart3, Zap, Shield, AlertTriangle, Sparkles, Target, TrendingUp } from 'lucide-react';

// フェーズとステップのデータ構造
const initialPhases = [
  {
    id: 0,
    name: '準備',
    icon: Settings,
    color: 'bg-gray-500',
    steps: [
      { id: '0-1', name: '楽天アフィリエイト登録', status: 'pending', description: '楽天アフィリエイトに登録してIDを取得' },
      { id: '0-2', name: 'Threadsアカウント作成', status: 'pending', description: 'Instagramと連携してThreadsアカウントを作成' },
      { id: '0-3', name: 'サイト登録', status: 'pending', description: 'ThreadsのプロフィールURLを楽天に登録' },
    ]
  },
  {
    id: 1,
    name: '設計',
    icon: Target,
    color: 'bg-blue-500',
    steps: [
      { id: '1-1', name: 'ジャンル選定', status: 'locked', description: '発信するジャンルを決定', hasAI: true },
      { id: '1-2', name: 'ターゲット設定', status: 'locked', description: '届けたい層を明確にする', hasAI: true },
      { id: '1-3', name: 'プロフィール作成', status: 'locked', description: '名前・自己紹介文を作成', hasAI: true },
      { id: '1-4', name: 'アイコン準備', status: 'locked', description: 'アイコン画像を用意', hasAI: true },
    ]
  },
  {
    id: 2,
    name: 'リサーチ',
    icon: Search,
    color: 'bg-purple-500',
    steps: [
      { id: '2-1', name: '大手アカウントフォロー', status: 'locked', description: 'フォロワー5千以上を5-10フォロー' },
      { id: '2-2', name: '中規模アカウントフォロー', status: 'locked', description: 'フォロワー500-5千を5フォロー' },
      { id: '2-3', name: 'バズ投稿ストック', status: 'locked', description: '参考になる投稿を保存' },
      { id: '2-4', name: '商品候補リストアップ', status: 'locked', description: '紹介する商品を選定', hasAI: true },
    ]
  },
  {
    id: 3,
    name: '投稿準備',
    icon: FileText,
    color: 'bg-orange-500',
    steps: [
      { id: '3-1', name: '挨拶投稿作成', status: 'locked', description: 'バズを狙う自己紹介投稿', hasAI: true, important: true },
      { id: '3-2', name: '初期投稿セット準備', status: 'locked', description: '5-10投稿を事前に用意', hasAI: true },
      { id: '3-3', name: '投稿スケジュール設計', status: 'locked', description: 'いつ何を投稿するか計画' },
    ]
  },
  {
    id: 4,
    name: '運用開始',
    icon: Play,
    color: 'bg-green-500',
    steps: [
      { id: '4-1', name: 'Day 1: 挨拶投稿', status: 'locked', description: '最初の投稿を実行' },
      { id: '4-2', name: 'Day 2-3: アフィ投稿', status: 'locked', description: '商品紹介投稿を開始' },
      { id: '4-3', name: '6パターン投稿ローテーション', status: 'locked', description: '球種を変えて継続投稿', hasAI: true },
    ]
  },
  {
    id: 5,
    name: '拡大',
    icon: TrendingUp,
    color: 'bg-pink-500',
    steps: [
      { id: '5-1', name: '楽天ROOM連携', status: 'locked', description: 'ROOMも活用して収益UP' },
      { id: '5-2', name: '分析・改善', status: 'locked', description: '投稿パフォーマンスを分析', hasAI: true },
      { id: '5-3', name: '複数アカウント展開', status: 'locked', description: '別ジャンルに横展開' },
    ]
  },
];

// 投稿6パターン
const postPatterns = [
  { id: 1, name: '挨拶投稿', pitch: 'ストレート', description: '自己紹介、ジャンル認知', frequency: '開始時1回' },
  { id: 2, name: '一言＋商品画像', pitch: 'ストレート', description: 'シンプルに商品紹介', frequency: '高め' },
  { id: 3, name: 'バズワード投稿', pitch: 'カーブ', description: 'トレンドワードでリーチ拡大', frequency: '中' },
  { id: 4, name: 'ターゲット刺し', pitch: 'フォーク', description: 'HARM法則で感情訴求', frequency: '中' },
  { id: 5, name: '有益情報', pitch: 'チェンジアップ', description: '価値提供、信頼構築', frequency: '低〜中' },
  { id: 6, name: 'まとめ投稿', pitch: 'スライダー', description: '複数商品をまとめて紹介', frequency: '週1-2回' },
];

export default function Dashboard() {
  const [phases, setPhases] = useState(initialPhases);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [mode, setMode] = useState('beginner'); // 'beginner' or 'expert'
  const [showPatterns, setShowPatterns] = useState(false);

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
    
    // 次のステップをアンロック
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

  // ステップのステータスアイコン
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">Threads × 楽天アフィリ</h1>
              <p className="text-sm text-gray-400">自動化システム</p>
            </div>
          </div>
          
          {/* モード切替 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setMode('beginner')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all ${
                  mode === 'beginner' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                初心者
              </button>
              <button
                onClick={() => setMode('expert')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all ${
                  mode === 'expert' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                エキスパート
              </button>
            </div>
          </div>
        </div>
        
        {/* プログレスバー */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">全体進捗</span>
            <span className="text-blue-400 font-medium">{calculateProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー - フェーズ一覧 */}
        <aside className="w-72 bg-gray-800 min-h-screen border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            フェーズ
          </h2>
          
          <div className="space-y-2">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const completedSteps = phase.steps.filter(s => s.status === 'completed').length;
              const isExpanded = expandedPhase === phase.id;
              
              return (
                <div key={phase.id} className="rounded-lg overflow-hidden">
                  {/* フェーズヘッダー */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className={`w-full flex items-center gap-3 p-3 transition-all ${
                      isExpanded ? 'bg-gray-700' : 'bg-gray-750 hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${phase.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{phase.name}</div>
                      <div className="text-xs text-gray-400">
                        {completedSteps}/{phase.steps.length} 完了
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {/* ステップ一覧 */}
                  {isExpanded && (
                    <div className="bg-gray-750 py-2">
                      {phase.steps.map((step) => (
                        <button
                          key={step.id}
                          onClick={() => {
                            if (step.status !== 'locked' || mode === 'expert') {
                              setSelectedStep(step);
                            }
                          }}
                          disabled={step.status === 'locked' && mode === 'beginner'}
                          className={`w-full flex items-center gap-3 px-4 py-2 transition-all ${
                            selectedStep?.id === step.id
                              ? 'bg-blue-600/20 border-l-2 border-blue-500'
                              : step.status === 'locked' && mode === 'beginner'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-700'
                          }`}
                        >
                          <StatusIcon status={step.status} />
                          <span className={`text-sm flex-1 text-left ${
                            step.important ? 'text-yellow-400 font-medium' : ''
                          }`}>
                            {step.name}
                            {step.important && ' ⭐'}
                          </span>
                          {step.hasAI && (
                            <span className="text-xs bg-purple-600/30 text-purple-400 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 投稿パターン */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-750 hover:bg-gray-700 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-left font-medium">投稿6パターン</span>
              {showPatterns ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
          {showPatterns ? (
            /* 投稿パターン表示 */
            <div>
              <h2 className="text-2xl font-bold mb-2">投稿6パターン（野球理論）</h2>
              <p className="text-gray-400 mb-6">球種を変えて「飽きないアカウント」を作る</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {postPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                        {pattern.id}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pattern.name}</h3>
                        <p className="text-xs text-gray-400">⚾ {pattern.pitch}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{pattern.description}</p>
                    <p className="text-xs text-gray-500">頻度: {pattern.frequency}</p>
                  </div>
                ))}
              </div>
              
              {/* HARM法則 */}
              <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  HARM法則（フック文の設計）
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400 mb-1">H</div>
                    <div className="font-medium">Health</div>
                    <div className="text-xs text-gray-400">健康・美容・容姿</div>
                    <div className="text-xs text-gray-500 mt-2">「痩せたい」「美しくなりたい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400 mb-1">A</div>
                    <div className="font-medium">Ambition</div>
                    <div className="text-xs text-gray-400">夢・キャリア・将来</div>
                    <div className="text-xs text-gray-500 mt-2">「成長したい」「時短したい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-pink-400 mb-1">R</div>
                    <div className="font-medium">Relation</div>
                    <div className="text-xs text-gray-400">人間関係・恋愛</div>
                    <div className="text-xs text-gray-500 mt-2">「モテたい」「褒められたい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400 mb-1">M</div>
                    <div className="font-medium">Money</div>
                    <div className="text-xs text-gray-400">お金・投資・節約</div>
                    <div className="text-xs text-gray-500 mt-2">「お得」「1000円以下」</div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedStep ? (
            /* ステップ詳細 */
            <div>
              <div className="flex items-center gap-4 mb-6">
                <StatusIcon status={selectedStep.status} />
                <div>
                  <h2 className="text-2xl font-bold">{selectedStep.name}</h2>
                  <p className="text-gray-400">{selectedStep.description}</p>
                </div>
                {selectedStep.hasAI && (
                  <span className="bg-purple-600/30 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    AI支援あり
                  </span>
                )}
              </div>
              
              {/* 初心者モードの警告 */}
              {mode === 'beginner' && selectedStep.status === 'locked' && (
                <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400">このステップはまだロックされています</p>
                    <p className="text-sm text-gray-400 mt-1">前のステップを完了してから進んでください。</p>
                  </div>
                </div>
              )}
              
              {/* アクションエリア */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-semibold mb-4">このステップで行うこと</h3>
                
                {/* ステップに応じたコンテンツ（例） */}
                {selectedStep.id === '1-1' && (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      発信するジャンルを決めましょう。以下の質問に答えると、おすすめのジャンルを提案します。
                    </p>
                    <div className="bg-gray-750 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Q1. 興味のあるカテゴリは？</p>
                      <div className="flex flex-wrap gap-2">
                        {['インテリア', 'ファッション', '美容', 'ガジェット', '食品', 'ベビー・キッズ'].map(cat => (
                          <button key={cat} className="px-3 py-1.5 bg-gray-700 hover:bg-blue-600 rounded-lg text-sm transition-all">
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedStep.id === '3-1' && (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      バズを狙う挨拶投稿を作成します。以下の要素を含めると効果的です：
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      <li>冒頭にターゲットに刺さる言葉</li>
                      <li>自分の属性（年齢、職業など）</li>
                      <li>ジャンルのバズワード</li>
                      <li>最後にCTA（行動喚起）</li>
                    </ul>
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                      <Sparkles className="w-4 h-4" />
                      AIで挨拶投稿を生成
                    </button>
                  </div>
                )}
                
                {/* 汎用アクションボタン */}
                {selectedStep.status === 'pending' && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => completeStep(selectedStep.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      完了にする
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all">
                      スキップ
                    </button>
                  </div>
                )}
                
                {selectedStep.status === 'completed' && (
                  <div className="mt-6 flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>このステップは完了しています</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* デフォルト: ダッシュボード概要 */
            <div>
              <h2 className="text-2xl font-bold mb-2">ダッシュボード</h2>
              <p className="text-gray-400 mb-6">左のメニューからフェーズを選んで進めていきましょう</p>
              
              {/* クイックスタート */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30 mb-6">
                <h3 className="text-lg font-semibold mb-2">🚀 クイックスタート</h3>
                <p className="text-gray-300 mb-4">
                  まずは「準備」フェーズから始めましょう。楽天アフィリエイトとThreadsの登録が必要です。
                </p>
                <button
                  onClick={() => {
                    setExpandedPhase(0);
                    setSelectedStep(initialPhases[0].steps[0]);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  始める
                </button>
              </div>
              
              {/* コア哲学 */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">💡 このシステムの考え方</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="text-red-400 font-medium mb-1">❌ 目的：売る</div>
                    <p className="text-sm text-gray-400">商品を売ろうとすると押し売りになりがち</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-400 font-medium mb-1">⭕ 目的：クリックさせる</div>
                    <p className="text-sm text-gray-400">24時間以内に何か買えば報酬発生！</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-300">
                  → 紹介した商品じゃなくてもOK。だから「興味を引く」が全て！
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
