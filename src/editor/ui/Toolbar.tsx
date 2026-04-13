import React from 'react';
import {
  MousePointer2,
  Move,
  RotateCw,
  Minus,
  Square,
  Eraser,
  Circle,
  Undo2,
  ChevronDown,
  Spline,
  Pentagon,
  Ruler,
  Maximize2,
  ArrowUpRight,
  GripHorizontal,
  Box,
} from 'lucide-react';
import { useUIStore } from '@/editor/store/uiStore';
import { ToolManager } from '@/editor/core/ToolManager';
import type { ToolId } from '@/editor/tools/types';

interface ToolDef {
  id: ToolId | string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  group: number;
  hasDropdown?: boolean;
}

const TOOLS: ToolDef[] = [
  // Group 0: Selection & Basic Manipulation
  { id: 'select', label: 'Select', icon: <MousePointer2 size={18} />, shortcut: 'V', group: 0, hasDropdown: true },
  
  // Group 1: Creation Tools
  { id: 'line', label: 'Line', icon: <Minus className="rotate-[135deg]" size={18} />, shortcut: 'L', group: 1 },
  { id: 'arc', label: 'Arc', icon: <Spline size={18} />, shortcut: 'A', group: 1 },
  { id: 'ellipse', label: 'Circle', icon: <Circle size={18} />, shortcut: 'E', group: 1 },
  { id: 'rectangle', label: 'Rectangle', icon: <Square size={18} />, shortcut: 'Shift+R', group: 1 },
  { id: 'eraser', label: 'Eraser', icon: <Eraser size={18} />, shortcut: 'Del', group: 1 },

  // Group 2: Transformation Tools
  { id: 'move', label: 'Move', icon: <Move size={18} />, shortcut: 'G', group: 2 },
  { id: 'scale_uniform', label: 'Scale Uniform', icon: <Box size={18} />, group: 2 },
  { id: 'rotate', label: 'Rotate', icon: <RotateCw size={18} />, shortcut: 'R', group: 2 },
  { id: 'scale_axis', label: 'Scale Axis', icon: <ArrowUpRight size={18} />, group: 2 },

  // Group 3: Utility/Measurement
  { id: 'dimension', label: 'Dimension', icon: <GripHorizontal size={18} />, group: 3 },
  { id: 'ruler', label: 'Ruler', icon: <Ruler size={18} />, group: 3 },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setTool = useUIStore((s) => s.setTool);

  const handleToolClick = (id: string) => {
    setTool(id as ToolId);
    ToolManager.setActiveTool(id as ToolId);
  };

  // Group tools by group number
  const groups = TOOLS.reduce<ToolDef[][]>((acc, tool) => {
    if (!acc[tool.group]) acc[tool.group] = [];
    acc[tool.group].push(tool);
    return acc;
  }, []);

  return (
    <div className="toolbar">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div className="toolbar-separator" />}
          <div className="toolbar-group">
            {group.map((tool) => (
              <button
                key={tool.id}
                className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
                title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
              >
                <div className="flex items-center gap-0.5">
                  {tool.icon}
                  {tool.hasDropdown && <ChevronDown size={10} className="opacity-50" />}
                </div>
                <span className="tooltip">
                  {tool.label} {tool.shortcut && <kbd className="kbd">{tool.shortcut}</kbd>}
                </span>
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
