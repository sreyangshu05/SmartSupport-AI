import type { Ticket, KBArticle, KBSuggestion } from '../types';

export function generateTicketSummary(description: string): string {
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) return description.substring(0, 100);

  const keywords = extractKeywords(description);
  const firstSentence = sentences[0].trim();

  if (keywords.length > 0) {
    return `${firstSentence.substring(0, 80)} - Key: ${keywords.slice(0, 2).join(', ')}`;
  }

  return firstSentence.substring(0, 100);
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'my', 'i', 'me', 'you', 'it', 'that', 'this', 'was', 'get', 'have', 'has', 'had', 'when', 'where', 'why', 'how']);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

export function classifyTicket(subject: string, description: string): string {
  const text = `${subject} ${description}`.toLowerCase();

  const patterns = [
    { categoryId: 'cat-2', keywords: ['bill', 'charge', 'payment', 'invoice', 'subscription', 'refund', 'credit card'] },
    { categoryId: 'cat-3', keywords: ['password', 'login', 'access', 'account', 'sign in', 'authenticate', 'locked out'] },
    { categoryId: 'cat-1', keywords: ['error', 'bug', 'broken', 'not working', 'crash', 'issue', 'problem', '403', '404', '500'] },
    { categoryId: 'cat-4', keywords: ['feature', 'request', 'suggestion', 'would like', 'could you add', 'enhancement'] },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return pattern.categoryId;
    }
  }

  return 'cat-5';
}

export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

export function findSimilarTickets(ticket: Ticket, allTickets: Ticket[]): Ticket[] {
  const similarities = allTickets
    .filter(t => t.id !== ticket.id)
    .map(t => ({
      ticket: t,
      score: calculateSimilarity(
        `${ticket.subject} ${ticket.description}`,
        `${t.subject} ${t.description}`
      ),
    }))
    .filter(({ score }) => score > 0.3)
    .sort((a, b) => b.score - a.score);

  return similarities.slice(0, 3).map(({ ticket }) => ticket);
}

export function suggestKBArticles(ticket: Ticket, articles: KBArticle[]): KBSuggestion[] {
  const ticketText = `${ticket.subject} ${ticket.description}`.toLowerCase();
  const keywords = extractKeywords(ticketText);

  const suggestions = articles
    .filter(article => article.isPublished)
    .map(article => {
      const articleText = `${article.title} ${article.content} ${article.tags?.join(' ') || ''}`.toLowerCase();

      let score = 0;
      keywords.forEach(keyword => {
        if (articleText.includes(keyword)) {
          score += 0.2;
        }
      });

      score += calculateSimilarity(ticketText, articleText) * 0.5;

      if (ticket.categoryId === article.categoryId) {
        score += 0.3;
      }

      return {
        id: `suggestion-${ticket.id}-${article.id}`,
        ticketId: ticket.id,
        kbArticleId: article.id,
        article,
        relevanceScore: Math.min(score, 1),
        suggestedAt: new Date().toISOString(),
      };
    })
    .filter(suggestion => suggestion.relevanceScore > 0.4)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  return suggestions;
}

export function generateDraftReply(ticket: Ticket, kbArticles: KBArticle[]): string {
  const suggestions = suggestKBArticles(ticket, kbArticles);

  if (suggestions.length === 0) {
    return `Hello,\n\nThank you for contacting support regarding: "${ticket.subject}"\n\nI've reviewed your ticket and I'm looking into this issue. I'll get back to you shortly with more information.\n\nBest regards,\nSupport Team`;
  }

  const topArticle = suggestions[0].article;

  return `Hello,\n\nThank you for contacting support regarding: "${ticket.subject}"\n\nI found this helpful article that might address your issue:\n\n"${topArticle.title}"\n${topArticle.summary || topArticle.content.substring(0, 200)}\n\nPlease let me know if this helps or if you need additional assistance.\n\nBest regards,\nSupport Team`;
}

export function detectDuplicates(tickets: Ticket[]): Map<string, string[]> {
  const duplicates = new Map<string, string[]>();

  for (let i = 0; i < tickets.length; i++) {
    for (let j = i + 1; j < tickets.length; j++) {
      const similarity = calculateSimilarity(
        `${tickets[i].subject} ${tickets[i].description}`,
        `${tickets[j].subject} ${tickets[j].description}`
      );

      if (similarity > 0.7) {
        const key = tickets[i].id;
        if (!duplicates.has(key)) {
          duplicates.set(key, []);
        }
        duplicates.get(key)!.push(tickets[j].id);
      }
    }
  }

  return duplicates;
}

export function clusterTickets(tickets: Ticket[]): Array<{ name: string; tickets: Ticket[] }> {
  const clusters: Array<{ name: string; tickets: Ticket[] }> = [];
  const processed = new Set<string>();

  tickets.forEach(ticket => {
    if (processed.has(ticket.id)) return;

    const similar = findSimilarTickets(ticket, tickets);

    if (similar.length >= 2) {
      const clusterTickets = [ticket, ...similar];
      const keywords = extractKeywords(`${ticket.subject} ${ticket.description}`);

      clusters.push({
        name: keywords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Issues',
        tickets: clusterTickets,
      });

      clusterTickets.forEach(t => processed.add(t.id));
    }
  });

  return clusters;
}
