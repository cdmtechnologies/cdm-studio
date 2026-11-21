import type { Quiz } from '../../src/lessons/types'
import type { CourseLesson, CourseProject } from '../types'

// Advanced lessons added to Machine learning foundations (before the final deployment and career lesson).
export const mlMore: CourseLesson[] = [
  {
    id: 'ml-logistic',
    title: 'Logistic regression: predicting yes or no',
    minutes: 35,
    kind: 'code',
    outline: 'The sigmoid function, probabilities instead of labels, decision thresholds and log loss.',
    body: `## From numbers to probabilities

Linear regression predicts a number, like a house price. Many business questions are **yes or no**: will this customer repay the loan? Is this transaction fraud? Will this student pass? **Logistic regression** is the classic model for these, and it is still used every day in banks and hospitals because it is fast and easy to explain.

## The sigmoid: squashing any number into 0 to 1

The model first works out a score exactly like linear regression: \`z = w1·x1 + w2·x2 + … + b\`. The score can be any number, from very negative to very positive. The **sigmoid** function squashes it into a probability between 0 and 1:

\`\`\`
sigmoid(z) = 1 / (1 + e^(−z))
\`\`\`

Think of it as a dimmer switch: a very negative score is almost fully off (close to 0), a very positive score is almost fully on (close to 1), and a score of 0 is exactly halfway (0.5).

## Probabilities are more useful than labels

"72% likely to default" is more useful than just "will default". The business can then decide the **threshold**:

- A bank might decline loans above 30% risk (being careful), and approve the rest.
- A spam filter might only send to the spam folder above 95%, because hiding a real email is costly.

Changing the threshold trades precision against recall (lesson 5): a lower threshold catches more true cases but raises more false alarms.

## Log loss: how wrong is a probability?

Accuracy only checks the final yes / no. **Log loss** (cross-entropy) checks how good the probabilities are. For one example with true label \`y\` (1 or 0) and predicted probability \`p\`:

\`\`\`
loss = −( y·log(p) + (1 − y)·log(1 − p) )
\`\`\`

Being confidently wrong is punished heavily: predicting 0.99 for something that turns out to be 0 gives a huge loss. Training adjusts the weights to make the average log loss as small as possible, using gradient descent as in the linear regression lesson.

## Reading the weights

Each weight shows how a feature pushes the prediction: positive weights push towards "yes", negative towards "no". That explainability is why regulators often prefer logistic regression for credit decisions: you can tell a customer *why* they were declined.

## Your task

1. \`sigmoid(z)\`.
2. \`predictProba(x, w, b)\`: \`x\` and \`w\` are arrays of the same length. Return \`sigmoid(w · x + b)\`.
3. \`classify(x, w, b, threshold = 0.5)\`: \`1\` when the probability is **at least** the threshold, otherwise \`0\`.
4. \`logLoss(yTrue, pPred)\`: the **average** log loss over two arrays. Clip each probability into the range \`[1e-15, 1 − 1e-15]\` first so \`log(0)\` never happens.`,
    task: 'Write sigmoid, predictProba, classify and logLoss.',
    starter: `<script>
  function sigmoid(z) {
  }
  function predictProba(x, w, b) {
  }
  function classify(x, w, b, threshold = 0.5) {
  }
  function logLoss(yTrue, pPred) {
  }
</script>
`,
    checks: [
      { label: 'sigmoid squashes into 0 to 1', test: `return sigmoid(0) === 0.5 && sigmoid(10) > 0.9999 && sigmoid(-10) < 0.0001 && Math.abs(sigmoid(2) - 0.8807970779778823) < 1e-12` },
      { label: 'predictProba uses weights and bias', test: `return Math.abs(predictProba([2, 1], [0.5, -1], 0.25) - sigmoid(0.25)) < 1e-12 && Math.abs(predictProba([1, 1], [1, 1], 0) - sigmoid(2)) < 1e-12` },
      { label: 'classify uses the threshold', test: `return classify([1, 1], [1, 1], 0) === 1 && classify([1, 1], [1, 1], 0, 0.9) === 0 && classify([0], [1], 0) === 1` },
      { label: 'logLoss averages and punishes confident mistakes', test: `const good = logLoss([1, 0], [0.9, 0.1]), bad = logLoss([1, 0], [0.1, 0.9]); return Math.abs(good - 0.10536051565782628) < 1e-9 && bad > 2 && Number.isFinite(logLoss([1], [0]))` },
    ],
    hint: 'logLoss: const p = Math.min(Math.max(pPred[i], 1e-15), 1 - 1e-15); total += -(y * Math.log(p) + (1 - y) * Math.log(1 - p)); then divide by the length.',
    solution: `<script>
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)) }
  function predictProba(x, w, b) { return sigmoid(x.reduce((s, xi, i) => s + xi * w[i], b)) }
  function classify(x, w, b, threshold = 0.5) { return predictProba(x, w, b) >= threshold ? 1 : 0 }
  function logLoss(yTrue, pPred) {
    let total = 0
    for (let i = 0; i < yTrue.length; i++) {
      const p = Math.min(Math.max(pPred[i], 1e-15), 1 - 1e-15)
      total += -(yTrue[i] * Math.log(p) + (1 - yTrue[i]) * Math.log(1 - p))
    }
    return total / yTrue.length
  }
</script>
`,
  },
  {
    id: 'ml-trees',
    title: 'Decision trees and random forests',
    minutes: 35,
    kind: 'code',
    outline: 'How a tree asks questions, Gini impurity, choosing the best split, and why forests and boosting win on tables.',
    body: `## Twenty questions

In the game of twenty questions, you guess a hidden thing by asking yes / no questions: *Is it alive? Is it bigger than a goat?* A good player asks the question that splits the possibilities most cleanly. A **decision tree** does exactly that with data:

\`\`\`
Is income above 300,000?
├── yes → Has missed a payment before?
│         ├── yes → risky
│         └── no  → safe
└── no  → Has a guarantor?
          ├── yes → safe
          └── no  → risky
\`\`\`

Each question is a **split** on one feature; each end (a **leaf**) gives a prediction. Trees are easy to read, handle numbers and categories, and need no scaling.

## Purity: how mixed is a group?

A group where every example has the same label is **pure**. A 50/50 mix is as impure as it gets. **Gini impurity** measures this:

\`\`\`
gini = 1 − Σ (share of each class)²
\`\`\`

- All one class: \`1 − 1² = 0\` (pure)
- Half and half: \`1 − (0.5² + 0.5²) = 0.5\`

## Choosing the best split

For each possible threshold on a feature, split the data into left (≤ threshold) and right (> threshold), and work out the **weighted** impurity:

\`\`\`
weighted = (nLeft / n) × gini(left) + (nRight / n) × gini(right)
\`\`\`

The best split has the **lowest** weighted impurity: it separates the classes most cleanly. The tree then repeats the process inside each side, like the next round of questions.

## Overfitting and forests

A tree allowed to grow forever memorises the training data: one leaf per customer. Limit the **depth** or the minimum examples per leaf. Even better, combine many trees:

- **Random forest**: train hundreds of trees, each on a random sample of rows and features, and let them vote. Like asking a crowd rather than one person, the errors cancel out.
- **Gradient boosting** (XGBoost, LightGBM, CatBoost): build trees one after another, each fixing the mistakes of the previous ones. On spreadsheet-style (tabular) data, boosted trees are often the strongest models available, and they win many data science competitions.

## Feature importance

Trees show which features were used most to reduce impurity, a useful first look at what drives predictions (with care: importance is not cause).

## Your task

Labels are 0 or 1.

1. \`gini(labels)\`: Gini impurity of a list of labels (\`0\` for an empty list).
2. \`splitScore(xs, ys, threshold)\`: weighted Gini impurity after splitting into \`x <= threshold\` and \`x > threshold\`.
3. \`bestSplit(xs, ys)\`: try every distinct value of \`xs\` as a threshold and return \`{ threshold, score }\` for the lowest score (the first one found wins a tie).`,
    task: 'Write gini, splitScore and bestSplit.',
    starter: `<script>
  function gini(labels) {
  }
  function splitScore(xs, ys, threshold) {
  }
  function bestSplit(xs, ys) {
  }
</script>
`,
    checks: [
      { label: 'gini of pure, mixed and empty groups', test: `return gini([1, 1, 1]) === 0 && gini([0, 1]) === 0.5 && Math.abs(gini([0, 0, 1]) - 4 / 9) < 1e-12 && gini([]) === 0` },
      { label: 'weighted score after a split', test: `return splitScore([1, 2, 3, 4], [0, 0, 1, 1], 2) === 0 && Math.abs(splitScore([1, 2, 3, 4], [0, 1, 0, 1], 2) - 0.5) < 1e-12` },
      { label: 'bestSplit finds the clean cut', test: `const r = bestSplit([20, 35, 50, 80, 120, 150], [0, 0, 0, 1, 1, 1]); return r.threshold === 50 && r.score === 0` },
      { label: 'bestSplit on messy data', test: `const r = bestSplit([1, 2, 3, 4, 5], [0, 0, 1, 0, 1]); return r.threshold === 2 && Math.abs(r.score - (3 / 5) * (4 / 9)) < 1e-12` },
    ],
    hint: 'gini: if (!labels.length) return 0; const p = labels.filter(y => y === 1).length / labels.length; return 1 - (p * p + (1 - p) * (1 - p))',
    solution: `<script>
  function gini(labels) {
    if (!labels.length) return 0
    const p = labels.filter((y) => y === 1).length / labels.length
    return 1 - (p * p + (1 - p) * (1 - p))
  }
  function splitScore(xs, ys, threshold) {
    const left = [], right = []
    xs.forEach((x, i) => (x <= threshold ? left : right).push(ys[i]))
    const n = ys.length
    return (left.length / n) * gini(left) + (right.length / n) * gini(right)
  }
  function bestSplit(xs, ys) {
    let best = null
    for (const t of [...new Set(xs)]) {
      const s = splitScore(xs, ys, t)
      if (!best || s < best.score) best = { threshold: t, score: s }
    }
    return best
  }
</script>
`,
  },
  {
    id: 'ml-features',
    title: 'Feature engineering and data leakage',
    minutes: 35,
    kind: 'code',
    outline: 'Turning raw data into useful features: one-hot encoding, dates, ratios, scaling with training statistics, and avoiding leakage.',
    body: `## Better ingredients, better meal

A great cook with rotten tomatoes still makes a bad stew. In machine learning, the **features** (the inputs) usually matter more than the choice of algorithm. **Feature engineering** is preparing good ingredients: turning raw columns into information a model can use.

## Categories become numbers: one-hot encoding

Models need numbers, but "city = Lagos" is a word. Giving cities numbers (Abuja = 1, Kano = 2, Lagos = 3) is a trap: the model would think Lagos is "three times" Abuja. Instead, **one-hot encoding** makes one yes / no column per category:

| city | is_Abuja | is_Kano | is_Lagos |
|---|---|---|---|
| Lagos | 0 | 0 | 1 |
| Abuja | 1 | 0 | 0 |

Categories never seen in training (a new city) get all zeros.

## Dates hide many features

A date like \`2026-12-24\` contains: the month (December: festive season), the day of the week (Thursday), whether it is a weekend or holiday, days until payday, days since the customer's last purchase. Each can be a strong feature.

## Ratios and combinations

Raw numbers are often less useful than relationships: *loan amount ÷ monthly income*, *price per kilogram*, *orders in the last 30 days ÷ orders in the previous 30 days*. Domain knowledge (understanding the business) is where the best features come from.

## Scaling, and the leakage trap

Many models (k-nearest neighbours, logistic regression, neural networks) work better when features are on similar scales. **Standardising** turns each value into \`(x − mean) / standard deviation\`.

Here is the trap: the mean and standard deviation must come from the **training data only**, and then be applied unchanged to the test data. If you compute them using all the data, information from the test set "leaks" into training, and your test score becomes too optimistic. It is like letting students see the exam questions while they revise: great marks, no learning.

## Other kinds of leakage

- Using a feature that is only known **after** the outcome (for example "number of collection calls" to predict loan default: those calls happen because of the default).
- Duplicated customers in both training and test sets.
- Shuffling time-series data so the model trains on the future and tests on the past. For anything over time, train on earlier dates and test on later ones.

If a model's score looks too good to be true, suspect leakage first.

## Your task

1. \`oneHot(values, categories)\`: for each value, an array of 0s and 1s in the order of \`categories\` (unknown values give all zeros).
2. \`fitScaler(xs)\`: return \`{ mean, std }\` of the training values (population standard deviation; if it is 0, use 1).
3. \`transform(xs, scaler)\`: standardise values with a fitted scaler.
4. \`dateFeatures(iso)\`: for a date string like \`"2026-12-24"\`, return \`{ month, weekday, weekend }\` where month is 1 to 12, weekday is 0 (Sunday) to 6 (Saturday) and weekend is \`true\` on Saturday and Sunday. Treat the date as UTC.`,
    task: 'Write oneHot, fitScaler, transform and dateFeatures.',
    starter: `<script>
  function oneHot(values, categories) {
  }
  function fitScaler(xs) {
  }
  function transform(xs, scaler) {
  }
  function dateFeatures(iso) {
  }
</script>
`,
    checks: [
      { label: 'one-hot encoding with unknown categories', test: `return JSON.stringify(oneHot(['Lagos', 'Abuja', 'Jos'], ['Abuja', 'Kano', 'Lagos'])) === '[[0,0,1],[1,0,0],[0,0,0]]'` },
      { label: 'scaler is fitted on training values', test: `const s = fitScaler([2, 4, 4, 4, 5, 5, 7, 9]); return s.mean === 5 && s.std === 2 && fitScaler([3, 3]).std === 1` },
      { label: 'test data uses the training scaler', test: `const s = fitScaler([2, 4, 4, 4, 5, 5, 7, 9]); return JSON.stringify(transform([5, 9, 1], s)) === '[0,2,-2]'` },
      { label: 'date features', test: `const a = dateFeatures('2026-12-24'), b = dateFeatures('2026-11-21'); return a.month === 12 && a.weekday === 4 && a.weekend === false && b.weekday === 6 && b.weekend === true` },
    ],
    hint: "dateFeatures: const d = new Date(iso + 'T00:00:00Z'); use d.getUTCMonth() + 1 and d.getUTCDay().",
    solution: `<script>
  function oneHot(values, categories) { return values.map((v) => categories.map((c) => (c === v ? 1 : 0))) }
  function fitScaler(xs) {
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length
    const std = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / xs.length)
    return { mean, std: std || 1 }
  }
  function transform(xs, scaler) { return xs.map((x) => (x - scaler.mean) / scaler.std) }
  function dateFeatures(iso) {
    const d = new Date(iso + 'T00:00:00Z')
    const weekday = d.getUTCDay()
    return { month: d.getUTCMonth() + 1, weekday, weekend: weekday === 0 || weekday === 6 }
  }
</script>
`,
  },
  {
    id: 'ml-neural',
    title: 'Neural networks and deep learning',
    minutes: 40,
    kind: 'code',
    outline: 'Neurons, layers, activation functions (ReLU), softmax for many classes, and how deep learning powers vision and language models.',
    body: `## A neuron is a tiny voter

A single artificial **neuron** takes some inputs, multiplies each by a weight, adds them up with a bias, and passes the total through an **activation function**. You have already met one: logistic regression is a single neuron with a sigmoid activation.

Picture a committee member who listens to several advisers, trusts some more than others (the weights), adds a personal leaning (the bias), and then decides how strongly to speak up (the activation).

## Layers: committees of committees

A **neural network** stacks neurons in layers:

1. The **input layer** holds the features (pixels of an image, words of a sentence, columns of a table).
2. **Hidden layers** each combine the previous layer's outputs. Early layers learn simple patterns (edges in a photo); later layers combine them into complex ones (eyes, faces).
3. The **output layer** gives the prediction.

"Deep" learning simply means many hidden layers.

## Activation functions

Without activations, stacking layers would still only make a straight-line model. Activations add bends:

- **ReLU** (rectified linear unit): \`max(0, z)\`. Negative becomes 0, positive passes through. Simple, fast and the most common choice in hidden layers.
- **Sigmoid**: squashes to 0 to 1, for a single yes / no output.
- **Softmax**: for choosing between **many** classes (cat, dog or goat; which of 10 digits). It turns a list of scores into probabilities that add up to 1:

\`\`\`
softmax(z)_i = e^(z_i) / Σ e^(z_j)
\`\`\`

A trick used everywhere: subtract the largest score before taking exponents. The answer is the same, but huge numbers no longer overflow.

## Training: backpropagation

Training works like before: predict, measure the loss, and nudge every weight slightly in the direction that reduces the loss. **Backpropagation** is the method that works out, layer by layer from the output backwards, how much each weight was to blame. Libraries such as **PyTorch**, **TensorFlow** and **JAX** do this automatically on graphics cards (GPUs).

## What deep learning is good at

- **Images**: convolutional networks and vision transformers for medical scans, crop disease detection from phone photos, quality checks in factories.
- **Language**: **transformers**, the architecture behind large language models (the AI engineering course explains how they generate text).
- **Speech**, recommendations, translation and more.

For ordinary business tables, gradient-boosted trees (previous lessons) often still win, with less data and less computing power. Choose the tool that fits the problem.

## Your task

Build the forward pass of a small network:

1. \`relu(z)\`: works on a number **or** an array of numbers.
2. \`dense(x, W, b)\`: one layer. \`W\` is a list of rows, one row of weights per neuron; return \`W[i] · x + b[i]\` for each neuron.
3. \`softmax(z)\`: probabilities that add up to 1 (use the subtract-the-max trick).
4. \`forward(x, layers)\`: \`layers\` is a list of \`{ W, b }\`. Apply \`dense\` then \`relu\` for every layer **except the last**, which uses \`dense\` then \`softmax\`.`,
    task: 'Write relu, dense, softmax and forward.',
    starter: `<script>
  function relu(z) {
  }
  function dense(x, W, b) {
  }
  function softmax(z) {
  }
  function forward(x, layers) {
  }
</script>
`,
    checks: [
      { label: 'relu on numbers and arrays', test: `return relu(-3) === 0 && relu(2.5) === 2.5 && JSON.stringify(relu([-1, 0, 4])) === '[0,0,4]'` },
      { label: 'dense computes one output per neuron', test: `return JSON.stringify(dense([1, 2], [[1, 0], [0.5, -1], [2, 2]], [0, 1, -1])) === '[1,-0.5,5]'` },
      { label: 'softmax sums to 1 and survives big numbers', test: `const p = softmax([1, 2, 3]); const q = softmax([1000, 1001]); return Math.abs(p.reduce((a, b) => a + b, 0) - 1) < 1e-12 && p[2] > p[1] && Math.abs(p[0] - 0.09003057317038046) < 1e-12 && q.every(Number.isFinite) && Math.abs(q[1] - 0.7310585786300049) < 1e-12` },
      { label: 'forward applies relu between layers and softmax at the end', test: `const layers = [{ W: [[1, -1], [-1, 1]], b: [0, 0] }, { W: [[1, 0], [0, 1]], b: [0, 0] }]; const out = forward([3, 1], layers); return out.length === 2 && Math.abs(out[0] - softmax([2, 0])[0]) < 1e-12` },
    ],
    hint: 'softmax: const m = Math.max(...z); const e = z.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s)',
    solution: `<script>
  function relu(z) { return Array.isArray(z) ? z.map((v) => Math.max(0, v)) : Math.max(0, z) }
  function dense(x, W, b) { return W.map((row, i) => row.reduce((s, w, j) => s + w * x[j], b[i])) }
  function softmax(z) {
    const m = Math.max(...z)
    const e = z.map((v) => Math.exp(v - m))
    const s = e.reduce((a, b) => a + b, 0)
    return e.map((v) => v / s)
  }
  function forward(x, layers) {
    let a = x
    layers.forEach((l, i) => {
      const z = dense(a, l.W, l.b)
      a = i === layers.length - 1 ? softmax(z) : relu(z)
    })
    return a
  }
</script>
`,
  },
]

export const mlProject: CourseProject = {
  title: 'Build and evaluate a model end to end',
  lang: 'html',
  brief: `Pick a real prediction problem (will a customer return next month, is a loan likely to be repaid, which crop variety suits a plot, will a student pass) and build a small **machine learning app in CDM Studio** that solves it in JavaScript, from scratch.

**It must:** include a dataset you prepare (at least 40 rows, realistic, with at least 3 features, kept in the page), split it into training and test sets, prepare the features (scaling or encoding, fitted on training data only), train at least **two** models from this course (for example k-nearest neighbours and logistic regression or a decision stump) and compare them on the test set with accuracy plus precision and recall, and let a user enter new values to get a prediction.

Add a short "Model card" section: what the model is for, the data, the results, the limits, and any fairness risks.`,
  rubric: [
    'Defines a real prediction problem and who would use the predictions',
    'Includes a prepared dataset of at least 40 rows with at least 3 features',
    'Splits data into training and test sets and evaluates only on the test set',
    'Prepares features correctly (scaling or encoding fitted on training data only, no leakage)',
    'Implements and trains at least two different models from the course',
    'Reports accuracy, precision and recall for each model and compares them',
    'Lets a user enter new values and see a prediction (with a probability or confidence where possible)',
    'Includes a model card covering purpose, data, results, limits and fairness risks',
    'Code is organised into clear functions with sensible names',
  ],
}

export const mlExam: Quiz[] = [
  { q: 'The sigmoid function turns any score into…', options: ['A whole number', 'A probability between 0 and 1', 'A negative number', 'A category name'], answer: 1, why: 'It squashes scores into 0 to 1.' },
  { q: 'Lowering the threshold of a fraud model usually…', options: ['Catches more fraud but raises more false alarms', 'Has no effect', 'Always improves accuracy', 'Removes all errors'], answer: 0, why: 'It trades precision for recall.' },
  { q: 'Gini impurity of a group that is all one class is…', options: ['0', '0.5', '1', '100'], answer: 0, why: 'A pure group has no impurity.' },
  { q: 'A random forest improves on one decision tree by…', options: ['Using a single very deep tree', 'Averaging many trees trained on random samples', 'Removing all features', 'Only using text data'], answer: 1, why: 'Many trees voting cancel out errors.' },
  { q: 'Scaling statistics (mean and standard deviation) should be computed from…', options: ['All the data', 'The training data only', 'The test data only', 'Random numbers'], answer: 1, why: 'Otherwise test information leaks into training.' },
  { q: 'Softmax is used in the output layer when…', options: ['Choosing between many classes', 'Predicting a price', 'Clustering', 'Cleaning data'], answer: 0, why: 'It turns scores into probabilities that add up to 1.' },
]
