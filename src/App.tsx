import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import KnowledgeBase from './components/KnowledgeBase';
import Analytics from './components/Analytics';
import Agents from './components/Agents';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <TicketList />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'analytics':
        return <Analytics />;
      case 'agents':
        return <Agents />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderView()}
      </Layout>
    </AppProvider>
  );
}

export default App;
