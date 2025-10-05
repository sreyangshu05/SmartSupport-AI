import { useState } from 'react';
import { X, CreditCard as Edit2, Eye, ThumbsUp, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { KBArticle } from '../types';

interface ArticleDetailModalProps {
  article: KBArticle;
  onClose: () => void;
}

export default function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const { updateKBArticle, categories, currentAgent } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [summary, setSummary] = useState(article.summary || '');
  const [categoryId, setCategoryId] = useState(article.categoryId || '');
  const [tags, setTags] = useState(article.tags?.join(', ') || '');
  const [isPublished, setIsPublished] = useState(article.isPublished);

  const canEdit = currentAgent?.id === article.createdBy ||
                  currentAgent?.role === 'admin' ||
                  currentAgent?.role === 'senior_agent';

  const handleSave = () => {
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    updateKBArticle(article.id, {
      title,
      content,
      summary: summary.trim() || undefined,
      categoryId: categoryId || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined,
      isPublished,
    });

    setIsEditing(false);
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-bold mb-3 mt-5">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-bold mb-2 mt-4">{line.substring(4)}</h3>;
        }
        if (line.trim().startsWith('- ')) {
          return <li key={idx} className="ml-4">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={idx} />;
        }
        return <p key={idx} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Article' : article.title}
            </h2>
            {!article.isPublished && !isEditing && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={12}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published-edit"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="published-edit" className="text-sm text-gray-700">
                  Published
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                {article.category && (
                  <span
                    className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white mb-4"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                )}
                {article.summary && (
                  <p className="text-lg text-gray-600 mb-4">{article.summary}</p>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700">
                {renderMarkdown(article.content)}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{article.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp size={16} />
                      <span>{article.helpfulCount} helpful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <span>Used {article.usageCount} times</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {article.createdByAgent && (
                      <span>By {article.createdByAgent.fullName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
