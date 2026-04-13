/**
 * Empty Tool — placeholder for tools not yet implemented.
 * Provides the tool interface shape so the toolbar can show them
 * and tool switching architecture works from day 1.
 */

import type { EditorTool } from './types';

export class EmptyTool implements EditorTool {
  id: string;
  label: string;
  icon: string;

  constructor(id: string, label: string, icon: string) {
    this.id = id;
    this.label = label;
    this.icon = icon;
  }

  onEnter(): void {
    console.log(`[${this.label} Tool] Activated (placeholder)`);
  }

  onExit(): void {
    console.log(`[${this.label} Tool] Deactivated`);
  }
}
