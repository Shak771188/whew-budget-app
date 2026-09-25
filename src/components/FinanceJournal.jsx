import { useState } from 'react';

function FinanceJournal({ transactions, setTransactions }) {
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [note, setNote] = useState('');

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

    setTransactions([...transactions, newEntry]);

    setDate('');
    setCategory('');
    setAmount('');
    setType('expense');
    setNote('');
  }

  return (
    <div className="finance-journal">
      <h2>Finance Journal</h2>

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
          {transactions
            .slice()
            .reverse()
            .map((t) => (
              <li key={t.id} className={t.type}>
                <span className="entry-date">{t.date}</span>
                <span className="entry-category">{t.category}</span>
                {t.type !== 'note' && (
                  <span className="entry-amount">
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                )}
                {t.note && <span className="entry-note">{t.note}</span>}
              </li>
            ))}
        </ul>
    </div>
  );
}

export default FinanceJournal;