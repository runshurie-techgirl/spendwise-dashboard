// ===== SpendWise: interactive dashboard =====

// ----- Fixed values (const = never changes) -----
const appName = "SpendWise";
const currency = "KES";
const usdRate = 129.2;
const maxAmount = 1000000000;

// ----- Data (let = can change later) -----
let monthlyBudget = 0;
let nextId = 1;

// Array of category objects: one per dashboard card
const categories = [
  { name: "Food", icon: "🍲", limit: 12000 },
  { name: "Transport", icon: "🚌", limit: 6000 },
  { name: "Rent", icon: "🏠", limit: 15000 },
  { name: "Entertainment", icon: "🎬", limit: 4000 },
  { name: "Savings", icon: "🐖", limit: 10000 },
  { name: "Utilities", icon: "💡", limit: 5000 }
];

// Array that stores every expense the user adds
const expenses = [];

// ----- DOM references -----
const errorMessage = document.getElementById("error-message");
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");
const expenseForm = document.getElementById("expense-form");
const nameInput = document.getElementById("name-input");
const amountInput = document.getElementById("amount-input");
const categoryInput = document.getElementById("category-input");
const cardGrid = document.getElementById("card-grid");
const expenseList = document.getElementById("expense-list");
const clearButton = document.getElementById("clear-button");
const balanceValue = document.getElementById("balance-value");
const balanceUsd = document.getElementById("balance-usd");
const statusMessage = document.getElementById("status-message");
const summaryLine = document.getElementById("summary-line");

console.log(appName + " script loaded successfully!");

// ===== Helper functions =====

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function formatKES(amount) {
  const sign = amount < 0 ? "-" : "";
  return sign + currency + " " + Math.abs(amount).toLocaleString("en-KE", {
    maximumFractionDigits: 2
  });
}

function formatUSD(amount) {
  const sign = amount < 0 ? "-" : "";
  return "≈ " + sign + "$" + Math.abs(Math.round(amount / usdRate)).toLocaleString("en-US");
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
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

// ===== Calculations (loops over the arrays) =====

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

function calculateRemaining(budget, total) {
  return roundMoney(budget - total);
}

function calculatePercentSpent(total, budget) {
  if (budget <= 0) {
    return 0;
  }
  return (total / budget) * 100;
}

// ===== Smart budget check (conditionals) =====

function getBudgetStatus(total, budget) {
  const percent = calculatePercentSpent(total, budget);

  if (budget <= 0) {
    return { level: "none", text: "Set your monthly budget to get advice." };
  } else if (total > budget) {
    return {
      level: "over",
      text: "WARNING: You are over budget by " + formatKES(roundMoney(total - budget)) + "!"
    };
  } else if (percent >= 80) {
    return {
      level: "careful",
      text: "CAREFUL: You have used " + percent.toFixed(1) + "% of your budget."
    };
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
    balanceValue.textContent = "Set a budget";
    balanceUsd.textContent = "";
    return;
  }
  const remaining = calculateRemaining(monthlyBudget, total);
  balanceValue.textContent = formatKES(remaining);
  balanceUsd.textContent = formatUSD(remaining);
}

function renderStatus(total) {
  const status = getBudgetStatus(total, monthlyBudget);
  statusMessage.textContent = status.text;
  statusMessage.className = "status is-" + status.level;

  if (monthlyBudget > 0) {
    const percent = calculatePercentSpent(total, monthlyBudget);
    summaryLine.textContent = "Spent " + formatKES(total) + " of " +
      formatKES(monthlyBudget) + " (" + percent.toFixed(1) + "%).";
  } else {
    summaryLine.textContent = "";
  }
}

function createCard(category) {
  const spent = calculateCategoryTotal(category.name);
  const percent = calculatePercentSpent(spent, category.limit);
  const level = getCategoryLevel(percent);

  const card = makeEl("article", "card is-" + level);
  card.tabIndex = 0;
  card.setAttribute("aria-label",
    category.name + ": " + formatKES(spent) + " of " + formatKES(category.limit));

  const top = makeEl("div", "card-top");
  const icon = makeEl("span", "card-icon", category.icon);
  icon.setAttribute("aria-hidden", "true");
  top.append(icon,
    makeEl("h3", "card-title", category.name),
    makeEl("span", "card-badge", Math.round(percent) + "%"));

  const amount = makeEl("p", "card-amount", formatKES(spent) + " ");
  amount.appendChild(makeEl("span", "card-usd", formatUSD(spent)));

  const meta = makeEl("p", "card-meta",
    "of " + formatKES(category.limit) + " budget (" + formatUSD(category.limit) + ")");

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
    left.append(
      makeEl("span", "item-name", expense.name),
      makeEl("span", "item-meta", expense.category));

    const right = makeEl("div", "item-right");
    const deleteButton = makeEl("button", "delete-button", "Delete");
    deleteButton.type = "button";
    deleteButton.dataset.id = expense.id;
    deleteButton.setAttribute("aria-label", "Delete " + expense.name);
    right.append(makeEl("strong", "", formatKES(expense.amount)), deleteButton);

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

// ===== Events =====

budgetForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearError();

  const value = Number(budgetInput.value);
  if (budgetInput.value.trim() === "" || !Number.isFinite(value) || value <= 0) {
    showError("Enter a monthly budget greater than 0.");
    budgetInput.focus();
    return;
  }
  if (value > maxAmount) {
    showError("That budget is too large. Enter a smaller amount.");
    budgetInput.focus();
    return;
  }

  monthlyBudget = roundMoney(value);
  budgetInput.value = "";
  render();
});

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearError();

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

  expenses.push({
    id: nextId,
    name: name,
    amount: roundMoney(amount),
    category: categoryInput.value
  });
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
  clearError();
  render();
});

clearButton.addEventListener("click", function () {
  if (expenses.length === 0) {
    showError("There are no expenses to clear.");
    return;
  }
  clearError();
  expenses.length = 0;
  render();
});

// ===== Start the app =====
populateCategories();
render();