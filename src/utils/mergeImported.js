import { sortByDateDesc } from './sortTransactions';

// Adds newly imported transactions to the existing list, skipping any that
// were already imported (same date, type, amount, and description).
// Counting matches means two real identical purchases on one day are both kept.
export function mergeImported(prev, incoming) {
  const keyOf = (t) =>
    `${t.date}|${t.type}|${Number(t.amount).toFixed(2)}|${(t.note || '').trim().toLowerCase()}`;

  const existing = new Map();
  prev.forEach((t) => {
    if (t.imported) {
      const k = keyOf(t);
      existing.set(k, (existing.get(k) || 0) + 1);
    }
  });

  const seenInBatch = new Map();
  const fresh = incoming.filter((t) => {
    const k = keyOf(t);
    const n = (seenInBatch.get(k) || 0) + 1;
    seenInBatch.set(k, n);
    return n > (existing.get(k) || 0);
  });

  return sortByDateDesc([...prev, ...fresh]);
}