/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3, 
  Info, 
  RefreshCw,
  Copy,
  Trash2,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeText, type AnalysisResult } from './engine';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate processing time for better UX
    setTimeout(() => {
      const analysis = analyzeText(text);
      setResult(analysis);
      setIsAnalyzing(false);
      
      if (analysis.score < 30) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      }
    }, 800);
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (score < 60) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-rose-500 bg-rose-50 border-rose-200';
  };

  const getScoreProgressColor = (score: number) => {
    if (score < 30) return 'bg-emerald-500';
    if (score < 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-red-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="快刀中英文AI文章辨識系統" className="h-20 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ai.ppvs.org/" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold text-white bg-[#fd373b] hover:bg-[#e02f33] px-6 py-2.5 rounded-full transition-colors shadow-sm">
              即刻辨識
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText size={18} className="text-[#fd373b]" />
                  輸入文章內容
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-[#fd373b] transition-colors"
                    title="複製文字"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={handleClear}
                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="清除內容"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="請在此貼上您想要辨識的文章內容（建議至少 50 字以上以獲得較準確的結果）..."
                  className="w-full h-[400px] p-6 focus:outline-none resize-none text-slate-700 leading-relaxed placeholder:text-slate-300"
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || text.trim().length < 10}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2",
                    isAnalyzing || text.trim().length < 10
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-[#fd373b] hover:bg-[#e02f33] active:scale-[0.98] shadow-red-200"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      正在分析語言特徵...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      開始辨識文章
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tips/Info */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex gap-3">
              <Info className="text-[#fd373b] shrink-0" size={20} />
              <div className="text-sm text-red-900/70 leading-relaxed">
                <p className="font-semibold mb-1">辨識原理說明：</p>
                本系統透過分析文章的<span className="font-bold text-[#fd373b]">突發性 (Burstiness)</span>、<span className="font-bold text-[#fd373b]">詞彙多樣性 (Perplexity Proxy)</span> 以及特定的 <span className="font-bold text-[#fd373b]">AI 語言模式</span> 進行綜合評分。人類寫作通常具有更高的句子長度變化與更豐富的詞彙選擇。
              </div>
            </div>
          </div>

        </div>

        {/* Analysis Results - Full Width */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-8"
          >
            {/* Score Card + Detailed Stats - Row Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Score Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border bg-slate-50 text-slate-500">
                    分析報告
                  </div>

                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray="282.7"
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{ strokeDashoffset: 282.7 - (282.7 * result.score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(getScoreProgressColor(result.score).replace('bg-', 'text-'))}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black tracking-tighter">{result.score}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI 可能性</span>
                    </div>
                  </div>

                  <div className={cn(
                    "inline-block px-6 py-3 rounded-2xl border font-black text-xl mb-4",
                    getScoreColor(result.score)
                  )}>
                    {result.label === 'Human' && '人類原創'}
                    {result.label === 'Likely Human' && '疑似人類'}
                    {result.label === 'Uncertain' && '難以判定'}
                    {result.label === 'Likely AI' && '疑似 AI'}
                    {result.label === 'AI' && '高度疑似 AI'}
                  </div>

                  <p className="text-sm text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                    根據語言特徵分析，這篇文章有 <span className="font-bold text-slate-900">{result.score}%</span> 的機率是由人工智慧生成的。
                  </p>
                </div>

                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-4 border-r border-slate-100 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">突發性指數</div>
                    <div className="text-lg font-bold text-slate-700">{result.stats.burstiness}</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">詞彙多樣性</div>
                    <div className="text-lg font-bold text-slate-700">{result.stats.vocabularyDiversity}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#fd373b]" />
                  詳細統計數據
                </h4>
                <div className="space-y-3 flex-1">
                  <StatRow label="總字數" value={result.stats.wordCount} />
                  <StatRow label="總句數" value={result.stats.sentenceCount} />
                  <StatRow label="不重複詞彙數" value={result.stats.uniqueWordCount} />
                  <StatRow label="平均句長（字/句）" value={result.stats.avgSentenceLength} />
                  <StatRow label="平均詞長（字元/詞）" value={result.stats.avgWordLength} />
                  <StatRow label="最長句子字數" value={result.stats.longestSentenceLen} />
                  <StatRow label="最短句子字數" value={result.stats.shortestSentenceLen} />
                  <StatRow label="AI 常見用語命中數" value={result.stats.patternCount} />
                  <div className="pt-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>語法結構一致性</span>
                      <span>{100 - Math.round(result.stats.burstiness * 2)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, 100 - (result.stats.burstiness * 2))}%` }}
                        className="h-full bg-[#fd373b]"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>詞彙豐富度</span>
                      <span>{Math.round(result.stats.vocabularyDiversity * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(result.stats.vocabularyDiversity * 100)}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 mt-6">
                  <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-[11px] text-amber-900/60 leading-relaxed">
                    請注意：此分析結果僅供參考。AI 辨識技術並非 100% 準確，特別是對於經過人類修改的 AI 文本或非常短的文章。
                  </p>
                </div>
              </div>
            </div>

            {/* Highlighted Text - Full Width below */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-[#fd373b]" />
                  AI 疑似段落標註
                </h4>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 rounded-sm bg-red-100 border border-red-300" /> 高度疑似</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 rounded-sm bg-amber-100 border border-amber-300" /> 中度疑似</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 rounded-sm bg-emerald-50 border border-emerald-200" /> 低度疑似</span>
                </div>
              </div>
              <div className="p-6 md:p-8 text-base leading-[2.2] text-slate-700">
                {result.highlights.map((h, i) => {
                  const bg = h.score >= 0.7
                    ? 'bg-red-100 border-b-2 border-red-400'
                    : h.score >= 0.4
                      ? 'bg-amber-100 border-b-2 border-amber-400'
                      : '';
                  return (
                    <span key={i} className="group relative">
                      <span className={cn("rounded-sm px-0.5 transition-colors", bg)}>
                        {h.text.trim()}
                      </span>
                      {h.score >= 0.4 && (
                        <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10">
                          AI 可能性：{Math.round(h.score * 100)}%
                        </span>
                      )}
                      {i < result.highlights.length - 1 ? '。' : ''}
                    </span>
                  );
                })}
              </div>
              <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Info size={14} />
                  滑鼠移至標註句子可查看該句的 AI 可能性分數
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {/* Logo */}
            <div>
              <img src="/logo.png" alt="快刀中英文AI文章辨識系統" className="h-16 w-auto mb-3" />
              <a href="https://ai.ppvs.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#fd373b] hover:underline mb-4">
                ai.ppvs.org
                <ChevronRight size={14} />
              </a>
              <p className="text-sm text-slate-400 leading-relaxed">採用快刀專利核心技術，透過文本語言特徵分析，精準辨識 GPT-5、Gemini 3、Claude 3 等主流 AI 模型生成內容及翻譯工具產出，提供全方位文本來源辨識服務。</p>
            </div>

            {/* Contact Info */}
            <div>
              <h5 className="text-sm font-bold text-slate-700 mb-4">聯絡資訊</h5>
              <div className="space-y-3 text-sm text-slate-500">
                <a href="https://ai.ppvs.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#fd373b] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">🌎</span>
                  ai.ppvs.org
                </a>
                <a href="mailto:talk@ppvs.org" className="flex items-center gap-3 hover:text-[#fd373b] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">✉️</span>
                  talk@ppvs.org
                </a>
                <a href="tel:02-2823-0833" className="flex items-center gap-3 hover:text-[#fd373b] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">📞</span>
                  (02) 2823-0833
                </a>
                <a href="https://line.me/R/ti/p/@ppvs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#fd373b] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">💬</span>
                  LINE 諮詢 @ppvs
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="md:text-right">
              <h5 className="text-sm font-bold text-slate-700 mb-4">關於我們</h5>
              <p className="text-sm text-slate-500 leading-relaxed">雲書苑教育科技有限公司</p>
              <p className="text-xs text-slate-400 mt-1">數位學習精進方案產品序號：11222-077</p>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">版權所有 © 2026 雲書苑教育科技有限公司</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-700">{value}</span>
    </div>
  );
}
