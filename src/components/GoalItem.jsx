import { useState } from 'react';


function GoalItem({ goal, setGoals }) {
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

    setContribution('');
  }

  return (
    <li className={isComplete ? 'goal-complete' : ''}>
      <div className="goal-header">
        <span className="goal-name">{goal.name}</span>
        <span className="goal-percent">{percent}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
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
        <form className="add-contribution" onSubmit={handleAddContribution}>
          <input
            type="number"
            step="0.01"
            placeholder="Add amount"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}
    </li>
  );
}

export default GoalItem;