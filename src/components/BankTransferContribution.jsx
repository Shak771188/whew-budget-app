import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_BANK_API_URL;

// One-time "pay this goal from my linked bank account" flow, built against
// the simulated Plaid Transfer backend in whew-bank-connect (see
// terraform/transfer.tf there). Mirrors Plaid's real authorize -> create ->
// webhook-settles lifecycle. Since live Transfer access needs business
// entity (KYB) verification this project doesn't have yet, the webhook
// calls below are triggered by this component itself on a short delay
// instead of by Plaid's servers -- everything downstream of that point is
// the same handler code Plaid would actually be driving in production.
function BankTransferContribution({ goal, setGoals }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const appliedRef = useRef(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return;

    setBusy(true);
    setStatus('Authorizing transfer…');
    appliedRef.current = false;

    try {
      const authRes = await fetch(`${API_URL}/create-transfer-authorization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount, goalId: String(goal.id) }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Could not authorize this transfer.');
      if (authData.decision !== 'approved') {
        setStatus('This transfer was declined — try a smaller amount.');
        setBusy(false);
        return;
      }

      const clientTransferId = crypto.randomUUID();
      const createRes = await fetch(`${API_URL}/create-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization_id: authData.authorization_id,
          amount: numericAmount,
          goalId: String(goal.id),
          goalName: goal.name,
          clientTransferId,
        }),
      });
      const transfer = await createRes.json();
      if (!createRes.ok) throw new Error(transfer.error || 'Could not create this transfer.');

      setStatus(`Pending — $${numericAmount.toFixed(2)} on its way from your bank.`);
      setAmount('');

      // Simulated settlement: stands in for the real Plaid webhook calls,
      // which would arrive on their own timeline once live Transfer access
      // is in place. The handler being called here (transferWebhook.js) is
      // the real one -- only the trigger is simulated.
      setTimeout(async () => {
        try {
          await fetch(`${API_URL}/transfer-webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transfer_id: transfer.transferId, status: 'posted' }),
          });
          setStatus('Posted — settling shortly.');
        } catch (err) {
          console.error('Simulated "posted" webhook call failed:', err);
        }
      }, 4000);

      setTimeout(async () => {
        try {
          await fetch(`${API_URL}/transfer-webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transfer_id: transfer.transferId, status: 'settled' }),
          });

          // Only now -- once the transfer has actually settled, not the
          // moment it was requested -- does the goal's contributed amount
          // update. A real transfer can still fail or get returned before
          // this point, so the UI never assumes success early.
          if (!appliedRef.current) {
            appliedRef.current = true;
            setGoals((prevGoals) =>
              prevGoals.map((g) =>
                g.id === goal.id ? { ...g, current: g.current + numericAmount } : g
              )
            );
          }
          setStatus(`Settled — $${numericAmount.toFixed(2)} added to ${goal.name}.`);
        } catch (err) {
          console.error('Simulated "settled" webhook call failed:', err);
          setStatus('Something went wrong confirming this transfer.');
        } finally {
          setBusy(false);
        }
      }, 9000);
    } catch (err) {
      console.error('Bank transfer failed:', err);
      setStatus(err.message || 'Something went wrong with this transfer.');
      setBusy(false);
    }
  }

  return (
    <form className="bank-transfer-contribution" onSubmit={handleSubmit}>
      <input
        type="number"
        step="0.01"
        placeholder="Pay from bank account"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={busy}
      />
      <button type="submit" disabled={busy}>
        {busy ? 'Processing…' : 'Pay'}
      </button>
      {status && <p className="bank-transfer-status">{status}</p>}
    </form>
  );
}

export default BankTransferContribution;
