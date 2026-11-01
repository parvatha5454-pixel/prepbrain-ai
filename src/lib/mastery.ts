// Transparent mastery algorithm (0-100). Deterministic; no AI involved.
// evidence = difficulty-weighted accuracy of the session (weights 1..3)
// alpha = min(0.6, 0.25 + 0.05*answers); new = first time ? evidence : old*(1-alpha)+evidence*alpha
export type Ans = { correct: boolean; difficulty: number }
export function updateMastery(old: number | null, priorAttempts: number, answers: Ans[]) {
  if (!answers.length) return old ?? 0
  const w = answers.reduce((s, a) => s + a.difficulty, 0)
  const evidence = (answers.reduce((s, a) => s + (a.correct ? a.difficulty : 0), 0) / w) * 100
  if (old === null || priorAttempts === 0) return Math.round(evidence)
  const alpha = Math.min(0.6, 0.25 + 0.05 * answers.length)
  return Math.round(old * (1 - alpha) + evidence * alpha)
}
// Difficulty from last 5 answers on a topic (newest last). Never random.
export function nextDifficulty(cur: number, recent: boolean[]) {
  const last = recent.slice(-5)
  if (last.length < 3) return { difficulty: cur, prerequisite: false }
  const right = last.filter(Boolean).length
  if (right >= 4) return { difficulty: Math.min(3, cur + 1), prerequisite: false }
  if (right <= 1) return { difficulty: Math.max(1, cur - 1), prerequisite: true }
  return { difficulty: cur, prerequisite: false }
}
