import { VehicleData } from '../types';

export interface MoveHistoryEntry {
  vehicleId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export class MoveHistory {
  private history: MoveHistoryEntry[] = [];
  private redoStack: MoveHistoryEntry[] = [];
  
  addMove(vehicleId: string, fromX: number, fromY: number, toX: number, toY: number) {
    this.history.push({ vehicleId, fromX, fromY, toX, toY });
    // Clear redo stack when new move is made
    this.redoStack = [];
  }
  
  undo(): MoveHistoryEntry | null {
    const lastMove = this.history.pop();
    if (lastMove) {
      this.redoStack.push(lastMove);
      return lastMove;
    }
    return null;
  }
  
  redo(): MoveHistoryEntry | null {
    const redoMove = this.redoStack.pop();
    if (redoMove) {
      this.history.push(redoMove);
      return redoMove;
    }
    return null;
  }
  
  canUndo(): boolean {
    return this.history.length > 0;
  }
  
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  
  getMoveCount(): number {
    return this.history.length;
  }
  
  clear() {
    this.history = [];
    this.redoStack = [];
  }
  
  getHistory(): MoveHistoryEntry[] {
    return [...this.history];
  }
}
