import { useState } from 'react';

function FinanceJournal({ transactions, journalEntries, setJournalEntries }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [entryDate, setEntryDate] = useState(todayStr);
  const [entryText, setEntryText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const recentTransactions = [...transactions]
    .filter((t) => t.type !== 'note')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  function toggleTransaction(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!entryText.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: entryDate,
      text: entryText,
      transactionIds: selectedIds,
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setEntryDate(todayStr);
    setEntryText('');
    setSelectedIds([]);
    setShowPicker(false);
  }

  function handleDeleteEntry(id) {
    setJournalEntries(journalEntries.filter((e) => e.id !== id));
  }

  function getTransaction(id) {
    return transactions.find((t) => t.id === id);
  }

  return (
    <div className="finance-journal">
      <h2>Finance Journal</h2>
      <p className="journal-subtitle">
        A space to reflect on your money habits — what's working, what's tempting, what you noticed about yourself this week.
      </p>

      <form className="journal-entry-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          required
        />
        <textarea
          placeholder="What's on your mind about your money today?"
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          rows={5}
          required
        />

        <button
          type="button"
          className="toggle-picker-btn"
          onClick={() => setShowPicker(!showPicker)}
        >
          {showPicker ? 'Hide transactions' : '+ Attach a transaction (optional)'}
        </button>

        {showPicker && (
          <div className="transaction-picker">
            {recentTransactions.length === 0 ? (
              <p className="no-transactions">No transactions logged yet.</p>
            ) : (
              recentTransactions.map((t) => (
                <label key={t.id} className="transaction-picker-row">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => toggleTransaction(t.id)}
                  />
                  <span>{t.date}</span>
                  <span>{t.category}</span>
                  <span>{t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</span>
                </label>
              ))
            )}
          </div>
        )}

        <button type="submit">Save Entry</button>
      </form>

      <div className="journal-entries">
        {journalEntries.length === 0 ? (
          <p>No journal entries yet — write your first reflection above.</p>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.id} className="journal-entry-card">
              <div className="journal-entry-header">
                <span className="journal-entry-date">{entry.date}</span>
                <button className="delete-entry-btn" onClick={() => handleDeleteEntry(entry.id)}>
                  Delete
                </button>
              </div>
              <p className="journal-entry-text">{entry.text}</p>
              {entry.transactionIds && entry.transactionIds.length > 0 && (
                <div className="journal-entry-transactions">
                  {entry.transactionIds.map((id) => {
                    const t = getTransaction(id);
                    if (!t) return null;
                    return (
                      <span key={id} className="journal-transaction-chip">
                        {t.category} · {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FinanceJournal;