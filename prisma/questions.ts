import type { PrismaClient } from '@prisma/client'
const M = 'MCQ', TF = 'TRUE_FALSE', SC = 'SCENARIO'
// [topic, type, difficulty, prompt, options, answer, explanation, misconceptionTag]
export const Q: [string, string, number, string, string[], string, string, string][] = [
  ['Variables', M, 1, "Which is a valid Python variable name?", ['2name', 'my_name', 'my-name', 'class'], 'my_name', 'Names cannot start with a digit, contain "-" or be keywords.', 'invalid-names'],
  ['Variables', M, 1, "What is type(3.0)?", ['int', 'float', 'str', 'bool'], 'float', 'A number with a decimal point is a float.', 'int-vs-float'],
  ['Variables', M, 2, "After x = 5; y = x; x = 7, what is y?", ['5', '7', '12', 'Error'], '5', 'Assignment copies the reference to an int; y keeps 5.', 'assignment-aliasing'],
  ['Variables', TF, 1, "True or False: In Python you must declare a variable's type before using it.", ['True', 'False'], 'False', 'Python is dynamically typed; the type comes from the value.', 'static-typing-myth'],
  ['Variables', M, 1, "What does print(type('5')) show?", ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'bool'>"], "<class 'str'>", 'Anything in quotes is a string, even digits.', 'quotes-make-strings'],
  ['Variables', M, 2, "What is x after x = 3 then x += 2?", ['3', '2', '5', '32'], '5', 'x += 2 means x = x + 2.', 'augmented-assignment'],
  ['Variables', M, 2, "What is '3' + '4' in Python?", ['7', '34', 'Error', '12'], '34', 'The + operator joins strings instead of adding them.', 'string-concat-vs-add'],
  ['Variables', SC, 3, "a = [1, 2]; b = a; b.append(3). What is a now?", ['[1, 2]', '[1, 2, 3]', '[3]', 'Error'], '[1, 2, 3]', 'b and a point to the same list, so changing one changes both.', 'assignment-aliasing'],
  ['Loops', M, 1, "How many times does range(3) loop run?", ['2', '3', '4', 'Infinite'], '3', 'range(3) gives 0,1,2.', 'range-off-by-one'],
  ['Loops', M, 2, "What does range(1,5) produce?", ['1,2,3,4,5', '1,2,3,4', '0,1,2,3,4', '2,3,4'], '1,2,3,4', 'The stop value is excluded.', 'range-off-by-one'],
  ['Loops', M, 2, "Which statement exits a loop immediately?", ['continue', 'pass', 'break', 'exit'], 'break', 'break ends the loop; continue skips one iteration.', 'break-vs-continue'],
  ['Loops', TF, 1, "True or False: A while loop stops when its condition becomes False.", ['True', 'False'], 'True', 'The condition is checked before every pass.', 'while-condition'],
  ['Loops', M, 1, "What does for ch in 'abc': print(ch) print?", ['abc on one line', 'a, b, c on separate lines', 'Error', '0 1 2'], 'a, b, c on separate lines', 'A string is a sequence of characters you can loop over.', 'iterate-strings'],
  ['Loops', M, 2, "i = 0, then while i < 3: i += 1. How many times does the body run?", ['2', '3', '4', 'Infinite'], '3', 'i goes 0, 1, 2 and stops when i reaches 3.', 'while-counter'],
  ['Loops', M, 2, "total = 0; for i in range(4): total += i; print(total). What prints?", ['4', '6', '10', '3'], '6', '0+1+2+3 = 6; range(4) stops before 4.', 'range-off-by-one'],
  ['Loops', SC, 3, "Which of these runs forever (no break inside)?", ["for i in range(3): print(i)", "while True: print('hi')", "for x in []: print(x)", "while False: print('hi')"], "while True: print('hi')", 'while True never becomes False, so it needs a break to stop.', 'infinite-loop'],
  ['Functions', M, 1, "Which keyword defines a function?", ['func', 'define', 'def', 'function'], 'def', 'Python uses def.', 'function-syntax'],
  ['Functions', M, 2, "What does a function return if it has no return statement?", ['0', 'None', '""', 'Error'], 'None', 'Functions implicitly return None.', 'implicit-return'],
  ['Functions', M, 3, "def f(a, b=2): return a+b. What is f(1)?", ['3', '1', 'Error', '2'], '3', 'b defaults to 2, so 1+2=3.', 'default-args'],
  ['Functions', TF, 1, "True or False: A function must always have a return statement.", ['True', 'False'], 'False', 'Without return, a function returns None.', 'implicit-return'],
  ['Functions', M, 1, "What is a value you pass into a function call called?", ['argument', 'return value', 'module', 'decorator'], 'argument', 'Arguments are the values supplied when calling a function.', 'params-vs-args'],
  ['Functions', M, 2, "def g(x): x = x * 2. What does print(g(4)) show?", ['8', '4', 'None', 'Error'], 'None', 'g never returns anything, so the result is None.', 'implicit-return'],
  ['Functions', M, 2, "Where is a variable created inside a function available?", ['Everywhere', 'Only inside that function', 'Only in other functions', 'In imported modules'], 'Only inside that function', 'Variables created in a function are local to it.', 'local-scope'],
  ['Functions', SC, 3, "def f(items=[]): items.append(1); return items. After f(), what does print(f()) show?", ['[1]', '[1, 1]', '[]', 'Error'], '[1, 1]', 'The default list is created once and shared between calls.', 'mutable-default-arg'],
  ['Lists', M, 1, "Index of the first item in a list?", ['1', '0', '-1', 'first'], '0', 'Python indexing starts at 0.', 'zero-index'],
  ['Lists', M, 2, "What does [1,2,3].append(4) return?", ['[1,2,3,4]', 'None', '4', 'Error'], 'None', 'append modifies in place and returns None.', 'append-returns-none'],
  ['Lists', M, 2, "What is [1,2,3,4][1:3]?", ['[1,2,3]', '[2,3]', '[2,3,4]', '[1,2]'], '[2,3]', 'Slice includes start, excludes end.', 'slice-end-exclusive'],
  ['Lists', TF, 1, "True or False: Lists can contain items of different types.", ['True', 'False'], 'True', 'A list can mix numbers, strings and more.', 'mixed-types'],
  ['Lists', M, 1, "What does len([10, 20, 30]) return?", ['2', '3', '30', 'Error'], '3', 'len counts the items.', 'len-basic'],
  ['Lists', M, 2, "What is [1, 2, 3][-1]?", ['1', '3', '-1', 'Error'], '3', 'Negative indexes count from the end.', 'negative-index'],
  ['Lists', M, 2, "nums = [3, 1, 2]; nums.sort(). What is nums now?", ['[3, 1, 2]', '[1, 2, 3]', 'None', '[3, 2, 1]'], '[1, 2, 3]', 'sort() reorders the list in place (and returns None).', 'sort-in-place'],
  ['Lists', SC, 3, "x = [1, 2, 3]; y = x[:]; y.append(4). What is x?", ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'], '[1, 2, 3]', 'x[:] makes a copy, so changing y does not affect x.', 'copy-vs-alias'],
]
// Adds only missing questions (matched by topic + prompt). Never deletes, so past answers stay valid.
export async function ensureQuestions(db: PrismaClient, topics: Record<string, string>) {
  let created = 0
  for (const [t, type, d, prompt, o, a, e, tag] of Q) {
    if (await db.question.findFirst({ where: { topicId: topics[t], prompt } })) continue
    await db.question.create({ data: { topicId: topics[t], type, difficulty: d, prompt, options: JSON.stringify(o), answer: a, explanation: e, misconceptionTag: tag } })
    created++
  }
  return created
}
