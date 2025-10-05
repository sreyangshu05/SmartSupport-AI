import { useState } from 'react';
import { X, Bot, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Ticket, TicketStatus, TicketPriority } from '../types';
import { generateDraftReply } from '../utils/aiSimulation';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const { updateTicket, categories, agents, kbArticles } = useApp();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [categoryId, setCategoryId] = useState(ticket.categoryId || '');
  const [draftReply, setDraftReply] = useState('');
  const [showDraftReply, setShowDraftReply] = useState(false);

  const handleSave = () => {
    updateTicket(ticket.id, {
      status,
      priority,
      assignedTo: assignedTo || undefined,
      categoryId: categoryId || undefined,
      resolvedAt: status === 'resolved' && !ticket.resolvedAt ? new Date().toISOString() : ticket.resolvedAt,
      closedAt: status === 'closed' && !ticket.closedAt ? new Date().toISOString() : ticket.closedAt,
    });
    onClose();
  };

  const handleGenerateDraft = () => {
    const draft = generateDraftReply(ticket, kbArticles);
    setDraftReply(draft);
    setShowDraftReply(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{ticket.ticketNumber}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Created by {ticket.createdBy}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
              {ticket.summary && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <Bot className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">AI Summary</p>
                    <p className="text-sm text-blue-800">{ticket.summary}</p>
                  </div>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {ticket.kbSuggestions && ticket.kbSuggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="text-green-600" size={20} />
                  <h4 className="font-semibold text-gray-900">Suggested Knowledge Base Articles</h4>
                </div>
                <div className="space-y-2">
                  {ticket.kbSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{suggestion.article.title}</h5>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full">
                          {Math.round(suggestion.relevanceScore * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.article.summary}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>👁️ {suggestion.article.viewCount} views</span>
                        <span>👍 {suggestion.article.helpfulCount} helpful</span>
                        <span>🔄 Used {suggestion.article.usageCount} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">AI Draft Reply</h4>
                <button
                  onClick={handleGenerateDraft}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Generate Draft
                </button>
              </div>
              {showDraftReply && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <textarea
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={8}
                  />
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                      Send Reply
                    </button>
                    <button
                      onClick={handleGenerateDraft}
                      className="px-3 py-1.5 border border-purple-300 text-purple-700 text-sm rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Ticket Details</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">None</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Unassigned</option>
                  {agents.filter(a => a.isActive).map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-gray-600">Resolved</p>
                    <p className="text-gray-900">{new Date(ticket.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
