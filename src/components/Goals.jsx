import { useState } from 'react';
import GoalItem from './GoalItem';

function Goals({ goals, setGoals }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [unlocks, setUnlocks] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const newGoal = {
      id: Date.now(),
      name,
      target: parseFloat(target),
      current: 0,
      timeframe,
      unlocks,
    };

    setGoals([...goals, newGoal]);

    setName('');
    setTarget('');
    setTimeframe('');
    setUnlocks('');
  }

  return (
    <div className="goals">
      <h2>Goals</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Goal name (e.g. Emergency Fund)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Target amount"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
        <input
          type="date"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unlocks (e.g. Investment Portfolio Tools)"
          value={unlocks}
          onChange={(e) => setUnlocks(e.target.value)}
        />
        <button type="submit">Add Goal</button>
      </form>
      <ul className="goal-list">
        {goals.map((g) => (
          <GoalItem key={g.id} goal={g} setGoals={setGoals} />
        ))}
      </ul>
    </div>
  );
}

export default Goals;