import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { categorizeTransaction } from '../utils/categorize';
import { sortByDateDesc } from '../utils/sortTransactions';
import { mergeImported } from '../utils/mergeImported';

const API_URL = import.meta.env.VITE_BANK_API_URL;

function ConnectBankAccount({ setTransactions, setLinkedAccounts }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Step 1: ask our backend for a fresh link_token, then let the effect
  // below open Plaid Link as soon as both the token and the hook are ready.
  async function startConnecting() {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_URL}/create-link-token`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start bank connection.');
      setLinkToken(data.link_token);
    } catch (err) {
      console.error('Failed to create link token:', err);
      setStatus('Could not reach the bank-linking service. Try again in a moment.');
      setLoading(false);
    }
  }

  // Step 3: Plaid Link calls this once the user finishes logging into their
  // sandbox bank. publicToken is short-lived, so we trade it in immediately.
  // metadata describes the bank and accounts the user picked.
  const onSuccess = useCallback(
    async (publicToken, metadata) => {
      setStatus('Finishing connection…');
      try {
        const exchangeRes = await fetch(`${API_URL}/exchange-public-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const exchangeData = await exchangeRes.json();
        if (!exchangeRes.ok) {
          throw new Error(exchangeData.error || 'Could not finish linking that account.');
        }

        // Remember which bank was linked (name + last 4 digits), once per bank/account.
        const institution = metadata?.institution?.name || 'Linked bank';
        const mask = metadata?.accounts?.[0]?.mask || '';
        if (setLinkedAccounts) {
          setLinkedAccounts((prev) => {
            const exists = prev.some((a) => a.bankName === institution && a.mask === mask);
            return exists
              ? prev
              : [
                  ...prev,
                  {
                    id: `acct-${Date.now()}`,
                    bankName: institution,
                    mask,
                    connectedAt: new Date().toISOString(),
                  },
                ];
          });
        }

        // Step 4: now that the account is linked, pull its transactions and
        // run them through the same category rules CSV imports use.
        setStatus('Pulling your recent transactions…');
        const txRes = await fetch(`${API_URL}/transactions`);
        const txData = await txRes.json();
        if (!txRes.ok) throw new Error(txData.error || 'Could not fetch transactions.');

        const categorized = txData.transactions.map((t) => ({
          ...t,
          category: t.type === 'income' ? 'Income' : categorizeTransaction(t.description),
          note: t.description,
          imported: true,
        }));

        setTransactions((prev) => mergeImported(prev, categorized));
        const matched = categorized.filter((t) => t.category !== 'Uncategorized').length;
        setStatus(
          `Connected! Imported ${categorized.length} transaction${categorized.length === 1 ? '' : 's'} — ${matched} sorted into categories automatically.`
        );
      } catch (err) {
        console.error('Bank connect flow failed:', err);
        setStatus(err.message || 'Something went wrong finishing the bank connection.');
      } finally {
        setLoading(false);
        setLinkToken(null);
      }
    },
    [setTransactions, setLinkedAccounts]
  );

  const onExit = useCallback((err) => {
    setLoading(false);
    setLinkToken(null);
    if (err) {
      console.error('Plaid Link exited with an error:', err);
      setStatus('Bank connection was cancelled or failed.');
    }
  }, []);

  // react-plaid-link's hook needs the token available before it can open —
  // ready flips true once it's finished initializing with that token.
  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess, onExit });

  // Step 2: as soon as we have a token AND the hook says it's ready,
  // actually pop open the Plaid Link widget.
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <div className="bank-connect">
      <button type="button" onClick={startConnecting} disabled={loading}>
        {loading ? 'Connecting…' : '🏦 Connect Bank Account'}
      </button>
      {status && <p className="bank-connect-status">{status}</p>}
    </div>
  );
}

export default ConnectBankAccount;