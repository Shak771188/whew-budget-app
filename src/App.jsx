import { useState, useEffect } from 'react';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import FinanceJournal from './components/FinanceJournal';
import './App.css';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('whew-goals');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load goals from localStorage:', err);
      return [];
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('whew-goals', JSON.stringify(goals));
    } catch (err) {
      console.error('Failed to save goals to localStorage:', err);
    }
  }, [goals]);

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' && (
        <Dashboard transactions={transactions} goals={goals} setTransactions={setTransactions} />
      )}
      {activeTab === 'goals' && (
        <Goals goals={goals} setGoals={setGoals} />
      )}
      {activeTab === 'journal' && (
        <FinanceJournal
          transactions={transactions}
          setTransactions={setTransactions}
        />
      )}
    </div>
  );
}

export default App;