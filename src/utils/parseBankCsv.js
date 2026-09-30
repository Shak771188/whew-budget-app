import { categorizeTransaction } from './categorize';

// Splits one CSV line into fields, respecting quoted values that may contain commas.
function splitCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Finds the header index matching any of the given candidate names (case-insensitive).
function findColumn(headers, candidates) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const name of candidates) {
    const idx = lower.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

function toIsoDate(raw) {
  if (!raw) return '';
  // Handles MM/DD/YYYY as well as already-ISO YYYY-MM-DD.
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let [, m, d, y] = slashMatch;
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  return raw;
}

/**
 * Parses a bank-exported CSV into WHEW transaction objects, auto-categorized
 * and auto-sorted (newest first). Supports two common export shapes:
 *  - Date, Description, Amount           (negative = expense, positive = income)
 *  - Date, Description, Debit, Credit    (separate columns)
 */
export function parseBankCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const dateIdx = findColumn(headers, ['date', 'transaction date', 'posted date']);
  const descIdx = findColumn(headers, ['description', 'merchant', 'name', 'payee']);
  const amountIdx = findColumn(headers, ['amount']);
  const debitIdx = findColumn(headers, ['debit', 'withdrawal']);
  const creditIdx = findColumn(headers, ['credit', 'deposit']);

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i]);
    if (row.length < 2) continue;

    const description = descIdx !== -1 ? row[descIdx] : '';
    const date = toIsoDate(dateIdx !== -1 ? row[dateIdx] : '');

    let amount = 0;
    let type = 'expense';

    if (amountIdx !== -1) {
      const raw = parseFloat((row[amountIdx] || '0').replace(/[^0-9.-]/g, ''));
      amount = Math.abs(raw);
      type = raw < 0 ? 'expense' : 'income';
    } else if (debitIdx !== -1 || creditIdx !== -1) {
      const debit = parseFloat((row[debitIdx] || '0').replace(/[^0-9.-]/g, '')) || 0;
      const credit = parseFloat((row[creditIdx] || '0').replace(/[^0-9.-]/g, '')) || 0;
      if (credit > 0) {
        amount = credit;
        type = 'income';
      } else {
        amount = debit;
        type = 'expense';
      }
    }

    if (!amount) continue;

    results.push({
      id: Date.now() + i,
      date,
      category: type === 'income' ? 'Income' : categorizeTransaction(description),
      amount,
      type,
      note: description,
      imported: true,
    });
  }

  // Sort newest first so imports slot in chronologically with everything else.
  results.sort((a, b) => (a.date < b.date ? 1 : -1));
  return results;
}
