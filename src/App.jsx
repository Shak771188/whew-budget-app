import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import FinanceJournal from './components/FinanceJournal';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);

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