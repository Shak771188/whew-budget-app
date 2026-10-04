import { useState } from 'react';

const API_URL = import.meta.env.VITE_BANK_API_URL;

// Recurring "automatically pay this goal on a schedule" control. The full
// list of active schedules is fetched once, in Goals.jsx, and handed down
// through GoalItem - same pattern as goals/setGoals. This component only
// reads its own goal's entry out of that shared list and updates the list
// through setSchedules when it creates or cancels one.
function AutopayContribution({ goal, schedules, setSchedules }) {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const schedule = schedules.find((s) => s.goalId === String(goal.id)) || null;

  async function handleCreate(e) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return;

    setBusy(true);
    setStatus('Setting up autopay…');

    try {
      const res = await fetch(`${API_URL}/autopay-schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: String(goal.id), amount: numericAmount, frequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not set up autopay.');

      setSchedules((prev) => [...prev.filter((s) => s.goalId !== String(goal.id)), data.schedule]);
      setAmount('');
      setStatus('');
    } catch (err) {
      console.error('Autopay setup failed:', err);
      setStatus(err.message || 'Something went wrong setting up autopay.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    setStatus('Cancelling autopay…');

    try {
      const res = await fetch(`${API_URL}/autopay-schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: String(goal.id), active: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not cancel autopay.');

      setSchedules((prev) => prev.filter((s) => s.goalId !== String(goal.id)));
      setStatus('');
    } catch (err) {
      console.error('Autopay cancel failed:', err);
      setStatus(err.message || 'Something went wrong cancelling autopay.');
    } finally {
      setBusy(false);
    }
  }

  if (schedule) {
    return (
      <div className="autopay-contribution autopay-active">
        <p>
          Autopay: ${schedule.amount.toFixed(2)} {schedule.frequency} — next on {schedule.nextRunDate}
        </p>
        <button type="button" onClick={handleCancel} disabled={busy}>
          {busy ? 'Cancelling…' : 'Cancel autopay'}
        </button>
        {status && <p className="autopay-status">{status}</p>}
      </div>
    );
  }

  return (
    <form className="autopay-contribution" onSubmit={handleCreate}>
      <input
        type="number"
        step="0.01"
        placeholder="Autopay amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={busy}
      />
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)} disabled={busy}>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button type="submit" disabled={busy}>
        {busy ? 'Setting up…' : 'Turn on autopay'}
      </button>
      {status && <p className="autopay-status">{status}</p>}
    </form>
  );
}

export default AutopayContribution;