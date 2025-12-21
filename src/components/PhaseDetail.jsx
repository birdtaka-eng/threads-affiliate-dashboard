import React from 'react';
import { Check, AlertTriangle, ExternalLink, SkipForward, RotateCcw, Sparkles, Target, Play, Zap, Shield, FileText, Box, Key, Plus, Edit3, Trash2, Save, User } from 'lucide-react';
import { stepDetails, postPatterns, featureModules, safetyBlocks, initialPhases } from '../data/config';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="relative">
          <Check className="w-5 h-5 text-green-500 check-bounce" />
          <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
        </div>
      );
    case 'skipped':
      return <SkipForward className="w-5 h-5 text-yellow-500" />;
    case 'locked':
      return (
        <div className="relative opacity-50">
          <div className="w-5 h-5 text-gray-400">🔒</div>
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
          <span className="text-[8px] text-blue-400">!</span>
        </div>
      );
  }
};

export default function PhaseDetail({
  showIntroSection,
  setShowIntroSection,
  setExpandedPhase,
  setAchievement,
  showPatterns,
  showModules,
  showSafetyInfo,
  selectedStep,
  setSelectedStep,
  mode,
  renderStepForm,
  completeStep,
  skipStep,
  resetStepData,
  activeTab,
  accounts,
  setAccounts,
  editingAccount,
  setEditingAccount,
  newAccount,
  setNewAccount,
  addAccount,
  updateAccount,
  deleteAccount,
}) {
  if (activeTab === 'accounts') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Key className="w-6 h-6 text-blue-400" />
            アカウント情報管理
          </h2>
          <p className="text-gray-400 mb-6">
            楽天、Threads、Instagramなどのアカウント情報を一元管理できます。
            <span className="text-yellow-400 text-sm ml-2">※データはブラウザに保存されます</span>
          </p>

          {/* 新規追加フォーム */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新規アカウント追加
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">サービス名</label>
                <input
                  type="text"
                  value={newAccount.service}
                  onChange={(e) => setNewAccount({ ...newAccount, service: e.target.value })}
                  placeholder="例: 楽天アフィリエイト"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">ID / メールアドレス</label>
                <input
                  type="text"
                  value={newAccount.userId}
                  onChange={(e) => setNewAccount({ ...newAccount, userId: e.target.value })}
                  placeholder="例: user@example.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">パスワード</label>
                <input
                  type="text"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  placeholder="パスワード"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">メモ</label>
                <input
                  type="text"
                  value={newAccount.memo}
                  onChange={(e) => setNewAccount({ ...newAccount, memo: e.target.value })}
                  placeholder="備考"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>
            </div>
            <button
              onClick={addAccount}
              disabled={!newAccount.service}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              追加する
            </button>
          </div>

          {/* アカウント一覧 */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">登録済みアカウント ({accounts.length}件)</h3>
            </div>

            {accounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                アカウント情報がありません。上のフォームから追加してください。
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 hover:bg-gray-750 transition-all">
                    {editingAccount === account.id ? (
                      // 編集モード
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={account.service}
                            onChange={(e) => updateAccount(account.id, { service: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            placeholder="サービス名"
                          />
                          <input
                            type="text"
                            value={account.userId}
                            onChange={(e) => updateAccount(account.id, { userId: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={account.password}
                            onChange={(e) => updateAccount(account.id, { password: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            placeholder="パスワード"
                          />
                          <input
                            type="text"
                            value={account.memo}
                            onChange={(e) => updateAccount(account.id, { memo: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            placeholder="メモ"
                          />
                        </div>
                        <button
                          onClick={() => setEditingAccount(null)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                      </div>
                    ) : (
                      // 表示モード
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">サービス</div>
                            <div className="font-medium">{account.service}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">ID</div>
                            <div className="text-gray-300">{account.userId || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">パスワード</div>
                            <div className="text-gray-300 font-mono">{account.password || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">メモ</div>
                            <div className="text-gray-400 text-sm">{account.memo || '-'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setEditingAccount(account.id)}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto max-h-screen">
      {showIntroSection ? (
        /* はじめに（イントロ）セクション */
        <div className="max-w-3xl mx-auto">
          {/* RPG風タイトル */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-gray-800 to-gray-900 px-8 py-4 rounded-lg border-4 border-yellow-600 shadow-2xl">
              <h1 className="pixel-font text-yellow-400 text-xl mb-2">〜 副業クエスト 〜</h1>
              <p className="text-gray-400 text-sm">Threads × 楽天アフィリエイト</p>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="space-y-6">
            {/* 冒険の始まり */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <span className="text-2xl">🎮</span>
                <span className="text-yellow-400">冒険の始まり</span>
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>ようこそ、勇者よ。</p>
                <p>
                  これから<span className="text-yellow-400 font-bold">スレッズ</span>と
                  <span className="text-yellow-400 font-bold">楽天アフィリエイト</span>を使った
                  副業の旅が始まります。
                </p>
                <p className="text-gray-400 text-sm">
                  もちろん、いきなり玄人向けの設定から始めることもできます。
                  でも、初めての冒険なら...まずはこのガイドに従ってみてください。
                </p>
              </div>
            </div>

            {/* 初心者へのおすすめ */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <span className="text-2xl">💡</span>
                <span className="text-blue-400">初心者へのおすすめ</span>
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>
                  最初の武器として選ぶべきは、
                  <span className="text-blue-400 font-bold">「見た目で伝わる」</span>ジャンルです。
                </p>
                <p>
                  伝えたいことの<span className="text-yellow-400 font-bold">80%が画像で伝わる</span>なら、
                  難しい言葉を考えなくても大丈夫。
                </p>
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30 mt-4">
                  <p className="text-blue-300 text-sm">
                    📷 インテリア、ファッション、ガジェットなど...<br/>
                    写真を見ただけで「いいな」と思えるものがおすすめです。
                  </p>
                </div>
              </div>
            </div>

            {/* 強みを活かす */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <span className="text-2xl">⭐</span>
                <span className="text-purple-400">強みを活かす</span>
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>そしてもう一つ大切なこと。</p>
                <p>
                  あなたが<span className="text-purple-400 font-bold">好きなこと</span>、
                  <span className="text-purple-400 font-bold">興味があること</span>を選ぶと、
                  自然と強みになります。
                </p>
                <p className="text-gray-400 text-sm">
                  毎日投稿するものだから、楽しみながら続けられることが一番の武器です。
                </p>
              </div>
            </div>

            {/* 次のステップへ */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setShowIntroSection(false);
                  setExpandedPhase(0);
                  setAchievement({ message: '🗡️ 冒険の始まりだ！', type: 'complete' });
                  setTimeout(() => setAchievement(null), 2000);
                }}
                className="group relative px-12 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105 border-2 border-yellow-400"
              >
                <span className="flex items-center gap-3">
                  <span className="pixel-font text-sm">▶</span>
                  準備を始める
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">⚔️</span>
                </span>
              </button>
              <p className="text-gray-500 text-sm mt-4">
                左のメニューから「Phase 0: 準備」へ進みます
              </p>
            </div>
          </div>
        </div>
      ) : showPatterns ? (
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
      ) : showModules ? (
        /* 機能モジュール一覧 */
        <div>
          <h2 className="text-2xl font-bold mb-2">機能モジュール一覧</h2>
          <p className="text-gray-400 mb-6">システムが提供する機能と自動化レベル</p>

          <div className="space-y-6">
            {featureModules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className={`${module.color} px-4 py-3 flex items-center gap-3`}>
                    <Icon className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">{module.name}</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-3">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-750 rounded-lg p-3">
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-gray-400">{feature.desc}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            feature.level === 'AI支援' ? 'bg-purple-600/30 text-purple-400' :
                            feature.level === '自動' ? 'bg-green-600/30 text-green-400' :
                            feature.level === '半自動' ? 'bg-blue-600/30 text-blue-400' :
                            'bg-gray-600/30 text-gray-400'
                          }`}>
                            {feature.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h4 className="font-semibold mb-3">自動化レベル凡例</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-400">AI支援</span>
                <span className="text-sm text-gray-400">AIが文案生成・判定</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-600/30 text-green-400">自動</span>
                <span className="text-sm text-gray-400">システムが自動実行</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-600/30 text-blue-400">半自動</span>
                <span className="text-sm text-gray-400">一部手動操作あり</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 text-gray-400">手動入力</span>
                <span className="text-sm text-gray-400">ユーザーが入力</span>
              </div>
            </div>
          </div>
        </div>
      ) : showSafetyInfo ? (
        /* 安全装置（初心者ブロック） */
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            安全装置（初心者ブロック）
          </h2>
          <p className="text-gray-400 mb-6">初心者モードでは、危険な操作を事前に警告・ブロックします</p>

          <div className="space-y-4">
            {safetyBlocks.map((block) => {
              const Icon = block.icon;
              const colorClasses = {
                red: 'bg-red-900/30 border-red-500/50 text-red-400',
                orange: 'bg-orange-900/30 border-orange-500/50 text-orange-400',
                yellow: 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400',
              };
              return (
                <div key={block.id} className={`rounded-xl p-5 border ${colorClasses[block.color]}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      block.color === 'red' ? 'bg-red-500' :
                      block.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{block.trigger}</h3>
                      <p className="text-sm mt-1 opacity-80">警告: 「{block.warning}」</p>
                      <p className="text-xs mt-2 text-gray-400">解除条件: {block.condition}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              エキスパートモードについて
            </h4>
            <p className="text-sm text-gray-400">
              エキスパートモードでは、これらの警告は表示されますが、無視して進行することができます。
              十分な経験を積んでから切り替えることをおすすめします。
            </p>
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
            {stepDetails[selectedStep.id]?.hasAI && (
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

          {/* ステップ詳細コンテンツ */}
          {stepDetails[selectedStep.id] && (
            <div className="space-y-4">
              {/* なぜこのステップが必要か */}
              <div className={`${stepDetails[selectedStep.id].isLargeText ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30' : 'bg-blue-900/20 border-blue-500/30'} border rounded-xl p-5`}>
                <h3 className={`font-bold ${stepDetails[selectedStep.id].isLargeText ? 'text-purple-300 text-lg mb-4' : 'text-blue-400 mb-2'} flex items-center gap-2`}>
                  <Target className={`${stepDetails[selectedStep.id].isLargeText ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {stepDetails[selectedStep.id].isLargeText ? 'ジャンル選定ガイド' : 'なぜこのステップが必要？'}
                </h3>
                <p className={`text-gray-200 whitespace-pre-line leading-relaxed ${stepDetails[selectedStep.id].isLargeText ? 'text-base' : 'text-sm'}`}>{stepDetails[selectedStep.id].why}</p>
              </div>

              {/* 手順 */}
              {stepDetails[selectedStep.id].steps?.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="font-semibold mb-4">やることリスト</h3>
                  <div className="space-y-3">
                    {stepDetails[selectedStep.id].steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-gray-300 text-sm pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {stepDetails[selectedStep.id].tips && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tips
                  </h3>
                  <p className="text-gray-300 text-sm">{stepDetails[selectedStep.id].tips}</p>
                </div>
              )}

              {/* 外部リンク */}
              {stepDetails[selectedStep.id].link && (
                <a
                  href={stepDetails[selectedStep.id].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  関連リンクを開く
                </a>
              )}
            </div>
          )}

          {/* インタラクティブフォーム */}
          {renderStepForm(selectedStep.id)}

          {/* アクションボタン */}
          {selectedStep.status === 'pending' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => completeStep(selectedStep.id)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                完了にする
              </button>
              <button
                onClick={() => skipStep(selectedStep.id)}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <SkipForward className="w-4 h-4" />
                スキップ
              </button>
            </div>
          )}

          {selectedStep.status === 'completed' && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span>このステップは完了しています</span>
              </div>
              <button
                onClick={() => resetStepData(selectedStep.id)}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                やり直す
              </button>
            </div>
          )}

          {selectedStep.status === 'skipped' && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400">
                <SkipForward className="w-5 h-5" />
                <span>このステップはスキップしました</span>
              </div>
              <button
                onClick={() => resetStepData(selectedStep.id)}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                やり直す
              </button>
            </div>
          )}
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
  );
}
