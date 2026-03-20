export enum CellType {
  EMPTY = 0,
  BLOCKED = 2,
  EXIT = 3,
}

export enum Orientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export class Vehicle {
  constructor(
    public id: string,
    public x: number,     // column
    public y: number,     // row
    public orientation: Orientation,
    public length: number
  ) {}
}

export interface SlideResult {
  x: number;
  y: number;
  exited: boolean;
  steps: number;
}

export class Grid {
  public width: number;
  public height: number;
  public cells: CellType[][];
  public vehicles: Vehicle[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () => Array(width).fill(CellType.EMPTY));
  }

  public setCell(row: number, col: number, type: CellType): void {
    if (this.isValidCoordinate(row, col)) {
      this.cells[row][col] = type;
    }
  }

  public getCell(row: number, col: number): CellType | null {
    if (this.isValidCoordinate(row, col)) {
      return this.cells[row][col];
    }
    return null;
  }

  public isValidCoordinate(row: number, col: number): boolean {
    return row >= 0 && row < this.height && col >= 0 && col < this.width;
  }

  public getVehicleCells(v: Vehicle): { row: number; col: number }[] {
    const occupied = [];
    for (let i = 0; i < v.length; i++) {
      occupied.push({
        row: v.orientation === Orientation.VERTICAL ? v.y + i : v.y,
        col: v.orientation === Orientation.HORIZONTAL ? v.x + i : v.x,
      });
    }
    return occupied;
  }

  public getOccupancyMap(): boolean[][] {
    const map = Array.from({ length: this.height }, () => Array(this.width).fill(false));
    for (const v of this.vehicles) {
      for (const cell of this.getVehicleCells(v)) {
        if (this.isValidCoordinate(cell.row, cell.col)) {
          map[cell.row][cell.col] = true;
        }
      }
    }
    return map;
  }

  public validatePlacement(v: Vehicle): { valid: boolean; reason?: string } {
    const vehicleCells = this.getVehicleCells(v);
    const occupancy = this.getOccupancyMap();

    for (const cell of vehicleCells) {
      if (!this.isValidCoordinate(cell.row, cell.col)) {
        return { valid: false, reason: 'Out of bounds' };
      }
      
      const cellType = this.getCell(cell.row, cell.col);
      if (cellType === CellType.BLOCKED) {
        return { valid: false, reason: 'Collision with BLOCKED wall' };
      }

      if (occupancy[cell.row][cell.col]) {
        return { valid: false, reason: 'Collision with another vehicle' };
      }
    }

    return { valid: true };
  }

  public addVehicle(v: Vehicle): boolean {
    const validation = this.validatePlacement(v);
    if (!validation.valid) {
      console.error(`[ERROR] Failed to place Vehicle '${v.id}' at (${v.x}, ${v.y}): ${validation.reason}`);
      return false;
    }
    
    this.vehicles.push(v);
    console.log(`[SUCCESS] Placed Vehicle '${v.id}' at (${v.x}, ${v.y})`);
    return true;
  }

  /**
   * Calculates the max travel distance in `dir` (1 or -1) and instantly 
   * teleports the vehicle. If it hits an EXIT, it removes it from the grid.
   */
  public slideVehicle(id: string, dir: number): SlideResult | null {
    const vIndex = this.vehicles.findIndex(v => v.id === id);
    if (vIndex === -1) {
      console.warn(`[Slide] Vehicle '${id}' not found.`);
      return null;
    }
    const v = this.vehicles[vIndex];
    
    // Temporarily remove to decouple from occupancy map during calculation
    this.vehicles.splice(vIndex, 1);
    const occupancy = this.getOccupancyMap();
    
    let maxSteps = 0;
    const limit = Math.max(this.width, this.height);
    let exited = false;
    
    for (let step = 1; step <= limit; step++) {
      let checkRow: number;
      let checkCol: number;

      if (v.orientation === Orientation.HORIZONTAL) {
        checkRow = v.y;
        checkCol = dir > 0 ? v.x + v.length - 1 + step : v.x - step;
      } else {
        checkCol = v.x;
        checkRow = dir > 0 ? v.y + v.length - 1 + step : v.y - step;
      }

      // 1. Edge detection
      if (!this.isValidCoordinate(checkRow, checkCol)) break;

      const cellType = this.getCell(checkRow, checkCol);
      
      // 2. Obstacle detection: Wall
      if (cellType === CellType.BLOCKED) break;

      // 3. Obstacle detection: Another Vehicle
      if (occupancy[checkRow][checkCol]) break;

      // Valid step, record it
      maxSteps = step * dir;

      // 4. Exit detection
      if (cellType === CellType.EXIT) {
        exited = true;
        maxSteps += v.length * dir; // Slide completely visually off the board limits
        break; 
      }
    }

    // Instantly teleport logically
    if (v.orientation === Orientation.HORIZONTAL) v.x += maxSteps;
    else v.y += maxSteps;

    if (!exited) {
      this.vehicles.push(v);
    }
    
    return { x: v.x, y: v.y, exited, steps: maxSteps };
  }

  public debugRender(): void {
    console.log(`\n--- Static Level Map [${this.width}x${this.height}] ---`);
    const occupancy = this.getOccupancyMap();
    let output = '';
    
    output += '   ' + Array.from({ length: this.width }, (_, i) => (i % 10).toString()).join(' ') + '\n';
    
    for (let row = 0; row < this.height; row++) {
      output += (row % 10).toString().padEnd(3, ' ');
      for (let col = 0; col < this.width; col++) {
        const cell = this.cells[row][col];
        const hasVehicle = occupancy[row][col];

        if (hasVehicle) {
          const occupant = this.vehicles.find(v => 
            this.getVehicleCells(v).some(c => c.row === row && c.col === col)
          );
          output += (occupant ? occupant.id.charAt(0).toUpperCase() : 'V') + ' ';
        } 
        else if (cell === CellType.EMPTY) output += '. ';
        else if (cell === CellType.BLOCKED) output += 'X ';
        else if (cell === CellType.EXIT) output += 'E ';
      }
      output += '\n';
    }
    console.log(output);
  }
}

// ==========================================
// TEST EXECUTION (Runs if executed directly)
// ==========================================
if (require.main === module) {
  const grid = new Grid(8, 8);
  
  // Set up static walls
  grid.setCell(2, 2, CellType.BLOCKED);
  grid.setCell(3, 2, CellType.BLOCKED);
  grid.setCell(3, 3, CellType.BLOCKED);
  grid.setCell(4, 7, CellType.EXIT);

  // Add vehicles
  grid.addVehicle(new Vehicle('target', 1, 4, Orientation.HORIZONTAL, 2)); 
  grid.addVehicle(new Vehicle('carA', 4, 1, Orientation.VERTICAL, 2)); 
  grid.addVehicle(new Vehicle('blocker', 4, 6, Orientation.HORIZONTAL, 2)); 
  grid.addVehicle(new Vehicle('banger', 0, 2, Orientation.HORIZONTAL, 2));

  console.log("\n--- Initial Grid ---");
  grid.debugRender();

  // Test Case 1: Stop at wall
  console.log("\n--- TEST: Doesn't pass through walls ---");
  console.log("Expected: 'banger' should slide 0 steps as Wall is at (2,2).");
  grid.slideVehicle('banger', 1);

  // Test Case 2: Stop at obstacle
  console.log("\n--- TEST: Stops correctly at Obstacle ---");
  console.log("Expected: 'carA' slides down and stops precisely above 'blocker'.");
  grid.slideVehicle('carA', 1);
  
  // Test Case 3: Stop at edge
  console.log("\n--- TEST: Stop at edge ---");
  console.log("Expected: 'blocker' slides right to the grid boundary without overflowing.");
  grid.slideVehicle('blocker', 1);

  // Test Case 4: Exit correctly
  console.log("\n--- TEST: Exits correctly ---");
  console.log("Expected: 'carA' moves out of the way, then 'target' slides right, hits EXIT at (7,4), and disappears.");
  grid.slideVehicle('carA', -1); // Slide carA back up to clear the path
  grid.slideVehicle('target', 1);
  
  console.log("\n--- Final Grid State ---");
  grid.debugRender();
}
