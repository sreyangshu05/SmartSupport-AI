export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AgentRole = 'admin' | 'senior_agent' | 'agent';
export type AIFeatureType = 'summary' | 'suggestion' | 'classification' | 'draft_reply' | 'clustering';

export interface Agent {
  id: string;
  email: string;
  fullName: string;
  role: AgentRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  summary?: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId?: string;
  category?: TicketCategory;
  assignedTo?: string;
  assignedAgent?: Agent;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  responses?: TicketResponse[];
  kbSuggestions?: KBSuggestion[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  agentId?: string;
  agent?: Agent;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categoryId?: string;
  category?: TicketCategory;
  tags?: string[];
  viewCount: number;
  helpfulCount: number;
  usageCount: number;
  isPublished: boolean;
  createdBy: string;
  createdByAgent?: Agent;
  createdAt: string;
  updatedAt: string;
}

export interface KBSuggestion {
  id: string;
  ticketId: string;
  kbArticleId: string;
  article: KBArticle;
  relevanceScore: number;
  wasHelpful?: boolean;
  suggestedAt: string;
}

export interface TicketCluster {
  id: string;
  name: string;
  description?: string;
  ticketIds: string[];
  tickets?: Ticket[];
  ticketCount: number;
  firstSeen: string;
  lastSeen: string;
  isTrending: boolean;
  createdAt: string;
}

export interface AgentAnalytics {
  id: string;
  agentId: string;
  date: string;
  ticketsCreated: number;
  ticketsResolved: number;
  avgResponseTimeMinutes?: number;
  avgResolutionTimeMinutes?: number;
  totalResponses: number;
  kbArticlesCreated: number;
}

export interface AIFeedback {
  id: string;
  agentId: string;
  featureType: AIFeatureType;
  contextId: string;
  rating: number;
  feedbackText?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  topCategories: Array<{ category: string; count: number }>;
  trendingIssues: TicketCluster[];
  agentPerformance: Array<{
    agent: Agent;
    ticketsResolved: number;
    avgResolutionTime: number;
  }>;
}
