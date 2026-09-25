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