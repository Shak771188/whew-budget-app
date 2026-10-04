import { useState, useEffect } from 'react';
import { Rose3D } from './Rose';
import { C } from '../theme';

const TIPS = [
  "Automate the boring part — a standing transfer the day you get paid beats remembering to \"save what's left.\"",
  "Name your savings account after the goal. \"Vacation Fund\" gets touched way less than \"Savings 2.\"",
  "The 24-hour rule: for any non-essential buy over $50, wait a day. Most urges fade by morning.",
  "Round-up savings add up quietly — small transfers you never miss beat big ones you dread.",
  "Check subscriptions quarterly. The ones you forgot about are the ones costing you most.",
  "Pay yourself first: treat your goal contribution like a bill, not a leftover.",
  "A sinking fund for irregular costs (car repairs, gifts) keeps those from wrecking your budget later.",
  "Track needs vs. wants for one week before changing your whole budget — you can't fix what you haven't seen.",
];

function TipOfDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tip = TIPS[dayOfYear % TIPS.length];
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('whew-tip-reminder') === 'on';
    } catch (e) {
      return false;
    }
  });

  const toggleReminder = async () => {
    if (enabled) {
      setEnabled(false);
      try { localStorage.setItem('whew-tip-reminder', 'off'); } catch (e) {}
      return;
    }
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('WHEW 🌹 Tip of the Day', { body: tip });
        }
      }
    } catch (e) {}
    setEnabled(true);
    try { localStorage.setItem('whew-tip-reminder', 'on'); } catch (e) {}
  };

  return (
    <div className="tip-of-day">
      <div className="tip-of-day-header">
        <span>💡 Tip of the Day</span>
        <button onClick={toggleReminder}>
          {enabled ? '🔔 Reminders On' : '🔕 Remind Me Daily'}
        </button>
      </div>
      <p>{tip}</p>
    </div>
  );
}

function Dashboard({ transactions, goals, setTransactions, monthlyBudget, categoryBudgets, showMotivation }) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = totalIncome - totalExpenses;

  const budgetUsedPercent =
    monthlyBudget > 0 ? Math.min(100, Math.round((totalExpenses / monthlyBudget) * 100)) : 0;

  const remainingBudget = monthlyBudget - totalExpenses;

  const categoryTotals = transactions
    .filter((t) => t.type === 'expense')
    .reduce((totals, t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      return totals;
    }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const spentByCategoryLower = transactions
    .filter((t) => t.type === 'expense')
    .reduce((totals, t) => {
      const key = t.category.trim().toLowerCase();
      totals[key] = (totals[key] || 0) + t.amount;
      return totals;
    }, {});

  const overBudgetCategories = (categoryBudgets || [])
    .map((c) => ({
      ...c,
      spent: spentByCategoryLower[c.label.trim().toLowerCase()] || 0,
    }))
    .filter((c) => c.spent > c.budget);

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
  const [quickNote, setQuickNote] = useState('');

  function handleQuickNote(e) {
    e.preventDefault();
    if (!quickNote.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: 'Note',
      amount: 0,
      type: 'note',
      note: quickNote,
    };

    setTransactions([...transactions, newEntry]);
    setQuickNote('');
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <TipOfDay />

      <div className="monthly-budget-card">
        <div className="monthly-budget-text">
          <div className="monthly-budget-label">Monthly Budget</div>
          <div className="monthly-budget-amount">${Math.max(0, remainingBudget).toFixed(2)}</div>
          <div className="monthly-budget-sub">remaining of ${monthlyBudget.toFixed(2)} budgeted</div>

          <div
            className="budget-bar"
            role="progressbar"
            aria-valuenow={budgetUsedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget usage: ${budgetUsedPercent}%`}
          >
            <div
              className="budget-bar-fill"
              style={{
                width: `${budgetUsedPercent}%`,
                backgroundSize: `${budgetUsedPercent > 0 ? (100 / budgetUsedPercent) * 100 : 100}% 100%`,
              }}
            ></div>
          </div>
          <div className="budget-bar-meta">
            <span>{budgetUsedPercent}% used</span>
            <span>${totalExpenses.toFixed(2)} spent</span>
          </div>

          <button className="motivate-btn" onClick={showMotivation}>
            ✨ Motivate Me
          </button>
        </div>
        <div className="monthly-budget-rose">
          <Rose3D size={120} percent={budgetUsedPercent} />
          <div className="drag-to-spin">DRAG TO SPIN ↻</div>
        </div>
      </div>

      {overBudgetCategories.length > 0 && (
        <div className="over-budget-alert">
          <h3>🚨 Over Budget</h3>
          {overBudgetCategories.map((c) => (
            <div key={c.id} className="over-budget-alert-row">
              <span>{c.label}</span>
              <span>+${(c.spent - c.budget).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

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
      <form className="quick-note" onSubmit={handleQuickNote}>
        <input
          type="text"
          placeholder="Quick note for your Finance Journal..."
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="category-card">
        <h3>Top Categories</h3>
        {topCategories.length === 0 ? (
          <p>No expenses logged yet.</p>
        ) : (
          <div className="category-breakdown">
            {topCategories.map(([category, total], i) => {
              const maxTotal = topCategories[0][1];
              const barPercent = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
              const colors = [C.green, C.blush, C.rose, C.gold, C.accentLight];
              return (
                <div key={category} className="category-row">
                  <div className="category-row-top">
                    <span>{category}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="category-bar">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${barPercent}%`, background: colors[i % colors.length] }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;