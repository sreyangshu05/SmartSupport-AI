import { Users, Mail, Calendar, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Agents() {
  const { agents, tickets, analytics } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => {
          const agentTickets = tickets.filter(t => t.assignedTo === agent.id);
          const openTickets = agentTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
          const resolvedTickets = agentTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
          const agentAnalytics = analytics.find(a => a.agentId === agent.id);

          return (
            <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {agent.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {agent.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {agent.role.replace('_', ' ')}
                  </p>
                  <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    agent.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Activity size={12} />
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {new Date(agent.createdAt).toLocaleDateString()}</span>
                </div>
                {agent.lastActiveAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity size={16} className="text-gray-400" />
                    <span>Last active {new Date(agent.lastActiveAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assigned Tickets</span>
                  <span className="text-lg font-bold text-gray-900">{agentTickets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open / In Progress</span>
                  <span className="text-lg font-bold text-yellow-600">{openTickets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolved / Closed</span>
                  <span className="text-lg font-bold text-green-600">{resolvedTickets.length}</span>
                </div>
              </div>

              {agentAnalytics && (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Today's Performance</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Responses</p>
                      <p className="font-semibold text-gray-900">{agentAnalytics.totalResponses}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Resolved</p>
                      <p className="font-semibold text-gray-900">{agentAnalytics.ticketsResolved}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Response</p>
                      <p className="font-semibold text-gray-900">
                        {Math.round(agentAnalytics.avgResponseTimeMinutes || 0)}m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">KB Articles</p>
                      <p className="font-semibold text-gray-900">{agentAnalytics.kbArticlesCreated}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          Team Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {agents.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Agents</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {agents.filter(a => a.isActive).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active Agents</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(tickets.length / agents.filter(a => a.isActive).length) || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Tickets per Agent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
