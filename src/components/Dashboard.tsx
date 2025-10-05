import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { tickets, clusters, analytics, currentAgent } = useApp();

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedToday = tickets.filter(t => {
    if (!t.resolvedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.resolvedAt).toDateString() === today;
  }).length;

  const avgResolutionTime = analytics.reduce((acc, a) => acc + (a.avgResolutionTimeMinutes || 0), 0) / analytics.length || 0;

  const categoryBreakdown = tickets.reduce((acc, ticket) => {
    const categoryName = ticket.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const trendingClusters = clusters.filter(c => c.isTrending);

  const currentAgentAnalytics = analytics.find(a => a.agentId === currentAgent?.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Open Tickets"
          value={openTickets}
          icon={AlertCircle}
          color="red"
          subtitle="Awaiting assignment"
        />
        <MetricCard
          title="In Progress"
          value={inProgressTickets}
          icon={Clock}
          color="yellow"
          subtitle="Being handled"
        />
        <MetricCard
          title="Resolved Today"
          value={resolvedToday}
          icon={CheckCircle}
          color="green"
          subtitle="Completed tickets"
        />
        <MetricCard
          title="Avg Resolution"
          value={`${Math.round(avgResolutionTime)}m`}
          icon={TrendingUp}
          color="blue"
          subtitle="Response time"
        />
      </div>

      {currentAgentAnalytics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance Today</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tickets Created</p>
              <p className="text-2xl font-bold text-gray-900">{currentAgentAnalytics.ticketsCreated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tickets Resolved</p>
              <p className="text-2xl font-bold text-green-600">{currentAgentAnalytics.ticketsResolved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{currentAgentAnalytics.totalResponses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(currentAgentAnalytics.avgResponseTimeMinutes || 0)}m
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Issue Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => {
              const percentage = (count / tickets.length) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="text-gray-600">{count} tickets</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={20} />
            Trending Issues
          </h3>
          {trendingClusters.length > 0 ? (
            <div className="space-y-4">
              {trendingClusters.map(cluster => (
                <div key={cluster.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{cluster.name}</h4>
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                      {cluster.ticketCount} tickets
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{cluster.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Last seen: {new Date(cluster.lastSeen).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No trending issues detected</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1 truncate">{ticket.subject}</p>
                <p className="text-xs text-gray-500 mt-1">{ticket.summary}</p>
              </div>
              <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'red' | 'yellow' | 'green' | 'blue';
  subtitle: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
