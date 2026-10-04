import { useState } from 'react';
import { parseBankCsv } from '../utils/parseBankCsv';
import { sortByDateDesc } from '../utils/sortTransactions';
import ConnectBankAccount from './ConnectBankAccount';
import { mergeImported } from '../utils/mergeImported';

function Transactions({ transactions, setTransactions, onExpenseAdded, setLinkedAccounts }) {
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [note, setNote] = useState('');
  const [importMessage, setImportMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const newEntry = {
      id: Date.now(),
      date,
      category,
      amount: parseFloat(amount),
      type,
      note,
    };

    setTransactions(sortByDateDesc([...transactions, newEntry]));

    if (type === 'expense' && onExpenseAdded) {
      onExpenseAdded(category, parseFloat(amount));
    }

    setDate('');
    setCategory('');
    setAmount('');
    setType('expense');
    setNote('');
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = parseBankCsv(event.target.result);
        if (imported.length === 0) {
          setImportMessage('No transactions found in that file — check the column headers match Date/Description/Amount (or Debit/Credit).');
          return;
        }
        setTransactions((prev) => mergeImported(prev, imported));
        const categorized = imported.filter((t) => t.category !== 'Uncategorized').length;
        setImportMessage(
          `Imported ${imported.length} transaction${imported.length === 1 ? '' : 's'} — ${categorized} sorted into categories automatically${
            categorized < imported.length ? `, ${imported.length - categorized} left as Uncategorized` : ''
          }.`
        );
      } catch (err) {
        console.error('Failed to import CSV:', err);
        setImportMessage('Something went wrong reading that file. Make sure it\'s a CSV exported from your bank.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="transactions-page">
      <h2>Transactions</h2>

      <ConnectBankAccount
        setTransactions={setTransactions}
        setLinkedAccounts={setLinkedAccounts}
      />

      <div className="csv-import">
        <label htmlFor="bank-csv-input">
          <strong>Or import bank transactions (CSV)</strong>
        </label>
        <input
          id="bank-csv-input"
          type="file"
          accept=".csv"
          onChange={handleImport}
        />
        {importMessage && <p className="import-message">{importMessage}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. Groceries, Income)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit">Add Entry</button>
      </form>
      <ul className="transaction-list">
        {sortByDateDesc(transactions).map((t) => (
          <li key={t.id} className={t.type}>
            <span className="entry-date">{t.date}</span>
            <span className="entry-category">
              {t.category}
              {t.imported && t.category === 'Uncategorized' && (
                <span className="uncategorized-flag"> ⚠️</span>
              )}
            </span>
            {t.type !== 'note' && (
              <span className="entry-amount">
                {t.type === 'income' || t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
              </span>
            )}
            {t.note && <span className="entry-note">{t.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;