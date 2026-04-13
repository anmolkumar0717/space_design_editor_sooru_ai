import { Settings, Eye, Search } from 'lucide-react';

export function BottomLeftControls() {
  return (
    <div className="bottom-control-group">
      <button className="bottom-control-item" title="Settings">
        <Settings size={18} />
      </button>
      <button className="bottom-control-item" title="Visibility">
        <Eye size={18} />
      </button>
      <button className="bottom-control-item" title="Search">
        <Search size={18} />
      </button>
    </div>
  );
}
