function Dashboard({ transactions, goals }) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = totalIncome - totalExpenses;

  const categoryTotals = transactions
    .filter((t) => t.type === 'expense')
    .reduce((totals, t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      return totals;
    }, {});

  const goalProgress =
    goals.length === 0
      ? 0
      : goals.reduce((sum, g) => sum + g.current / g.target, 0) / goals.length;

  const goalProgressPercent = Math.round(goalProgress * 100);

  function getNextStep() {
    if (goals.length === 0) {
      return 'Head to the Goals tab to set your first financial goal.';
    }
    const almostThere = goals.find((g) => g.current / g.target >= 0.9 && g.current / g.target < 1);
    if (almostThere) {
      return `You're almost there on "${almostThere.name}" — a little more and you'll hit it!`;
    }
    if (totalExpenses > totalIncome) {
      return 'Your expenses are outpacing your income this period — worth a look.';
    }
    return "You're on track. Keep logging your transactions to stay ahead.";
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="totals">
        <div>
          <span>Income</span>
          <strong>${totalIncome.toFixed(2)}</strong>
        </div>
        <div>
          <span>Expenses</span>
          <strong>${totalExpenses.toFixed(2)}</strong>
        </div>
        <div>
          <span>Net</span>
          <strong className={net >= 0 ? 'positive' : 'negative'}>
            ${net.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="goal-progress">
        <h3>Overall Goal Progress</h3>
        <p>{goalProgressPercent}% across all active goals</p>
      </div>

      <div className="next-step">
        <h3>Next Step</h3>
        <p>{getNextStep()}</p>
      </div>

      <h3>Spending by Category</h3>
      {Object.keys(categoryTotals).length === 0 ? (
        <p>No expenses logged yet.</p>
      ) : (
        <ul className="category-breakdown">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <li key={category}>
              <span>{category}</span>
              <span>${total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;