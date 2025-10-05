import { useState } from 'react';
import { Plus, Search, Eye, ThumbsUp, BookOpen, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { KBArticle } from '../types';
import CreateArticleModal from './CreateArticleModal';
import ArticleDetailModal from './ArticleDetailModal';

export default function KnowledgeBase() {
  const { kbArticles, currentAgent, deleteKBArticle } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  const filteredArticles = kbArticles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || article.categoryId === categoryFilter;

    const canView = article.isPublished ||
                    article.createdBy === currentAgent?.id ||
                    currentAgent?.role === 'admin' ||
                    currentAgent?.role === 'senior_agent';

    return matchesSearch && matchesCategory && canView;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this article?')) {
      deleteKBArticle(id);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            New Article
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.category && (
                    <span
                      className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  )}
                </div>
                {!article.isPublished && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    Draft
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {article.summary || article.content.substring(0, 150)}
              </p>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{article.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{article.helpfulCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{article.usageCount}</span>
                  </div>
                </div>
                {(article.createdBy === currentAgent?.id || currentAgent?.role === 'admin') && (
                  <button
                    onClick={(e) => handleDelete(article.id, e)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No articles found</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateArticleModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
