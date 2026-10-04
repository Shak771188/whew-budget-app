import { useState } from 'react';
import { MiniRose } from './Rose';

function Navigation({ activeTab, setActiveTab }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <nav className="navigation">
      <div className="nav-top-row">
        <div className="nav-brand">
          <MiniRose size={32} />
          <span className="brand-name">WHEW</span>
        </div>

        <div className="help-wrap">
          <button className="help-btn" onClick={() => setShowHelp(!showHelp)} aria-label="Help and support">
            ?
          </button>
          {showHelp && (
            <div className="help-dropdown">
              <h4>Help & Support</h4>
              <p>Have a question or run into an issue?</p>
              <p className="help-contact">📧 support@whewbudget.com</p>
              <p className="help-placeholder">FAQs and more support options coming soon.</p>
            </div>
          )}
        </div>
      </div>

      <div className="nav-tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'budget' ? 'active' : ''} onClick={() => setActiveTab('budget')}>Budget</button>
        <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}>Goals</button>
        <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>Transactions</button>
        <button className={activeTab === 'journal' ? 'active' : ''} onClick={() => setActiveTab('journal')}>Finance Journal</button>
      </div>
    </nav>
  );
}

export default Navigation;