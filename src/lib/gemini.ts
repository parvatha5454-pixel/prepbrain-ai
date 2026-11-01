import { z } from 'zod'
// Server-side only. Output is schema-validated. Temporary Gemini errors (429/500/503) are retried, then a backup model is tried.
// Any final failure returns the fallback and logs the reason to the terminal.
const PRIMARY = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const BACKUP = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
export async function geminiJSON<T>(prompt: string, schema: z.ZodType<T>, fallback: T, pdfBase64?: string): Promise<{ data: T; ai: boolean }> {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) { console.warn('[gemini] GEMINI_API_KEY is empty. Using offline fallback.'); return { data: fallback, ai: false } }
  const plan = [PRIMARY, PRIMARY, BACKUP]
  let last = ''
  for (let i = 0; i < plan.length; i++) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${plan[i]}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [...(pdfBase64 ? [{ inlineData: { mimeType: 'application/pdf', data: pdfBase64 } }] : []), { text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }) })
      if (r.ok) {
        const j = await r.json()
        return { data: schema.parse(JSON.parse(j.candidates[0].content.parts[0].text)), ai: true }
      }
      last = `${plan[i]} HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`
      if ([400, 401, 403].includes(r.status)) break // key or request problem, retrying will not help
    } catch (e) { last = `${plan[i]} ${e instanceof Error ? e.message : e}` }
    if (i < plan.length - 1) await sleep(900 * (i + 1))
  }
  console.warn('[gemini] failed, using fallback:', last)
  return { data: fallback, ai: false }
}
