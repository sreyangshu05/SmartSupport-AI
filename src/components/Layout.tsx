import { ReactNode } from 'react';
import { LayoutDashboard, Ticket, BookOpen, BarChart3, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentAgent, agents, setCurrentAgent } = useApp();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', name: 'Tickets', icon: Ticket },
    { id: 'knowledge-base', name: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'agents', name: 'Agents', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-900">SmartSupport AI</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={`${sidebarOpen ? 'flex items-center gap-3' : 'flex justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {currentAgent?.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <select
                  value={currentAgent?.id || ''}
                  onChange={(e) => {
                    const agent = agents.find(a => a.id === e.target.value);
                    setCurrentAgent(agent || null);
                  }}
                  className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 capitalize">{currentAgent?.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {navigation.find(n => n.id === currentView)?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
