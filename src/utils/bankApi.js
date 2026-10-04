// Simulated bank layer. It follows the same two-step shape as a real Plaid flow
// (create a link token, then exchange it and fetch data), so the real
// whew-bank-connect API calls can replace these functions later.

// Fictional banks on purpose: no real brand names or logos.
export const MOCK_BANKS = [
    { id: 'sunrise', name: 'Sunrise Credit Union', icon: '🌅' },
    { id: 'harbor', name: 'Harbor National Bank', icon: '⚓' },
    { id: 'maple', name: 'Maple Street Bank', icon: '🍁' },
  ];
  
  // Keyword -> budget category. Category names match the Budget tab.
  const CATEGORY_KEYWORDS = {
    Groceries: ['market', 'grocery', 'foods'],
    Dining: ['cafe', 'coffee', 'pizza', 'grill', 'taco'],
    Utilities: ['electric', 'water', 'internet'],
    Transportation: ['fuel', 'gas station', 'transit', 'parking'],
    Subscriptions: ['stream', 'music', 'subscription'],
    Shopping: ['mart', 'outlet', 'online store'],
    Health: ['pharmacy', 'clinic', 'dental'],
    Insurance: ['insurance'],
    Housing: ['rent', 'mortgage'],
  };
  
  export function categorizeTransaction(description) {
    const text = description.toLowerCase();
    for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
      if (words.some((w) => text.includes(w))) return category;
    }
    return 'Uncategorized';
  }
  
  const SAMPLE_TEMPLATES = [
    { description: 'Payroll Deposit', amount: 1850, type: 'income', daysAgo: 28 },
    { description: 'Corner Market', amount: 62.4, type: 'expense', daysAgo: 26 },
    { description: 'Sunny Side Cafe', amount: 14.75, type: 'expense', daysAgo: 24 },
    { description: 'City Electric', amount: 88.1, type: 'expense', daysAgo: 21 },
    { description: 'Fuel Stop Gas Station', amount: 41.2, type: 'expense', daysAgo: 18 },
    { description: 'StreamBox Subscription', amount: 15.99, type: 'expense', daysAgo: 15 },
    { description: 'Greenfield Pharmacy', amount: 23.5, type: 'expense', daysAgo: 12 },
    { description: 'Value Mart', amount: 54.3, type: 'expense', daysAgo: 8 },
    { description: 'Taco Corner', amount: 18.2, type: 'expense', daysAgo: 5 },
    { description: 'Payroll Deposit', amount: 1850, type: 'income', daysAgo: 2 },
  ];
  
  function dateDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }
  
  function buildSampleTransactions(accountId) {
    return SAMPLE_TEMPLATES.map((t, i) => ({
      id: `${accountId}-${i}`,
      type: t.type,
      amount: t.amount,
      note: t.description,
      category: t.type === 'income' ? 'Income' : categorizeTransaction(t.description),
      date: dateDaysAgo(t.daysAgo),
      imported: true,
    }));
  }
  
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
  // Step A: ask the "server" for a short-lived link token.
  // REAL VERSION: call your Lambda endpoint that creates a Plaid link token.
  export async function createLinkToken(bankId) {
    await wait(500);
    return { linkToken: `sim-link-${bankId}-${Date.now()}` };
  }
  
  // Step B: exchange the token, then fetch the account and its transactions.
  // REAL VERSION: call your Lambda endpoint that exchanges the public token.
  export async function connectBank(bankId, linkToken) {
    await wait(900);
    const bank = MOCK_BANKS.find((b) => b.id === bankId);
    if (!bank || !linkToken) throw new Error('Unable to connect to bank');
  
    const account = {
      id: `acct-${bankId}-${Date.now()}`,
      bankId,
      bankName: bank.name,
      icon: bank.icon,
      mask: String(Math.floor(1000 + Math.random() * 9000)),
      connectedAt: new Date().toISOString(),
    };
  
    return { account, transactions: buildSampleTransactions(account.id) };
  }