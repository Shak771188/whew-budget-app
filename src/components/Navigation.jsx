function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="navigation">
      <button
        className={activeTab === 'dashboard' ? 'active' : ''}
        onClick={() => setActiveTab('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={activeTab === 'goals' ? 'active' : ''}
        onClick={() => setActiveTab('goals')}
      >
        Goals
      </button>
      <button
        className={activeTab === 'journal' ? 'active' : ''}
        onClick={() => setActiveTab('journal')}
      >
        Finance Journal
      </button>
    </nav>
  );
}

export default Navigation;