// Keyword-based auto-categorization for imported bank transactions.
// Add/edit keywords here as you see how your real bank descriptions look —
// this list doesn't need to be perfect, just a decent starting sort.

export const CATEGORY_RULES = [
  { category: 'Groceries', keywords: ['whole foods', 'kroger', 'trader joe', 'aldi', 'safeway', 'publix', 'grocery', 'walmart grocery', 'sprouts', 'wegmans'] },
  { category: 'Dining', keywords: ['starbucks', 'mcdonald', 'chipotle', 'doordash', 'uber eats', 'grubhub', 'restaurant', 'cafe', 'coffee', 'pizza', 'taco'] },
  { category: 'Transportation', keywords: ['uber', 'lyft', 'shell', 'chevron', 'exxon', 'gas station', 'parking', 'transit', 'dmv', 'auto repair'] },
  { category: 'Housing', keywords: ['rent', 'mortgage', 'property mgmt', 'hoa'] },
  { category: 'Utilities', keywords: ['electric', 'water bill', 'gas bill', 'internet', 'comcast', 'xfinity', 'at&t', 'verizon', 'sewer', 'trash service'] },
  { category: 'Subscriptions', keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'apple.com/bill', 'amazon prime', 'youtube premium', 'audible'] },
  { category: 'Shopping', keywords: ['amazon', 'target', 'zara', 'nike', 'best buy', 'ebay', 'etsy', 'shein'] },
  { category: 'Health', keywords: ['pharmacy', 'cvs', 'walgreens', 'urgent care', 'copay', 'dental', 'vision'] },
  { category: 'Insurance', keywords: ['insurance', 'geico', 'progressive', 'state farm', 'allstate'] },
  { category: 'Fees', keywords: ['overdraft', 'monthly fee', 'service charge', 'atm fee', 'late fee'] },
  { category: 'Income', keywords: ['payroll', 'direct deposit', 'salary', 'deposit from'] },
];

export function categorizeTransaction(description) {
  const text = (description || '').toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }
  return 'Uncategorized';
}
