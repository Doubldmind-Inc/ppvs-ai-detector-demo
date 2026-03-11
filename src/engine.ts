/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalysisResult {
  score: number; // 0 to 100, higher means more likely AI
  label: 'Human' | 'Likely Human' | 'Uncertain' | 'Likely AI' | 'AI';
  stats: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    burstiness: number; // Variance in sentence length
    vocabularyDiversity: number; // Type-Token Ratio
    uniqueWordCount: number;
    avgWordLength: number;
    longestSentenceLen: number;
    shortestSentenceLen: number;
    patternCount: number;
  };
  highlights: {
    index: number;
    text: string;
    score: number; // 0 to 1, probability of AI for this sentence
  }[];
}

// Common AI transition words and phrases (English & Traditional Chinese)
const AI_PATTERNS = [
  "in conclusion", "it is important to note", "moreover", "furthermore", "consequently",
  "總結來說", "值得注意的是", "此外", "而且", "因此", "另一方面", "綜上所述", "不僅如此",
  "在當今社會", "隨著科技的發展", "首先", "其次", "最後"
];

export function analyzeText(text: string): AnalysisResult {
  if (!text || text.trim().length < 10) {
    return {
      score: 0,
      label: 'Human',
      stats: { wordCount: 0, sentenceCount: 0, avgSentenceLength: 0, burstiness: 0, vocabularyDiversity: 0, uniqueWordCount: 0, avgWordLength: 0, longestSentenceLen: 0, shortestSentenceLen: 0, patternCount: 0 },
      highlights: []
    };
  }

  // Basic cleaning
  const sentences = text.split(/[.!?。\！？]/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().match(/\b\w+\b|[\u4e00-\u9fa5]/g) || [];
  
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgSentenceLength = wordCount / (sentenceCount || 1);

  // 1. Burstiness (Variance in sentence length)
  // AI tends to have very consistent sentence lengths. Humans vary more.
  const sentenceLengths = sentences.map(s => (s.match(/\b\w+\b|[\u4e00-\u9fa5]/g) || []).length);
  const meanLength = avgSentenceLength;
  const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - meanLength, 2), 0) / (sentenceCount || 1);
  const burstiness = Math.sqrt(variance); // Standard Deviation

  // 2. Vocabulary Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words);
  const vocabularyDiversity = uniqueWords.size / (wordCount || 1);

  // 3. Pattern Matching
  let patternCount = 0;
  AI_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    const matches = text.match(regex);
    if (matches) patternCount += matches.length;
  });

  // 4. Scoring Logic (Heuristic)
  // Lower burstiness -> Higher AI score
  // Lower vocabulary diversity -> Higher AI score
  // Higher pattern count -> Higher AI score
  
  // Normalize metrics
  const burstinessScore = Math.max(0, 100 - (burstiness * 5)); // If SD is low, score is high
  const diversityScore = Math.max(0, 100 - (vocabularyDiversity * 200)); // If diversity is low, score is high
  const patternScore = Math.min(100, (patternCount / (wordCount / 50)) * 20);

  // Weighted average
  let totalScore = (burstinessScore * 0.4) + (diversityScore * 0.3) + (patternScore * 0.3);
  
  // Clamp score
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Labeling
  let label: AnalysisResult['label'] = 'Uncertain';
  if (totalScore < 20) label = 'Human';
  else if (totalScore < 40) label = 'Likely Human';
  else if (totalScore < 60) label = 'Uncertain';
  else if (totalScore < 80) label = 'Likely AI';
  else label = 'AI';

  // Sentence Highlights
  const highlights = sentences.map((s, i) => {
    const sWords = (s.match(/\b\w+\b|[\u4e00-\u9fa5]/g) || []).length;
    const sDiff = Math.abs(sWords - meanLength);
    // If sentence length is very close to average, it's more "AI-like" in this simple model
    const sScore = Math.max(0, 1 - (sDiff / 10)); 
    return { index: i, text: s, score: sScore };
  });

  return {
    score: Math.round(totalScore),
    label,
    stats: {
      wordCount,
      sentenceCount,
      avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
      burstiness: Number(burstiness.toFixed(2)),
      vocabularyDiversity: Number(vocabularyDiversity.toFixed(3)),
      uniqueWordCount: uniqueWords.size,
      avgWordLength: Number(((words as string[]).reduce((sum: number, w: string) => sum + w.length, 0) / (wordCount || 1)).toFixed(1)),
      longestSentenceLen: Math.max(...sentenceLengths, 0),
      shortestSentenceLen: Math.min(...sentenceLengths, 0),
      patternCount,
    },
    highlights
  };
}
