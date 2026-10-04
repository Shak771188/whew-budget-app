import { useState } from 'react';
import { checkEmailAvailable, normalizeEmail } from '../utils/profileApi';

function Account({
  transactions,
  setTransactions,
  goals,
  setGoals,
  monthlyBudget,
  setMonthlyBudget,
  categoryBudgets,
  setCategoryBudgets,
  journalEntries,
  setJournalEntries,
  profile,
  setProfile,
  defaultCategoryBudgets,
}) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [checking, setChecking] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaved(false);

    if (!name.trim() || !email.trim()) {
      setSaveError('Please enter both your name and email before saving.');
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Only ask the server if the email changed from what's already saved.
    if (normalizedEmail !== (profile?.email || '').toLowerCase()) {
      setChecking(true);
      try {
        const available = await checkEmailAvailable(normalizedEmail);
        if (!available) {
          setSaveError('That email is already in use. Please use a different one.');
          return;
        }
      } catch {
        setSaveError("We couldn't verify that email right now. Please try again.");
        return;
      } finally {
        setChecking(false);
      }
    }

    setSaveError('');
    setProfile({ name: name.trim(), email: normalizedEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleResetCategories() {
    setCategoryBudgets(defaultCategoryBudgets);
  }

  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile,
      transactions,
      goals,
      monthlyBudget,
      categoryBudgets,
      journalEntries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'whew-budget-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleResetAll() {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    setTransactions([]);
    setGoals([]);
    setMonthlyBudget(0);
    setCategoryBudgets(defaultCategoryBudgets);
    setJournalEntries([]);
    setProfile({ name: '', email: '' });
    setName('');
    setEmail('');
    setSaveError('');
    setResetConfirm(false);
  }

  return (
    <div className="account-page">
      <h2>Account</h2>

      <section className="account-card">
        <h3>Profile</h3>
        <form className="profile-form" onSubmit={handleSaveProfile} noValidate>
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Please provide your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={checking}>
            {checking ? 'Checking…' : 'Save'}
          </button>
        </form>
        {saved && <p className="account-saved-msg">Profile saved.</p>}
        {saveError && <p className="account-error-msg">{saveError}</p>}
      </section>

      <section className="account-card">
        <h3>App Settings</h3>
        <div className="account-setting-row">
          <div>
            <strong>Default category budgets</strong>
            <p>Reset your Budget tab categories back to the starter defaults.</p>
          </div>
          <button type="button" className="account-reset-btn" onClick={handleResetCategories}>
            Reset
          </button>
        </div>
      </section>

      <section className="account-card">
        <h3>Linked Accounts</h3>
        <p>
          Bank connections made from the Transactions tab will appear here. Full
          linked-account management coming soon.
        </p>
      </section>

      <section className="account-card account-danger-card">
        <h3>Data Management</h3>
        <div className="account-setting-row">
          <div>
            <strong>Export your data</strong>
            <p>
              Download everything — transactions, goals, budgets, and journal
              entries — as a JSON file.
            </p>
          </div>
          <button type="button" className="account-reset-btn" onClick={handleExport}>
            Export
          </button>
        </div>
        <div className="account-setting-row">
          <div>
            <strong>Reset all data</strong>
            <p>
              Permanently clears transactions, goals, budgets, and journal
              entries. This can't be undone.
            </p>
          </div>
          <button
            type="button"
            className="account-reset-btn account-reset-danger"
            onClick={handleResetAll}
          >
            {resetConfirm ? 'Click again to confirm' : 'Reset All Data'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Account;