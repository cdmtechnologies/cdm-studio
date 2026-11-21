import type { Course } from './types'

// Python runs in the learner's browser (Pyodide). Checks use py("expression") and output().
export const python: Course = {
  id: 'python',
  title: 'Python programming',
  blurb: 'The most popular language for automation, data and AI. Go from your first line of code to real programs that read data, make decisions and produce reports.',
  emoji: '🐍',
  colour: 'sky',
  level: 'Beginner',
  hours: 14,
  free: 2,
  skills: ['Variables, numbers and text', 'Decisions and loops', 'Functions', 'Lists and dictionaries', 'Handling errors', 'Reading CSV data', 'Classes and objects', 'Using AI to write and debug code'],
  careers: ['Junior Python developer', 'Automation / scripting', 'Data analyst', 'Back-end developer (with Django or FastAPI)', 'AI and machine learning (next step)'],
  lessons: [
    {
      id: 'python-hello',
      title: 'Your first Python program',
      minutes: 20,
      kind: 'code',
      lang: 'python',
      outline: 'What Python is, how a program runs line by line, print() and comments.',
      body: `## What is Python?

A computer is a very fast, very obedient worker who understands nothing unless you spell it out. A **programming language** is how you write those instructions down. Python is the language most people learn first because it reads almost like English, and it is the same language used by Instagram, Netflix, NASA, banks and nearly every AI lab.

Think of a Python program as a **recipe**. The cook (the computer) starts at the top and follows one line at a time, in order. If a step is written wrongly, the cook stops and tells you which line confused it.

## Your first instruction: print()

\`print()\` tells Python to show something on the screen:

\`\`\`python
print("Hello, world!")
print("I am learning Python")
\`\`\`

- The words inside quotes are **text** (programmers call it a *string*: a string of letters).
- The brackets \`( )\` hold what you give to print.
- Every \`print\` starts a new line.

You can print numbers and sums too, without quotes:

\`\`\`python
print(5 + 3)      # shows 8
print("5 + 3")    # shows 5 + 3 (it is text, so Python does not calculate it)
\`\`\`

## Comments: notes for humans

Anything after \`#\` is a **comment**. Python skips it. Comments are sticky notes you leave for yourself and your team: *why* you did something, not what every line does.

## When it goes wrong

Mistakes are normal: every programmer sees errors every day. If you forget a quote, Python says something like \`SyntaxError: unterminated string literal\` and points to the line. Read the **last line** of the error first: it says what went wrong. Then look at the line number.

## Your task

The editor on the right already runs Python in your browser. Press **Run** to see the output panel.

1. Print exactly \`Hello, world!\`
2. On the next line, print the sentence \`My name is\` followed by your name, for example \`My name is Ada\`.
3. Print the answer to \`365 * 24\` (the hours in a year), as a number, not as text.
4. Add at least one comment.`,
      task: 'Print the three lines described and add a comment.',
      starter: `# Write your code below
print("Hello")
`,
      checks: [
        { label: 'prints Hello, world!', test: `return output().includes("Hello, world!")` },
        { label: 'introduces yourself', test: `return output().includes("My name is ")` },
        { label: 'prints the hours in a year (8760)', test: `return output().includes("8760")` },
      ],
      hint: 'Three print lines: print("Hello, world!"), print("My name is Ada"), print(365 * 24). A comment starts with #.',
      solution: `# My first program
print("Hello, world!")
print("My name is Ada")
print(365 * 24)  # hours in a year
`,
    },
    {
      id: 'python-values',
      title: 'Variables, numbers and text',
      minutes: 25,
      kind: 'code',
      lang: 'python',
      outline: 'Store values in variables, do arithmetic, round money and build messages with f-strings.',
      body: `## Variables are labelled boxes

Imagine a market stall with labelled boxes: one says *price*, one says *quantity*. You can look inside a box, or empty it and put something new in. A **variable** is exactly that: a name that holds a value.

\`\`\`python
price = 1500
quantity = 3
total = price * quantity
print(total)   # 4500
\`\`\`

The \`=\` sign means **"put the value on the right into the box on the left"**. It is not "equals" like in maths. \`count = count + 1\` is perfectly sensible: take what is in the box, add one, put it back.

Good names describe the content: \`total_price\`, not \`tp\` or \`x\`. Python names use lowercase words joined by underscores.

## Kinds of values (types)

| Type | Example | Used for |
|---|---|---|
| \`int\` | \`42\`, \`-7\` | whole numbers: counts, quantities |
| \`float\` | \`3.5\`, \`0.075\` | numbers with decimals: prices, rates |
| \`str\` | \`"Abuja"\` | text |
| \`bool\` | \`True\`, \`False\` | yes / no answers |

\`type(value)\` tells you the type. Mixing types carelessly causes errors: \`"5" + 3\` fails because Python will not guess whether you meant text or maths. Convert on purpose: \`int("5") + 3\` gives \`8\`, \`str(8)\` gives \`"8"\`.

## Arithmetic

\`+  -  *  /\` work as you expect. Also:

- \`//\` whole-number division: \`17 // 5\` is \`3\` (3 full boxes of 5)
- \`%\` remainder: \`17 % 5\` is \`2\` (2 left over)
- \`**\` power: \`2 ** 10\` is \`1024\`
- \`round(x, 2)\` rounds to 2 decimal places, which is what you want for money.

## f-strings: filling in a form

An f-string is like a printed form with blanks. Put \`f\` before the quotes and write variable names inside \`{ }\`:

\`\`\`python
name = "Chika"
items = 3
print(f"{name} bought {items} items")
print(f"Total: {4500:,}")       # Total: 4,500   (the comma adds thousands separators)
\`\`\`

## Your task

A shop sells a phone case for 2,500. A customer buys 4. VAT is 7.5%.

1. Set \`price = 2500\` and \`quantity = 4\`.
2. \`subtotal\`: price times quantity.
3. \`vat\`: 7.5% of the subtotal, rounded to 2 decimals.
4. \`total\`: subtotal plus vat.
5. \`receipt\`: an f-string that reads exactly \`4 items, total 10750.0\` (use your variables, not typed numbers).
6. Print the receipt.`,
      task: 'Work out subtotal, vat and total, then build the receipt with an f-string.',
      starter: `price = 2500
quantity = 4
# subtotal = ...
# vat = ...
# total = ...
# receipt = f"..."
`,
      checks: [
        { label: 'subtotal is 10000', test: `return await py("subtotal == 10000")` },
        { label: 'vat is 750.0', test: `return await py("vat == 750.0")` },
        { label: 'total is 10750.0', test: `return await py("total == 10750.0")` },
        { label: 'receipt built with an f-string', test: `return await py("receipt == '4 items, total 10750.0'")` },
        { label: 'receipt printed', test: `return output().includes("4 items, total 10750.0")` },
      ],
      hint: 'vat = round(subtotal * 0.075, 2) and receipt = f"{quantity} items, total {total}"',
      solution: `price = 2500
quantity = 4
subtotal = price * quantity
vat = round(subtotal * 0.075, 2)
total = subtotal + vat
receipt = f"{quantity} items, total {total}"
print(receipt)
`,
    },
    {
      id: 'python-decisions',
      title: 'Decisions and your first functions',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'Comparisons, if / elif / else, and and / or, and wrapping logic in a function you can reuse.',
      body: `## Programs that choose

So far the recipe has one path. Real programs choose: *if the customer spent over 50,000, give a discount; otherwise, don't*. Think of a **road junction** with signs: the car (your program) checks the sign and takes one road.

\`\`\`python
amount = 62000
if amount >= 50000:
    print("You get 10% off")
else:
    print("No discount today")
\`\`\`

Two rules matter:

1. The line ends with a colon \`:\`.
2. The lines that belong to the branch are **indented** (4 spaces). Indentation is not decoration in Python: it is how Python knows which lines are inside the \`if\`.

## Comparisons give True or False

\`==\` equal (two signs! one \`=\` puts a value in a box), \`!=\` not equal, \`<\`, \`<=\`, \`>\`, \`>=\`.

Combine them with \`and\`, \`or\`, \`not\`:

\`\`\`python
if age >= 18 and has_id:
    print("You may open an account")
\`\`\`

## More than two roads: elif

\`\`\`python
if score >= 70:
    grade = "A"
elif score >= 60:
    grade = "B"
elif score >= 50:
    grade = "C"
else:
    grade = "F"
\`\`\`

Python checks from the top and takes the **first** road whose sign is true. Order matters: if you checked \`score >= 50\` first, a 90 would get a C.

## Functions: a machine you build once

A **function** is like a blender: you put things in (the *inputs*, or parameters), it does its job, and something comes out (the *return* value). You build it once and use it as often as you like.

\`\`\`python
def grade(score):
    if score >= 70:
        return "A"
    return "F"

print(grade(85))   # A
print(grade(40))   # F
\`\`\`

- \`def\` starts a function, then its name and inputs in brackets, then a colon.
- \`return\` sends the answer back and **stops** the function immediately.
- Functions make your code testable: the checks for this lesson call your function with different scores.

## Your task

1. \`grade(score)\`: return \`"A"\` for 70 and above, \`"B"\` for 60 to 69, \`"C"\` for 50 to 59, \`"D"\` for 45 to 49 and \`"F"\` below 45.
2. \`delivery_fee(amount, city)\`: free (\`0\`) when the amount is 50,000 or more; otherwise \`1500\` if the city is \`"Abuja"\` and \`3000\` anywhere else.
3. \`can_vote(age, registered)\`: \`True\` only when age is 18 or more **and** registered is True.`,
      task: 'Write grade, delivery_fee and can_vote.',
      starter: `def grade(score):
    return "F"

def delivery_fee(amount, city):
    return 0

def can_vote(age, registered):
    return False
`,
      checks: [
        { label: 'grade boundaries are right', test: `return await py("[grade(s) for s in (100, 70, 69, 60, 59, 50, 49, 45, 44, 0)] == ['A','A','B','B','C','C','D','D','F','F']")` },
        { label: 'free delivery from 50,000', test: `return await py("delivery_fee(50000, 'Lagos') == 0 and delivery_fee(90000, 'Abuja') == 0")` },
        { label: 'city fees below 50,000', test: `return await py("delivery_fee(49999, 'Abuja') == 1500 and delivery_fee(1000, 'Kano') == 3000")` },
        { label: 'can_vote needs both', test: `return await py("can_vote(18, True) and not can_vote(17, True) and not can_vote(30, False)")` },
      ],
      hint: 'Check the highest grade first. For delivery_fee, check the free case first, then the city.',
      solution: `def grade(score):
    if score >= 70:
        return "A"
    elif score >= 60:
        return "B"
    elif score >= 50:
        return "C"
    elif score >= 45:
        return "D"
    return "F"

def delivery_fee(amount, city):
    if amount >= 50000:
        return 0
    if city == "Abuja":
        return 1500
    return 3000

def can_vote(age, registered):
    return age >= 18 and registered
`,
    },
    {
      id: 'python-loops',
      title: 'Lists and loops',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'Store many values in a list, loop over them with for, use range, and build totals step by step.',
      body: `## A list is a row of lockers

One variable holds one value. A **list** holds many, in order, like a row of numbered lockers:

\`\`\`python
sales = [12000, 8500, 15000, 9200]
print(sales[0])     # 12000   the first locker is number 0
print(sales[-1])    # 9200    negative numbers count from the end
print(len(sales))   # 4
sales.append(11000) # add a locker at the end
\`\`\`

Counting from 0 feels odd at first. Think of it as "how many steps from the start": the first item is 0 steps away.

Python has helpers that work on whole lists: \`sum(sales)\`, \`min(sales)\`, \`max(sales)\`, \`sorted(sales)\`.

## Loops: do this for each one

A **for loop** is a teacher walking down a row of desks, doing the same thing at each desk:

\`\`\`python
for amount in sales:
    print(amount)
\`\`\`

The indented lines run once for every item, and \`amount\` holds the current item each time round.

## The accumulator pattern

The most useful loop pattern in all of programming: start with an empty "running total", and add to it as you go. It is exactly how a cashier counts a pile of notes.

\`\`\`python
total = 0
for amount in sales:
    total = total + amount     # or: total += amount
print(total)
\`\`\`

The same pattern counts things (\`count += 1\` when a condition is true) or builds a new list (\`big.append(x)\`).

## range(): counting loops

\`range(5)\` gives 0, 1, 2, 3, 4. \`range(1, 6)\` gives 1 to 5. Use it when you need to repeat something a number of times:

\`\`\`python
for week in range(1, 5):
    print(f"Week {week}")
\`\`\`

## while loops (briefly)

\`while\` repeats *as long as* something is true, like "keep pouring until the cup is full". Be careful: if the condition never becomes false, the loop never stops.

## Your task

Write these **using loops** (you may also use \`len\`):

1. \`average(nums)\`: the mean of a list. Return \`0\` for an empty list (never divide by zero).
2. \`count_above(nums, limit)\`: how many numbers are strictly greater than \`limit\`.
3. \`running_totals(nums)\`: a new list of running totals: \`[5, 3, 2]\` becomes \`[5, 8, 10]\`.
4. \`biggest(nums)\`: the largest number, **without** using \`max\`. Return \`None\` for an empty list.`,
      task: 'Write average, count_above, running_totals and biggest.',
      starter: `def average(nums):
    pass

def count_above(nums, limit):
    pass

def running_totals(nums):
    pass

def biggest(nums):
    pass
`,
      checks: [
        { label: 'average works (and 0 for an empty list)', test: `return await py("average([2, 4, 9]) == 5 and average([]) == 0")` },
        { label: 'count_above counts strictly greater', test: `return await py("count_above([10, 50, 51, 90], 50) == 2 and count_above([], 1) == 0")` },
        { label: 'running_totals builds a new list', test: `return await py("running_totals([5, 3, 2]) == [5, 8, 10] and running_totals([]) == []")` },
        { label: 'biggest without max', test: `return await py("biggest([3, 99, -2, 7]) == 99 and biggest([-5, -9]) == -5 and biggest([]) is None")` },
      ],
      hint: 'biggest: start with best = nums[0] (after checking the list is not empty), then loop and replace best when you find a bigger number.',
      solution: `def average(nums):
    if len(nums) == 0:
        return 0
    total = 0
    for n in nums:
        total += n
    return total / len(nums)

def count_above(nums, limit):
    count = 0
    for n in nums:
        if n > limit:
            count += 1
    return count

def running_totals(nums):
    out = []
    total = 0
    for n in nums:
        total += n
        out.append(total)
    return out

def biggest(nums):
    if not nums:
        return None
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best
`,
    },
    {
      id: 'python-strings',
      title: 'Working with text',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'String methods, slicing, split and join, and cleaning real-world text like names and phone numbers.',
      body: `## Text is a list of characters

A string behaves like a list of letters. You can count it, index it and slice it:

\`\`\`python
city = "Port Harcourt"
len(city)      # 13
city[0]        # 'P'
city[0:4]      # 'Port'   from position 0 up to (not including) 4
city[-8:]      # 'Harcourt'
\`\`\`

Slicing is like cutting a loaf of bread: \`[start:end]\` keeps the slices from *start* up to, but not including, *end*.

## String methods: tools on a belt

Every string carries a tool belt of **methods**. You call them with a dot:

| Method | What it does | Example |
|---|---|---|
| \`.strip()\` | removes spaces at both ends | \`"  hi ".strip()\` → \`"hi"\` |
| \`.lower()\` / \`.upper()\` | changes case | \`"Ada".upper()\` → \`"ADA"\` |
| \`.title()\` | Capitalises Each Word | \`"ada obi".title()\` → \`"Ada Obi"\` |
| \`.replace(a, b)\` | swaps text | \`"1,200".replace(",", "")\` → \`"1200"\` |
| \`.startswith(x)\` | True / False | \`"+234...".startswith("+")\` |
| \`.split(sep)\` | cuts into a list | \`"a,b,c".split(",")\` → \`['a','b','c']\` |
| \`sep.join(list)\` | glues a list | \`"-".join(['a','b'])\` → \`"a-b"\` |

Strings are **immutable**: methods never change the original, they give you a new string. So you must keep the result: \`name = name.strip()\`.

## Checking characters

\`.isdigit()\` is True when every character is a digit. \`"7" in "2347"\` checks whether one string appears inside another. You can loop over a string: \`for ch in text:\` visits each character.

## Why this matters

Most real data is typed by people, and people are inconsistent. Customer names arrive as \`"  aDA  obi "\`, phone numbers as \`"0803 123 4567"\`, \`"+2348031234567"\` or \`"234-803-123-4567"\`. Before you can count customers or send messages, you must clean the text. That is everyday Python work in offices around the world.

## Your task

1. \`initials(full_name)\`: \`"  ada  ngozi obi "\` → \`"A.N.O."\` (first letter of each word, upper case, each followed by a dot).
2. \`clean_phone(text)\`: keep only the digits; then if the result starts with \`0\` and has 11 digits, replace the leading 0 with \`234\`. \`"0803 123 4567"\` → \`"2348031234567"\`, \`"+234-803-123-4567"\` → \`"2348031234567"\`. Anything else stays as its digits.
3. \`mask_email(email)\`: keep the first letter of the part before \`@\`, replace the rest of that part with \`***\`: \`"chika@mail.com"\` → \`"c***@mail.com"\`.`,
      task: 'Write initials, clean_phone and mask_email.',
      starter: `def initials(full_name):
    pass

def clean_phone(text):
    pass

def mask_email(email):
    pass
`,
      checks: [
        { label: 'initials from messy names', test: `return await py("initials('  ada  ngozi obi ') == 'A.N.O.' and initials('Musa') == 'M.'")` },
        { label: 'local numbers get 234', test: `return await py("clean_phone('0803 123 4567') == '2348031234567'")` },
        { label: 'international numbers are cleaned', test: `return await py("clean_phone('+234-803-123-4567') == '2348031234567' and clean_phone('(44) 20 7946') == '44207946'")` },
        { label: 'emails are masked', test: `return await py("mask_email('chika@mail.com') == 'c***@mail.com' and mask_email('bo@x.org') == 'b***@x.org'")` },
      ],
      hint: 'initials: "".join(w[0].upper() + "." for w in full_name.split()). clean_phone: build a string of the characters where ch.isdigit().',
      solution: `def initials(full_name):
    out = ""
    for word in full_name.split():
        out += word[0].upper() + "."
    return out

def clean_phone(text):
    digits = ""
    for ch in text:
        if ch.isdigit():
            digits += ch
    if digits.startswith("0") and len(digits) == 11:
        digits = "234" + digits[1:]
    return digits

def mask_email(email):
    name, domain = email.split("@")
    return name[0] + "***@" + domain
`,
    },
    {
      id: 'python-dicts',
      title: 'Dictionaries: data with labels',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'Key-value data, looking things up, counting with dictionaries and lists of records.',
      body: `## A dictionary is a phone book

A list finds things by position (locker 0, locker 1). A **dictionary** finds things by **name**, like a phone book: you look up *"Bola"* and get her number.

\`\`\`python
prices = {"bread": 1200, "milk": 900, "eggs": 3000}
prices["milk"]          # 900
prices["rice"] = 7500   # add or change an entry
"eggs" in prices        # True
prices.get("sugar", 0)  # 0: a safe lookup with a default
\`\`\`

Each entry is a **key** (the name you look up) and a **value** (what you get). Keys must be unique: a phone book cannot have two entries for exactly the same name.

## Looping over a dictionary

\`\`\`python
for item, price in prices.items():
    print(f"{item}: {price}")
\`\`\`

\`.keys()\` gives the keys, \`.values()\` the values, \`.items()\` both as pairs.

## The counting pattern

The second most useful pattern in programming (after the running total): **count how often each thing appears**. It is a tally sheet: for each new name, start a tally at 0; each time you see it, add one stroke.

\`\`\`python
counts = {}
for fruit in ["mango", "orange", "mango"]:
    counts[fruit] = counts.get(fruit, 0) + 1
# {'mango': 2, 'orange': 1}
\`\`\`

The same pattern **sums** per group: \`totals[branch] = totals.get(branch, 0) + amount\`. This one line is the heart of every "sales by branch" report.

## Records: a list of dictionaries

Real data usually looks like a table, and in Python each row is a dictionary:

\`\`\`python
orders = [
    {"customer": "Ada", "amount": 5000},
    {"customer": "Musa", "amount": 12000},
]
for o in orders:
    print(o["customer"], o["amount"])
\`\`\`

This is the same shape as JSON, the format almost every website and API uses to send data. Learn it well.

## Finding the best

To find the key with the biggest value, loop and remember the best so far, or use \`max(d, key=d.get)\`.

## Your task

1. \`word_counts(text)\`: count each word, ignoring case: \`"Buy rice buy beans"\` → \`{"buy": 2, "rice": 1, "beans": 1}\`.
2. \`sales_by_branch(orders)\`: orders is a list of dictionaries with \`"branch"\` and \`"amount"\`; return a dictionary of total amount per branch.
3. \`top_branch(orders)\`: the name of the branch with the highest total (use your function above). Return \`None\` when there are no orders.`,
      task: 'Write word_counts, sales_by_branch and top_branch.',
      starter: `def word_counts(text):
    return {}

def sales_by_branch(orders):
    return {}

def top_branch(orders):
    return None
`,
      checks: [
        { label: 'counts words, ignoring case', test: `return await py("word_counts('Buy rice buy beans BUY') == {'buy': 3, 'rice': 1, 'beans': 1}")` },
        { label: 'totals per branch', test: `return await py("sales_by_branch([{'branch': 'Wuse', 'amount': 5}, {'branch': 'Garki', 'amount': 7}, {'branch': 'Wuse', 'amount': 4}]) == {'Wuse': 9, 'Garki': 7}")` },
        { label: 'finds the top branch', test: `return await py("top_branch([{'branch': 'Wuse', 'amount': 5}, {'branch': 'Garki', 'amount': 7}, {'branch': 'Wuse', 'amount': 4}]) == 'Wuse'")` },
        { label: 'no orders: None', test: `return await py("top_branch([]) is None and sales_by_branch([]) == {}")` },
      ],
      hint: 'Use totals[o["branch"]] = totals.get(o["branch"], 0) + o["amount"]. For the top: if not totals: return None, then max(totals, key=totals.get).',
      solution: `def word_counts(text):
    counts = {}
    for w in text.lower().split():
        counts[w] = counts.get(w, 0) + 1
    return counts

def sales_by_branch(orders):
    totals = {}
    for o in orders:
        totals[o["branch"]] = totals.get(o["branch"], 0) + o["amount"]
    return totals

def top_branch(orders):
    totals = sales_by_branch(orders)
    if not totals:
        return None
    return max(totals, key=totals.get)
`,
    },
    {
      id: 'python-functions',
      title: 'Functions in depth',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'Default values, keyword arguments, returning several values, scope, docstrings and small reusable tools.',
      body: `## Why functions are the most important idea

Good programs are built like a car from parts: engine, wheels, brakes, each made and tested on its own. Functions are those parts. Each one should do **one job**, have a clear name, and be small enough to understand in one glance.

## Default values

A coffee machine has a default size: press the button and you get a medium, unless you choose otherwise. Parameters can have defaults too:

\`\`\`python
def price_after_discount(price, percent=0):
    return price - price * percent / 100

price_after_discount(1000)          # 1000.0 (no discount)
price_after_discount(1000, 10)      # 900.0
price_after_discount(1000, percent=25)  # keyword argument: clearer to read
\`\`\`

Parameters with defaults go **after** the ones without.

## Returning several values

Return a **tuple** (values separated by commas) and unpack it on the other side:

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([4, 9, 1])
\`\`\`

## Scope: what happens in the function stays in the function

Variables created inside a function are **local**: they exist only while it runs, like scribbles on a whiteboard wiped clean after each meeting. This is a feature: functions cannot accidentally break each other's variables. Give functions what they need through parameters and get results back with \`return\`, rather than reaching for outside variables.

## print versus return

Beginners often \`print\` the answer inside a function. That shows it on screen but gives nothing back to the code that called it, like a calculator that flashes the answer and then forgets it. **Return** values; print only at the edges of your program.

## Docstrings

The first line inside a function can be a string that explains it. Editors and AI assistants read it, and so do your teammates:

\`\`\`python
def vat(amount, rate=7.5):
    """VAT on an amount, rounded to 2 decimals."""
    return round(amount * rate / 100, 2)
\`\`\`

## Functions can use functions

Build big things from small, tested pieces: \`invoice_total\` can call \`vat\`, which you already trust.

## Your task

1. \`vat(amount, rate=7.5)\`: the VAT on an amount, rounded to 2 decimals.
2. \`invoice_total(items, rate=7.5)\`: items is a list of \`(price, quantity)\` pairs. Return a tuple \`(subtotal, vat, total)\`, using your \`vat\` function. Round the total to 2 decimals.
3. \`split_bill(total, people, tip_percent=0)\`: each person's share including the tip, rounded to 2 decimals. If \`people\` is less than 1, return \`None\`.`,
      task: 'Write vat, invoice_total and split_bill.',
      starter: `def vat(amount, rate=7.5):
    pass

def invoice_total(items, rate=7.5):
    pass

def split_bill(total, people, tip_percent=0):
    pass
`,
      checks: [
        { label: 'vat with a default rate', test: `return await py("vat(1000) == 75.0 and vat(1000, 20) == 200.0 and vat(333) == 24.98")` },
        { label: 'invoice_total returns three values', test: `return await py("invoice_total([(1000, 2), (500, 1)]) == (2500, 187.5, 2687.5)")` },
        { label: 'invoice_total uses the rate', test: `return await py("invoice_total([(100, 1)], rate=0) == (100, 0.0, 100.0)")` },
        { label: 'split_bill with tip and bad input', test: `return await py("split_bill(9000, 3) == 3000.0 and split_bill(10000, 4, tip_percent=10) == 2750.0 and split_bill(100, 0) is None")` },
      ],
      hint: 'In invoice_total: subtotal = sum(price * qty for price, qty in items), then v = vat(subtotal, rate) and return subtotal, v, round(subtotal + v, 2).',
      solution: `def vat(amount, rate=7.5):
    """VAT on an amount, rounded to 2 decimals."""
    return round(amount * rate / 100, 2)

def invoice_total(items, rate=7.5):
    """(subtotal, vat, total) for a list of (price, quantity) pairs."""
    subtotal = 0
    for price, qty in items:
        subtotal += price * qty
    v = vat(subtotal, rate)
    return subtotal, v, round(subtotal + v, 2)

def split_bill(total, people, tip_percent=0):
    """Each person's share, tip included."""
    if people < 1:
        return None
    return round(total * (1 + tip_percent / 100) / people, 2)
`,
    },
    {
      id: 'python-errors',
      title: 'Errors and defensive code',
      minutes: 30,
      kind: 'code',
      lang: 'python',
      outline: 'Read tracebacks, catch exceptions with try / except, raise your own errors and validate input.',
      body: `## Errors are messages, not failures

When Python cannot do something, it raises an **exception** and prints a **traceback**. Read it from the **bottom**:

\`\`\`
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    total = int(text)
ValueError: invalid literal for int() with base 10: 'twelve'
\`\`\`

The last line names the kind of error (\`ValueError\`) and what went wrong. The line above shows where. Common ones:

| Error | Usually means |
|---|---|
| \`SyntaxError\` | a typo: missing colon, bracket or quote |
| \`NameError\` | a misspelled variable or one used before it was created |
| \`TypeError\` | mixing types, like \`"5" + 3\` |
| \`ValueError\` | right type, bad value, like \`int("twelve")\` |
| \`KeyError\` | a dictionary key that does not exist |
| \`IndexError\` | a list position past the end |
| \`ZeroDivisionError\` | dividing by zero |

## try / except: the safety net

A trapeze artist works above a net. Most of the time it is not needed, but when something slips, the show goes on. \`try\` / \`except\` is that net:

\`\`\`python
try:
    qty = int(user_text)
except ValueError:
    qty = 0
    print("Please type a number")
\`\`\`

Always catch a **specific** error. A bare \`except:\` catches everything, including your own typos, and hides bugs.

## raise: refusing bad input

Sometimes your function should refuse to continue, like a bank teller refusing a cheque with no signature. Raise an exception with a helpful message:

\`\`\`python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > balance:
        raise ValueError("Not enough money")
    return balance - amount
\`\`\`

The code that calls \`withdraw\` decides what to do: show the message, log it, or try again.

## Defensive programming

Data from people, files and the internet will be wrong sometimes. Check it at the door: is it the right type, in range, not empty? Fail early with a clear message rather than producing a wrong answer later. A wrong total in a report is far worse than an error that says "row 14 has no amount".

## Your task

1. \`safe_divide(a, b)\`: return \`a / b\`, or \`None\` if b is zero (catch \`ZeroDivisionError\`).
2. \`parse_quantity(text)\`: turn text like \`" 12 "\` into the int \`12\`. Raise \`ValueError\` if it is not a whole number **or** if it is less than 1.
3. \`total_quantities(texts)\`: add up the valid quantities in a list of texts, skipping bad ones, and return a tuple \`(total, bad_count)\`. Use your \`parse_quantity\` with try / except.`,
      task: 'Write safe_divide, parse_quantity and total_quantities.',
      starter: `def safe_divide(a, b):
    return a / b

def parse_quantity(text):
    return int(text)

def total_quantities(texts):
    pass
`,
      checks: [
        { label: 'safe_divide handles zero', test: `return await py("safe_divide(10, 4) == 2.5 and safe_divide(1, 0) is None")` },
        { label: 'parse_quantity reads clean numbers', test: `return await py("parse_quantity(' 12 ') == 12")` },
        { label: 'parse_quantity refuses bad input', test: `return await py("def _raises(t):\\n    try:\\n        parse_quantity(t)\\n    except ValueError:\\n        return True\\n    return False\\nall(_raises(t) for t in ['abc', '0', '-3', '2.5'])")` },
        { label: 'total_quantities skips and counts bad rows', test: `return await py("total_quantities(['3', 'x', ' 4', '0', '10']) == (17, 2)")` },
      ],
      hint: 'parse_quantity: n = int(text.strip()) raises ValueError by itself for "abc" and "2.5"; then if n < 1: raise ValueError("Quantity must be at least 1").',
      solution: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

def parse_quantity(text):
    n = int(text.strip())
    if n < 1:
        raise ValueError("Quantity must be at least 1")
    return n

def total_quantities(texts):
    total = 0
    bad = 0
    for t in texts:
        try:
            total += parse_quantity(t)
        except ValueError:
            bad += 1
    return total, bad
`,
    },
    {
      id: 'python-csv',
      title: 'Reading data files (CSV)',
      minutes: 35,
      kind: 'code',
      lang: 'python',
      outline: 'Read CSV data with the csv module, turn rows into records, clean values and build a summary report.',
      body: `## CSV: the language spreadsheets speak

Almost every system can export a **CSV** file (comma-separated values): bank statements, POS sales, school results, Google Sheets. It is just text, one row per line, commas between columns:

\`\`\`
date,branch,product,amount
2026-11-01,Wuse,Bread,1200
2026-11-01,Garki,Milk,900
\`\`\`

If a spreadsheet is a printed table, a CSV is that same table read out loud over the phone: plain, simple, and understood everywhere.

## The csv module

Python comes with batteries included: a **module** is a toolbox you \`import\`. The \`csv\` module reads CSV text correctly, even tricky cases like a comma inside quotes (\`"Abuja, FCT"\`), which a simple \`split(",")\` would get wrong.

\`\`\`python
import csv
import io

text = open("sales.csv").read()          # on your own computer
rows = list(csv.DictReader(io.StringIO(text)))
rows[0]   # {'date': '2026-11-01', 'branch': 'Wuse', 'product': 'Bread', 'amount': '1200'}
\`\`\`

\`DictReader\` uses the first line as the column names and gives each row as a dictionary. Notice that **every value is text**, even the amount: \`'1200'\`. You must convert numbers yourself.

In this lesson the data comes as a string in the code, through \`io.StringIO\`, which makes a string behave like a file. On your own computer you would use \`open("file.csv")\` with exactly the same code after that.

## Clean as you read

Real exports contain blank lines, missing amounts and typos. The professional habit: **never crash on one bad row, and never silently include it**. Skip it, count it, and report it.

\`\`\`python
for row in rows:
    try:
        amount = float(row["amount"].replace(",", ""))
    except (ValueError, AttributeError):
        bad += 1
        continue        # skip to the next row
\`\`\`

\`continue\` jumps straight to the next round of the loop.

## Writing files

\`with open("report.txt", "w") as f: f.write(text)\` writes a file. The \`with\` block closes the file for you, even if something goes wrong.

## Your task

The starter contains \`DATA\`, a small sales export with some bad rows.

1. \`load(text)\`: return the rows as a list of dictionaries (use \`csv.DictReader\` and \`io.StringIO\`).
2. \`summarise(text)\`: return a dictionary with:
   - \`"total"\`: the sum of all valid amounts (amounts may contain commas, like \`"1,500"\`),
   - \`"by_branch"\`: a dictionary of total per branch (branch names trimmed),
   - \`"bad_rows"\`: how many rows had an amount that is missing or not a number.`,
      task: 'Write load and summarise for the sales CSV.',
      starter: `import csv
import io

DATA = """date,branch,product,amount
2026-11-01,Wuse,Bread,1200
2026-11-01,Garki,Milk,900
2026-11-02,Wuse ,Eggs,"1,500"
2026-11-02,Garki,Rice,
2026-11-03,Maitama,Oil,abc
2026-11-03,Garki,Bread,1200
"""

def load(text):
    return []

def summarise(text):
    return {}
`,
      checks: [
        { label: 'load gives 6 records with column names', test: `return await py("len(load(DATA)) == 6 and load(DATA)[0]['product'] == 'Bread'")` },
        { label: 'total of valid amounts', test: `return await py("summarise(DATA)['total'] == 4800")` },
        { label: 'totals per branch (names trimmed)', test: `return await py("summarise(DATA)['by_branch'] == {'Wuse': 2700, 'Garki': 2100}")` },
        { label: 'bad rows counted', test: `return await py("summarise(DATA)['bad_rows'] == 2")` },
      ],
      hint: 'In summarise, loop over load(text); amount = float(row["amount"].replace(",", "")) inside try, and except ValueError: bad += 1; continue.',
      solution: `import csv
import io

DATA = """date,branch,product,amount
2026-11-01,Wuse,Bread,1200
2026-11-01,Garki,Milk,900
2026-11-02,Wuse ,Eggs,"1,500"
2026-11-02,Garki,Rice,
2026-11-03,Maitama,Oil,abc
2026-11-03,Garki,Bread,1200
"""

def load(text):
    return list(csv.DictReader(io.StringIO(text)))

def summarise(text):
    total = 0
    by_branch = {}
    bad = 0
    for row in load(text):
        try:
            amount = float((row["amount"] or "").replace(",", ""))
        except ValueError:
            bad += 1
            continue
        branch = row["branch"].strip()
        total += amount
        by_branch[branch] = by_branch.get(branch, 0) + amount
    return {"total": total, "by_branch": by_branch, "bad_rows": bad}
`,
    },
    {
      id: 'python-classes',
      title: 'Classes and objects',
      minutes: 35,
      kind: 'code',
      lang: 'python',
      outline: 'Model real things with classes: attributes, methods, __init__, and keeping data valid inside an object.',
      body: `## A class is a blueprint

An architect draws one blueprint for a house, and builders use it to put up many houses. Each house is separate: paint one blue and the others stay white. In Python, the blueprint is a **class** and each house built from it is an **object** (or *instance*).

\`\`\`python
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

ada = Account("Ada")
musa = Account("Musa", 5000)
ada.deposit(2000)
print(ada.balance, musa.balance)   # 2000 5000
\`\`\`

## The parts

- \`class Account:\` names the blueprint (class names use CapitalWords).
- \`__init__\` runs automatically when an object is built. It sets up the object's starting data.
- \`self\` means "this particular object". \`self.balance\` is *this* account's balance, not every account's.
- **Attributes** are the object's data (\`owner\`, \`balance\`). **Methods** are functions that belong to it (\`deposit\`).

## Why bother?

Functions and dictionaries can do a lot. Classes help when data and the rules about that data belong together. An account's balance must never be changed carelessly: the only way in is through \`deposit\` and \`withdraw\`, which check the rules. That idea, keeping the rules next to the data, is called **encapsulation**. It is how banking, inventory and booking systems stay correct.

## Keeping objects valid

\`\`\`python
    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
\`\`\`

## A history list

Objects can hold lists. Recording every transaction in \`self.history\` gives you a statement for free, the way a bank keeps a ledger rather than just a final number.

## __str__: a friendly description

Define \`__str__(self)\` to control what \`print(ada)\` shows, for example \`Ada: 2000\`.

## Your task

Write a class \`Account\`:

1. \`Account(owner, balance=0)\` stores both, and starts \`self.history\` as an empty list.
2. \`deposit(amount)\`: raise \`ValueError\` if amount is not positive; otherwise add it, append \`("deposit", amount)\` to history and return the new balance.
3. \`withdraw(amount)\`: raise \`ValueError\` if amount is not positive or more than the balance; otherwise subtract, append \`("withdraw", amount)\` and return the new balance.
4. \`__str__\` returns \`"Ada: 2000"\` (owner, colon, space, balance).`,
      task: 'Write the Account class with deposit, withdraw, history and __str__.',
      starter: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
`,
      checks: [
        { label: 'stores owner and balance', test: `return await py("a = Account('Ada', 500)\\na.owner == 'Ada' and a.balance == 500 and Account('Bo').balance == 0 and a.history == []")` },
        { label: 'deposit adds and records', test: `return await py("a = Account('Ada')\\na.deposit(2000) == 2000 and a.history == [('deposit', 2000)]")` },
        { label: 'withdraw subtracts and records', test: `return await py("a = Account('Ada', 1000)\\na.withdraw(300) == 700 and a.history == [('withdraw', 300)]")` },
        { label: 'bad amounts are refused', test: `return await py("def _r(f):\\n    try:\\n        f()\\n    except ValueError:\\n        return True\\n    return False\\na = Account('Ada', 100)\\n_r(lambda: a.withdraw(500)) and _r(lambda: a.deposit(0)) and _r(lambda: a.withdraw(-1)) and a.balance == 100")` },
        { label: 'prints nicely', test: `return await py("str(Account('Ada', 2000)) == 'Ada: 2000'")` },
      ],
      hint: 'Check the bad cases first and raise ValueError("..."); only then change self.balance and append to self.history.',
      solution: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))
        return self.balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self.history.append(("withdraw", amount))
        return self.balance

    def __str__(self):
        return f"{self.owner}: {self.balance}"
`,
    },
    {
      id: 'python-pro',
      title: 'Writing Python like a professional',
      minutes: 35,
      kind: 'code',
      lang: 'python',
      outline: 'List and dictionary comprehensions, sorting with key and lambda, the standard library and clean code habits.',
      body: `## Comprehensions: a loop in one line

Many loops build a new list from an old one. Python has a short form for that, called a **comprehension**. It reads like a sentence: *"give me the price times 1.075, for each price in prices, if the price is over 1000"*.

\`\`\`python
prices = [500, 1200, 3000]
with_vat = [p * 1.075 for p in prices]
big = [p for p in prices if p > 1000]
by_name = {name: len(name) for name in ["Ada", "Musa"]}   # dictionary comprehension
\`\`\`

Use them for simple transformations. If you need several steps or an \`if\` / \`else\` chain, a normal loop is clearer.

## Sorting with a key

\`sorted\` sorts numbers and text. To sort records, tell it **what to compare** with \`key\`. A \`lambda\` is a tiny function without a name, perfect for this:

\`\`\`python
products = [{"name": "Rice", "sold": 40}, {"name": "Oil", "sold": 95}]
sorted(products, key=lambda p: p["sold"], reverse=True)   # best sellers first
\`\`\`

Think of \`key\` as telling a librarian whether to arrange the books by title, author or year.

## The standard library

Python ships with hundreds of modules. A few you will use constantly:

- \`math\`: \`math.sqrt\`, \`math.ceil\` (round up: how many buses for 130 pupils if each takes 50?)
- \`statistics\`: \`mean\`, \`median\`, \`stdev\`
- \`datetime\`: dates and times, \`date(2026, 12, 25) - date.today()\`
- \`random\`, \`json\`, \`csv\`, \`re\` (patterns in text), \`pathlib\` (files and folders)

Beyond it, the Python Package Index has more than half a million free packages: \`pandas\` for data, \`requests\` for websites and APIs, \`Django\` and \`FastAPI\` for web back ends, \`scikit-learn\` and \`PyTorch\` for machine learning.

## Clean code habits

- Names that explain: \`unpaid_invoices\`, not \`lst2\`.
- Small functions that do one thing.
- No magic numbers: \`VAT_RATE = 7.5\` at the top, not \`7.5\` scattered everywhere.
- Follow **PEP 8**, the Python style guide: 4-space indents, lowercase_with_underscores names.
- Test your functions with a few known answers, the way the checks in this course do. \`assert average([2, 4]) == 3\` stops the program loudly if it is ever wrong.

## Your task

1. \`with_vat(prices, rate=7.5)\`: a list comprehension returning each price with VAT added, rounded to 2 decimals.
2. \`top_products(products, n)\`: products is a list of dictionaries with \`"name"\` and \`"sold"\`. Return the **names** of the \`n\` best sellers, best first.
3. \`buses_needed(pupils, seats=50)\`: how many buses (round up, use \`math.ceil\`).
4. \`median_sale(sales)\`: the median, using the \`statistics\` module.`,
      task: 'Write with_vat, top_products, buses_needed and median_sale.',
      starter: `import math
import statistics

def with_vat(prices, rate=7.5):
    pass

def top_products(products, n):
    pass

def buses_needed(pupils, seats=50):
    pass

def median_sale(sales):
    pass
`,
      checks: [
        { label: 'with_vat adds VAT to every price', test: `return await py("with_vat([1000, 200]) == [1075.0, 215.0] and with_vat([100], rate=10) == [110.0]")` },
        { label: 'top_products returns the best names in order', test: `return await py("top_products([{'name': 'Rice', 'sold': 40}, {'name': 'Oil', 'sold': 95}, {'name': 'Salt', 'sold': 60}], 2) == ['Oil', 'Salt']")` },
        { label: 'buses_needed rounds up', test: `return await py("buses_needed(130) == 3 and buses_needed(100) == 2 and buses_needed(10, seats=4) == 3")` },
        { label: 'median_sale', test: `return await py("median_sale([5, 1, 9, 3]) == 4 and median_sale([7]) == 7")` },
      ],
      hint: 'top_products: [p["name"] for p in sorted(products, key=lambda p: p["sold"], reverse=True)[:n]]',
      solution: `import math
import statistics

def with_vat(prices, rate=7.5):
    return [round(p * (1 + rate / 100), 2) for p in prices]

def top_products(products, n):
    best = sorted(products, key=lambda p: p["sold"], reverse=True)
    return [p["name"] for p in best[:n]]

def buses_needed(pupils, seats=50):
    return math.ceil(pupils / seats)

def median_sale(sales):
    return statistics.median(sales)
`,
    },
    {
      id: 'python-ai-career',
      title: 'Python with AI, and your next steps',
      minutes: 25,
      kind: 'prompt',
      outline: 'Use AI to write, explain and debug code safely; what to learn next; building a portfolio and earning with Python.',
      body: `## AI is a pair programmer, not a replacement for understanding

AI assistants (like the tutor in CDM Studio) can write a working Python function in seconds. That is powerful, and it changes how programmers work. But an AI is like a very fast junior colleague who is confident even when wrong. **You** are the senior: you must read, test and understand every line before you trust it.

## Good ways to use AI with Python

1. **Explain**: paste code and ask "explain this line by line for a beginner".
2. **Debug**: paste the full traceback *and* the code. Ask for the cause first, then the fix. Last line of the traceback first, remember?
3. **Generate tests**: "write 5 test cases, including edge cases, for this function".
4. **Review**: "how could this be clearer or safer?"
5. **Translate**: "how would I do this with pandas?"

## A strong prompt has context

Weak: *"fix my code"*.
Strong: *"This Python function should return the total per branch from a list of dictionaries. For the input below it returns an empty dictionary. Here is the code and the input. Explain the bug, then show the corrected function."*

## Rules for safety

- Never paste passwords, API keys or customers' personal data into any AI tool.
- Run generated code on test data first.
- If you cannot explain a line, do not ship it.

## What to learn next

| If you want to… | Learn |
|---|---|
| Analyse data and make charts | pandas, matplotlib, Jupyter notebooks (and the **Data analytics** course) |
| Build websites and APIs | FastAPI or Django, databases (the **SQL** course) |
| Automate office work | openpyxl (Excel), python-docx, schedules, emails |
| Build AI apps | APIs of AI models, the **AI engineering** and **Machine learning** courses |

## Earning with Python

- **Portfolio**: put 3 to 5 small, real projects on GitHub with a clear README: a sales report generator, a price tracker, a quiz bot. Your final project in this course is a good first one.
- **Freelancing**: automation scripts, data cleaning and report generation are common small jobs on Upwork and Fiverr.
- **Jobs**: junior developer, data analyst, QA automation, back-end developer. Practise on sites like Exercism or LeetCode (easy problems) before interviews.

## Practise

Use the tutor to explain, debug and test code.`,
      practice: 'Paste one of your solutions from this course (for example summarise from the CSV lesson) and ask the tutor to: 1) explain it line by line, 2) suggest 3 edge cases that could break it, 3) suggest one improvement. Then deliberately break your code (remove a colon or misspell a variable), paste the error and ask the tutor to explain the traceback before giving the fix.',
    },
  ],
  project: {
    title: 'Sales report generator',
    lang: 'python',
    brief: `Build a Python program that a small shop owner could really use at the end of the month.

**What it does:** it reads the month's sales from CSV text (at least 12 rows that you write yourself, with columns such as date, product, quantity and price, including at least 2 deliberately bad rows), cleans the data, and prints a clear report.

**The report must show:** the total revenue, revenue per product, the 3 best-selling products, the best day, the average sale, and how many rows were skipped and why.

**How to work:** build it in the Studio code playground or on your own computer, test it until the output is right, then paste the **whole program** here. Use functions (and a class if it helps), and keep the data inside the program so the marker can read it.`,
    rubric: [
      'Keeps the sales data as CSV text inside the program with at least 12 rows and at least 2 bad rows',
      'Reads the CSV with the csv module (DictReader or reader) rather than only splitting on commas',
      'Converts text to numbers and handles bad rows with try / except, counting what was skipped',
      'Is organised into small, well-named functions (at least 3), each with one job',
      'Uses a dictionary (or class) to total revenue per product',
      'Finds the top 3 products using sorting with a key',
      'Works out the total revenue, average sale and best day correctly',
      'Prints a clear, readable report using f-strings with formatted money',
      'Uses constants or parameters instead of repeating magic numbers, and has helpful comments or docstrings',
    ],
  },
  exam: [
    { q: 'What does print("5 + 3") show?', options: ['8', '5 + 3', 'An error', '53'], answer: 1, why: 'It is text in quotes, so Python prints it as it is.' },
    { q: 'In Python, = means…', options: ['Is equal to', 'Put the value on the right into the variable on the left', 'Compare two values', 'Add'], answer: 1, why: '== compares; = assigns.' },
    { q: '17 // 5 and 17 % 5 give…', options: ['3 and 2', '3.4 and 2', '2 and 3', '3 and 0.4'], answer: 0, why: '// is whole division, % is the remainder.' },
    { q: '"5" + 3 raises which error?', options: ['ValueError', 'TypeError', 'NameError', 'SyntaxError'], answer: 1, why: 'You cannot add text and a number without converting.' },
    { q: 'name = "Ada"; what is f"Hi {name}!"?', options: ['Hi {name}!', 'Hi Ada!', 'Hi name!', 'An error'], answer: 1, why: 'f-strings fill in the variable.' },
    { q: 'How does Python know which lines belong to an if?', options: ['Curly braces', 'Indentation', 'Semicolons', 'The word end'], answer: 1, why: 'Indentation defines blocks in Python.' },
    { q: 'With if score >= 50: … elif score >= 70: …, a score of 90 takes…', options: ['The first branch', 'The elif branch', 'Both', 'Neither'], answer: 0, why: 'Python takes the first true condition, so put the highest check first.' },
    { q: 'sales = [10, 20, 30]. What is sales[-1]?', options: ['10', '30', '-1', 'An error'], answer: 1, why: 'Negative positions count from the end.' },
    { q: 'What does range(1, 4) give?', options: ['1, 2, 3, 4', '1, 2, 3', '0, 1, 2, 3', '4'], answer: 1, why: 'The end is not included.' },
    { q: 'The "accumulator" pattern means…', options: ['Starting with a total of 0 and adding inside a loop', 'Sorting a list', 'Deleting duplicates', 'Importing a module'], answer: 0, why: 'A running total built step by step.' },
    { q: '"  ada  ".strip().title() gives…', options: ['"Ada"', '"  Ada  "', '"ADA"', '"ada"'], answer: 0, why: 'strip removes the spaces, title capitalises.' },
    { q: 'Why must you write name = name.strip() and not just name.strip()?', options: ['Strings cannot be changed; methods return a new string', 'strip is slow', 'It is a style rule only', 'strip deletes the variable'], answer: 0, why: 'Strings are immutable.' },
    { q: 'prices.get("sugar", 0) when sugar is not a key returns…', options: ['A KeyError', '0', 'None', '"sugar"'], answer: 1, why: 'get returns the default instead of failing.' },
    { q: 'counts[w] = counts.get(w, 0) + 1 inside a loop…', options: ['Counts how often each word appears', 'Deletes words', 'Sorts words', 'Finds the longest word'], answer: 0, why: 'The counting pattern.' },
    { q: 'A function that prints its answer but does not return it…', options: ['Gives None to the code that called it', 'Is faster', 'Returns the printed text', 'Cannot be called'], answer: 0, why: 'Return values; print only at the edges.' },
    { q: 'def f(a, b=2): what does f(5) use for b?', options: ['Nothing, it fails', '2', '5', '0'], answer: 1, why: 'b falls back to its default.' },
    { q: 'When reading a traceback, start with…', options: ['The first line', 'The last line', 'The middle', 'The file name'], answer: 1, why: 'The last line names the error and the reason.' },
    { q: 'Why avoid a bare except:?', options: ['It catches every error and hides real bugs', 'It is slower', 'It is not valid Python', 'It only catches ValueError'], answer: 0, why: 'Catch the specific errors you expect.' },
    { q: 'csv.DictReader gives each amount as…', options: ['A number', 'Text that you must convert', 'A list', 'A date'], answer: 1, why: 'Everything read from CSV starts as text.' },
    { q: 'In a class, self means…', options: ['The class itself', 'This particular object', 'A global variable', 'The parent class'], answer: 1, why: 'self.balance is this object\'s balance.' },
    { q: '[p for p in prices if p > 1000] is…', options: ['A list comprehension that keeps prices over 1000', 'A dictionary', 'A syntax error', 'A loop that prints prices'], answer: 0, why: 'A filter written as a comprehension.' },
    { q: 'sorted(products, key=lambda p: p["sold"], reverse=True) sorts by…', options: ['Name', 'Units sold, highest first', 'Units sold, lowest first', 'Random order'], answer: 1, why: 'key chooses what to compare; reverse puts the biggest first.' },
    { q: 'The safest way to use AI-written code is to…', options: ['Paste it straight into production', 'Read it, understand it and test it first', 'Never use AI', 'Only use it if it is short'], answer: 1, why: 'You are responsible for every line you ship.' },
  ],
}
