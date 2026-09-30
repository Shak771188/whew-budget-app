// Shared by manual entry, CSV import, and bank-connect import so every path
// into `transactions` keeps the same newest-first ordering.
export function sortByDateDesc(list) {
  return list.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
