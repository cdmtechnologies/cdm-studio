import type { Course } from './types'
import { mlExam, mlMore, mlProject } from './extra/ml'

export const ml: Course = {
  id: 'ml',
  title: 'Machine learning foundations',
  blurb: 'Understand how machines learn from data by building the core algorithms yourself: regression, classification, evaluation and fairness.',
  emoji: '🧠',
  colour: 'rose',
  level: 'Intermediate',
  hours: 14,
  free: 2,
  skills: ['Features, labels and datasets', 'Train/test splits', 'Linear regression', 'Classification with k-nearest neighbours', 'Accuracy, precision and recall', 'Overfitting and fairness'],
  careers: ['Junior data scientist', 'ML engineer (entry)', 'Data analyst using ML', 'AI product analyst'],
  lessons: [
    {
      id: 'ml-what-is-ml',
      title: 'What machine learning really is',
      minutes: 20,
      kind: 'read',
      outline: 'Rules vs learning, features and labels, the three kinds of machine learning.',
      body: `## From rules to examples

Normal software follows **rules a person wrote**: *if the basket is over ₦50,000, give 5% off.* Machine learning (ML) is different: you give the computer **examples**, and it **finds the rule** itself.

- Spam filters learned from millions of emails marked "spam" or "not spam".
- Loan apps learn which applicants repaid from past loans.
- Your phone's keyboard learned which word you usually type next.

ML is useful when the rule is too complicated to write by hand, or when it changes over time.

## The vocabulary

Imagine a table of past house sales in Abuja:

| size (m²) | bedrooms | area | price (₦m) |
|---|---|---|---|
| 120 | 3 | Gwarinpa | 85 |
| 300 | 5 | Maitama | 420 |

- Each **row** is an **example** (also called a sample or record).
- The input columns (size, bedrooms, area) are **features**.
- The column we want to predict (price) is the **label** or **target**.
- A **model** is the rule learned from the examples: give it features, it predicts the label.
- **Training** means finding the model; **inference** (or prediction) means using it on new examples.

## Three kinds of machine learning

1. **Supervised learning**: examples come with labels. *Regression* predicts a number (price, demand); *classification* predicts a category (spam / not spam, will repay / will default).
2. **Unsupervised learning**: no labels; find structure. *Clustering* groups similar customers; *anomaly detection* spots unusual transactions.
3. **Reinforcement learning**: an agent learns by trial and reward (games, robots, some recommendation systems).

Large language models like Claude are trained mostly with self-supervised learning (predicting the next word), then improved with human feedback.

## Garbage in, garbage out

A model can only be as good as its data. If the data is **too small**, **wrong**, **old** or **unfair** (for example, only from one city or one group of people), the model will be too. Most of a data scientist's time goes into collecting and cleaning data, not into algorithms.

In this course you will build the core algorithms in plain JavaScript, so you understand what libraries like scikit-learn, TensorFlow and PyTorch do for you.`,
      quiz: [
        { q: 'Predicting tomorrow\'s sales in naira is…', options: ['Classification', 'Regression', 'Clustering'], answer: 1, why: 'A number is predicted: regression.' },
        { q: 'In a table predicting loan repayment, "repaid: yes/no" is the…', options: ['Feature', 'Label', 'Model'], answer: 1, why: 'The value we want to predict is the label.' },
        { q: 'Grouping customers by buying habits with no labels is…', options: ['Supervised learning', 'Unsupervised learning (clustering)', 'Reinforcement learning'], answer: 1, why: 'No labels: unsupervised.' },
      ],
    },
    {
      id: 'ml-data-prep',
      title: 'Preparing data: cleaning, scaling and splitting',
      minutes: 25,
      kind: 'code',
      outline: 'Remove bad rows, scale features with min-max, and split data into training and test sets.',
      body: `## Clean before you learn

Real data has missing values, typing mistakes and outliers. Common first steps:

- **Drop or fill missing values** (here we drop rows with any missing number)
- **Scale features** so a big-number feature (price in naira) does not drown a small one (bedrooms). **Min-max scaling** maps each value to between 0 and 1: \`(x - min) / (max - min)\`.
- **Split** the data: train the model on one part, and test it on data it has **never seen**. Testing on the training data is like marking an exam with the answers the student memorised.

A common split is 80% training, 20% test. Shuffle first, so the test set is not just "the last month". For tests to be repeatable, use a fixed **seed** for the shuffle; here we keep it simple and split in order after you shuffle elsewhere.

## Your task

1. \`clean(rows)\`: keep only rows where **every** value is a finite number (\`Number.isFinite\`).
2. \`minMax(values)\`: return the values scaled to 0..1. If all values are the same, return all zeros.
3. \`split(rows, testShare)\`: return \`{ train, test }\` where \`test\` is the **last** \`Math.round(rows.length * testShare)\` rows and \`train\` is the rest, without changing the original array.`,
      task: 'Write clean, minMax and split.',
      starter: `<script>
  function clean(rows) {
  }
  function minMax(values) {
  }
  function split(rows, testShare) {
  }
</script>
`,
      checks: [
        { label: 'clean drops rows with missing or bad numbers', test: `return JSON.stringify(clean([[1, 2], [3, null], [NaN, 4], [5, 6], [7, Infinity]])) === '[[1,2],[5,6]]'` },
        { label: 'minMax scales to 0..1', test: `return JSON.stringify(minMax([10, 20, 30])) === '[0,0.5,1]'` },
        { label: 'minMax of equal values is zeros', test: `return JSON.stringify(minMax([4, 4])) === '[0,0]'` },
        { label: 'split 80/20', test: `const r = split([1,2,3,4,5,6,7,8,9,10], 0.2); return JSON.stringify(r.test) === '[9,10]' && r.train.length === 8` },
        { label: 'split does not change the original', test: `const a = [1,2,3,4,5]; split(a, 0.4); return a.length === 5` },
      ],
      hint: 'clean: rows.filter(r => r.every(v => Number.isFinite(v))). minMax: const lo = Math.min(...values), hi = Math.max(...values); return values.map(v => hi === lo ? 0 : (v - lo) / (hi - lo)). split: const n = Math.round(rows.length * testShare); return { train: rows.slice(0, rows.length - n), test: rows.slice(rows.length - n) }',
      solution: `<script>
  function clean(rows) { return rows.filter((r) => r.every((v) => Number.isFinite(v))) }
  function minMax(values) { const lo = Math.min(...values), hi = Math.max(...values); return values.map((v) => (hi === lo ? 0 : (v - lo) / (hi - lo))) }
  function split(rows, testShare) { const n = Math.round(rows.length * testShare); return { train: rows.slice(0, rows.length - n), test: rows.slice(rows.length - n) } }
</script>`,
    },
    {
      id: 'ml-regression',
      title: 'Linear regression from scratch',
      minutes: 30,
      kind: 'code',
      outline: 'Fit a straight line with least squares, predict, and measure error with MAE and RMSE.',
      body: `## The simplest useful model

**Linear regression** predicts a number with a straight line: \`y = slope × x + intercept\`. For example, a bakery's daily sales against the number of WhatsApp status views.

**Least squares** finds the line that makes the squared prediction errors as small as possible. For one feature there is an exact formula:

\`\`\`text
slope     = Σ (x - meanX)(y - meanY)  ÷  Σ (x - meanX)²
intercept = meanY - slope × meanX
\`\`\`

## Measuring error

- **MAE** (mean absolute error): the average of |actual - predicted|. Easy to explain: *"on average we are ₦3,000 off"*.
- **RMSE** (root mean squared error): square the errors, average, take the square root. Punishes big misses more.
- **R²**: share of the variation the model explains (1 is perfect, 0 is no better than guessing the average).

Always measure on the **test** set.

## Your task

1. \`fit(xs, ys)\` returns \`{ slope, intercept }\` by least squares.
2. \`predict(model, x)\` returns \`slope * x + intercept\`.
3. \`mae(actual, predicted)\` and \`rmse(actual, predicted)\`.`,
      task: 'Write fit, predict, mae and rmse.',
      starter: `<script>
  function fit(xs, ys) {
  }
  function predict(model, x) {
  }
  function mae(actual, predicted) {
  }
  function rmse(actual, predicted) {
  }
</script>
`,
      checks: [
        { label: 'fit finds y = 2x + 1', test: `const m = fit([1, 2, 3, 4], [3, 5, 7, 9]); return Math.abs(m.slope - 2) < 1e-9 && Math.abs(m.intercept - 1) < 1e-9` },
        { label: 'fit works on noisy data', test: `const m = fit([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]); return Math.abs(m.slope - 0.6) < 1e-9 && Math.abs(m.intercept - 2.2) < 1e-9` },
        { label: 'predict uses the line', test: `return predict({ slope: 3, intercept: -1 }, 4) === 11` },
        { label: 'mae averages absolute errors', test: `return mae([10, 20, 30], [12, 18, 33]) === 7 / 3` },
        { label: 'rmse', test: `return Math.abs(rmse([1, 2, 3], [1, 2, 6]) - Math.sqrt(3)) < 1e-9` },
      ],
      hint: 'const mx = xs.reduce((a, b) => a + b, 0) / xs.length (same for my). Then loop: num += (x - mx) * (y - my); den += (x - mx) ** 2.',
      solution: `<script>
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
  function fit(xs, ys) {
    const mx = mean(xs), my = mean(ys); let num = 0, den = 0
    xs.forEach((x, i) => { num += (x - mx) * (ys[i] - my); den += (x - mx) ** 2 })
    const slope = num / den
    return { slope, intercept: my - slope * mx }
  }
  function predict(m, x) { return m.slope * x + m.intercept }
  function mae(a, p) { return a.reduce((s, v, i) => s + Math.abs(v - p[i]), 0) / a.length }
  function rmse(a, p) { return Math.sqrt(a.reduce((s, v, i) => s + (v - p[i]) ** 2, 0) / a.length) }
</script>`,
    },
    {
      id: 'ml-knn',
      title: 'Classification with k-nearest neighbours',
      minutes: 30,
      kind: 'code',
      outline: 'Distance between examples, majority voting, and build a k-NN classifier.',
      body: `## Ask the neighbours

**k-nearest neighbours (k-NN)** classifies a new example by looking at the **k** most similar training examples and taking a **majority vote**. To decide if a new customer will repay, look at the 5 past customers most like them.

## Distance

"Similar" means **close** in feature space. With two features (income, existing debt), the **Euclidean distance** between a and b is:

\`\`\`text
√((a₁ - b₁)² + (a₂ - b₂)² + …)
\`\`\`

This is why scaling (lesson 2) matters: without it, a feature measured in naira would dominate one measured in years.

## Choosing k

- Small k (1) follows the training data too closely and is fooled by noise.
- Large k smooths too much and ignores local patterns.
- Use an odd k for two classes to avoid ties; try several values and pick the best on validation data.

## Your task

1. \`distance(a, b)\`: Euclidean distance between two arrays of numbers.
2. \`knn(train, point, k)\`: \`train\` is an array of \`{ x: [..], label }\`. Return the most common label among the k nearest. If there is a tie in votes, return the label of the **single nearest** example among the tied labels.`,
      task: 'Write distance and knn.',
      starter: `<script>
  function distance(a, b) {
  }
  function knn(train, point, k) {
  }
</script>
`,
      checks: [
        { label: 'distance 3-4-5', test: `return distance([0, 0], [3, 4]) === 5` },
        { label: 'distance in 3 dimensions', test: `return distance([1, 2, 3], [1, 2, 3]) === 0 && Math.abs(distance([0,0,0],[1,1,1]) - Math.sqrt(3)) < 1e-12` },
        { label: 'k=1 copies the nearest', test: `const t = [{ x: [0, 0], label: 'repay' }, { x: [10, 10], label: 'default' }]; return knn(t, [1, 1], 1) === 'repay'` },
        { label: 'k=3 majority vote', test: `const t = [{ x: [0, 0], label: 'A' }, { x: [1, 0], label: 'B' }, { x: [0, 1], label: 'B' }, { x: [9, 9], label: 'A' }]; return knn(t, [0.1, 0.1], 3) === 'B'` },
        { label: 'ties go to the nearest label', test: `const t = [{ x: [0, 0], label: 'A' }, { x: [2, 0], label: 'B' }]; return knn(t, [0.5, 0], 2) === 'A'` },
      ],
      hint: 'Sort copies: train.map(e => ({ ...e, d: distance(e.x, point) })).sort((a, b) => a.d - b.d).slice(0, k). Count votes in an object, find the best count, then pick the first label in the sorted list whose count equals it.',
      solution: `<script>
  function distance(a, b) { return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) }
  function knn(train, point, k) {
    const near = train.map((e) => ({ ...e, d: distance(e.x, point) })).sort((a, b) => a.d - b.d).slice(0, k)
    const votes = {}
    for (const n of near) votes[n.label] = (votes[n.label] || 0) + 1
    const best = Math.max(...Object.values(votes))
    return near.find((n) => votes[n.label] === best).label
  }
</script>`,
    },
    {
      id: 'ml-metrics',
      title: 'Is the model any good? Accuracy, precision, recall',
      minutes: 25,
      kind: 'code',
      outline: 'The confusion matrix and why accuracy can lie, with a fraud-detection example.',
      body: `## Accuracy can lie

A fraud model that always says "not fraud" is **99% accurate** if 1% of transactions are fraud, and completely useless. For classification, look deeper with the **confusion matrix** (for the class we care about, called "positive"):

| | predicted positive | predicted negative |
|---|---|---|
| **actually positive** | true positive (TP) | false negative (FN) |
| **actually negative** | false positive (FP) | true negative (TN) |

- **Accuracy** = (TP + TN) / all
- **Precision** = TP / (TP + FP): *when it says fraud, how often is it right?* Low precision means many innocent customers blocked.
- **Recall** = TP / (TP + FN): *of all real fraud, how much did it catch?* Low recall means fraud slips through.
- **F1** = 2 × precision × recall / (precision + recall): one balanced number.

Which matters more depends on the cost of each mistake. Medical screening favours recall (do not miss a sick patient); a spam filter favours precision (do not hide a real email).

## Your task

Write \`confusion(actual, predicted, positive)\` returning \`{ tp, fp, fn, tn }\`, and \`metrics(actual, predicted, positive)\` returning \`{ accuracy, precision, recall, f1 }\`. If a division has 0 below the line, use 0.`,
      task: 'Write confusion and metrics.',
      starter: `<script>
  function confusion(actual, predicted, positive) {
  }
  function metrics(actual, predicted, positive) {
  }
</script>
`,
      checks: [
        { label: 'confusion counts', test: `const c = confusion(['f','n','f','n','n'], ['f','f','n','n','n'], 'f'); return c.tp === 1 && c.fp === 1 && c.fn === 1 && c.tn === 2` },
        { label: 'accuracy', test: `return metrics(['f','n','f','n','n'], ['f','f','n','n','n'], 'f').accuracy === 0.6` },
        { label: 'precision and recall', test: `const m = metrics(['f','f','f','n'], ['f','f','n','n'], 'f'); return m.precision === 1 && Math.abs(m.recall - 2/3) < 1e-12` },
        { label: 'f1', test: `const m = metrics(['f','f','f','n'], ['f','f','n','n'], 'f'); return Math.abs(m.f1 - 0.8) < 1e-12` },
        { label: 'always-negative model: precision 0, not a crash', test: `const m = metrics(['f','n','n'], ['n','n','n'], 'f'); return m.precision === 0 && m.recall === 0 && m.f1 === 0` },
      ],
      hint: 'Loop over the indexes: const a = actual[i] === positive, p = predicted[i] === positive; then count tp (a && p), fp (!a && p), fn (a && !p), tn. const div = (x, y) => (y ? x / y : 0).',
      solution: `<script>
  function confusion(actual, predicted, positive) {
    const c = { tp: 0, fp: 0, fn: 0, tn: 0 }
    actual.forEach((v, i) => { const a = v === positive, p = predicted[i] === positive; if (a && p) c.tp++; else if (!a && p) c.fp++; else if (a && !p) c.fn++; else c.tn++ })
    return c
  }
  function metrics(actual, predicted, positive) {
    const { tp, fp, fn, tn } = confusion(actual, predicted, positive)
    const div = (x, y) => (y ? x / y : 0)
    const precision = div(tp, tp + fp), recall = div(tp, tp + fn)
    return { accuracy: div(tp + tn, tp + fp + fn + tn), precision, recall, f1: div(2 * precision * recall, precision + recall) }
  }
</script>`,
    },
    {
      id: 'ml-overfitting',
      title: 'Overfitting, validation and fairness',
      minutes: 25,
      kind: 'code',
      outline: 'Why models memorise, k-fold cross-validation, and check a model for unfair error rates between groups.',
      body: `## Memorising is not learning

A model **overfits** when it learns the training data's noise instead of the real pattern: excellent on training data, poor on new data. Signs: training accuracy far above test accuracy. Fixes: more data, a simpler model, fewer features, regularisation, or early stopping.

The opposite, **underfitting**, is a model too simple to capture the pattern: poor on both.

## Cross-validation

One test split can be lucky or unlucky. **k-fold cross-validation** splits the data into k parts (folds); each fold takes a turn as the test set while the model trains on the rest; you average the k scores. It gives a more reliable estimate, especially with small datasets.

## Fairness

A model can be accurate overall and still unfair to a group. A credit model may wrongly reject far more applicants from one region or gender. Responsible teams:

- Measure errors **per group** (for example the false negative rate for each region)
- Remove or question features that act as proxies for protected traits (an address can stand in for ethnicity)
- Keep humans accountable for decisions about people, and explain decisions when asked (Nigeria's NDPA and the EU's GDPR give people rights around automated decisions)

## Your task

1. \`folds(n, k)\`: split the indexes 0..n-1 into k folds **in order**, as equal as possible (the first \`n % k\` folds get one extra). Return an array of arrays of indexes.
2. \`errorRateByGroup(rows)\`: \`rows\` are \`{ group, actual, predicted }\`. Return an object mapping each group to its error rate (wrong / total), and \`gap\`, the largest rate minus the smallest, as \`{ rates, gap }\`.`,
      task: 'Write folds and errorRateByGroup.',
      starter: `<script>
  function folds(n, k) {
  }
  function errorRateByGroup(rows) {
  }
</script>
`,
      checks: [
        { label: '10 into 3 folds', test: `return JSON.stringify(folds(10, 3)) === '[[0,1,2,3],[4,5,6],[7,8,9]]'` },
        { label: 'equal folds', test: `return JSON.stringify(folds(4, 2)) === '[[0,1],[2,3]]'` },
        { label: 'every index exactly once', test: `return folds(17, 5).flat().join(',') === Array.from({ length: 17 }, (_, i) => i).join(',')` },
        { label: 'error rate per group', test: `const r = errorRateByGroup([{ group: 'North', actual: 1, predicted: 0 }, { group: 'North', actual: 1, predicted: 1 }, { group: 'South', actual: 1, predicted: 1 }, { group: 'South', actual: 0, predicted: 0 }]); return r.rates.North === 0.5 && r.rates.South === 0` },
        { label: 'gap between groups', test: `const r = errorRateByGroup([{ group: 'A', actual: 1, predicted: 0 }, { group: 'B', actual: 1, predicted: 1 }, { group: 'B', actual: 0, predicted: 1 }, { group: 'B', actual: 1, predicted: 1 }, { group: 'B', actual: 1, predicted: 1 }]); return Math.abs(r.gap - 0.75) < 1e-12` },
      ],
      hint: 'folds: let start = 0; for (let f = 0; f < k; f++) { const size = Math.floor(n / k) + (f < n % k ? 1 : 0); out.push(Array.from({ length: size }, (_, i) => start + i)); start += size }',
      solution: `<script>
  function folds(n, k) { const out = []; let start = 0; for (let f = 0; f < k; f++) { const size = Math.floor(n / k) + (f < n % k ? 1 : 0); out.push(Array.from({ length: size }, (_, i) => start + i)); start += size } return out }
  function errorRateByGroup(rows) {
    const t = {}
    for (const r of rows) { t[r.group] = t[r.group] || { wrong: 0, all: 0 }; t[r.group].all++; if (r.actual !== r.predicted) t[r.group].wrong++ }
    const rates = {}
    for (const g in t) rates[g] = t[g].wrong / t[g].all
    const v = Object.values(rates)
    return { rates, gap: Math.max(...v) - Math.min(...v) }
  }
</script>`,
    },
    {
      id: 'ml-clustering',
      title: 'Unsupervised learning: k-means clustering',
      minutes: 30,
      kind: 'code',
      outline: 'Group customers without labels by building the k-means algorithm.',
      body: `## Finding groups no one labelled

A supermarket wants to know its kinds of customers: weekend bulk buyers, daily small-basket shoppers, high-value occasional visitors. No one has labelled them. **Clustering** finds groups of similar examples.

## k-means in four steps

1. Choose **k** starting centres (centroids), for example the first k points.
2. **Assign** each point to its nearest centroid.
3. **Update** each centroid to the average (mean) of its points.
4. Repeat 2 and 3 until nothing changes (or a maximum number of rounds).

Then **look at** each cluster and name it in business terms. Choosing k: try several and use the "elbow" where adding clusters stops helping much, plus common sense.

## Your task

Using \`distance(a, b)\` (given), write:

1. \`assign(points, centroids)\`: an array giving, for each point, the index of its nearest centroid (the lower index wins ties).
2. \`update(points, labels, k)\`: the new centroids, each the mean of its points. If a cluster has no points, return \`null\` for it.
3. \`kmeans(points, k, rounds)\`: start from the first k points, repeat assign/update up to \`rounds\` times or until labels stop changing; return \`{ labels, centroids }\`.`,
      task: 'Write assign, update and kmeans.',
      starter: `<script>
  function distance(a, b) { return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) }

  function assign(points, centroids) {
  }
  function update(points, labels, k) {
  }
  function kmeans(points, k, rounds) {
  }
</script>
`,
      checks: [
        { label: 'assign picks the nearest centroid', test: `return JSON.stringify(assign([[0, 0], [10, 10], [1, 1]], [[0, 0], [9, 9]])) === '[0,1,0]'` },
        { label: 'update averages each cluster', test: `return JSON.stringify(update([[0, 0], [2, 2], [10, 10]], [0, 0, 1], 2)) === '[[1,1],[10,10]]'` },
        { label: 'empty clusters are null', test: `return update([[1, 1]], [0], 2)[1] === null` },
        { label: 'kmeans separates two groups', test: `const p = [[1, 1], [9, 9], [1, 2], [2, 1], [8, 9], [9, 8]]; const r = kmeans(p, 2, 10); return r.labels[0] === r.labels[2] && r.labels[2] === r.labels[3] && r.labels[1] === r.labels[4] && r.labels[4] === r.labels[5] && r.labels[0] !== r.labels[1]` },
        { label: 'centroids end in the middle of each group', test: `const p = [[0, 0], [10, 10], [0, 2], [10, 12]]; const r = kmeans(p, 2, 10); const c = r.centroids.map(x => x.join(',')).sort(); return c[0] === '0,1' && c[1] === '10,11'` },
      ],
      hint: 'update: sums and counts per cluster; centroid = sums[c].map(v => v / counts[c]). kmeans: let c = points.slice(0, k).map(p => [...p]); loop { const l = assign(points, c); if (same as before) break; c = update(points, l, k).map((x, i) => x || c[i]) }',
      solution: `<script>
  function distance(a, b) { return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) }
  function assign(points, centroids) {
    return points.map((p) => { let best = 0; centroids.forEach((c, i) => { if (distance(p, c) < distance(p, centroids[best])) best = i }); return best })
  }
  function update(points, labels, k) {
    const sums = Array.from({ length: k }, () => null), counts = Array(k).fill(0)
    points.forEach((p, i) => { const c = labels[i]; sums[c] = sums[c] ? sums[c].map((v, j) => v + p[j]) : [...p]; counts[c]++ })
    return sums.map((s, c) => (s ? s.map((v) => v / counts[c]) : null))
  }
  function kmeans(points, k, rounds) {
    let centroids = points.slice(0, k).map((p) => [...p]), labels = null
    for (let r = 0; r < rounds; r++) {
      const next = assign(points, centroids)
      if (labels && next.join() === labels.join()) break
      labels = next
      centroids = update(points, labels, k).map((x, i) => x || centroids[i])
    }
    return { labels, centroids }
  }
</script>`,
    },
    ...mlMore,
    {
      id: 'ml-deploy',
      title: 'From notebook to product: deploying ML and your career',
      minutes: 20,
      kind: 'read',
      outline: 'Python tools, deployment, monitoring for drift, and how to get an ML job.',
      body: `## The tools professionals use

You built the algorithms by hand so you understand them. At work you will usually use:

- **Python** with **pandas** (tables), **NumPy** (maths), **scikit-learn** (classic ML: regression, k-NN, k-means, random forests), and **PyTorch** or **TensorFlow** (deep learning)
- **Jupyter notebooks** or **Google Colab** (free, runs in the browser) for exploring
- Cloud ML services: **AWS SageMaker**, **Google Vertex AI**, **Azure ML**

Everything you learned maps directly: \`train_test_split\`, \`LinearRegression().fit()\`, \`KNeighborsClassifier(n_neighbors=5)\`, \`classification_report\` (precision, recall, F1), \`KMeans(n_clusters=4)\`.

## Deploying a model

A model only creates value when people use it:

1. **Save** the trained model (a file).
2. **Serve** it behind an API: an app sends features, gets a prediction.
3. **Monitor** it: input data changes over time (**data drift**: new products, inflation, a new customer group), and accuracy quietly falls. Track live accuracy and retrain on fresh data.
4. **Document** it: what data, what it is for, known limits and fairness checks (a "model card").

## Choosing ML or not

Use simple rules or statistics when they work. ML is worth it when there is enough good data, the pattern is complex, and a wrong prediction is affordable or checked by a human.

## Getting a job

- Learn Python and pandas next (free: Kaggle Learn, Google's ML Crash Course)
- Do 3 portfolio projects with **real local data**: predict sales for a shop, classify customer messages, cluster students' performance. Publish notebooks on GitHub with a clear write-up of the business result.
- Compete on **Kaggle** and join communities (Data Science Nigeria, AI Saturdays Lagos and others)
- Certifications that help: Google's ML and data certificates, AWS Certified Machine Learning, Microsoft Azure AI Fundamentals (AI-900)`,
      quiz: [
        { q: 'Live accuracy slowly drops because customers\' behaviour changed. This is…', options: ['Data drift', 'Overfitting on purpose', 'A syntax error'], answer: 0, why: 'The data the model sees changed from its training data.' },
        { q: 'Which Python library is the standard for classic ML like k-NN and k-means?', options: ['scikit-learn', 'Bootstrap', 'jQuery'], answer: 0, why: 'scikit-learn provides these algorithms.' },
        { q: 'A good ML portfolio project…', options: ['Copies a tutorial without changes', 'Uses real data and explains the business result', 'Only shows code'], answer: 1, why: 'Employers want to see real problems solved and explained.' },
      ],
    },
  ],
  project: mlProject,
  exam: [
    { q: 'Machine learning differs from normal programming because…', options: ['It needs no computer', 'The computer finds the rule from examples', 'It cannot make mistakes', 'It only works on images'], answer: 1, why: 'Rules are learned from data.' },
    { q: 'Predicting whether a customer will default (yes/no) is…', options: ['Regression', 'Classification', 'Clustering', 'Reinforcement learning'], answer: 1, why: 'A category is predicted.' },
    { q: 'In a house-price model, "number of bedrooms" is a…', options: ['Label', 'Feature', 'Metric', 'Fold'], answer: 1, why: 'Inputs are features; price is the label.' },
    { q: 'Why test on data the model never saw?', options: ['It is faster', 'To estimate how it will do on new data', 'To use less memory', 'It is not needed'], answer: 1, why: 'Training data performance is overly optimistic.' },
    { q: 'Min-max scaling maps 30 in [10, 50] to…', options: ['0.3', '0.5', '0.75', '30'], answer: 1, why: '(30 − 10) / (50 − 10) = 0.5.' },
    { q: 'Why scale features before k-NN?', options: ['So large-number features do not dominate distances', 'To remove labels', 'To make the data private', 'k-NN requires text'], answer: 0, why: 'Distances depend on units.' },
    { q: 'Least squares chooses the line that minimises…', options: ['The number of points', 'The sum of squared errors', 'The slope', 'The intercept'], answer: 1, why: 'That is its definition.' },
    { q: 'A model is on average ₦3,000 off. Which metric says this directly?', options: ['MAE', 'Recall', 'k', 'F1'], answer: 0, why: 'Mean absolute error is the average absolute miss.' },
    { q: 'RMSE compared with MAE…', options: ['Ignores big errors', 'Punishes big errors more', 'Is always smaller', 'Is only for classification'], answer: 1, why: 'Squaring enlarges large errors.' },
    { q: 'k-NN with k = 1 tends to…', options: ['Underfit', 'Follow noise in the training data', 'Ignore the data', 'Need labels removed'], answer: 1, why: 'One neighbour is easily fooled.' },
    { q: 'Euclidean distance between (0, 0) and (6, 8) is…', options: ['14', '10', '48', '2'], answer: 1, why: '√(36 + 64) = 10.' },
    { q: 'A fraud model says "not fraud" for everything; 1% are fraud. Its accuracy is about…', options: ['1%', '50%', '99%', '0%'], answer: 2, why: 'Which shows accuracy alone can mislead.' },
    { q: 'Precision answers…', options: ['Of all real fraud, how much was caught?', 'When it says fraud, how often is it right?', 'How fast is the model?', 'How many features are there?'], answer: 1, why: 'TP / (TP + FP).' },
    { q: 'For cancer screening you usually prioritise…', options: ['Precision', 'Recall', 'Training speed', 'Fewer features'], answer: 1, why: 'Missing a sick patient (false negative) is costly.' },
    { q: 'Training accuracy 99%, test accuracy 60% suggests…', options: ['Underfitting', 'Overfitting', 'A perfect model', 'Data drift only'], answer: 1, why: 'It memorised the training data.' },
    { q: 'k-fold cross-validation…', options: ['Uses each fold once as test data and averages the scores', 'Uses only the first fold', 'Removes outliers', 'Chooses k for k-NN only'], answer: 0, why: 'More reliable estimate than one split.' },
    { q: 'A credit model has a much higher error rate for one region. You should…', options: ['Ignore it if overall accuracy is high', 'Investigate, check proxy features and fix before use', 'Delete the region\'s customers', 'Increase k'], answer: 1, why: 'Fairness requires checking errors per group.' },
    { q: 'k-means needs labels?', options: ['Yes, always', 'No, it is unsupervised', 'Only for regression', 'Only with k = 1'], answer: 1, why: 'It finds groups without labels.' },
    { q: 'In k-means, the update step moves each centroid to…', options: ['A random point', 'The mean of its assigned points', 'The origin', 'The farthest point'], answer: 1, why: 'Assign then average.' },
    { q: 'After deployment, why monitor a model?', options: ['Data drift can quietly reduce accuracy', 'Models get faster', 'It is required by HTML', 'To change its colour'], answer: 0, why: 'Monitor and retrain on fresh data.' },
    ...mlExam,
  ],
}
