# SpendWise Dashboard

SpendWise is a budgeting dashboard.
You set a monthly budget, add your
expenses, and the page shows how you
are doing. Amounts are in Kenyan
Shillings (KES) with an approximate
US dollar value (1 USD = KES 129.2).

## Project Files

- `index.html`: page structure.
- `style.css`: layout and design.
- `script.js`: all the logic.
- `README.md`: this explanation.

## 1. Improvements Made This Week

Where the project started:

- Week 1 built the dashboard shell in
  HTML and CSS: sidebar, header and
  category cards (Grid and Flexbox).
- Week 2 added JavaScript basics:
  variables, `prompt()` input, three
  calculation functions and a smart
  budget check that logged to the
  console.

What is new this week:

- Expenses are stored in an array of
  objects, not in single variables.
- `prompt()` is replaced by two forms:
  one for the budget, one for expenses.
- Loops add up totals and draw the
  cards and the list.
- The balance, status message, cards
  and list update on the page, not in
  the console.
- Each expense has a Delete button.
- A Clear all button empties the list.
- Bad input shows an error message.
- The old smart budget check now shows
  its message on the page.
- Cards turn amber or red as spending
  grows.

## 2. How Conditionals Are Used

`getBudgetStatus()` compares spending
with the budget:

```javascript
if (budget <= 0) {
  // no budget set yet
} else if (total > budget) {
  // WARNING: over budget
} else if (percent >= 80) {
  // CAREFUL: 80% or more used
} else {
  // GOOD JOB: within budget
}
```

- Budget not set: ask the user to set it.
- Spent more than the budget: warning.
- 80% or more used: careful.
- Otherwise: good job.

`getCategoryLevel()` does the same for
each card: over 100% is "over", 80% or
more is "careful", else "good".

Conditionals also check input:

- An empty name is rejected.
- An amount that is not a number above
  0 is rejected.
- A budget of 0 never divides: the
  percent function returns 0 first.
- Clear all warns if the list is empty.

## 3. How Arrays Are Used to Store Data

Two arrays hold the data.

`categories` holds one object per
dashboard card:

```javascript
{ name: "Food", icon: "🍲",
  limit: 12000 }
```

`expenses` holds every expense the
user adds:

```javascript
{ id: 1, name: "Chapati",
  amount: 50, category: "Food" }
```

Array methods used:

- `push()` adds a new expense.
- `splice()` removes one by its id.
- `expenses.length = 0` clears all.

Loops work through the arrays:

- `for` loop: adds up all expenses.
- `for...of` loop: adds up one
  category, builds the cards, builds
  the list and fills the dropdown.

## 4. How the DOM Is Updated

The page never reloads. After every
change, `render()` runs and redraws:

- `renderHeader()`: the remaining
  balance in KES and USD.
- `renderStatus()`: the status message
  and the "spent of budget" line.
- `renderCards()`: one card per
  category, built from the array.
- `renderExpenses()`: one list item
  per expense.

How elements are built:

- `createElement()` makes the element.
- `textContent` adds the text, so
  anything typed stays plain text.
- `replaceChildren()` clears old items
  before redrawing.
- `style.setProperty("--pct", ...)`
  sets the progress bar width.
- A class such as `is-over` changes
  the colour of the status or card.

## 5. How User Interactions Are Handled

Event listeners connect actions to
the logic:

- Budget form `submit`: checks the
  value, saves the budget, renders.
- Expense form `submit`: checks name
  and amount, pushes a new object into
  the array, renders.
- Click on the list: one listener on
  the `ul` finds the Delete button
  with `closest()`, removes that
  expense, renders.
- Clear all `click`: empties the array
  and renders.

The flow is always the same:

1. The user acts (click or submit).
2. The event listener runs.
3. The array or budget is updated.
4. `render()` redraws the page.

## 6. Challenges and How I Solved Them

- **Script placement.** The script tag
  sat after `</html>` with a stray
  closing `div`. I moved the script
  before `</body>` and removed the
  extra tag.
- **Page reloading on submit.** Forms
  refresh the page by default. I used
  `event.preventDefault()`.
- **Delete buttons not responding.**
  Buttons made by JavaScript had no
  listeners. I used one listener on the
  parent list (event delegation).
- **Bad or empty input.** Empty text,
  zero and negative numbers broke the
  totals. I check with
  `Number.isFinite()` and show a
  message.
- **Dividing by zero.** A budget of 0
  gave `Infinity` percent. The percent
  function now returns 0 first.
- **Decimal errors.** Adding decimals
  gave odd totals. I round money to 2
  decimals.
- **Removing the right expense.**
  Using list position was risky, so
  each expense has a unique id.
- **Duplicate items on redraw.** Old
  items stayed on the page. I clear
  the container before each redraw.

## Reflection

Moving from separate variables to
arrays made the code shorter and
easier to grow. Adding a new category
now means adding one object. The
biggest lesson was the flow: event,
then data, then render. Keeping the
data and the display separate made
bugs much easier to find.
