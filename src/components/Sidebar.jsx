import React from 'react';
import { ChevronRight, ChevronDown, Check, SkipForward, FileText, Box, Shield } from 'lucide-react';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="relative">
          <Check className="w-5 h-5 text-green-500" />
        </div>
      );
    case 'skipped':
      return <SkipForward className="w-5 h-5 text-yellow-500" />;
    case 'locked':
      return (
        <div className="w-5 h-5 text-gray-400 opacity-50">🔒</div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
          <span className="text-[8px] text-blue-400">!</span>
        </div>
      );
  }
};

export default function Sidebar({
  phases,
  expandedPhase,
  setExpandedPhase,
  showIntroSection,
  setShowIntroSection,
  expandedStepId,
  setExpandedStepId,
  selectedStep,
  setSelectedStep,
  setSelectedFieldId,
  mode,
  showPatterns,
  setShowPatterns,
  showModules,
  setShowModules,
  showSafetyInfo,
  setShowSafetyInfo,
  showItemBox,
  setShowItemBox,
}) {
  return (
    <aside className="flex-1 bg-gray-800 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        クエスト
      </h2>

      <div className="space-y-2">
        {/* はじめに */}
        <div className="rounded-lg overflow-hidden">
          <button
            onClick={() => {
              setShowIntroSection(true);
              setExpandedPhase(null);
              setExpandedStepId(null);
              setSelectedStep(null);
            }}
            className={`w-full flex items-center gap-3 p-3 transition-all ${
              showIntroSection ? 'bg-yellow-900/50 border border-yellow-500/50' : 'bg-gray-750 hover:bg-gray-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <span className="text-lg">📖</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-yellow-400">はじめに</div>
            </div>
            {showIntroSection && <ChevronRight className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>

        {/* フェーズ一覧 */}
        {phases.map((phase) => {
          const Icon = phase.icon;
          const completedSteps = phase.steps.filter(s => s.status === 'completed').length;
          const isExpanded = expandedPhase === phase.id;

          return (
            <div key={phase.id} className="rounded-lg overflow-hidden">
              {/* フェーズヘッダー */}
              <button
                onClick={() => {
                  setExpandedPhase(isExpanded ? null : phase.id);
                  setShowIntroSection(false);
                  setShowPatterns(false);
                  setShowModules(false);
                  setShowSafetyInfo(false);
                }}
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
                <div className="bg-gray-750 py-1">
                  {phase.steps.map((step) => {
                    const isSelected = selectedStep?.id === step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          if (step.status !== 'locked' || mode === 'expert') {
                            setSelectedStep(step);
                            setExpandedStepId(step.id);
                            setSelectedFieldId(null);
                            setShowIntroSection(false);
                            setShowPatterns(false);
                            setShowModules(false);
                            setShowSafetyInfo(false);
                          }
                        }}
                        disabled={step.status === 'locked' && mode === 'beginner'}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-l-2 border-blue-500'
                            : step.status === 'locked' && mode === 'beginner'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-700'
                        }`}
                      >
                        <StatusIcon status={step.status} />
                        <span className={`flex-1 text-left text-sm ${
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
                        {isSelected && <ChevronRight className="w-4 h-4 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 投稿パターン・機能モジュール */}
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
        <button
          onClick={() => {
            setShowPatterns(!showPatterns);
            setShowModules(false);
            setShowSafetyInfo(false);
            setShowItemBox(false);
            setSelectedStep(null);
            setShowIntroSection(false);
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
            showPatterns ? 'bg-yellow-600/20 border border-yellow-500/50' : 'bg-gray-750 hover:bg-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1 text-left font-medium">投稿6パターン</span>
          {showPatterns && <ChevronRight className="w-4 h-4 text-yellow-400" />}
        </button>

        <button
          onClick={() => {
            setShowModules(!showModules);
            setShowPatterns(false);
            setShowSafetyInfo(false);
            setShowItemBox(false);
            setSelectedStep(null);
            setShowIntroSection(false);
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
            showModules ? 'bg-cyan-600/20 border border-cyan-500/50' : 'bg-gray-750 hover:bg-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1 text-left font-medium">機能モジュール</span>
          {showModules && <ChevronRight className="w-4 h-4 text-cyan-400" />}
        </button>

        {mode === 'beginner' && (
          <button
            onClick={() => {
              setShowSafetyInfo(!showSafetyInfo);
              setShowPatterns(false);
              setShowModules(false);
              setSelectedStep(null);
              setShowIntroSection(false);
              setShowItemBox(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              showSafetyInfo ? 'bg-red-600/20 border border-red-500/50' : 'bg-gray-750 hover:bg-gray-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 text-left font-medium">安全装置</span>
            {showSafetyInfo && <ChevronRight className="w-4 h-4 text-red-400" />}
          </button>
        )}

        {/* 冒険のカバン */}
        <button
          onClick={() => {
            setShowItemBox(!showItemBox);
            setShowPatterns(false);
            setShowModules(false);
            setShowSafetyInfo(false);
            setSelectedStep(null);
            setShowIntroSection(false);
            setExpandedPhase(null);
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
            showItemBox ? 'bg-amber-600/20 border border-amber-500/50' : 'bg-gray-750 hover:bg-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="text-lg">🎒</span>
          </div>
          <span className="flex-1 text-left font-medium">冒険のカバン</span>
          {showItemBox && <ChevronRight className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </aside>
  );
}
