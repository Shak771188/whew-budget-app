import { useState } from 'react';
import BankTransferContribution from './BankTransferContribution';
import AutopayContribution from './AutopayContribution';

function GoalItem({ goal, setGoals, schedules, setSchedules, onContribution }) {
  const [contribution, setContribution] = useState('');

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
    </li>
  );
}

export default GoalItem;