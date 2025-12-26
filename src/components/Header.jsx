import React from 'react';
import { Sparkles, Shield, Zap, Eye, EyeOff, RotateCcw, FileText, Key, ClipboardList } from 'lucide-react';

export default function Header({
  mode,
  setMode,
  showHints,
  setShowHints,
  resetAllSettings,
  activeTab,
  setActiveTab,
  calculateProgress,
  setAchievement,
}) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="absolute -top-1 -right-1 text-xs">✨</span>
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="pixel-font text-yellow-400 text-sm">▶</span>
              Threads × 楽天アフィリ
            </h1>
            <p className="text-sm text-gray-400">〜 副業クエスト 〜</p>
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

          {/* ヒント表示ON/OFF */}
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all border ${
              showHints
                ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30 hover:bg-yellow-900/50'
                : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600'
            }`}
            title={showHints ? 'ヒント表示をOFFにする' : 'ヒント表示をONにする'}
          >
            {showHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            💬 ヒント{showHints ? 'ON' : 'OFF'}
          </button>

          {/* 設定リセットボタン */}
          <button
            onClick={resetAllSettings}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          やることリスト
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
            activeTab === 'accounts'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          アカウント情報
        </button>
        <button
          onClick={() => setActiveTab('management')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
            activeTab === 'management'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          一元管理表
        </button>
      </div>

      {/* RPG風プログレスバー */}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          {/* レベル表示（クリックで達成演出テスト） */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => {
              const messages = ['🎮 QUEST CLEAR!', '⭐ LEVEL UP!', '🏆 MISSION COMPLETE!', '✨ NICE WORK!', '🌟 GREAT JOB!'];
              setAchievement({ message: messages[Math.floor(Math.random() * messages.length)], type: 'complete' });
              setTimeout(() => setAchievement(null), 2000);
            }}
            title="クリックで達成演出テスト"
          >
            <span className="pixel-font text-yellow-400 text-xs">LV.</span>
            <span className="pixel-font text-yellow-300 text-lg">{Math.floor(calculateProgress() / 10) + 1}</span>
          </div>

          {/* EXPバー */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <span className="text-yellow-500">⚔️</span> EXP
              </span>
              <span className="pixel-font text-yellow-400 text-[10px]">{calculateProgress()}%</span>
            </div>
            <div className="rpg-bar-container h-4">
              <div
                className="rpg-bar-fill h-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* 次のレベルまで */}
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">NEXT</span>
            <span className="pixel-font text-[10px] text-yellow-500 ml-1">{10 - (calculateProgress() % 10)}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
