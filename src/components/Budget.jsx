import { useState } from 'react';

const TYPE_LABELS = { need: '🔴 Needs', want: '💛 Wants', save: '💚 Save' };

const CATEGORY_ICONS = {
  groceries: '🛒',
  housing: '🏠',
  utilities: '⚡',
  insurance: '🛡️',
  transportation: '🚗',
  health: '❤️',
  dining: '🍽️',
  shopping: '🛍️',
  subscriptions: '📱',
  emergency: '🛡️',
  vacation: '✈️',
};

const TYPE_FALLBACK_ICON = { need: '🔴', want: '💛', save: '💚' };

function getIcon(category) {
  return CATEGORY_ICONS[category.label.trim().toLowerCase()] || TYPE_FALLBACK_ICON[category.type];
}

function Budget({ transactions, setTransactions, categoryBudgets, setCategoryBudgets, monthlyBudget, setMonthlyBudget, onExpenseAdded })  {
  const [newCat, setNewCat] = useState({ label: '', type: 'need', budget: '' });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [subtractId, setSubtractId] = useState(null);
  const [subtractAmount, setSubtractAmount] = useState('');

  const spentByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((totals, t) => {
      const key = t.category.trim().toLowerCase();
      totals[key] = (totals[key] || 0) + t.amount;
      return totals;
    }, {});

  function getSpent(label) {
    return spentByCategory[label.trim().toLowerCase()] || 0;
  }

  function todayString() {
    return new Date().toISOString().split('T')[0];
  }

  // Quick-adds are tagged with quick: true so "Undo" only ever removes those,
  // never a bank import or a transaction typed in by hand.
  function quickSpendsFor(category) {
    const key = category.label.trim().toLowerCase();
    return transactions.filter(
      (t) => t.quick && t.type === 'expense' && t.category.trim().toLowerCase() === key
    );
  }

  function logQuickSpend(category, amount) {
    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        date: todayString(),
        category: category.label,
        amount,
        type: 'expense',
        quick: true,
      },
    ]);

    if (onExpenseAdded) onExpenseAdded(category.label, amount);
  }

  function undoLastQuickSpend(category) {
    const quickOnes = quickSpendsFor(category);
    if (quickOnes.length === 0) return;
    const last = quickOnes.reduce((a, b) => (b.id > a.id ? b : a));
    setTransactions(transactions.filter((t) => t.id !== last.id));
  }

  function startSubtracting(c) {
    setSubtractId(c.id);
    setSubtractAmount('');
  }

  // Subtracting adds a negative expense (a refund/correction). Every total in the
  // app already sums expenses, so spent and remaining update with no extra code.
  function saveSubtract(category) {
    const entered = parseFloat(subtractAmount);
    if (!entered || entered <= 0) return;
    const amount = Math.min(entered, getSpent(category.label));
    if (amount > 0) {
      setTransactions([
        ...transactions,
        {
          id: Date.now(),
          date: todayString(),
          category: category.label,
          amount: -amount,
          type: 'expense',
          note: 'Budget adjustment',
        },
      ]);
    }
    setSubtractId(null);
    setSubtractAmount('');
  }

  function handleAddCategory(e) {
    e.preventDefault();
    if (!newCat.label || !newCat.budget) return;
    setCategoryBudgets([
      ...categoryBudgets,
      { id: Date.now().toString(), label: newCat.label, type: newCat.type, budget: Number(newCat.budget) },
    ]);
    setNewCat({ label: '', type: 'need', budget: '' });
  }

  function handleRemoveCategory(id) {
    setCategoryBudgets(categoryBudgets.filter((c) => c.id !== id));
  }

  function startEditingCategory(c) {
    setEditingId(c.id);
    setEditAmount(c.budget);
  }

  function saveEditingCategory(id) {
    setCategoryBudgets(
      categoryBudgets.map((c) => (c.id === id ? { ...c, budget: Number(editAmount) || 0 } : c))
    );
    setEditingId(null);
  }

  function handleSaveMonthlyBudget(e) {
    e.preventDefault();
    setMonthlyBudget(Number(budgetInput) || 0);
    setEditingBudget(false);
  }

  const totalBudgeted = categoryBudgets.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categoryBudgets.reduce((sum, c) => sum + getSpent(c.label), 0);

  return (
    <div className="budget-page">
      <h2>Budget</h2>

      <div className="monthly-target-card">
        <h3>Monthly Budget Target</h3>
        {editingBudget ? (
          <form onSubmit={handleSaveMonthlyBudget} className="monthly-target-form">
            <input
              type="number"
              step="0.01"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Monthly budget amount"
              autoFocus
            />
            <button type="submit">Save</button>
          </form>
        ) : (
          <div className="monthly-target-display">
            <span>${monthlyBudget.toFixed(2)}</span>
            <button onClick={() => { setBudgetInput(monthlyBudget); setEditingBudget(true); }}>
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="budget-summary">
        <div>
          <span>Total Budgeted</span>
          <strong>${totalBudgeted.toFixed(2)}</strong>
        </div>
        <div>
          <span>Total Spent</span>
          <strong className={totalSpent > totalBudgeted ? 'negative' : 'positive'}>
            ${totalSpent.toFixed(2)}
          </strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong className={totalBudgeted - totalSpent < 0 ? 'negative' : 'positive'}>
            ${(totalBudgeted - totalSpent).toFixed(2)}
          </strong>
        </div>
      </div>

      {['need', 'want', 'save'].map((type) => {
        const group = categoryBudgets.filter((c) => c.type === type);
        if (group.length === 0) return null;
        const groupSpent = group.reduce((sum, c) => sum + getSpent(c.label), 0);
        const groupBudget = group.reduce((sum, c) => sum + c.budget, 0);
        return (
          <div key={type} className="budget-group">
            <div className="budget-group-header">
              <h3>{TYPE_LABELS[type]}</h3>
              <span>${groupSpent.toFixed(2)}/${groupBudget.toFixed(2)}</span>
            </div>
            <div className="budget-group-list">
              {group.map((c) => {
                const spent = getSpent(c.label);
                const over = spent > c.budget;
                const percent = c.budget > 0 ? Math.min(100, Math.round((spent / c.budget) * 100)) : 0;
                const hasQuick = quickSpendsFor(c).length > 0;
                return (
                  <div key={c.id} className={`budget-category-row ${over ? 'over-budget' : ''}`}>
                    <div className="budget-category-top">
                      <span>{getIcon(c)} {c.label}</span>
                      <span>
                        ${spent.toFixed(2)}/${c.budget.toFixed(2)}
                        {over && ' 🚨'}
                      </span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill gradient"
                        style={{
                          width: `${percent}%`,
                          backgroundSize: `${percent > 0 ? (100 / percent) * 100 : 100}% 100%`,
                        }}
                      ></div>
                    </div>
                    <div className="budget-category-actions">
                      {[10, 25, 50, 100].map((amt) => (
                        <button key={amt} onClick={() => logQuickSpend(c, amt)} className="quick-spend-btn">
                          +${amt}.00
                        </button>
                      ))}
                      {editingId === c.id ? (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => saveEditingCategory(c.id)}>Save</button>
                        </>
                      ) : subtractId === c.id ? (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={subtractAmount}
                            onChange={(e) => setSubtractAmount(e.target.value)}
                            placeholder="Amount to subtract"
                            autoFocus
                          />
                          <button onClick={() => saveSubtract(c)}>Apply</button>
                          <button onClick={() => setSubtractId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            className="quick-spend-btn"
                            onClick={() => undoLastQuickSpend(c)}
                            disabled={!hasQuick}
                            title="Undo the last quick-add"
                          >
                            ↩ Undo
                          </button>
                          <button
                            className="quick-spend-btn"
                            onClick={() => startSubtracting(c)}
                            disabled={spent <= 0}
                            title="Subtract a refund or correction"
                          >
                            − Subtract
                          </button>
                          <button onClick={() => startEditingCategory(c)}>Edit</button>
                          <button className="remove-category-btn" onClick={() => handleRemoveCategory(c.id)}>
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <form className="add-category-form" onSubmit={handleAddCategory}>
        <input
          value={newCat.label}
          onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
          placeholder="Category name"
        />
        <select value={newCat.type} onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}>
          <option value="need">Need</option>
          <option value="want">Want</option>
          <option value="save">Save</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={newCat.budget}
          onChange={(e) => setNewCat({ ...newCat, budget: e.target.value })}
          placeholder="Budget amount"
        />
        <button type="submit">+ Add Category</button>
      </form>
    </div>
  );
}

export default Budget;