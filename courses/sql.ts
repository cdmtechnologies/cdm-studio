import type { Course } from './types'

// SQL runs in the learner's browser (sql.js, which is SQLite). Every lesson starts from the same shop database.
// Checks use same("expected query", ordered?) to compare the learner's last result, and yes("query") for changed tables.
const SHOP = `
create table customers (id integer primary key, name text not null, city text, joined text not null);
insert into customers values
 (1, 'Ada Obi', 'Abuja', '2026-01-10'), (2, 'Musa Bello', 'Kano', '2026-02-03'), (3, 'Chika Eze', 'Lagos', '2026-02-20'),
 (4, 'Tunde Ade', 'Lagos', '2026-03-15'), (5, 'Fatima Sani', 'Abuja', '2026-04-01'), (6, 'Grace Okon', 'Port Harcourt', '2026-05-12'),
 (7, 'Emeka Nwosu', null, '2026-06-30');
create table products (id integer primary key, name text not null, category text not null, price integer not null);
insert into products values
 (1, 'Rice 50kg', 'Food', 72000), (2, 'Vegetable oil 5L', 'Food', 15500), (3, 'Bread', 'Food', 1200),
 (4, 'Phone case', 'Electronics', 2500), (5, 'Power bank', 'Electronics', 18000), (6, 'Earbuds', 'Electronics', 9500),
 (7, 'Notebook', 'Stationery', 800), (8, 'Pen pack', 'Stationery', 1500);
create table orders (id integer primary key, customer_id integer not null references customers(id), order_date text not null, status text not null, total integer not null);
insert into orders values
 (1, 1, '2026-09-02', 'paid', 72000), (2, 2, '2026-09-05', 'paid', 27500), (3, 1, '2026-09-18', 'paid', 6000),
 (4, 3, '2026-10-01', 'cancelled', 5000), (5, 4, '2026-10-07', 'paid', 31000), (6, 3, '2026-10-15', 'paid', 11000),
 (7, 5, '2026-10-28', 'paid', 19000), (8, 2, '2026-11-03', 'pending', 87500), (9, 1, '2026-11-10', 'paid', 18000),
 (10, 4, '2026-11-12', 'paid', 12000);
create table order_items (order_id integer not null references orders(id), product_id integer not null references products(id), qty integer not null);
insert into order_items values
 (1, 1, 1), (2, 5, 1), (2, 6, 1), (3, 3, 5), (4, 4, 2), (5, 2, 2), (6, 7, 10), (6, 8, 2), (7, 6, 2), (8, 1, 1), (8, 2, 1), (9, 5, 1), (10, 3, 10);
`

const TABLES = `## The shop database

Every lesson in this course uses the same small database of an online shop. It has four tables:

| Table | Columns |
|---|---|
| \`customers\` | id, name, city, joined |
| \`products\` | id, name, category, price |
| \`orders\` | id, customer_id, order_date, status (paid, pending or cancelled), total |
| \`order_items\` | order_id, product_id, qty |

You can always look around with \`select * from products;\` in the editor. Only the result of your **last** statement is checked.`

export const sql: Course = {
  id: 'sql',
  title: 'SQL and databases',
  blurb: 'Ask questions of data with SQL, the language behind every bank, shop, school and app database. From your first SELECT to joins, reports and database design.',
  emoji: '🗄️',
  colour: 'amber',
  level: 'Beginner',
  hours: 12,
  free: 2,
  skills: ['SELECT, WHERE and ORDER BY', 'Aggregates and GROUP BY', 'Joins', 'CASE and dates', 'Subqueries and CTEs', 'Creating and changing tables', 'Database design and keys', 'Window functions'],
  careers: ['Data analyst', 'Business intelligence analyst', 'Back-end developer', 'Database administrator (junior)', 'Product / operations analyst'],
  lessons: [
    {
      id: 'sql-select',
      title: 'Databases and your first query',
      minutes: 20,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'What a database is, tables, rows and columns, and SELECT to read data.',
      body: `## What is a database?

Picture a school office with a big filing cabinet. One drawer holds student records, another holds fees paid, another holds teachers. Every folder in a drawer has the same layout. A **database** is that cabinet, kept by a computer: it stores information in **tables**, and it can answer questions about millions of records in a fraction of a second.

- A **table** is a drawer: customers, products, orders.
- A **row** is one folder: one customer.
- A **column** is one field on the form: name, city, date joined.

Banks, hospitals, schools, shops and apps like WhatsApp and Uber all keep their data in databases. **SQL** (say *"S-Q-L"* or *"sequel"*) is the language you use to ask them questions. It has been around since the 1970s, and it is still one of the most requested skills in job adverts, because nearly every company has a database.

## Your first query

\`\`\`sql
select name, city from customers;
\`\`\`

Read it as a sentence: *"select the name and city from the customers table"*.

- \`select\` lists the columns you want, separated by commas.
- \`*\` means every column: \`select * from customers;\`
- \`from\` names the table.
- The semicolon \`;\` ends the statement.

SQL does not care about capital letters in keywords: \`SELECT\` and \`select\` are the same. Many people write keywords in capitals to make queries easier to scan. Text values, though, must match exactly and go in **single quotes**: \`'Abuja'\`.

## Calculations in a query

You can calculate new columns and give them a name with \`as\`:

\`\`\`sql
select name, price, price * 1.075 as price_with_vat from products;
\`\`\`

The database does not change: \`select\` only **reads**. You cannot break anything with it, so explore freely.

${TABLES}

## Your task

Write a query that shows each product's \`name\`, \`category\` and \`price\`, in that order, plus a fourth column called \`price_in_usd\` that is the price divided by 1600 (use \`price / 1600.0\` so you get decimals).`,
      task: 'Select name, category, price and price_in_usd from products.',
      starter: `-- Look around first, then write your query
select * from products;
`,
      checks: [
        { label: 'shows name, category and price for every product', test: `return await same("select name, category, price, price / 1600.0 from products")` },
        { label: 'has 8 rows', test: `return (await result()).length === 8` },
      ],
      hint: 'select name, category, price, price / 1600.0 as price_in_usd from products;',
      solution: `select name, category, price, price / 1600.0 as price_in_usd from products;
`,
    },
    {
      id: 'sql-where',
      title: 'Filtering rows with WHERE',
      minutes: 25,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Comparisons, AND / OR, IN, BETWEEN, LIKE and the special case of NULL.',
      body: `## WHERE is a sieve

When you pour rice through a sieve, only what fits passes. \`where\` is a sieve for rows: only rows that make the condition **true** come through.

\`\`\`sql
select name, price from products where price > 10000;
select * from orders where status = 'paid';
\`\`\`

## Comparisons

\`=\` equal (just one sign in SQL), \`<>\` or \`!=\` not equal, \`<\`, \`<=\`, \`>\`, \`>=\`.

## Combining conditions

\`\`\`sql
select * from products where category = 'Food' and price < 20000;
select * from customers where city = 'Lagos' or city = 'Abuja';
\`\`\`

When you mix \`and\` with \`or\`, use brackets so the meaning is clear: \`where status = 'paid' and (city = 'Lagos' or city = 'Abuja')\`.

## Handy shortcuts

- \`in\`: matches any value in a list: \`where city in ('Lagos', 'Abuja')\`
- \`between\`: a range, including both ends: \`where price between 1000 and 5000\`
- \`like\`: a text pattern. \`%\` means "anything", \`_\` means "exactly one character": \`where name like 'P%'\` finds names that start with P; \`like '%bank%'\` finds names containing *bank*.
- \`not\`: flips a condition: \`where status not in ('cancelled')\`

## NULL: the empty box

\`NULL\` means **unknown or missing**, not zero and not empty text. Emeka's city is NULL: we simply do not know it. Because NULL is unknown, \`city = NULL\` is never true (is an unknown thing equal to another unknown thing? SQL cannot say). Always write:

\`\`\`sql
select * from customers where city is null;
select * from customers where city is not null;
\`\`\`

This trips up experienced people too, so remember it.

## Dates as text

In this database dates are text in the form \`YYYY-MM-DD\`, which sorts and compares correctly: \`where order_date >= '2026-10-01'\`.

${TABLES}

## Your task

Show the \`id\`, \`order_date\` and \`total\` (in that order) of orders that are **paid**, placed **on or after 1 October 2026**, with a total of **at least 12,000**.`,
      task: 'Filter the paid orders from October 2026 onwards with a total of at least 12,000.',
      starter: `select id, order_date, total from orders;
`,
      checks: [
        { label: 'only paid orders from 2026-10-01 with total >= 12000', test: `return await same("select id, order_date, total from orders where status = 'paid' and order_date >= '2026-10-01' and total >= 12000")` },
      ],
      hint: "Three conditions joined with and: status = 'paid', order_date >= '2026-10-01', total >= 12000.",
      solution: `select id, order_date, total
from orders
where status = 'paid'
  and order_date >= '2026-10-01'
  and total >= 12000;
`,
    },
    {
      id: 'sql-sort',
      title: 'Sorting, limiting and unique values',
      minutes: 25,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'ORDER BY, LIMIT and OFFSET, DISTINCT, and readable aliases.',
      body: `## Rows have no order until you ask

A database is like a pile of exam scripts on a desk: there is no promised order. If you want them by score, you must say so. Never rely on the order you happen to see.

\`\`\`sql
select name, price from products order by price;          -- cheapest first (asc is the default)
select name, price from products order by price desc;     -- dearest first
select name, city from customers order by city, name;     -- by city, then by name within each city
\`\`\`

## LIMIT: just the top few

\`\`\`sql
select name, price from products order by price desc limit 3;   -- the 3 most expensive
\`\`\`

\`limit\` without \`order by\` gives you *some* rows, not the top ones. Always sort first. \`offset 3\` skips the first 3, which is how apps show "page 2" of results.

## DISTINCT: remove repeats

\`\`\`sql
select distinct city from customers;
\`\`\`

This gives each city once. It is like asking "which towns do our customers come from?" rather than reading every customer's address.

## Aliases

\`as\` renames a column in the result, which makes reports readable:

\`\`\`sql
select name as product, price as "price (NGN)" from products;
\`\`\`

## Writing order versus running order

You write: \`select … from … where … order by … limit …\`. The database works roughly in the order **from → where → select → order by → limit**: it finds the table, filters the rows, picks the columns, sorts, then cuts. Knowing this explains many surprises later.

${TABLES}

## Your task

Show the \`name\` and \`price\` of the **3 cheapest** products that are **not** in the Stationery category, cheapest first.`,
      task: 'The 3 cheapest products outside Stationery, cheapest first.',
      starter: `select name, price from products;
`,
      checks: [
        { label: 'name and price of the 3 cheapest non-Stationery products, in order', test: `return await same("select name, price from products where category <> 'Stationery' order by price limit 3", true)` },
      ],
      hint: "where category <> 'Stationery' order by price limit 3",
      solution: `select name, price
from products
where category <> 'Stationery'
order by price
limit 3;
`,
    },
    {
      id: 'sql-aggregates',
      title: 'Counting and adding up',
      minutes: 25,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'COUNT, SUM, AVG, MIN, MAX and ROUND turn many rows into one answer.',
      body: `## From many rows to one number

A manager rarely wants to read every receipt. She wants: *How many orders? How much money? What was the average sale?* **Aggregate functions** squeeze many rows into one answer, like a cashier counting the day's takings into a single figure.

\`\`\`sql
select count(*) from orders;                 -- how many rows
select sum(total) from orders;               -- add up a column
select avg(total) from orders;               -- the mean
select min(total), max(total) from orders;   -- smallest and largest
\`\`\`

Combine them with \`where\` to count only some rows:

\`\`\`sql
select count(*) as paid_orders, sum(total) as revenue
from orders
where status = 'paid';
\`\`\`

The \`where\` runs **first**, so the sums only see paid orders. This is the difference between "all orders" and "revenue": cancelled and pending orders are not money in the bank.

## Counting carefully

- \`count(*)\` counts rows.
- \`count(city)\` counts rows where city is **not NULL**. With Emeka's missing city, \`count(city)\` from customers is 6, while \`count(*)\` is 7.
- \`count(distinct city)\` counts different cities.

## Rounding

\`round(avg(total), 2)\` keeps two decimal places, which is what money needs. In SQLite, dividing two whole numbers gives a whole number (\`7 / 2\` is \`3\`); write \`7 / 2.0\` or multiply by \`1.0\` to keep decimals. PostgreSQL behaves the same way, so it is a good habit everywhere.

## Your task

Write **one** query, over **paid orders only**, that returns a single row with these columns in this order:

1. \`orders\`: the number of paid orders
2. \`revenue\`: their total
3. \`average_order\`: the average total, rounded to 2 decimals
4. \`biggest\`: the largest total`,
      task: 'One row: orders, revenue, average_order and biggest for paid orders.',
      starter: `select count(*) from orders;
`,
      checks: [
        { label: 'one row with the four paid-order figures', test: `return await same("select count(*), sum(total), round(avg(total), 2), max(total) from orders where status = 'paid'")` },
      ],
      hint: "select count(*) as orders, sum(total) as revenue, round(avg(total), 2) as average_order, max(total) as biggest from orders where status = 'paid';",
      solution: `select count(*) as orders,
       sum(total) as revenue,
       round(avg(total), 2) as average_order,
       max(total) as biggest
from orders
where status = 'paid';
`,
    },
    {
      id: 'sql-group',
      title: 'GROUP BY: totals per group',
      minutes: 30,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Summaries per category, customer or month with GROUP BY, and filtering groups with HAVING.',
      body: `## Sorting coins into piles

Empty a jar of coins on the table. Before you count, you sort them into piles: all the ₦10 coins together, all the ₦20 coins together. Then you count each pile. That is exactly what \`group by\` does: it sorts rows into piles that share a value, then runs the aggregate on **each pile**.

\`\`\`sql
select category, count(*) as products, avg(price) as avg_price
from products
group by category;
\`\`\`

One row comes out **per group**: one for Food, one for Electronics, one for Stationery.

## The golden rule

Every column in \`select\` must either be **in the group by** or **inside an aggregate**. \`select category, name, count(*) … group by category\` makes no sense: which of the many names in the Food pile should it show? (SQLite quietly picks one, which hides bugs; PostgreSQL refuses with an error. Follow the rule.)

## Grouping by more than one column

\`group by customer_id, status\` makes a pile for each combination: Ada's paid orders, Ada's pending orders, and so on.

## HAVING: filter the piles

\`where\` filters **rows before** grouping. \`having\` filters **groups after** grouping:

\`\`\`sql
select customer_id, sum(total) as spent
from orders
where status = 'paid'          -- only paid rows go into the piles
group by customer_id
having sum(total) > 30000      -- only keep the big piles
order by spent desc;
\`\`\`

Remember the running order: **from → where → group by → having → select → order by → limit**.

## Business questions this answers

Sales per branch, students per class, average fee per term, complaints per product, top customers. Most dashboards in the world are \`group by\` queries underneath.

${TABLES}

## Your task

For **paid** orders, show each \`customer_id\` with the number of orders as \`orders\` and the amount spent as \`spent\`, but only customers who spent **more than 20,000**. Sort by \`spent\`, highest first.`,
      task: 'Paid orders per customer, only those who spent over 20,000, biggest first.',
      starter: `select customer_id, total from orders;
`,
      checks: [
        { label: 'customer_id, orders and spent for big paid customers, biggest first', test: `return await same("select customer_id, count(*), sum(total) from orders where status = 'paid' group by customer_id having sum(total) > 20000 order by sum(total) desc", true)` },
      ],
      hint: "where status = 'paid' group by customer_id having sum(total) > 20000 order by spent desc",
      solution: `select customer_id, count(*) as orders, sum(total) as spent
from orders
where status = 'paid'
group by customer_id
having sum(total) > 20000
order by spent desc;
`,
    },
    {
      id: 'sql-joins',
      title: 'Joining tables',
      minutes: 35,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Why data is split into tables, keys, and INNER JOIN to combine them, including joins across three or four tables.',
      body: `## Why split data into tables?

Imagine writing Ada's full name and city on every one of her orders. If she moves to Lagos, you must fix every order, and you will miss one. Instead, each customer is stored **once**, and each order just says *which* customer by their \`id\`. That number is like a student's admission number: short, unique and never confused with someone else who has the same name.

- A **primary key** is the unique id of each row: \`customers.id\`.
- A **foreign key** is a column that points to another table's primary key: \`orders.customer_id\` points to \`customers.id\`.

## JOIN: put the pieces back together

To show orders with the customer's name, we **join** the two tables where the keys match:

\`\`\`sql
select orders.id, customers.name, orders.total
from orders
join customers on customers.id = orders.customer_id;
\`\`\`

Think of matching two class lists by admission number: for every order, find the customer whose id equals the order's customer_id, and glue the two rows side by side.

## Table aliases

Long table names get tiring. Give each one a short alias:

\`\`\`sql
select o.id, c.name, o.total
from orders o
join customers c on c.id = o.customer_id
where o.status = 'paid';
\`\`\`

## Many tables

Joins chain. To see which products were in each order, go orders → order_items → products:

\`\`\`sql
select o.id, p.name, i.qty, p.price * i.qty as line_total
from orders o
join order_items i on i.order_id = o.id
join products p on p.id = i.product_id;
\`\`\`

## Inner join drops the unmatched

A plain \`join\` (also written \`inner join\`) only keeps rows that have a match on **both** sides. Grace and Emeka have no orders, so they never appear in the query above. The next lesson shows how to keep them.

## Joins with GROUP BY

Join first, then group, and you can answer questions like "revenue per city" or "units sold per product".

${TABLES}

## Your task

Show **revenue per city** from **paid** orders: columns \`city\` and \`revenue\`, highest revenue first. (Join orders to customers, filter, then group by city.)`,
      task: 'Revenue per customer city from paid orders, highest first.',
      starter: `select * from orders o
join customers c on c.id = o.customer_id;
`,
      checks: [
        { label: 'city and revenue from paid orders, highest first', test: `return await same("select c.city, sum(o.total) from orders o join customers c on c.id = o.customer_id where o.status = 'paid' group by c.city order by sum(o.total) desc", true)` },
      ],
      hint: "select c.city, sum(o.total) as revenue from orders o join customers c on c.id = o.customer_id where o.status = 'paid' group by c.city order by revenue desc;",
      solution: `select c.city, sum(o.total) as revenue
from orders o
join customers c on c.id = o.customer_id
where o.status = 'paid'
group by c.city
order by revenue desc;
`,
    },
    {
      id: 'sql-left-join',
      title: 'LEFT JOIN and finding what is missing',
      minutes: 30,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Keep every row with LEFT JOIN, find customers with no orders, and replace NULLs with COALESCE.',
      body: `## Keep everyone on the list

A teacher takes the register by matching the class list against who is in the room. An inner join is like listing only the children who are present. A **left join** lists **every child on the register**, and leaves a blank next to those who are absent.

\`\`\`sql
select c.name, o.id as order_id
from customers c
left join orders o on o.customer_id = c.id;
\`\`\`

Every customer appears. Where there is no matching order, the order columns are **NULL**. Grace and Emeka show up with an empty order_id.

The table written **first** (on the left) is the one whose rows are all kept.

## Finding what is missing

The classic use: *which customers have never ordered?* Left join, then keep the rows where the right side is NULL:

\`\`\`sql
select c.name
from customers c
left join orders o on o.customer_id = c.id
where o.id is null;
\`\`\`

Businesses run this kind of query all the time: products that never sold, students who have not paid, staff with no timesheet this week.

## A trap: filters on the right table

If you add \`where o.status = 'paid'\` to a left join, the customers with no orders disappear again, because their status is NULL, and NULL is not \`'paid'\`. Put that condition in the **on** instead, so it only decides which orders match:

\`\`\`sql
left join orders o on o.customer_id = c.id and o.status = 'paid'
\`\`\`

## COALESCE: fill the blanks

\`coalesce(a, b)\` gives the first value that is not NULL. \`coalesce(sum(o.total), 0)\` turns "no orders" into a clear 0, and \`coalesce(city, 'Unknown')\` labels missing cities in a report.

## Counting with left joins

\`count(o.id)\` counts only matched orders (NULLs are not counted), so customers with no orders get 0, which is right. \`count(*)\` would wrongly give them 1.

${TABLES}

## Your task

List **every** customer with the money they have spent on **paid** orders: columns \`name\` and \`spent\`, where customers with no paid orders show \`0\`. Sort by \`spent\` highest first, then by \`name\`.`,
      task: 'Every customer with their paid spending (0 if none).',
      starter: `select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
`,
      checks: [
        { label: 'all 7 customers', test: `return (await result()).length === 7` },
        { label: 'name and paid spending, 0 for none, sorted', test: `return await same("select c.name, coalesce(sum(o.total), 0) from customers c left join orders o on o.customer_id = c.id and o.status = 'paid' group by c.id, c.name order by 2 desc, c.name", true)` },
      ],
      hint: "from customers c left join orders o on o.customer_id = c.id and o.status = 'paid' group by c.id, c.name, with coalesce(sum(o.total), 0) as spent",
      solution: `select c.name, coalesce(sum(o.total), 0) as spent
from customers c
left join orders o on o.customer_id = c.id and o.status = 'paid'
group by c.id, c.name
order by spent desc, c.name;
`,
    },
    {
      id: 'sql-case-dates',
      title: 'CASE, dates and monthly reports',
      minutes: 30,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Label rows with CASE WHEN, group by month with date functions, and build a pivot-style report.',
      body: `## CASE: if / else inside a query

\`case\` lets a query make decisions, like a teacher turning scores into grades:

\`\`\`sql
select name, price,
  case
    when price >= 15000 then 'premium'
    when price >= 2000 then 'standard'
    else 'budget'
  end as band
from products;
\`\`\`

The first true \`when\` wins, just like \`if\` / \`elif\` in Python. Without an \`else\`, unmatched rows get NULL.

## Counting with CASE

A powerful trick: put \`case\` inside \`sum\` to count or add only some rows, in the same query:

\`\`\`sql
select
  sum(case when status = 'paid' then total else 0 end) as paid,
  sum(case when status = 'pending' then total else 0 end) as pending
from orders;
\`\`\`

This turns rows into columns, which is what a spreadsheet **pivot table** does.

## Dates

Every database has date functions. Their names differ, but the ideas are the same:

| Task | SQLite (this course) | PostgreSQL / Supabase |
|---|---|---|
| Year and month | \`strftime('%Y-%m', order_date)\` | \`to_char(order_date, 'YYYY-MM')\` |
| Today | \`date('now')\` | \`current_date\` |
| 30 days ago | \`date('now', '-30 days')\` | \`current_date - 30\` |
| Days between | \`julianday(b) - julianday(a)\` | \`b - a\` |

Because our dates are stored as \`YYYY-MM-DD\` text, \`substr(order_date, 1, 7)\` also gives the month, like \`2026-10\`.

## Monthly reports

Group by the month to see the trend:

\`\`\`sql
select strftime('%Y-%m', order_date) as month, sum(total) as revenue
from orders
where status = 'paid'
group by month
order by month;
\`\`\`

A month-by-month table like this is the first thing most business owners ask for, and you can now build it.

${TABLES}

## Your task

Make a monthly report over **all** orders with these columns, one row per month, oldest month first:

1. \`month\` (like \`2026-09\`)
2. \`paid\`: the total of paid orders in that month
3. \`not_paid\`: the total of orders that are pending or cancelled in that month
4. \`orders\`: the number of orders in that month`,
      task: 'One row per month: month, paid, not_paid, orders.',
      starter: `select order_date, status, total from orders;
`,
      checks: [
        { label: 'month, paid, not_paid and orders, oldest first', test: `return await same("select strftime('%Y-%m', order_date), sum(case when status = 'paid' then total else 0 end), sum(case when status <> 'paid' then total else 0 end), count(*) from orders group by 1 order by 1", true)` },
      ],
      hint: "select strftime('%Y-%m', order_date) as month, sum(case when status = 'paid' then total else 0 end) as paid, … group by month order by month",
      solution: `select strftime('%Y-%m', order_date) as month,
       sum(case when status = 'paid' then total else 0 end) as paid,
       sum(case when status <> 'paid' then total else 0 end) as not_paid,
       count(*) as orders
from orders
group by month
order by month;
`,
    },
    {
      id: 'sql-subqueries',
      title: 'Subqueries and CTEs',
      minutes: 30,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Queries inside queries, IN with a subquery, and WITH (common table expressions) for readable step-by-step SQL.',
      body: `## A question inside a question

*"Which products cost more than the average product?"* To answer, you first need the average, then compare. In SQL, you can put one query **inside** another:

\`\`\`sql
select name, price
from products
where price > (select avg(price) from products);
\`\`\`

The inner query runs first and gives one number; the outer query uses it. It is like asking a friend for the class average before deciding who scored above it.

## Subqueries that return a list

\`\`\`sql
select name from customers
where id in (select customer_id from orders where status = 'pending');
\`\`\`

The inner query returns a list of ids; \`in\` checks each customer against it.

## WITH: name your steps (CTEs)

Long nested queries get hard to read, like a sentence with five brackets. A **common table expression** (CTE) lets you name each step, then use it like a table:

\`\`\`sql
with spending as (
  select customer_id, sum(total) as spent
  from orders
  where status = 'paid'
  group by customer_id
)
select c.name, s.spent
from spending s
join customers c on c.id = s.customer_id
where s.spent > (select avg(spent) from spending);
\`\`\`

Read it top to bottom: *first* work out each customer's spending, *then* keep those above the average spending. You can chain several steps: \`with a as (…), b as (… from a …) select … from b\`.

CTEs are how analysts write long reports that colleagues can still check. Prefer them whenever a query does more than one thing.

## EXISTS

\`where exists (select 1 from orders o where o.customer_id = c.id)\` keeps customers who have at least one order. It stops looking as soon as it finds one, which is efficient on large tables.

${TABLES}

## Your task

Using a CTE, show the customers whose spending on **paid** orders is **above the average** of all paying customers' spending. Columns: \`name\` and \`spent\`, highest first.`,
      task: 'Customers who spent more than the average paying customer.',
      starter: `with spending as (
  select customer_id, sum(total) as spent
  from orders
  group by customer_id
)
select * from spending;
`,
      checks: [
        { label: 'name and spent above the average, highest first', test: `return await same("with s as (select customer_id, sum(total) as spent from orders where status = 'paid' group by customer_id) select c.name, s.spent from s join customers c on c.id = s.customer_id where s.spent > (select avg(spent) from s) order by s.spent desc", true)` },
      ],
      hint: "Add where status = 'paid' inside the CTE, then join customers and keep where s.spent > (select avg(spent) from spending).",
      solution: `with spending as (
  select customer_id, sum(total) as spent
  from orders
  where status = 'paid'
  group by customer_id
)
select c.name, s.spent
from spending s
join customers c on c.id = s.customer_id
where s.spent > (select avg(spent) from spending)
order by s.spent desc;
`,
    },
    {
      id: 'sql-change',
      title: 'Creating and changing data',
      minutes: 35,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'CREATE TABLE with constraints, INSERT, UPDATE, DELETE, and transactions to keep data safe.',
      body: `## From reading to writing

So far you have only read data. Now you will change it. These commands are powerful: an \`update\` without a \`where\` changes **every** row. Professionals treat them like a cheque book: check twice, sign once.

## CREATE TABLE

\`\`\`sql
create table suppliers (
  id integer primary key,
  name text not null unique,
  phone text,
  rating integer check (rating between 1 and 5)
);
\`\`\`

The rules after each column are **constraints**: the database refuses data that breaks them.

- \`primary key\`: unique id for each row
- \`not null\`: a value is required
- \`unique\`: no two rows may share it
- \`check (…)\`: any rule you like
- \`references other(id)\`: a foreign key: the value must exist in the other table

Constraints are the database's security guard at the gate. Code in an app can have bugs; the guard still stops bad data.

## INSERT

\`\`\`sql
insert into suppliers (id, name, phone, rating) values (1, 'Abuja Grains Ltd', '0803 000 0000', 5);
insert into suppliers (id, name, rating) values (2, 'Kano Oils', 4), (3, 'Lagos Tech', 3);
\`\`\`

Always list the columns: your insert keeps working if someone adds a column later.

## UPDATE

\`\`\`sql
update products set price = 1300 where id = 3;
update products set price = round(price * 1.1) where category = 'Food';   -- a 10% rise for food
\`\`\`

**Run the \`where\` as a \`select\` first** to see which rows will change. That one habit prevents most disasters.

## DELETE

\`\`\`sql
delete from orders where status = 'cancelled';
\`\`\`

Many real systems never delete business records. They mark them (\`status = 'archived'\`) so history and audits stay intact.

## Transactions: all or nothing

Moving money from one account to another is two updates. If the power goes off between them, money vanishes. A **transaction** groups statements so that either all happen or none do:

\`\`\`sql
begin;
update accounts set balance = balance - 5000 where id = 1;
update accounts set balance = balance + 5000 where id = 2;
commit;     -- or rollback; to undo everything since begin
\`\`\`

## Your task

1. Create a table \`suppliers\` with \`id\` (integer primary key), \`name\` (text, not null, unique) and \`rating\` (integer that must be between 1 and 5).
2. Insert 3 suppliers.
3. Raise the price of every **Electronics** product by **10%** (round to a whole number).
4. Delete the **cancelled** orders.
5. Finish with \`select * from suppliers;\``,
      task: 'Create suppliers, add 3, raise Electronics prices 10%, delete cancelled orders.',
      starter: `-- 1. create table suppliers (...)

-- 2. insert into suppliers ...

-- 3. update products ...

-- 4. delete from orders ...

select * from suppliers;
`,
      checks: [
        { label: 'suppliers table has 3 rows', test: `return await yes("select count(*) = 3 from suppliers")` },
        { label: 'rating has a check rule', test: `return await yes("select sql like '%check%' from sqlite_master where name = 'suppliers'")` },
        { label: 'Electronics prices up 10%', test: `return await yes("select sum(price) = 2750 + 19800 + 10450 from products where category = 'Electronics'")` },
        { label: 'other prices unchanged', test: `return await yes("select sum(price) = 72000 + 15500 + 1200 + 800 + 1500 from products where category <> 'Electronics'")` },
        { label: 'cancelled orders deleted, others kept', test: `return await yes("select count(*) = 9 and sum(status = 'cancelled') = 0 from orders")` },
      ],
      hint: "update products set price = round(price * 1.1) where category = 'Electronics'; delete from orders where status = 'cancelled';",
      solution: `create table suppliers (
  id integer primary key,
  name text not null unique,
  rating integer check (rating between 1 and 5)
);
insert into suppliers (id, name, rating) values (1, 'Abuja Grains Ltd', 5), (2, 'Kano Oils', 4), (3, 'Lagos Tech', 3);
update products set price = round(price * 1.1) where category = 'Electronics';
delete from order_items where order_id in (select id from orders where status = 'cancelled');
delete from orders where status = 'cancelled';
select * from suppliers;
`,
    },
    {
      id: 'sql-design',
      title: 'Designing a good database',
      minutes: 30,
      kind: 'read',
      outline: 'Normalisation, choosing keys, relationships, indexes, SQL injection and access rules in real systems.',
      body: `## Design decides everything later

A badly planned building can be painted beautifully, but the doors will still be in the wrong places. A badly designed database makes every future query harder and every report less trustworthy. Ten minutes of design saves months of cleaning.

## Start from the nouns

List the **things** the business deals with: customers, products, orders, payments, branches, staff. Each thing usually becomes a table. Then list the **facts** about each one: those become columns.

## Normalisation: one fact, one place

The main rule: **store each fact once**. If the customer's phone number is written on every order, it will eventually disagree with itself. Common signs of trouble:

- Repeating columns: \`product1\`, \`product2\`, \`product3\`. Use a separate table with one row per item (like \`order_items\`).
- Several values in one cell: \`"Rice, Oil, Bread"\`. Split into rows.
- The same text typed in many rows: \`"Electronics"\`, \`"electronics"\`, \`"Electronic"\`. Use a lookup table or a check constraint.

## Relationships

- **One-to-many**: one customer has many orders. The "many" side holds the foreign key (\`orders.customer_id\`).
- **Many-to-many**: an order has many products, and a product is in many orders. Use a **join table** in the middle (\`order_items\`), with a foreign key to each side.
- **One-to-one**: rare; usually extra details split into another table.

## Choosing keys and types

- Use a meaningless id (a number or a UUID) as the primary key, not a name or phone number, because those change.
- Store money as whole units (kobo, cents) or a \`numeric\` type, never as text, and avoid floating-point types for money.
- Store dates as date types, not text like \`"5th of Nov"\`.

## Indexes: the book's index

Finding a word in a book without an index means reading every page. A database **index** on a column lets it jump straight to matching rows: \`create index orders_customer_idx on orders (customer_id);\`. Index the columns you search and join on often. Indexes speed up reading but slightly slow down writing, so do not index everything.

## SQL injection: the most famous security hole

If an app glues user input straight into SQL text, an attacker can type SQL instead of a name:

\`\`\`
name typed:  ' or '1'='1
query built: select * from users where name = '' or '1'='1'
\`\`\`

That returns every user. The fix is simple and non-negotiable: **parameterised queries**, where the database receives the query and the values separately and never treats a value as code. Every modern library supports them. Never build SQL by joining strings with user input.

## Who may see what

Real databases give each user only the access they need. In PostgreSQL and Supabase (which CDM Studio uses), **row level security** rules like *"a user can only read their own orders"* live in the database itself, so even a buggy app cannot leak other people's data.

## Which database?

**PostgreSQL** (free, powerful, used by Supabase), **MySQL / MariaDB** (common on web hosting), **SQL Server** (many corporates and banks), **SQLite** (inside phones and apps; this course), **Oracle** (large enterprises). The SQL you learned works on all of them with small differences.`,
      quiz: [
        { q: 'An orders table has columns product1, product2, product3. The better design is…', options: ['Add product4 and product5', 'A separate order_items table with one row per product', 'Put all products in one text cell'], answer: 1, why: 'Repeating columns become rows in a child table.' },
        { q: 'Which is the best primary key for customers?', options: ['Their phone number', 'Their full name', 'A meaningless id that never changes'], answer: 2, why: 'Names and phone numbers change and can repeat.' },
        { q: 'The fix for SQL injection is…', options: ['Parameterised queries', 'Hiding error messages', 'Using capital letters in SQL'], answer: 0, why: 'Values must never be treated as SQL code.' },
        { q: 'An index helps most on…', options: ['Columns you search and join on often', 'Every column', 'Columns you never read'], answer: 0, why: 'Indexes speed up lookups but cost a little on writes.' },
      ],
    },
    {
      id: 'sql-window',
      title: 'Window functions and where SQL takes you',
      minutes: 35,
      kind: 'code',
      lang: 'sql',
      setup: SHOP,
      outline: 'Rank rows, running totals and comparisons with the previous row using OVER (...), plus SQL careers and next steps.',
      body: `## Looking through a window

\`group by\` squeezes rows into one per group. Sometimes you want to **keep every row** but still see something about its group, like each student's score *and* their position in the class. **Window functions** do that: each row looks through a "window" at the rows around it.

\`\`\`sql
select name, category, price,
       rank() over (partition by category order by price desc) as rank_in_category
from products;
\`\`\`

- \`over ( … )\` makes it a window function.
- \`partition by category\` makes a separate window per category (like separate classes).
- \`order by price desc\` decides the order inside each window.

## Useful window functions

| Function | Gives |
|---|---|
| \`row_number()\` | 1, 2, 3 … with no ties |
| \`rank()\` | positions, with ties sharing a rank |
| \`sum(x) over (order by …)\` | a **running total** |
| \`lag(x)\` / \`lead(x)\` | the value from the previous / next row |
| \`avg(x) over (partition by …)\` | the group average next to each row |

## Running totals

\`\`\`sql
select order_date, total,
       sum(total) over (order by order_date, id) as running_total
from orders
where status = 'paid';
\`\`\`

This is how a bank statement shows the balance after every transaction.

## Comparing with the previous row

\`total - lag(total) over (order by order_date)\` shows the change since the previous order: growth month on month, or the gap between a customer's visits.

## Top N per group

"The best-selling product in each category" is a classic interview question. Number the rows per group in a CTE, then keep number 1:

\`\`\`sql
with ranked as (
  select name, category, price, row_number() over (partition by category order by price desc) as n
  from products
)
select * from ranked where n = 1;
\`\`\`

## Where SQL takes you

- **Data analyst / BI analyst**: SQL plus a dashboard tool (Power BI, Looker Studio, Metabase). Pair this course with **Data analytics for business**.
- **Back-end developer**: SQL plus Python or JavaScript. Supabase and PostgreSQL are great places to practise; CDM Studio itself runs on them.
- **Practice**: SQLBolt, Mode's SQL tutorial, and the free datasets on Kaggle. In interviews, explain your thinking out loud and test edge cases like NULLs and ties.

${TABLES}

## Your task

For **paid** orders, show \`id\`, \`order_date\`, \`total\` and \`running_total\` (the total of paid orders so far, in date order, using \`id\` to break ties), oldest first.`,
      task: 'Paid orders with a running total, oldest first.',
      starter: `select id, order_date, total
from orders
where status = 'paid'
order by order_date;
`,
      checks: [
        { label: 'id, order_date, total and running_total in date order', test: `return await same("select id, order_date, total, sum(total) over (order by order_date, id) from orders where status = 'paid' order by order_date, id", true)` },
      ],
      hint: 'Add: sum(total) over (order by order_date, id) as running_total',
      solution: `select id, order_date, total,
       sum(total) over (order by order_date, id) as running_total
from orders
where status = 'paid'
order by order_date, id;
`,
    },
  ],
  project: {
    title: 'A database for a real business',
    lang: 'sql',
    brief: `Design and query a database for a business you know: a pharmacy, a school, a hotel, a farm, a church, a logistics company, anything real.

**Part 1, design:** write the \`create table\` statements for **at least 3 related tables** with primary keys, foreign keys and sensible constraints, then \`insert\` enough rows to make the answers interesting (at least 10 rows in the main table).

**Part 2, questions:** write **at least 6 queries** that answer real business questions, each with a comment above it saying the question in plain English. Include at least one join, one \`group by\`, one left join that finds something missing, and one CTE or window function.

Test the whole script in a SQL lesson's editor (it runs SQLite) or on your own computer, then paste it all here.`,
    rubric: [
      'Creates at least 3 related tables with primary keys and foreign keys',
      'Uses sensible column types and at least two other constraints (not null, unique or check)',
      'Inserts realistic data, with at least 10 rows in the main table',
      'Has at least 6 queries, each with a comment stating the business question',
      'Uses at least one join correctly on the keys',
      'Uses group by with an aggregate (and having or order by where it helps)',
      'Uses a left join (or not exists) to find something missing, handling NULLs correctly',
      'Uses a CTE or a window function in a meaningful way',
      'Queries are readable: aliases, consistent formatting and clear column names',
    ],
  },
  exam: [
    { q: 'In a database table, one row is…', options: ['One field, like a name', 'One record, like one customer', 'The whole table', 'A query'], answer: 1, why: 'Columns are fields; rows are records.' },
    { q: 'select name, city from customers returns…', options: ['Every column', 'Only the name and city columns', 'Only customers named city', 'An error'], answer: 1, why: 'select lists the columns you want.' },
    { q: 'How do you find customers whose city is missing?', options: ['where city = null', 'where city is null', "where city = ''", 'where city = 0'], answer: 1, why: 'NULL is unknown, so use is null.' },
    { q: "where name like 'A%' finds names that…", options: ['Contain A anywhere', 'Start with A', 'End with A', 'Are exactly A%'], answer: 1, why: '% means any characters after the A.' },
    { q: 'To get the 5 most expensive products you need…', options: ['limit 5 only', 'order by price desc limit 5', 'order by price limit 5', 'top 5 where price'], answer: 1, why: 'Sort first, then limit.' },
    { q: 'select distinct city from customers…', options: ['Shows each city once', 'Counts cities', 'Deletes duplicates from the table', 'Sorts cities'], answer: 0, why: 'distinct removes repeats from the result only.' },
    { q: 'count(city) differs from count(*) because…', options: ['It counts only non-NULL cities', 'It is faster', 'It counts distinct cities', 'There is no difference'], answer: 0, why: 'count(column) skips NULLs.' },
    { q: 'In SQLite and PostgreSQL, 7 / 2 gives…', options: ['3.5', '3', '4', 'An error'], answer: 1, why: 'Whole numbers divide to a whole number; use 7 / 2.0.' },
    { q: 'select category, count(*) from products group by category returns…', options: ['One row per product', 'One row per category', 'One row in total', 'An error'], answer: 1, why: 'group by makes one row per group.' },
    { q: 'WHERE and HAVING differ because…', options: ['WHERE filters rows before grouping; HAVING filters groups after', 'They are the same', 'HAVING is only for text', 'WHERE only works with joins'], answer: 0, why: 'Remember the running order.' },
    { q: 'orders.customer_id pointing to customers.id is a…', options: ['Primary key', 'Foreign key', 'Index', 'Constraint on price'], answer: 1, why: 'It refers to another table\'s primary key.' },
    { q: 'An inner join between customers and orders leaves out…', options: ['Customers with no orders', 'Orders with big totals', 'Paid orders', 'Nothing'], answer: 0, why: 'Inner joins keep only matches on both sides.' },
    { q: 'To list customers who have never ordered, you can…', options: ['left join orders and keep where the order id is null', 'inner join and filter', 'use distinct', 'use order by'], answer: 0, why: 'Unmatched rows have NULLs on the right side.' },
    { q: 'coalesce(sum(o.total), 0) is used to…', options: ['Show 0 instead of NULL when there are no orders', 'Round the sum', 'Count orders', 'Sort results'], answer: 0, why: 'coalesce returns the first non-NULL value.' },
    { q: "sum(case when status = 'paid' then total else 0 end) gives…", options: ['The number of paid orders', 'The total of paid orders only', 'All totals', 'An error'], answer: 1, why: 'Non-paid rows add 0.' },
    { q: 'A CTE (with … as) mainly helps…', options: ['Make long queries readable in named steps', 'Delete data', 'Encrypt data', 'Create users'], answer: 0, why: 'Each step gets a name you can query.' },
    { q: 'update products set price = 0 with no where clause…', options: ['Changes only the first row', 'Changes every row', 'Does nothing', 'Asks for confirmation'], answer: 1, why: 'Always check the where with a select first.' },
    { q: 'A transaction (begin … commit) guarantees that…', options: ['All its statements happen or none do', 'Queries run faster', 'Data is encrypted', 'Users can see each other\'s data'], answer: 0, why: 'All or nothing, like a money transfer.' },
    { q: 'Which is NOT a sign of poor design?', options: ['Columns like product1, product2, product3', 'Several values in one cell', 'A customer stored once and referenced by id', 'The same category typed many different ways'], answer: 2, why: 'Storing each fact once is good normalisation.' },
    { q: 'The proper defence against SQL injection is…', options: ['Parameterised queries', 'Longer passwords', 'Upper-case keywords', 'Shorter table names'], answer: 0, why: 'Values are sent separately and never run as code.' },
    { q: 'rank() over (partition by category order by price desc)…', options: ['Ranks products by price within each category, keeping every row', 'Groups products into one row per category', 'Deletes the cheapest products', 'Sorts categories alphabetically'], answer: 0, why: 'Window functions keep rows while looking at their group.' },
    { q: 'sum(total) over (order by order_date) produces…', options: ['A running total', 'The grand total on one row', 'The average', 'A count'], answer: 0, why: 'Each row sees the rows up to itself.' },
  ],
}
