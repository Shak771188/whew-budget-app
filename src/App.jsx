import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Transactions from './components/Transactions';
import FinanceJournal from './components/FinanceJournal';
import Account from './components/Account';
import NotifToast from './components/NotifToast';
import { URBAN_WINS, URBAN_LOSSES, getRand } from './utils/motivation';
import './App.css';

const DEFAULT_CATEGORY_BUDGETS = [
  { id: 'groceries', label: 'Groceries', type: 'need', budget: 400 },
  { id: 'housing', label: 'Housing', type: 'need', budget: 1200 },
  { id: 'utilities', label: 'Utilities', type: 'need', budget: 150 },
  { id: 'insurance', label: 'Insurance', type: 'need', budget: 120 },
  { id: 'transportation', label: 'Transportation', type: 'need', budget: 100 },
  { id: 'health', label: 'Health', type: 'need', budget: 50 },
  { id: 'dining', label: 'Dining', type: 'want', budget: 100 },
  { id: 'shopping', label: 'Shopping', type: 'want', budget: 100 },
  { id: 'subscriptions', label: 'Subscriptions', type: 'want', budget: 50 },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load transactions from localStorage:', err);
      return [];
    }
  });
  const [notif, setNotif] = useState(null);

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-goals');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load goals from localStorage:', err);
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-monthly-budget');
      return saved ? JSON.parse(saved) : 0;
    } catch (err) {
      console.error('Failed to load monthly budget from localStorage:', err);
      return 0;
    }
  });

  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-category-budgets');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && parsed.length > 0 ? parsed : DEFAULT_CATEGORY_BUDGETS;
    } catch (err) {
      console.error('Failed to load category budgets from localStorage:', err);
      return DEFAULT_CATEGORY_BUDGETS;
    }
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-journal-entries');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load journal entries from localStorage:', err);
      return [];
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-profile');
      return saved ? JSON.parse(saved) : { name: '', email: '' };
    } catch (err) {
      console.error('Failed to load profile from localStorage:', err);
      return { name: '', email: '' };
    }
  });

  const [linkedAccounts, setLinkedAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-linked-accounts');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load linked accounts from localStorage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('whew-transactions', JSON.stringify(transactions));
    } catch (err) {
      console.error('Failed to save transactions to localStorage:', err);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-goals', JSON.stringify(goals));
    } catch (err) {
      console.error('Failed to save goals to localStorage:', err);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-monthly-budget', JSON.stringify(monthlyBudget));
    } catch (err) {
      console.error('Failed to save monthly budget to localStorage:', err);
    }
  }, [monthlyBudget]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-category-budgets', JSON.stringify(categoryBudgets));
    } catch (err) {
      console.error('Failed to save category budgets to localStorage:', err);
    }
  }, [categoryBudgets]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-journal-entries', JSON.stringify(journalEntries));
    } catch (err) {
      console.error('Failed to save journal entries to localStorage:', err);
    }
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-profile', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save profile to localStorage:', err);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('whew-linked-accounts', JSON.stringify(linkedAccounts));
    } catch (err) {
      console.error('Failed to save linked accounts to localStorage:', err);
    }
  }, [linkedAccounts]);

  function showMotivation() {
    setNotif({ msg: getRand(URBAN_WINS), type: 'positive' });
  }

  function showWarning(msg) {
    setNotif({ msg, type: 'negative' });
  }

  useEffect(() => {
    showMotivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContribution(goal, amount) {
    if (!goal.timeframe) {
      showMotivation();
      return;
    }

    const today = new Date();
    const target = new Date(goal.timeframe);
    const daysRemaining = Math.ceil((target - today) / 86400000);
    const remainingAfter = goal.target - (goal.current + amount);

    if (remainingAfter <= 0) {
      showMotivation();
      return;
    }

    if (daysRemaining <= 0) {
      showWarning(
        `"${goal.name}"'s target date has already passed and it's not fully funded yet — might be time to adjust the date.`
      );
      return;
    }

    const neededPerWeek = (remainingAfter / daysRemaining) * 7;

    if (amount < neededPerWeek * 0.5) {
      showWarning(
        `That's below pace for "${goal.name}" — about $${neededPerWeek.toFixed(2)}/week is needed to hit it by ${goal.timeframe}.`
      );
    } else {
      showMotivation();
    }
  }

  function handleExpenseAdded(category, amount) {
    const budgetEntry = categoryBudgets.find(
      (c) => c.label.trim().toLowerCase() === category.trim().toLowerCase()
    );

    if (!budgetEntry) return;

    const priorSpent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category.trim().toLowerCase() === category.trim().toLowerCase()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const newTotal = priorSpent + amount;

    if (newTotal > budgetEntry.budget) {
      showWarning(
        `You're over budget in ${budgetEntry.label} by $${(newTotal - budgetEntry.budget).toFixed(2)}.`
      );
    }
  }

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'dashboard' && (
        <Dashboard
          transactions={transactions}
          goals={goals}
          setTransactions={setTransactions}
          monthlyBudget={monthlyBudget}
          categoryBudgets={categoryBudgets}
          showMotivation={showMotivation}
        />
      )}

      {activeTab === 'budget' && (
        <Budget
          transactions={transactions}
          setTransactions={setTransactions}
          categoryBudgets={categoryBudgets}
          setCategoryBudgets={setCategoryBudgets}
          monthlyBudget={monthlyBudget}
          setMonthlyBudget={setMonthlyBudget}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {activeTab === 'goals' && (
        <Goals
          goals={goals}
          setGoals={setGoals}
          onContribution={handleContribution}
          transactions={transactions}
          setTransactions={setTransactions}
        />
      )}

      {activeTab === 'transactions' && (
        <Transactions
          transactions={transactions}
          setTransactions={setTransactions}
          onExpenseAdded={handleExpenseAdded}
          setLinkedAccounts={setLinkedAccounts}
        />
      )}

      {activeTab === 'journal' && (
        <FinanceJournal
          transactions={transactions}
          journalEntries={journalEntries}
          setJournalEntries={setJournalEntries}
        />
      )}

      {activeTab === 'account' && (
        <Account
          transactions={transactions}
          setTransactions={setTransactions}
          goals={goals}
          setGoals={setGoals}
          monthlyBudget={monthlyBudget}
          setMonthlyBudget={setMonthlyBudget}
          categoryBudgets={categoryBudgets}
          setCategoryBudgets={setCategoryBudgets}
          journalEntries={journalEntries}
          setJournalEntries={setJournalEntries}
          profile={profile}
          setProfile={setProfile}
          defaultCategoryBudgets={DEFAULT_CATEGORY_BUDGETS}
          linkedAccounts={linkedAccounts}
          setLinkedAccounts={setLinkedAccounts}
        />
      )}

      {notif && <NotifToast msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
    </div>
  );
}

export default App;