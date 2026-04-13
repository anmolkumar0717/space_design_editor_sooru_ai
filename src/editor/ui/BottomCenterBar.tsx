import { Sparkles, Search, MessageSquare } from 'lucide-react';

export function BottomCenterBar() {
  return (
    <div className="center-search-container">
      <div className="search-input-wrapper">
        <Sparkles size={18} className="sparkle-icon" />
        <Search size={18} style={{ opacity: 0.5 }} />
        <span>Search tools, / for AI actions</span>
      </div>
      <button className="search-action-btn" title="AI Chat">
        <MessageSquare size={16} />
      </button>
    </div>
  );
}
