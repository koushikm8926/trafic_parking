# Traffic Parking - Game Guide & Logic

This guide describes the core mechanics, logic, and rules of the Traffic Parking game as of the latest version (12x13 dynamic grid).

---

## 1. Core Game Logic

### Dynamic Grid Architecture
- **Flexible Dimensions**: The grid system is dynamic. Each level defines its own `gridWidth` and `gridHeight`.
- **Level 1 Scale**: Currently set to a **12x13** grid (12 columns wide, 13 rows high).
- **Default Scale**: Standard levels typically use a **6x6** grid.
- **Aesthetics**: The grid features a light grey background (`#E0E0E0`) with black grid lines (`#000000`).

### Vehicle Mechanics
- **Types**: 
  - **Cars**: Occupy 2 grid cells.
  - **Trucks**: Occupy 3 grid cells.
- **Movement Constraints**: 
  - **Single-Axis Lock**: Vehicles can only move along their orientation. 
  - **Horizontal**: Move only left and right (X-axis).
  - **Vertical**: Move only up and down (Y-axis).
- **Collision Rules**: Vehicles cannot overlap with each other or with wall obstacles (defined in the level map).
- **Smooth Interaction**: Uses a spring-based physics system for dragging and snapping to the nearest cell.

### Win Condition
- **Target Car**: Your goal is to move the **red target vehicle** (ID: `target`). 
- **The Exit**: Find the opening on the grid edge (typically the right side, Row 6).
- **Completion**: The level is won when the target car's front reaches this exit point.

---

## 2. How to Play

### Getting Started
1. **Load a Level**: Choose a level from the level select screen.
2. **Identify the Goal**: Find the red car and the exit opening on the grid.

### Controls
- **Drag & Slide**: Press and hold any vehicle to move it.
- **Pathing**: You cannot move a vehicle if its path is blocked by another car or a wall.
- **Strategic Shifting**: Move other cars and trucks out of the way to create a clear horizontal path for the red car.

### Scoring
- **Move Count**: Every time you release a vehicle in a new position, it counts as one move.
- **Star Rating**:
  - **3 Stars**: Complete in the minimum possible moves.
  - **2 Stars**: Slightly over the optimal count.
  - **1 Star**: Many moves taken.
  - **0 Stars**: Level completed, but above all star thresholds.

### Tips
- **Work Backwards**: Look at the exit and see which cars are blocking the red car's path, then see which cars are blocking those, and so on.
- **Trucks are Heavy**: Trucks (3 cells) are much harder to maneuver because they require more open space to slide.
- **Undo/Reset**: Use the controls at the bottom of the screen if you get stuck or want to retry a move.

---

## 3. Technical Implementation
- **Positioning**: Uses `gridToPixel` and `pixelToGrid` conversion utilities to map grid coordinates to screen pixels.
- **Dynamic Scaling**: The `calculateGridMetrics` function ensures the grid fills 85% of the screen width and 60% of the screen height regardless of the number of rows/columns.
- **Collision Checking**: The `buildOccupancyMap` function creates a boolean 2D array of the current vehicle positions for real-time movement validation.
