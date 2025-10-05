import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { tickets, agents, analytics, clusters, kbArticles } = useApp();

  const agentPerformance = agents.map(agent => {
    const agentAnalytics = analytics.find(a => a.agentId === agent.id);
    const agentTickets = tickets.filter(t => t.assignedTo === agent.id);
    const resolvedTickets = agentTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

    return {
      agent,
      ticketsResolved: agentAnalytics?.ticketsResolved || 0,
      avgResponseTime: agentAnalytics?.avgResponseTimeMinutes || 0,
      avgResolutionTime: agentAnalytics?.avgResolutionTimeMinutes || 0,
      totalResponses: agentAnalytics?.totalResponses || 0,
      kbArticlesCreated: agentAnalytics?.kbArticlesCreated || 0,
    };
  }).sort((a, b) => b.ticketsResolved - a.ticketsResolved);

  const categoryBreakdown = tickets.reduce((acc, ticket) => {
    const categoryName = ticket.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topKBArticles = [...kbArticles]
    .filter(a => a.isPublished)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);

  const statusBreakdown = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  const priorityBreakdown = {
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={tickets.length}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${Math.round(analytics.reduce((acc, a) => acc + (a.avgResolutionTimeMinutes || 0), 0) / analytics.length || 0)}m`}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Active Agents"
          value={agents.filter(a => a.isActive).length}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Trending Issues"
          value={clusters.filter(c => c.isTrending).length}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
          <div className="space-y-3">
            <StatusBar label="Open" count={statusBreakdown.open} total={tickets.length} color="#EF4444" />
            <StatusBar label="In Progress" count={statusBreakdown.inProgress} total={tickets.length} color="#F59E0B" />
            <StatusBar label="Resolved" count={statusBreakdown.resolved} total={tickets.length} color="#10B981" />
            <StatusBar label="Closed" count={statusBreakdown.closed} total={tickets.length} color="#6B7280" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            <StatusBar label="Urgent" count={priorityBreakdown.urgent} total={tickets.length} color="#DC2626" />
            <StatusBar label="High" count={priorityBreakdown.high} total={tickets.length} color="#F97316" />
            <StatusBar label="Medium" count={priorityBreakdown.medium} total={tickets.length} color="#FBBF24" />
            <StatusBar label="Low" count={priorityBreakdown.low} total={tickets.length} color="#9CA3AF" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tickets Resolved</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Resolution</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Responses</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">KB Articles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agentPerformance.map(({ agent, ticketsResolved, avgResponseTime, avgResolutionTime, totalResponses, kbArticlesCreated }) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{agent.fullName}</p>
                      <p className="text-xs text-gray-500 capitalize">{agent.role.replace('_', ' ')}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-lg font-semibold text-green-600">{ticketsResolved}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {Math.round(avgResponseTime)}m
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {Math.round(avgResolutionTime)}m
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {totalResponses}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {kbArticlesCreated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                    <span className="text-gray-600">{count} tickets ({Math.round(percentage)}%)</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used KB Articles</h3>
          <div className="space-y-2">
            {topKBArticles.map((article, idx) => (
              <div key={article.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-500">
                    {article.usageCount} uses • {article.viewCount} views • {article.helpfulCount} helpful
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {clusters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Clusters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map(cluster => (
              <div key={cluster.id} className={`p-4 rounded-lg border-2 ${
                cluster.isTrending ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{cluster.name}</h4>
                  {cluster.isTrending && (
                    <TrendingUp className="text-orange-500 flex-shrink-0" size={16} />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{cluster.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold">{cluster.ticketCount} tickets</span>
                  <span>Last: {new Date(cluster.lastSeen).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusBar({ label, count, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
