// SpendWise: interactive dashboard
const currency = "KES";
const usdRate = 129.2;
const maxAmount = 1000000000;
let monthlyBudget = 0;
let nextId = 1;

// Arrays: category cards and every expense the user adds
const categories = [
  { name: "Food", icon: "🍲", limit: 12000 },
  { name: "Transport", icon: "🚌", limit: 6000 },
  { name: "Rent", icon: "🏠", limit: 15000 },
  { name: "Entertainment", icon: "🎬", limit: 4000 },
  { name: "Savings", icon: "🐖", limit: 10000 },
  { name: "Utilities", icon: "💡", limit: 5000 }
];
const expenses = [];

// Select the HTML elements
const $ = (id) => document.getElementById(id);
const errorBox = $("error-message");
const budgetInput = $("budget-input");
const nameInput = $("name-input");
const amountInput = $("amount-input");
const categoryInput = $("category-input");
const cardGrid = $("card-grid");
const expenseList = $("expense-list");

// ===== EVENTS: user action -> update data -> render() =====
$("budget-form").addEventListener("submit", function (event) {
  event.preventDefault();
  hideError();
  const value = Number(budgetInput.value);
  if (budgetInput.value.trim() === "" || !Number.isFinite(value) || value <= 0) {
    showError("Enter a monthly budget greater than 0.");
    budgetInput.focus();
    return;
  }
  if (value > maxAmount) {
    showError("That budget is too large. Enter a smaller amount.");
    return;
  }
  monthlyBudget = roundMoney(value);
  budgetInput.value = "";
  render();
});

$("expense-form").addEventListener("submit", function (event) {
  event.preventDefault();
  hideError();
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value);
  if (name === "") {
    showError("Enter a name for the expense.");
    nameInput.focus();
    return;
  }
  if (amountInput.value.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
    showError("Enter an amount greater than 0.");
    amountInput.focus();
    return;
  }
  if (amount > maxAmount) {
    showError("That amount is too large. Enter a smaller amount.");
    amountInput.focus();
    return;
  }
  expenses.push({ id: nextId, name: name, amount: roundMoney(amount), category: categoryInput.value });
  nextId++;
  nameInput.value = "";
  amountInput.value = "";
  nameInput.focus();
  render();
});

// One listener on the list handles every Delete button
expenseList.addEventListener("click", function (event) {
  const button = event.target.closest(".delete-button");
  if (!button) {
    return;
  }
  const id = Number(button.dataset.id);
  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].id === id) {
      expenses.splice(i, 1);
      break;
    }
  }
  hideError();
  render();
});

$("clear-button").addEventListener("click", function () {
  if (expenses.length === 0) {
    showError("There are no expenses to clear.");
    return;
  }
  hideError();
  expenses.length = 0;
  render();
});

// ===== Helpers =====
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function formatKES(amount) {
  return (amount < 0 ? "-" : "") + currency + " " +
    Math.abs(amount).toLocaleString("en-KE", { maximumFractionDigits: 2 });
}

function formatUSD(amount) {
  return "≈ " + (amount < 0 ? "-" : "") + "$" +
    Math.abs(Math.round(amount / usdRate)).toLocaleString("en-US");
}

function makeEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
}

// ===== Loops over the arrays =====
function calculateTotalExpenses() {
  let total = 0;
  for (let i = 0; i < expenses.length; i++) {
    total += expenses[i].amount;
  }
  return roundMoney(total);
}

function calculateCategoryTotal(categoryName) {
  let total = 0;
  for (const expense of expenses) {
    if (expense.category === categoryName) {
      total += expense.amount;
    }
  }
  return roundMoney(total);
}

function calculatePercentSpent(total, budget) {
  return budget > 0 ? (total / budget) * 100 : 0;
}

// ===== Conditionals: smart budget check =====
function getBudgetStatus(total, budget) {
  const percent = calculatePercentSpent(total, budget);
  if (budget <= 0) {
    return { level: "none", text: "Set your monthly budget to get advice." };
  } else if (total > budget) {
    return { level: "over", text: "WARNING: You are over budget by " + formatKES(roundMoney(total - budget)) + "!" };
  } else if (percent >= 80) {
    return { level: "careful", text: "CAREFUL: You have used " + percent.toFixed(1) + "% of your budget." };
  }
  return { level: "good", text: "GOOD JOB: You are within your budget. Keep it up!" };
}

function getCategoryLevel(percent) {
  if (percent > 100) {
    return "over";
  } else if (percent >= 80) {
    return "careful";
  }
  return "good";
}

// ===== DOM updates =====
function populateCategories() {
  for (const category of categories) {
    const option = makeEl("option", "", category.name);
    option.value = category.name;
    categoryInput.appendChild(option);
  }
}

function renderHeader(total) {
  if (monthlyBudget <= 0) {
    $("balance-value").textContent = "Set a budget";
    $("balance-usd").textContent = "";
    return;
  }
  const remaining = roundMoney(monthlyBudget - total);
  $("balance-value").textContent = formatKES(remaining);
  $("balance-usd").textContent = formatUSD(remaining);
}

function renderStatus(total) {
  const status = getBudgetStatus(total, monthlyBudget);
  $("status-message").textContent = status.text;
  $("status-message").className = "status is-" + status.level;
  $("summary-line").textContent = monthlyBudget > 0
    ? "Spent " + formatKES(total) + " of " + formatKES(monthlyBudget) + " (" +
      calculatePercentSpent(total, monthlyBudget).toFixed(1) + "%)."
    : "";
}

function createCard(category) {
  const spent = calculateCategoryTotal(category.name);
  const percent = calculatePercentSpent(spent, category.limit);
  const card = makeEl("article", "card is-" + getCategoryLevel(percent));
  card.tabIndex = 0;
  card.setAttribute("aria-label", category.name + ": " + formatKES(spent) + " of " + formatKES(category.limit));

  const top = makeEl("div", "card-top");
  const icon = makeEl("span", "card-icon", category.icon);
  icon.setAttribute("aria-hidden", "true");
  top.append(icon, makeEl("h3", "card-title", category.name), makeEl("span", "card-badge", Math.round(percent) + "%"));

  const amount = makeEl("p", "card-amount", formatKES(spent) + " ");
  amount.appendChild(makeEl("span", "card-usd", formatUSD(spent)));
  const meta = makeEl("p", "card-meta", "of " + formatKES(category.limit) + " budget (" + formatUSD(category.limit) + ")");

  const bar = makeEl("div", "bar");
  bar.style.setProperty("--pct", Math.min(percent, 100) + "%");
  bar.appendChild(document.createElement("span"));

  card.append(top, amount, meta, bar);
  return card;
}

function renderCards() {
  cardGrid.replaceChildren();
  for (const category of categories) {
    cardGrid.appendChild(createCard(category));
  }
}

function renderExpenses() {
  expenseList.replaceChildren();
  if (expenses.length === 0) {
    expenseList.appendChild(makeEl("li", "empty", "No expenses yet. Add one above."));
    return;
  }
  for (const expense of expenses) {
    const item = makeEl("li");
    const left = makeEl("div");
    left.append(makeEl("span", "item-name", expense.name), makeEl("span", "item-meta", expense.category));
    const right = makeEl("div", "item-right");
    const del = makeEl("button", "delete-button", "Delete");
    del.type = "button";
    del.dataset.id = expense.id;
    del.setAttribute("aria-label", "Delete " + expense.name);
    right.append(makeEl("strong", "", formatKES(expense.amount)), del);
    item.append(left, right);
    expenseList.appendChild(item);
  }
}

// One function redraws everything after any change
function render() {
  const total = calculateTotalExpenses();
  renderHeader(total);
  renderStatus(total);
  renderCards();
  renderExpenses();
}

// ===== Start the app =====
populateCategories();
render();