import { useState } from 'react';
import BankTransferContribution from './BankTransferContribution';
import AutopayContribution from './AutopayContribution';

function GoalItem({ goal, setGoals, schedules, setSchedules, onContribution, transactions, setTransactions }) {
  const [contribution, setContribution] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [useForPurchase, setUseForPurchase] = useState(false);
  const [withdrawCategory, setWithdrawCategory] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const isComplete = percent >= 100;

  function handleAddContribution(e) {
    e.preventDefault();
    const amount = parseFloat(contribution);
    if (!amount || amount <= 0) return;

    setGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goal.id ? { ...g, current: g.current + amount } : g
      )
    );

    if (onContribution) onContribution(goal, amount);

    setContribution('');
  }

  // Simulated for now — mirrors the two-step authorize/create pattern the
  // real whew-bank-connect Plaid Transfer backend uses, so this can be
  // swapped for an actual API call later without changing the surrounding UI.
  function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;

    if (amount > goal.current) {
      setWithdrawMessage("Can't withdraw more than what's saved toward this goal.");
      return;
    }

    setGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goal.id ? { ...g, current: g.current - amount } : g
      )
    );

    const newTxn = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: useForPurchase ? (withdrawCategory || 'Uncategorized') : 'Goal Withdrawal',
      amount,
      type: useForPurchase ? 'expense' : 'withdrawal',
      note: useForPurchase
        ? `Paid from "${goal.name}" goal funds`
        : `Withdrawn from "${goal.name}"`,
      fromGoal: goal.id,
    };

    setTransactions((prev) => [...prev, newTxn]);

    setWithdrawMessage(
      useForPurchase
        ? `$${amount.toFixed(2)} withdrawn and logged as a ${withdrawCategory || 'Uncategorized'} expense.`
        : `$${amount.toFixed(2)} withdrawn from "${goal.name}".`
    );
    setWithdrawAmount('');
    setWithdrawCategory('');
    setUseForPurchase(false);
  }

  return (
    <li className={isComplete ? 'goal-complete' : ''}>
      <div className="goal-header">
        <h3 className="goal-name">{goal.name}</h3>
        <span className="goal-percent">{percent}%</span>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.name} progress: ${percent}%`}
      >
        <div
          className="progress-fill"
          style={{
            width: `${percent}%`,
            backgroundSize: `${percent > 0 ? (100 / percent) * 100 : 100}% 100%`,
          }}
        ></div>
      </div>

      <div className="goal-details">
        <span>
          ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
        </span>
        {goal.timeframe && <span>Target date: {goal.timeframe}</span>}
      </div>

      {goal.unlocks && (
        <div className="goal-unlock">
          {isComplete ? `Unlocked: ${goal.unlocks}` : `Unlocks at 100%: ${goal.unlocks}`}
        </div>
      )}

      {!isComplete && (
        <>
          <BankTransferContribution goal={goal} setGoals={setGoals} />
          <AutopayContribution goal={goal} schedules={schedules} setSchedules={setSchedules} />

          <form className="add-contribution" onSubmit={handleAddContribution}>
            <label htmlFor={`contribution-${goal.id}`} className="sr-only">
              Add contribution to {goal.name}
            </label>
            <input
              id={`contribution-${goal.id}`}
              type="number"
              step="0.01"
              placeholder="Or add manually"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}

      {goal.current > 0 && (
        <div className="withdraw-section">
          <div className="withdraw-available">
            ${goal.current.toFixed(2)} available to withdraw
          </div>
          <form className="withdraw-form" onSubmit={handleWithdraw}>
            <input
              type="number"
              step="0.01"
              max={goal.current}
              placeholder="Withdraw amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <label className="withdraw-checkbox-label">
              <input
                type="checkbox"
                checked={useForPurchase}
                onChange={(e) => setUseForPurchase(e.target.checked)}
              />
              Use for a purchase
            </label>
            {useForPurchase && (
              <input
                type="text"
                placeholder="Category (e.g. Shopping)"
                value={withdrawCategory}
                onChange={(e) => setWithdrawCategory(e.target.value)}
              />
            )}
            <button type="submit">Withdraw</button>
          </form>
          {withdrawMessage && <p className="withdraw-message">{withdrawMessage}</p>}
        </div>
      )}
    </li>
  );
}

export default GoalItem;