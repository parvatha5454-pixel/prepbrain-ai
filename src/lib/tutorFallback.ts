// Offline tutor used when Gemini is unavailable. Deterministic; still uses the learner profile.
type KB = { analogy: string; simple: string; detail: string; example: string; prereq: string; keys: string[] }
const KB_: Record<string, KB> = {
  Variables: { analogy: 'Think of a variable as a labelled box that holds a value.', simple: 'A variable is a name that points to a value, like x = 5.',
    detail: 'Assignment binds a name to an object. y = x copies the reference to the value, so later changing x does not change y for numbers. Names cannot start with a digit, contain "-", or be keywords.',
    example: "age = 20\nname = 'Asha'\nprint(name, age)\nx = 5\ny = x\nx = 7\nprint(y)  # 5", prereq: 'none, this is the starting point', keys: ['variable', 'assign', 'type(', 'int', 'float'] },
  Loops: { analogy: 'A loop is like a washing machine cycle: the same steps repeat a set number of times.', simple: 'A loop repeats code. range(3) gives 0, 1, 2 (the stop value is excluded).',
    detail: 'for loops iterate over a sequence; range(start, stop) excludes stop, so range(1, 5) is 1,2,3,4. break exits the loop immediately, continue skips to the next iteration.',
    example: 'for i in range(3):\n    print(i)  # 0 1 2\nfor i in range(1, 5):\n    print(i)  # 1 2 3 4', prereq: 'Variables', keys: ['loop', 'for ', 'while', 'range', 'break', 'continue', 'iterat'] },
  Functions: { analogy: 'A function is like a recipe you can reuse whenever you need it.', simple: 'A function is a reusable block made with def. Without return it gives back None.',
    detail: 'def name(params): defines a function. return sends a value back; with no return statement Python returns None. Default arguments (b=2) are used when the caller omits them.',
    example: 'def add(a, b=2):\n    return a + b\nprint(add(1))     # 3\nprint(add(1, 5))  # 6', prereq: 'Variables', keys: ['function', 'def ', 'return', 'argument', 'parameter'] },
  Lists: { analogy: 'A list is like a row of numbered lockers, and the numbering starts at 0.', simple: 'A list holds ordered items. The first index is 0, and slices exclude the end.',
    detail: 'Lists are mutable. nums[1:3] returns items at index 1 and 2 only. Methods like append change the list in place and return None, so do not assign their result.',
    example: 'nums = [1, 2, 3, 4]\nprint(nums[0])    # 1\nprint(nums[1:3])  # [2, 3]\nnums.append(5)    # returns None', prereq: 'Variables', keys: ['list', 'append', 'slice', 'index', '[]'] },
}
export function offlineReply(message: string, mode: string, ms: { topic: string; score: number }[], mistakes: { topic: string; tag: string; count: number }[]) {
  const m = message.toLowerCase()
  const topic = Object.keys(KB_).find(t => m.includes(t.toLowerCase()) || KB_[t].keys.some(k => m.includes(k)))
  const note = '\n\n(Offline tutor mode. Add GEMINI_API_KEY for full AI answers.)'
  if (!topic) {
    const w = ms[0]
    return `I can explain Variables, Loops, Functions or Lists right now.${w ? ` Your weakest topic is ${w.topic} (${Math.round(w.score)}%), so that is a good place to start.` : ''} Try asking, for example, "Explain functions".${note}`
  }
  const k = KB_[topic], mine = ms.find(x => x.topic === topic), mis = mistakes.filter(x => x.topic === topic)
  const body = mode === 'BEGINNER' ? `${k.analogy}\n\n${k.simple}` : mode === 'SIMPLE' ? k.simple : mode === 'DETAILED' ? `${k.simple}\n\n${k.detail}` : `${k.simple}\n\nExample:\n${k.example}`
  const extra = [mine ? `Your current ${topic} mastery is ${Math.round(mine.score)}%.` : '', mis.length ? `You keep repeating this mistake: ${mis.map(x => `${x.tag} (${x.count}x)`).join(', ')}.` : '',
    mine && mine.score < 50 ? `Prerequisite to revise first: ${k.prereq}.` : ''].filter(Boolean).join(' ')
  return `${body}${extra ? `\n\n${extra}` : ''}${note}`
}
