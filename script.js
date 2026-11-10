// ===== SpendWise: application data =====

// Fixed values (const = never changes)
const appName = "SpendWise";
const currency = "KES";

// Budget data (let = can change later)
let monthlyBudget = 0;

// Expense data (starting at 0; the user will fill these in Step 3)
let foodExpense = 0;
let transportExpense = 0;
let rentExpense = 0;
let utilitiesExpense = 0;

// Results (we will calculate these in Step 4)
let totalExpenses = 0;
let remainingBalance = 0;

console.log(appName + " script loaded successfully!");

// ===== Collect user input =====

monthlyBudget = Number(prompt("Enter your monthly budget (KES):"));
foodExpense = Number(prompt("How much have you spent on Food (KES)?"));
transportExpense = Number(prompt("How much have you spent on Transport (KES)?"));
rentExpense = Number(prompt("How much have you spent on Rent (KES)?"));
utilitiesExpense = Number(prompt("How much have you spent on Utilities (KES)?"));

// ===== Reusable functions =====

function calculateTotalExpenses(food, transport, rent, utilities) {
  return food + transport + rent + utilities;
}

function calculateRemaining(budget, total) {
  return budget - total;
}

function calculatePercentSpent(total, budget) {
  return (total / budget) * 100;
}

// ===== Use the functions =====

totalExpenses = calculateTotalExpenses(foodExpense, transportExpense, rentExpense, utilitiesExpense);
remainingBalance = calculateRemaining(monthlyBudget, totalExpenses);
let percentSpent = calculatePercentSpent(totalExpenses, monthlyBudget);

// ===== Smart budget check =====

function checkBudgetStatus() {
  if (remainingBalance < 0) {
    console.log("WARNING: You are over budget by " + currency + " " + Math.abs(remainingBalance) + "!");
  } else if (percentSpent >= 80) {
    console.log("CAREFUL: You have used " + percentSpent.toFixed(1) + "% of your budget.");
  } else {
    console.log("GOOD JOB: You are within your budget. Keep it up!");
  }
}

displayResults();
checkBudgetStatus();

// ===== Display results =====

function displayResults() {
  console.log("===== " + appName + " Budget Summary =====");
  console.log("Monthly budget: " + currency + " " + monthlyBudget);
  console.log("Food: " + currency + " " + foodExpense);
  console.log("Transport: " + currency + " " + transportExpense);
  console.log("Rent: " + currency + " " + rentExpense);
  console.log("Utilities: " + currency + " " + utilitiesExpense);
  console.log("Total expenses: " + currency + " " + totalExpenses);
  console.log("Remaining balance: " + currency + " " + remainingBalance);
  console.log("Budget used: " + percentSpent.toFixed(1) + "%");
}
