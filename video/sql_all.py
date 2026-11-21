"""Scripts for the SQL and databases course. Each lesson is its own module (sql_<name>.py) that imports from here."""
from build import Board, around, arrow, box, text, path, tick, cross, BLUE, RED, GREEN, ORANGE, INK


def turn(b, msg='Your turn!'):
    return b.note(msg, 90, GREEN)


def table(x, y, cols, rows, cw=250, rh=70, size=46):
    out = [path(f'M {x} {y} L {x + cw * len(cols)} {y}', INK, 5)]
    out += [text(c, x + cw * i + 14, y - 18, size, 'EMSFelix', color=BLUE) for i, c in enumerate(cols)]
    for r, row in enumerate(rows):
        out += [text(str(v), x + cw * i + 14, y + rh * (r + 1) - 18, size) for i, v in enumerate(row)]
    out.append(path(f'M {x} {y + rh * len(rows) + 8} L {x + cw * len(cols)} {y + rh * len(rows) + 8}', INK, 3))
    return out


LESSONS = {}


def lesson(name):
    def reg(f):
        LESSONS[name] = f
        return f
    return reg


@lesson('sql-select')
def _():
    b1, b2, b3 = Board(), Board(), Board()
    return [
        ('1-cabinet', [
            ("A database is like a school office's filing cabinet. One drawer for students, one for fees, one for teachers.", [
                b1.title('What is a database?'), [box(x, 330, 360, 160, width=6) for x in (300, 780, 1260)],
                [text(t, x + 180, 430, 60, 'EMSFelix', align='center') for x, t in zip((300, 780, 1260), ('customers', 'products', 'orders'))]]),
            ("Each drawer is a table. Each folder in it is a row. And each field on the form is a column.", [
                b1.space(250), table(460, 700, ['name', 'city'], [['Ada Obi', 'Abuja'], ['Musa Bello', 'Kano']], cw=420)]),
        ]),
        ('2-select', [
            ("SQL is the language for asking a database questions. Read this query like a sentence.", [
                b2.title('select ... from'), b2.code('select name, city from customers;', 76)]),
            ("Select the name and the city, from the customers table. Star means every column.", [
                b2.code('select * from customers;', 72, color=ORANGE)]),
            ("Select only reads. You cannot break anything with it, so explore freely.", [b2.space(20), b2.note('select only reads: explore freely', 68, GREEN)]),
        ]),
        ('3-calc', [
            ("You can also calculate new columns, and name them with as.", [
                b3.title('Calculated columns'), b3.code('select name, price,', 70, x=380), b3.code('       price / 1600.0 as price_in_usd', 70, x=380), b3.code('from products;', 70, x=380)]),
            ("Now write your first query on the shop database.", [b3.space(20), turn(b3)]),
        ]),
    ]


@lesson('sql-where')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-sieve', [
            ("Where is a sieve. When you pour rice through a sieve, only what fits passes. Only rows that make the condition true come through.", [
                b1.title('Filtering with where'), path('M 700 330 L 1220 330 L 1080 520 L 840 520 Z', INK, 7),
                [text('o', x, y, 50, color=ORANGE) for x, y in ((760, 300), (900, 280), (1050, 300), (1150, 290))], arrow(960, 540, 960, 660, INK, 6)]),
            ("Select name and price from products where price is greater than ten thousand.", [
                b1.space(390), b1.code('select name, price from products', 64), b1.code('where price > 10000;', 64)]),
        ]),
        ('2-combine', [
            ("Combine conditions with and, or. In checks a list. Between checks a range. Like finds a pattern.", [
                b2.title('and, or, in, between, like'), b2.code("where category = 'Food' and price < 20000", 60), b2.code("where city in ('Lagos', 'Abuja')", 60),
                b2.code("where name like 'P%'", 60)]),
            ("And NULL means unknown. Is an unknown equal to anything? SQL cannot say. So always write: is null.", [
                b2.space(20), (bad := b2.code('city = null', 66, color=RED)), cross(1350, bad['y'] - 50, 46, RED), b2.code('city is null', 66, color=GREEN)]),
            ("Now filter the paid orders.", [turn(b2)]),
        ]),
    ]


@lesson('sql-sort')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-order', [
            ("A database is like a pile of exam scripts on a desk: there is no promised order. If you want them by score, you must ask.", [
                b1.title('Sorting and limiting'), b1.code('order by price desc', 80)]),
            ("Limit gives just the top few. But always sort first, or you get some rows, not the top ones.", [
                b1.code('order by price desc limit 3', 76), b1.note('sort first, then limit', 66)]),
        ]),
        ('2-distinct', [
            ("Distinct removes repeats: which towns do our customers come from?", [b2.title('distinct'), b2.code('select distinct city from customers;', 70)]),
            ("You write select, from, where, order by, limit. The database finds the table, filters, picks columns, sorts, then cuts.", [
                b2.space(30), b2.line('from -> where -> select -> order by -> limit', 60, color=ORANGE)]),
            ("Now find the three cheapest products.", [turn(b2)]),
        ]),
    ]


@lesson('sql-aggregates')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-takings', [
            ("A manager does not want every receipt. She wants: how many orders, how much money, what was the average sale?", [
                b1.title('Counting and adding up'), b1.code('count(*)   sum(total)   avg(total)', 68), b1.code('min(total)   max(total)', 68)]),
            ("Aggregates squeeze many rows into one answer, like a cashier counting the day's takings into one figure.", [
                b1.space(20), b1.line('many rows  ->  one number', 72, color=GREEN)]),
        ]),
        ('2-paid', [
            ("Where runs first, so the sums only see paid orders. Cancelled orders are not money in the bank.", [
                b2.title('Only paid orders'), b2.code('select count(*), sum(total)', 70, x=420), b2.code('from orders', 70, x=420), b2.code("where status = 'paid';", 70, x=420)]),
            ("Round the average to two decimals for money. Now build the paid orders summary.", [b2.code('round(avg(total), 2)', 70, color=ORANGE), turn(b2)]),
        ]),
    ]


@lesson('sql-group')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-piles', [
            ("Empty a jar of coins on the table. Before counting, you sort them into piles. Then you count each pile. That is group by.", [
                b1.title('group by'), [path(f'M {x - 90} 560 Q {x} 380 {x + 90} 560 Z', ORANGE, 6) for x in (560, 960, 1360)],
                [text(t, x, 640, 56, 'EMSFelix', align='center') for x, t in zip((560, 960, 1360), ('Food', 'Electronics', 'Stationery'))]]),
            ("One row comes out for each group.", [b1.space(470), b1.code('select category, count(*) from products', 62), b1.code('group by category;', 62)]),
        ]),
        ('2-having', [
            ("Where filters rows before the piles are made. Having filters the piles afterwards.", [
                b2.title('where before, having after'), b2.code("where status = 'paid'", 66, x=420), b2.code('group by customer_id', 66, x=420), b2.code('having sum(total) > 20000', 66, x=420)]),
            ("Sales per branch, students per class, top customers: most dashboards are group by queries underneath. Now find your big customers.", [turn(b2)]),
        ]),
    ]


@lesson('sql-joins')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-keys', [
            ("Why split data into tables? If Ada's city is written on every order, when she moves, you must fix every order, and you will miss one.", [
                b1.title('Joining tables'), table(260, 420, ['id', 'name'], [[1, 'Ada'], [2, 'Musa']], cw=200), table(1060, 420, ['order', 'customer_id'], [[101, 1], [102, 2]], cw=300)]),
            ("Instead, each customer is stored once, and each order says which customer by id, like a student's admission number.", [
                arrow(1360, 620, 330, 620, ORANGE, 6, bend=-90, head=26), text('customer_id = id', 860, 780, 60, 'EMSFelix', color=ORANGE, align='center')]),
        ]),
        ('2-join', [
            ("Join glues the matching rows back together, side by side.", [
                b2.title('join ... on'), b2.code('select o.id, c.name, o.total', 68, x=360), b2.code('from orders o', 68, x=360), b2.code('join customers c on c.id = o.customer_id;', 62, x=360)]),
            ("A plain join keeps only rows with a match on both sides. Now find revenue per city.", [b2.space(10), turn(b2)]),
        ]),
    ]


@lesson('sql-left-join')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-register', [
            ("An inner join is like listing only the children who are in the room. A left join lists every child on the register, with a blank beside those who are absent.", [
                b1.title('left join'), table(560, 420, ['name', 'order'], [['Ada', 101], ['Grace', 'NULL'], ['Emeka', 'NULL']], cw=400)]),
            ("Keep the rows where the right side is null, and you find customers who have never ordered.", [
                b1.space(460), b1.code('where o.id is null', 72, color=GREEN)]),
        ]),
        ('2-coalesce', [
            ("Coalesce fills the blanks: no orders becomes a clear zero.", [b2.title('Fill the blanks'), b2.code('coalesce(sum(o.total), 0)', 76)]),
            ("Careful: a filter on the right table belongs in the on, not the where, or the blanks disappear again. Now list every customer's spending.", [
                b2.code("left join orders o on ... and o.status = 'paid'", 56, color=ORANGE), turn(b2)]),
        ]),
    ]


@lesson('sql-case-dates')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-case', [
            ("Case is if and else inside a query, like a teacher turning scores into grades.", [
                b1.title('case when'), b1.code("case when price >= 15000 then 'premium'", 62), b1.code("     when price >= 2000 then 'standard'", 62), b1.code("     else 'budget' end", 62)]),
            ("Put case inside sum, and you add only some rows: paid in one column, pending in another, just like a pivot table.", [
                b1.code("sum(case when status = 'paid' then total else 0 end)", 52, color=GREEN)]),
        ]),
        ('2-months', [
            ("Group by the month, and you see the trend. It is the first report most business owners ask for.", [
                b2.title('Monthly reports'), b2.code("strftime('%Y-%m', order_date) as month", 64), b2.line('2026-09   2026-10   2026-11', 70, color=GREEN)]),
            ("Now build the monthly report.", [turn(b2)]),
        ]),
    ]


@lesson('sql-subqueries')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-inner', [
            ("Which products cost more than average? First ask a friend for the average, then compare. A subquery does exactly that.", [
                b1.title('Queries inside queries'), b1.code('where price > (select avg(price) from products)', 58)]),
            ("The inner query runs first, and gives one number to the outer query.", [b1.space(20), b1.note('inside first, then outside', 70)]),
        ]),
        ('2-cte', [
            ("Long nested queries are like sentences with five brackets. With, lets you name each step, then use it like a table.", [
                b2.title('with: name your steps'), b2.code('with spending as (', 66, x=380), b2.code('  select customer_id, sum(total) as spent ...', 58, x=380), b2.code(')', 66, x=380), b2.code('select ... from spending', 66, x=380)]),
            ("Read it top to bottom. Now find customers who spend more than average.", [turn(b2)]),
        ]),
    ]


@lesson('sql-change')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-create', [
            ("Now we write data. Constraints are the database's security guard at the gate: it refuses data that breaks the rules.", [
                b1.title('Creating tables'), b1.code('create table suppliers (', 62, x=360), b1.code('  id integer primary key,', 62, x=360), b1.code('  name text not null unique,', 62, x=360),
                b1.code('  rating integer check (rating between 1 and 5));', 56, x=360)]),
            ("Insert adds rows. Always list the columns.", [b1.code("insert into suppliers (id, name, rating) values (...)", 52, color=GREEN)]),
        ]),
        ('2-update', [
            ("Update and delete are like a cheque book: check twice, sign once. An update without where changes every row.", [
                b2.title('update and delete'), b2.code("update products set price = 1300 where id = 3;", 58), b2.note('run the WHERE as a SELECT first', 66, RED)]),
            ("A transaction is all or nothing, like a money transfer: both updates happen, or neither does. Now create and change some data.", [
                b2.code('begin; ... commit;', 70, color=GREEN), turn(b2)]),
        ]),
    ]


@lesson('sql-design')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-design', [
            ("A badly planned building can be painted beautifully, but the doors are still in the wrong places. Design decides everything later.", [
                b1.title('Designing a good database'), b1.line('one fact, one place', 80, color=GREEN)]),
            ("Store each fact once. Use a meaningless id as the primary key, because names and phone numbers change.", [
                b1.code('product1, product2, product3', 62, color=RED), b1.down(), b1.code('order_items: one row per product', 62, color=GREEN)]),
        ]),
        ('2-safe', [
            ("An index is like a book's index: jump straight to the page instead of reading every page.", [
                b2.title('Indexes and safety'), b2.code('create index on orders (customer_id);', 62)]),
            ("And never glue a user's input into SQL text. Use parameterised queries, so a value is never run as code.", [
                b2.code("name = '' or '1'='1'", 66, color=RED), b2.note('use parameterised queries', 70, GREEN)]),
        ]),
    ]


@lesson('sql-window')
def _():
    b1, b2 = Board(), Board()
    return [
        ('1-window', [
            ("Group by squeezes rows into one per group. Window functions keep every row, like seeing each student's score, and their position in the class.", [
                b1.title('Window functions'), b1.code('rank() over (partition by category', 64), b1.code('             order by price desc)', 64)]),
            ("A running total is how a bank statement shows the balance after every transaction.", [
                b1.code('sum(total) over (order by order_date)', 64, color=GREEN)]),
        ]),
        ('2-career', [
            ("SQL takes you to data analysis, business intelligence and back-end development. Practise with real datasets, and explain your thinking out loud in interviews.", [
                b2.title('Where SQL takes you'), b2.line('analyst  -  BI  -  back end', 76, color=BLUE)]),
            ("Now add a running total, then build your final project. Good luck!", [turn(b2, 'Good luck!')]),
        ]),
    ]


# ---------- extra worked examples, placed before each lesson's last scene ----------
EXTRA = {}


def extra(name):
    def reg(f):
        EXTRA[name] = f
        return f
    return reg


def scenes(name):
    s = LESSONS[name]()
    e = EXTRA[name]() if name in EXTRA else None
    return s[:-1] + [e] + s[-1:] if e else s


@extra('sql-select')
def _():
    b = Board()
    return ('2b-example', [
        ("Let's read a real result. You ask for name and city from customers, and the database hands back a small table: one row for each customer.", [
            b.title('What comes back'), b.code('select name, city from customers;', 66),
            table(520, 480, ['name', 'city'], [['Ada Obi', 'Abuja'], ['Musa Bello', 'Kano'], ['Chika Eze', 'Lagos']], cw=440, size=50)]),
        ("SQL does not care about capital letters in keywords. Select in capitals and select in small letters are the same. But text values must match exactly, inside single quotes.", [
            b.space(330), b.line("SELECT = select       'Abuja' is not 'abuja'", 58, color=ORANGE)]),
        ("Every bank, hospital, school and app keeps its data in a database. That is why SQL is one of the most requested skills in job adverts.", [
            b.note('banks, hospitals, schools, apps', 66, GREEN)]),
    ])


@extra('sql-where')
def _():
    b = Board()
    return ('1b-dates', [
        ("Comparisons work like maths: equals, not equals, less than, greater than. In SQL, equals is a single sign.", [
            b.title('Comparisons'), b.line('=     <>     <     <=     >     >=', 80, font='EMSNixish', color=BLUE)]),
        ("Dates stored as year, month, day sort correctly, so you can ask for orders on or after the first of October.", [
            b.code("where order_date >= '2026-10-01'", 70)]),
        ("When you mix and with or, use brackets, so the meaning is clear to you, and to the next person who reads it.", [
            b.code("status = 'paid' and (city = 'Lagos' or city = 'Abuja')", 54, color=GREEN), b.note('brackets make it clear', 64)]),
    ])


@extra('sql-sort')
def _():
    b = Board()
    return ('1b-more', [
        ("You can sort by more than one column. Order by city, then by name, sorts by city first, and alphabetically within each city.", [
            b.title('Sort by two columns'), b.code('order by city, name', 80)]),
        ("Offset skips rows. That is how apps show page two of the results.", [b.code('limit 10 offset 10', 76), b.note('page 2', 66)]),
        ("And as renames a column in the result, so your reports read like plain English.", [b.code('select name as product, price as "price (NGN)"', 56, color=GREEN)]),
    ])


@extra('sql-aggregates')
def _():
    b = Board()
    return ('1b-counting', [
        ("Count carefully. Count star counts rows. Count city counts only rows where the city is known.", [
            b.title('Counting carefully'), b.pair('count(*)', '7 rows', 70, lx=420, rx=1100), b.pair('count(city)', '6 known cities', 70, lx=420, rx=1100),
            b.pair('count(distinct city)', '5 different cities', 64, lx=360, rx=1260)]),
        ("Watch out with division. Seven divided by two gives three, because both are whole numbers. Write seven divided by two point zero to keep the decimals.", [
            b.space(20), b.code('7 / 2  ->  3', 72, color=RED), b.code('7 / 2.0  ->  3.5', 72, color=GREEN)]),
    ])


@extra('sql-group')
def _():
    b = Board()
    return ('1b-rule', [
        ("There is one golden rule. Every column you select must be in the group by, or inside an aggregate like count or sum.", [
            b.title('The golden rule'), b.code('select category, count(*) ... group by category', 58, color=GREEN)]),
        ("Asking for the product name as well makes no sense: which of the many names in the Food pile should it show?", [
            b.code('select category, name, count(*) ...', 62, color=RED), b.note('which name?', 66, RED)]),
        ("You can group by two columns too: a pile for each customer and each status.", [b.code('group by customer_id, status', 70)]),
    ])


@extra('sql-joins')
def _():
    b = Board()
    return ('1b-aliases', [
        ("Long table names get tiring, so give each table a short nickname, an alias. Orders becomes o, customers becomes c.", [
            b.title('Short names and many tables'), b.code('from orders o join customers c', 70)]),
        ("Joins chain together. To see the products in each order, go from orders, to order items, to products.", [
            b.line('orders  ->  order_items  ->  products', 70, color=ORANGE)]),
        ("Join first, then group, and you can answer questions like revenue per city, or units sold per product.", [
            b.note('join, then group', 72, GREEN)]),
    ])


@extra('sql-left-join')
def _():
    b = Board()
    return ('1b-uses', [
        ("Businesses run this kind of query every day: products that never sold, students who have not paid, staff with no timesheet this week.", [
            b.title('Finding what is missing'), b.line('never sold      not paid      no timesheet', 62, color=ORANGE)]),
        ("The table you write first, on the left, is the one whose rows are all kept.", [b.code('from customers c left join orders o', 68)]),
        ("When counting, use count of the order id, not count star. Customers with no orders then correctly get zero.", [
            b.code('count(o.id)', 72, color=GREEN), b.code('count(*)', 72, color=RED)]),
    ])


@extra('sql-case-dates')
def _():
    b = Board()
    return ('1b-dates', [
        ("Every database has date functions. The names differ a little, but the ideas are the same.", [
            b.title('Working with dates'), b.pair("date('now')", 'today (SQLite)', 64, lx=320, rx=1080), b.pair('current_date', 'today (PostgreSQL)', 64, lx=320, rx=1080),
            b.pair("date('now', '-30 days')", '30 days ago', 60, lx=320, rx=1260)]),
        ("Case works like if and elif in Python: the first true when wins. Without an else, rows that match nothing get null.", [
            b.space(10), b.note('first true WHEN wins', 70)]),
    ])


@extra('sql-subqueries')
def _():
    b = Board()
    return ('1b-lists', [
        ("A subquery can also return a list. Which customers have a pending order? The inner query lists their ids, and in checks each customer against the list.", [
            b.title('Subqueries that return a list'), b.code('where id in (select customer_id', 66, x=360), b.code("            from orders where status = 'pending')", 58, x=360)]),
        ("Exists keeps customers who have at least one order, and stops looking as soon as it finds one. That is fast on big tables.", [
            b.code('where exists (select 1 from orders o where ...)', 58, color=GREEN)]),
    ])


@extra('sql-change')
def _():
    b = Board()
    return ('1b-insert', [
        ("Primary key: a unique id. Not null: a value is required. Unique: no two rows share it. Check: any rule you like. Code in an app can have bugs, but the guard at the gate still stops bad data.", [
            b.title('The guards at the gate'), b.pair('primary key', 'unique id', 62, lx=360, rx=1100), b.pair('not null', 'required', 62, lx=360, rx=1100),
            b.pair('unique', 'no repeats', 62, lx=360, rx=1100), b.pair('check (...)', 'your own rule', 62, lx=360, rx=1100)]),
        ("Many real systems never delete business records. They mark them as archived, so history and audits stay intact.", [
            b.code("status = 'archived'", 70, color=GREEN)]),
    ])


@extra('sql-design')
def _():
    b = Board()
    return ('1b-relations', [
        ("Start from the nouns: customers, products, orders, payments. Each thing usually becomes a table, and the facts about it become columns.", [
            b.title('Relationships'), b.line('customers   products   orders   payments', 66, color=BLUE)]),
        ("One customer has many orders, so the orders table holds the customer's id. An order has many products, and a product is in many orders, so a join table sits in the middle.", [
            b.line('one-to-many:  orders.customer_id', 60, font='EMSNixish'), b.line('many-to-many:  order_items in the middle', 60, font='EMSNixish')]),
        ("Store money as whole numbers or a numeric type, never as text, and store dates as dates.", [b.note('money as numbers, dates as dates', 66, GREEN)]),
    ])


@extra('sql-window')
def _():
    b = Board()
    return ('1b-topn', [
        ("Lag looks at the previous row. Total minus the previous total shows the change since last time, like growth month on month.", [
            b.title('Looking at neighbours'), b.code('total - lag(total) over (order by order_date)', 58)]),
        ("A classic interview question: the best seller in each category. Number the rows in each category, then keep number one.", [
            b.code('row_number() over (partition by category', 60), b.code('                   order by price desc) = 1', 60, color=GREEN)]),
    ])
