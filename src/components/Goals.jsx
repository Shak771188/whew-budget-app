import { useState, useEffect } from 'react';
import GoalItem from './GoalItem';

const API_URL = import.meta.env.VITE_BANK_API_URL;

function Goals({ goals, setGoals, onContribution }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [unlocks, setUnlocks] = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchedules() {
      try {
        const res = await fetch(`${API_URL}/autopay-schedules`);
        const data = await res.json();
        if (!cancelled) setSchedules(data.schedules);
      } catch (err) {
        console.error('Could not load autopay schedules:', err);
      }
    }

    fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <label htmlFor="goal-name" className="sr-only">Goal name</label>
        <input
          id="goal-name"
          type="text"
          placeholder="Goal name (e.g. Emergency Fund)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="goal-target" className="sr-only">Target amount</label>
        <input
          id="goal-target"
          type="number"
          step="0.01"
          placeholder="Target amount"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />

        <label htmlFor="goal-timeframe" className="sr-only">Target date</label>
        <input
          id="goal-timeframe"
          type="date"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        />

        <label htmlFor="goal-unlocks" className="sr-only">Unlocks (optional)</label>
        <input
          id="goal-unlocks"
          type="text"
          placeholder="Unlocks (e.g. Investment Portfolio Tools)"
          value={unlocks}
          onChange={(e) => setUnlocks(e.target.value)}
        />

        <button type="submit">Add Goal</button>
      </form>

      <ul className="goal-list">
        {goals.map((g) => (
          <GoalItem
            key={g.id}
            goal={g}
            setGoals={setGoals}
            schedules={schedules}
            setSchedules={setSchedules}
            onContribution={onContribution}
          />
        ))}
      </ul>
    </div>
  );
}

export default Goals;