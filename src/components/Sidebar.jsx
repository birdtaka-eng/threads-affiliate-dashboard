import React from 'react';
import { ChevronRight, ChevronDown, Check, AlertTriangle, ExternalLink, SkipForward, RotateCcw, FileText, Box, Shield } from 'lucide-react';
import { stepFormConfigs, postPatterns } from '../data/config';

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
  selectedFieldId,
  setSelectedFieldId,
  userData,
  updateUserData,
  mode,
  completeStep,
  skipStep,
  resetStepData,
  showPatterns,
  setShowPatterns,
  showModules,
  setShowModules,
  showSafetyInfo,
  setShowSafetyInfo,
}) {
  return (
    <aside className="w-96 bg-gray-800 min-h-screen max-h-screen overflow-y-auto border-r border-gray-700 p-4">
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
              <div className="text-xs text-gray-400">冒険の始まり</div>
            </div>
            {showIntroSection && <span className="text-yellow-400">▶</span>}
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
                <div className="bg-gray-750 py-2">
                  {phase.steps.map((step) => {
                    const isStepExpanded = expandedStepId === step.id;
                    const stepData = userData[step.id] || {};
                    const config = stepFormConfigs[step.id];
                    const isCompleteReady = config?.completionCheck ? config.completionCheck(stepData) : false;

                    return (
                      <div key={step.id}>
                        {/* ステップヘッダー */}
                        <button
                          onClick={() => {
                            if (step.status !== 'locked' || mode === 'expert') {
                              setExpandedStepId(isStepExpanded ? null : step.id);
                              setSelectedStep(step);
                              setSelectedFieldId(null);
                            }
                          }}
                          disabled={step.status === 'locked' && mode === 'beginner'}
                          className={`w-full flex items-center gap-3 px-4 py-2 transition-all ${
                            isStepExpanded
                              ? 'bg-blue-600/20 border-l-2 border-blue-500'
                              : step.status === 'locked' && mode === 'beginner'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-700'
                          }`}
                        >
                          <StatusIcon status={step.status} />
                          <div className="flex-1 text-left">
                            <span className={`text-sm ${
                              step.important ? 'text-yellow-400 font-medium' : ''
                            }`}>
                              {step.name}
                              {step.important && ' ⭐'}
                            </span>
                            {/* 達成項目を表示 */}
                            {config && Object.keys(stepData).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {config.fields.filter(f => {
                                  if (f.type === 'checkbox') return stepData[f.id] === true;
                                  return stepData[f.id] && stepData[f.id].toString().trim() !== '';
                                }).map(f => (
                                  <span key={f.id} className="text-xs bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    {f.label.length > 10 ? f.label.substring(0, 10) + '...' : f.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {step.hasAI && (
                            <span className="text-xs bg-purple-600/30 text-purple-400 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          )}
                          {isStepExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {/* 展開パネル */}
                        {isStepExpanded && config && (
                          <div className="bg-gray-800 border-l-2 border-blue-500 px-4 py-3 space-y-3">
                            {/* 警告表示 */}
                            {config.warnings?.filter(w => w.condition(stepData, mode)).map((warning, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg flex items-start gap-2 text-sm ${
                                  warning.type === 'error'
                                    ? 'bg-red-900/30 border border-red-500/50'
                                    : 'bg-yellow-900/30 border border-yellow-500/50'
                                }`}
                              >
                                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                  warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                                }`} />
                                <span className={warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                                  {warning.message}
                                </span>
                              </div>
                            ))}

                            {/* やることリスト（クリック可能） */}
                            <div className="space-y-2">
                              {config.fields.map((field, idx) => {
                                // showIf条件をチェック
                                if (field.showIf && !field.showIf(stepData)) return null;

                                const fieldKey = `${step.id}-${field.id}`;
                                const isSelected = selectedFieldId === fieldKey;
                                const value = stepData?.[field.id];
                                const isCompleted = field.type === 'checkbox'
                                  ? value === true
                                  : value && value.toString().trim() !== '';

                                return (
                                  <div key={field.id}>
                                    {/* クリック可能な項目 */}
                                    <button
                                      onClick={() => setSelectedFieldId(isSelected ? null : fieldKey)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                                        isSelected
                                          ? 'bg-blue-600/30 border border-blue-500'
                                          : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                                      }`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                                      }`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                                      </span>
                                      <span className={`flex-1 text-sm ${isCompleted ? 'text-green-400' : 'text-gray-200'}`}>
                                        {field.label}
                                      </span>
                                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isSelected ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* 下段：選択時に作業内容を表示 */}
                                    {isSelected && (
                                      <div className="mt-2 ml-9 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                        {/* リンクがある場合 */}
                                        {field.link && (
                                          <a
                                            href={field.link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-all mb-3"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                            {field.link.text}
                                          </a>
                                        )}

                                        {/* 説明文 */}
                                        {field.explanation && (
                                          <p className="text-sm text-gray-300 whitespace-pre-line mb-3">{field.explanation}</p>
                                        )}

                                        {/* チェックボックス */}
                                        {field.type === 'checkbox' && (
                                          <label className="flex items-center gap-3 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-750">
                                            <input
                                              type="checkbox"
                                              checked={!!value}
                                              onChange={(e) => updateUserData(step.id, field.id, e.target.checked)}
                                              className="w-5 h-5 rounded border-gray-500 text-green-500 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-200">完了したらチェック</span>
                                          </label>
                                        )}

                                        {/* テキスト入力 */}
                                        {field.type === 'text' && (
                                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                            {field.question && (
                                              <label className="block text-sm text-yellow-300">{field.question}</label>
                                            )}
                                            <input
                                              type="text"
                                              id={`input-${step.id}-${field.id}`}
                                              name={`${step.id}-${field.id}`}
                                              value={value || ''}
                                              onChange={(e) => updateUserData(step.id, field.id, e.target.value)}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              placeholder={field.placeholder}
                                              autoComplete="off"
                                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                          </div>
                                        )}

                                        {/* テキストエリア */}
                                        {field.type === 'textarea' && (
                                          <div className="space-y-2">
                                            {field.question && (
                                              <label className="block text-sm text-yellow-300">{field.question}</label>
                                            )}
                                            <textarea
                                              id={`textarea-${step.id}-${field.id}`}
                                              name={`${step.id}-${field.id}`}
                                              value={value || ''}
                                              onChange={(e) => updateUserData(step.id, field.id, e.target.value)}
                                              placeholder={field.placeholder}
                                              rows={field.rows || 3}
                                              autoComplete="off"
                                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                            />
                                          </div>
                                        )}

                                        {/* セレクト */}
                                        {field.type === 'select' && (
                                          <div className="space-y-2">
                                            {field.question && (
                                              <label className="block text-sm text-yellow-300">{field.question}</label>
                                            )}
                                            <select
                                              value={value || ''}
                                              onChange={(e) => updateUserData(step.id, field.id, e.target.value)}
                                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            >
                                              <option value="">選択してください</option>
                                              {field.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                  {opt.label} {opt.difficulty && `(${opt.difficulty})`}
                                                </option>
                                              ))}
                                            </select>
                                            {/* 選択したオプションの警告表示 */}
                                            {value && field.options?.find(o => o.value === value)?.warning && (
                                              <div className="p-2 bg-yellow-900/30 border border-yellow-500/50 rounded text-sm text-yellow-400">
                                                ⚠️ {field.options.find(o => o.value === value).warning}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* ナンバー入力 */}
                                        {field.type === 'number' && (
                                          <div className="space-y-2">
                                            {field.question && (
                                              <label className="block text-sm text-yellow-300">{field.question}</label>
                                            )}
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="number"
                                                value={value || 0}
                                                onChange={(e) => updateUserData(step.id, field.id, parseInt(e.target.value) || 0)}
                                                min={field.min}
                                                max={field.max}
                                                className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                              />
                                              {field.target && (
                                                <div className="flex-1">
                                                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>{value || 0} / {field.target}</span>
                                                    <span>{Math.round(Math.min((value || 0) / field.target * 100, 100))}%</span>
                                                  </div>
                                                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                      className={`h-full transition-all ${Math.min((value || 0) / field.target * 100, 100) >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                      style={{ width: `${Math.min((value || 0) / field.target * 100, 100)}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* 完了状態 & アクションボタン */}
                            <div className="pt-2 border-t border-gray-700">
                              {step.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => completeStep(step.id)}
                                    disabled={!isCompleteReady}
                                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                                      isCompleteReady
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                    完了
                                  </button>
                                  <button
                                    onClick={() => skipStep(step.id)}
                                    className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm flex items-center gap-1 transition-all"
                                  >
                                    <SkipForward className="w-4 h-4" />
                                    スキップ
                                  </button>
                                </div>
                              )}

                              {step.status === 'completed' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-green-400 text-sm flex items-center gap-1">
                                    <Check className="w-4 h-4" /> 完了済み
                                  </span>
                                  <button
                                    onClick={() => resetStepData(step.id)}
                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" /> やり直す
                                  </button>
                                </div>
                              )}

                              {step.status === 'skipped' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-yellow-400 text-sm flex items-center gap-1">
                                    <SkipForward className="w-4 h-4" /> スキップ済み
                                  </span>
                                  <button
                                    onClick={() => resetStepData(step.id)}
                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" /> やり直す
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 投稿パターン */}
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
        <button
          onClick={() => { setShowPatterns(!showPatterns); setShowModules(false); setShowSafetyInfo(false); setSelectedStep(null); }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showPatterns ? 'bg-yellow-600/20 border border-yellow-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1 text-left font-medium">投稿6パターン</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* 機能モジュール */}
        <button
          onClick={() => { setShowModules(!showModules); setShowPatterns(false); setShowSafetyInfo(false); setSelectedStep(null); }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showModules ? 'bg-cyan-600/20 border border-cyan-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1 text-left font-medium">機能モジュール</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* 安全装置（初心者モードのみ表示） */}
        {mode === 'beginner' && (
          <button
            onClick={() => { setShowSafetyInfo(!showSafetyInfo); setShowPatterns(false); setShowModules(false); setSelectedStep(null); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showSafetyInfo ? 'bg-red-600/20 border border-red-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 text-left font-medium">安全装置</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </aside>
  );
}
