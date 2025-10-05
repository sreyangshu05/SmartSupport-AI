import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Agent, Ticket, KBArticle, TicketCategory, TicketCluster, AgentAnalytics } from '../types';
import { mockAgents, mockCategories, mockTickets, mockKBArticles, mockClusters, mockAnalytics } from '../utils/mockData';
import { generateTicketSummary, classifyTicket, suggestKBArticles } from '../utils/aiSimulation';

interface AppContextType {
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent | null) => void;
  agents: Agent[];
  categories: TicketCategory[];
  tickets: Ticket[];
  kbArticles: KBArticle[];
  clusters: TicketCluster[];
  analytics: AgentAnalytics[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'summary' | 'kbSuggestions'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addKBArticle: (article: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount' | 'usageCount'>) => void;
  updateKBArticle: (id: string, updates: Partial<KBArticle>) => void;
  deleteKBArticle: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(mockAgents[0]);
  const [agents] = useState<Agent[]>(mockAgents);
  const [categories] = useState<TicketCategory[]>(mockCategories);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [kbArticles, setKBArticles] = useState<KBArticle[]>(mockKBArticles);
  const [clusters] = useState<TicketCluster[]>(mockClusters);
  const [analytics] = useState<AgentAnalytics[]>(mockAnalytics);

  useEffect(() => {
    const enrichedTickets = tickets.map(ticket => {
      const category = categories.find(c => c.id === ticket.categoryId);
      const assignedAgent = agents.find(a => a.id === ticket.assignedTo);
      const suggestions = suggestKBArticles(ticket, kbArticles);

      return {
        ...ticket,
        category,
        assignedAgent,
        kbSuggestions: suggestions,
      };
    });

    setTickets(enrichedTickets);
  }, []);

  const addTicket = (newTicket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'summary' | 'kbSuggestions'>) => {
    const ticketNumber = `TKT-${String(tickets.length + 1).padStart(6, '0')}`;
    const summary = generateTicketSummary(newTicket.description);
    const categoryId = newTicket.categoryId || classifyTicket(newTicket.subject, newTicket.description);

    const ticket: Ticket = {
      ...newTicket,
      id: `ticket-${Date.now()}`,
      ticketNumber,
      summary,
      categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const category = categories.find(c => c.id === ticket.categoryId);
    const assignedAgent = agents.find(a => a.id === ticket.assignedTo);
    const suggestions = suggestKBArticles(ticket, kbArticles);

    const enrichedTicket = {
      ...ticket,
      category,
      assignedAgent,
      kbSuggestions: suggestions,
    };

    setTickets(prev => [enrichedTicket, ...prev]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === id) {
        const updated = {
          ...ticket,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const category = categories.find(c => c.id === updated.categoryId);
        const assignedAgent = agents.find(a => a.id === updated.assignedTo);

        return {
          ...updated,
          category,
          assignedAgent,
        };
      }
      return ticket;
    }));
  };

  const addKBArticle = (newArticle: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount' | 'usageCount'>) => {
    const article: KBArticle = {
      ...newArticle,
      id: `kb-${Date.now()}`,
      viewCount: 0,
      helpfulCount: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const category = categories.find(c => c.id === article.categoryId);
    const createdByAgent = agents.find(a => a.id === article.createdBy);

    setKBArticles(prev => [{
      ...article,
      category,
      createdByAgent,
    }, ...prev]);
  };

  const updateKBArticle = (id: string, updates: Partial<KBArticle>) => {
    setKBArticles(prev => prev.map(article => {
      if (article.id === id) {
        const updated = {
          ...article,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const category = categories.find(c => c.id === updated.categoryId);
        const createdByAgent = agents.find(a => a.id === updated.createdBy);

        return {
          ...updated,
          category,
          createdByAgent,
        };
      }
      return article;
    }));
  };

  const deleteKBArticle = (id: string) => {
    setKBArticles(prev => prev.filter(article => article.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentAgent,
        setCurrentAgent,
        agents,
        categories,
        tickets,
        kbArticles,
        clusters,
        analytics,
        addTicket,
        updateTicket,
        addKBArticle,
        updateKBArticle,
        deleteKBArticle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
