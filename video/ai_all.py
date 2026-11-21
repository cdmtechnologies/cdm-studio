"""Video scripts: AI engineering and Machine learning."""
from lessons_lib import simple

simple('aieng-how-llms-work', [
    ('How language models work', [
        ("A large language model is like the autocomplete on your phone, trained on a huge library of text. It predicts the next word, again and again.", ['b:The cat sat on the ...', 'g:mat']),
        ("It does not look facts up. It predicts what sounds right. That is why it can be confidently wrong, which we call hallucinating.", ['r:predicts, does not look up', 'n:check important facts']),
    ]),
    ('Tokens and context', [
        ("Models read text in small pieces called tokens, roughly three quarters of a word each. You pay per token.", ['c:"Abuja is lovely" -> 4 tokens']),
        ("Everything the model knows about your conversation must fit in its context window, like a desk with limited space. Clear instructions in, better answers out.", ['n:a desk with limited space', 'T:']),
    ]),
])
simple('aieng-templates', [
    ('Prompt templates', [
        ("A good prompt is like a brief to a new colleague: who they are, the task, the rules, and an example of good work.", ['role  +  task  +  rules  +  example', 'n:a brief to a new colleague']),
        ("A template keeps the brief the same every time, and only fills in the blanks, like a printed form.", ['c:Write a polite reply to {customer} about {issue}.']),
    ]),
    ('Examples beat adjectives', [
        ("Saying be professional is vague. Showing one example of a great reply teaches far more.", ['r:"be professional"', 'g:one example of a great reply']),
        ("Put the instructions first, mark user text clearly, and say what to do when information is missing.", ['c:<<<CUSTOMER MESSAGE ... >>>', 'T:']),
    ]),
])
simple('aieng-json', [
    ('Structured output', [
        ("Programs cannot read a friendly paragraph. They need data with a fixed shape, like a form with labelled boxes. That is JSON.", ['c:{"name": "Ada", "total": 4500}']),
        ("Ask the model for JSON with exact field names, and give an example of the shape you want.", ['n:exact field names + an example']),
    ]),
    ('Trust, but verify', [
        ("Then check it in code, like a cashier checking a banknote. Does it parse? Are the fields there? Are the numbers sensible?", ['parse  ->  check fields  ->  check values']),
        ("If it fails, retry once with the error message, or fall back safely. Never let bad data into your system.", ['r:never trust it blindly', 'T:']),
    ]),
])
simple('aieng-tokens', [
    ('Tokens and cost', [
        ("Every token in and out costs money, like a taxi meter running. Long prompts and long answers add up across thousands of users.", ['n:a taxi meter running', 'c:cost = tokens in x price + tokens out x price']),
        ("Long documents must be split into chunks, like cutting a long cloth into pieces that fit the table.", ['b:chunk  chunk  chunk  chunk']),
    ]),
    ('Control the bill', [
        ("Overlap chunks a little, so a sentence is never cut in half.", ['g:a small overlap between chunks']),
        ("Use the smallest model that does the job well, limit answer length, and cache repeated answers.", ['small model  -  max tokens  -  cache', 'T:']),
    ]),
])
simple('aieng-rag', [
    ('Grounding AI in your documents', [
        ("Ask a model about your shop's refund policy, and it will guess. Retrieval augmented generation gives it the right page first, like an open-book exam.", ['n:an open-book exam']),
        ("Find the few chunks that match the question, put only those into the prompt, and ask it to answer only from them.", ['question -> find chunks -> grounded answer']),
    ]),
    ('Say I do not know', [
        ("Number the sources, and ask the model to cite them, so people can check.", ['c:[1] Refunds within 7 days ...']),
        ("And always add the rule: if the sources do not contain the answer, say I don't know. An honest gap is better than a confident guess.", ['g:"If the sources do not say, say I don\'t know"', 'T:']),
    ]),
])
simple('aieng-evals', [
    ('Testing AI', [
        ("You would not sell a medicine without testing it. Do not ship an AI feature without an evaluation: a set of real questions with known good answers.", ['n:a test set of real questions']),
        ("Run the set every time you change the prompt or the model, and compare the scores.", ['change -> run tests -> compare']),
    ]),
    ('Guardrails', [
        ("Guardrails are the barriers on a mountain road: block personal data from leaking, refuse off-topic requests, and check the output before it reaches a user.", ['g:check inputs', 'g:check outputs']),
        ("Treat text from users and websites as data, never as instructions. That stops prompt injection.", ['r:text is data, not instructions', 'T:']),
    ]),
])
simple('aieng-agents', [
    ('Automation and agents', [
        ("An agent is an AI that works in a loop: decide the next step, use a tool, look at the result, and repeat until the task is done.", ['think -> act -> observe -> repeat']),
        ("Like a new employee, it needs clear goals, the right tools, and limits on what it may do.", ['n:goals, tools, limits']),
    ]),
    ('Keep a human in charge', [
        ("Start with simple, reliable workflows before free-roaming agents. Most business automation is a fixed set of steps.", ['g:simple workflows first']),
        ("For anything that spends money or sends messages, ask a human to approve. Log every step.", ['r:a human approves money and messages', 'T:']),
    ]),
])
simple('aieng-tools', [
    ('Tool use', [
        ("A model only writes text. It cannot check an order or send an SMS. With tool use, it asks your code to do it, like a receptionist who cannot leave the desk, but knows which extension to call.", ['n:a receptionist with phone extensions']),
        ("You describe each tool with a name, a description and the inputs it needs.", ['c:get_order(order_id: integer)']),
    ]),
    ('Never trust the arguments', [
        ("The model's request is only a suggestion. Check every argument, like a form from a stranger: right fields, right types, nothing extra.", ['g:validate every argument']),
        ("And check permissions in your own code. The model asking for order ten forty-two does not mean this user may see it.", ['r:permissions live in your code', 'T:']),
    ]),
])
simple('aieng-embeddings', [
    ('Embeddings', [
        ("Imagine a map where every sentence has a position, and sentences that mean similar things sit close together. That position is an embedding.", ['"get my money back"  ~  "refund policy"']),
        ("Keyword search finds shared words. Semantic search finds shared meaning, even across languages.", ['n:meaning, not just words']),
    ]),
    ('Cosine similarity', [
        ("To measure closeness, compare the directions of two arrows. One means the same direction. Zero means unrelated.", ['c:cos(a, b) = (a . b) / (|a| x |b|)']),
        ("Embed your documents once, embed each question, and pick the nearest chunks. Vector databases like pgvector do it fast.", ['g:embed once, search many times', 'T:']),
    ]),
])
simple('aieng-multimodal', [
    ('Multimodal AI', [
        ("Modern models can see images and hear speech. Photograph a receipt, and get back the vendor, date, items and total as data.", ['photo  ->  {"vendor": ..., "total": ...}']),
        ("But models can misread numbers, which matters a lot for money. Always check that the items add up to the total.", ['r:check the numbers']),
    ]),
    ('Speech and images', [
        ("Speech to text gives you meeting notes and captions. Text to speech reads aloud. Test with your real users' accents.", ['b:speech <-> text']),
        ("Never present generated images as real photos, and respect copyright and consent.", ['n:honest images only', 'T:']),
    ]),
])
simple('aieng-app', [
    ('From demo to product', [
        ("A demo works once on your laptop. A product works thousands of times a day, on slow networks, while the AI provider is busy.", ['n:demo  vs  product']),
        ("Models do not remember. Send the conversation each time, but keep within a budget: keep the rules and the newest messages, drop the oldest.", ['g:keep rules + newest messages']),
    ]),
    ('Retries and limits', [
        ("When a service is busy, do not redial at once, like everyone calling a busy line. Wait one second, then two, then four, then give up kindly.", ['c:wait 1s, 2s, 4s, 8s']),
        ("Limit messages per user, input size and output length, and have a fallback, so the feature degrades instead of disappearing.", ['limits  +  fallback', 'T:']),
    ]),
])
simple('aieng-responsible', [
    ('Responsible AI', [
        ("AI learns from human text, so it can repeat human bias. Test with different names, accents and situations, and fix what is unfair.", ['n:test for fairness']),
        ("Protect privacy: send the minimum data, never passwords, and tell people when they are talking to AI.", ['r:minimum data, never passwords', 'g:say when it is AI']),
    ]),
    ('Your AI career', [
        ("AI engineers build useful, safe features on top of models: prompts, data, evaluations and guardrails.", ['b:prompts  data  evals  guardrails']),
        ("Build a portfolio of small, real tools. Your final project is a great first one. Good luck!", ['T:Good luck!']),
    ]),
])

simple('ml-what-is-ml', [
    ('What machine learning is', [
        ("Normal programs follow rules a person wrote. Machine learning finds the rules from examples, like a child learning what a dog is from many pictures of dogs.", ['rules + data -> answers', 'g:data + answers -> rules']),
        ("Show it past house sales, and it learns to estimate prices. Show it past loans, and it learns who is likely to repay.", ['n:learning from examples']),
    ]),
    ('Kinds of learning', [
        ("Supervised learning learns from labelled answers. Unsupervised learning finds groups on its own. Reinforcement learning learns by trial and reward.", ['b:supervised   unsupervised   reinforcement']),
        ("A model is only as good as its data. Rubbish in, rubbish out.", ['r:rubbish in, rubbish out', 'T:']),
    ]),
])
simple('ml-data-prep', [
    ('Preparing data', [
        ("Cooks prepare ingredients before cooking: wash, cut, measure. Data needs the same: clean it, fill or drop missing values, and fix typos.", ['n:mise en place for data']),
        ("Scale numbers so a salary in millions does not drown out an age in tens.", ['c:(x - min) / (max - min)']),
    ]),
    ('Split before you learn', [
        ("Keep some data hidden for the final test, like exam questions the students never saw.", ['training 80%   |   test 20%']),
        ("If the model sees the test data while learning, its score is a lie. Split first, always.", ['r:split first, always', 'T:']),
    ]),
])
simple('ml-regression', [
    ('Linear regression', [
        ("Plot house size against price, and the points rise together. Linear regression draws the straight line that fits them best.", ['c:price = slope x size + intercept']),
        ("The best line is the one where the squared misses are smallest, like a rope pulled tight through the middle of the points.", ['n:smallest squared errors']),
    ]),
    ('Learning step by step', [
        ("Gradient descent is like walking down a hill in fog: feel the slope, take a small step downhill, and repeat.", ['g:feel the slope, step downhill']),
        ("Too big a step and you overshoot. Too small and you take forever. That step size is the learning rate.", ['learning rate', 'T:']),
    ]),
])
simple('ml-knn', [
    ('k-nearest neighbours', [
        ("Tell me who your neighbours are, and I will tell you who you are. To classify something new, look at the closest known examples.", ['n:ask the neighbours']),
        ("Measure distance between points, find the k nearest, and let them vote.", ['c:distance = sqrt((x1-x2)^2 + (y1-y2)^2)']),
    ]),
    ('Choosing k', [
        ("With k equals one, a single odd neighbour can fool you. A larger k is steadier. Use an odd k to avoid ties.", ['b:k = 1, 3, 5 ...']),
        ("And scale your features first, or the biggest numbers decide everything.", ['r:scale first', 'T:']),
    ]),
])
simple('ml-metrics', [
    ('Is the model any good?', [
        ("If only one transaction in a hundred is fraud, a model that always says not fraud is ninety-nine percent accurate, and completely useless.", ['r:99% accurate, catches nothing']),
        ("So we look closer, with the confusion matrix: true positives, false positives, false negatives and true negatives.", ['b:TP   FP   FN   TN']),
    ]),
    ('Precision and recall', [
        ("Precision asks: when the alarm rings, how often is it right? Recall asks: of all the real cases, how many did we catch?", ['c:precision = TP / (TP + FP)', 'c:recall = TP / (TP + FN)']),
        ("A cancer screen wants high recall. A spam filter wants high precision. Choose by the cost of each mistake.", ['n:choose by the cost of mistakes', 'T:']),
    ]),
])
simple('ml-overfitting', [
    ('Overfitting', [
        ("A student who memorises past papers word for word fails when the questions change. A model can do the same: perfect on training data, poor on new data.", ['r:memorising is not learning']),
        ("Keep models simple enough, and always judge them on data they have never seen.", ['g:judge on unseen data']),
    ]),
    ('Validation and fairness', [
        ("Cross-validation rotates which part is the test, like several mock exams instead of one.", ['b:fold 1   fold 2   fold 3   fold 4   fold 5']),
        ("Check results for each group of people. A model can be accurate overall, and unfair to one group.", ['n:check every group', 'T:']),
    ]),
])
simple('ml-clustering', [
    ('k-means clustering', [
        ("Sometimes there are no labels. Clustering finds natural groups, like customers who shop the same way.", ['n:no labels, find the groups']),
        ("Place k centres, give each point to its nearest centre, move each centre to the middle of its points, and repeat until nothing moves.", ['assign  ->  move centres  ->  repeat']),
    ]),
    ('Using the groups', [
        ("A shop might find bargain hunters, weekend families and big monthly buyers, and market to each one differently.", ['b:bargain   family   monthly']),
        ("Clusters are suggestions. Give each one a name only after looking at who is inside.", ['g:look inside before naming', 'T:']),
    ]),
])
simple('ml-logistic', [
    ('Logistic regression', [
        ("Many questions are yes or no: will this loan be repaid? Logistic regression gives a probability, not just a label.", ['"72% likely to repay"']),
        ("The sigmoid squashes any score into a number between zero and one, like a dimmer switch.", ['c:sigmoid(z) = 1 / (1 + e^-z)']),
    ]),
    ('Thresholds', [
        ("The business chooses the threshold. A careful bank might decline above thirty percent risk.", ['n:you choose the threshold']),
        ("Log loss punishes being confidently wrong. And each weight shows how a feature pushes the answer, which makes the model easy to explain.", ['g:easy to explain', 'T:']),
    ]),
])
simple('ml-trees', [
    ('Decision trees', [
        ("A decision tree plays twenty questions with your data: is income above three hundred thousand? Has a payment been missed?", ['income > 300k ?  ->  missed payment ?']),
        ("It picks the question that splits the groups most cleanly. Gini impurity measures how mixed a group is.", ['c:gini = 1 - sum(share^2)']),
    ]),
    ('Forests', [
        ("A tree that grows forever memorises the data. A random forest asks many trees and lets them vote, like asking a crowd instead of one person.", ['g:many trees vote']),
        ("Boosted trees fix each other's mistakes one after another, and often win on spreadsheet-style data.", ['b:random forest   gradient boosting', 'T:']),
    ]),
])
simple('ml-features', [
    ('Feature engineering', [
        ("A great cook with rotten tomatoes still makes a bad stew. In machine learning, good features matter more than the algorithm.", ['n:better ingredients, better meal']),
        ("Turn categories into yes or no columns, and pull hidden features out of dates: the month, the weekday, the days to payday.", ['c:city -> is_Abuja, is_Kano, is_Lagos']),
    ]),
    ('Data leakage', [
        ("Scale with statistics from the training data only. Using test data is like letting students see the exam while revising.", ['r:fit on training data only']),
        ("If a score looks too good to be true, suspect leakage first.", ['g:too good to be true? check for leakage', 'T:']),
    ]),
])
simple('ml-neural', [
    ('Neural networks', [
        ("A neuron is a tiny voter. It listens to several inputs, trusts some more than others, adds them up, and decides how strongly to speak.", ['c:output = activation(w . x + b)']),
        ("Stack neurons in layers. Early layers learn simple patterns, like edges. Later layers combine them into faces.", ['input -> hidden layers -> output']),
    ]),
    ('Deep learning', [
        ("ReLU keeps positives and zeroes negatives. Softmax turns scores into probabilities that add up to one.", ['b:ReLU   softmax']),
        ("Deep learning powers vision and language models. But for business tables, boosted trees are often just as good, and much cheaper.", ['n:choose the tool that fits', 'T:']),
    ]),
])
simple('ml-deploy', [
    ('From notebook to product', [
        ("A model in a notebook helps nobody. Deploy it behind an API, so an app can ask for predictions.", ['notebook -> API -> app']),
        ("Watch it in the real world. Data drifts as customers and prices change, so retrain on fresh data.", ['r:data drifts', 'g:monitor and retrain']),
    ]),
    ('Your ML career', [
        ("Learn Python, pandas and scikit-learn, practise on real datasets, and explain your results in plain language.", ['b:Python  pandas  scikit-learn']),
        ("Your final project, built and evaluated end to end, is your first portfolio piece. Good luck!", ['T:Good luck!']),
    ]),
])
