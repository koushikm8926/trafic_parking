# Parking Escape — Implementation Milestones

> **Game Concept:** Parking Escape is a grid-based spatial puzzle game where every vehicle on the board is locked to a single axis. Players slide cars and trucks along their rows/columns until they reach a free edge and escape off the grid. The level is complete when the board is **completely empty**.

---

## Milestone 1 — Project Scaffold & Navigation Shell
**Week 1 | Goal: Bootable app with screen navigation**

### What this milestone does
- Initializes the React Native / Expo project with the correct dependency versions
- Sets up the navigation stack: `HomeScreen → LevelSelectScreen → GameScreen → WinScreen`
- Establishes the TypeScript types and interfaces as a single source of truth
- Wires a placeholder `GameScreen` that renders the grid dimensions

### Files to create
| File | Purpose |
|------|---------|
| `src/types.ts` | All shared TS interfaces (`VehicleData`, `LevelData`, `HazardData`, etc.) |
| `src/navigation/AppNavigator.tsx` | Stack navigator with all screens registered |
| `src/screens/HomeScreen.tsx` | Play button navigating to LevelSelect |
| `src/screens/LevelSelectScreen.tsx` | Level grid/list UI |
| `src/screens/GameScreen.tsx` | Placeholder game canvas |
| `src/screens/WinScreen.tsx` | Win overlay/screen |

### Key dependencies to install
```bash
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install zustand
npx expo install react-native-safe-area-context
npm install @react-navigation/native @react-navigation/native-stack
```

### TypeScript Types (core)
```typescript
// src/types.ts
export type Direction = 'horizontal' | 'vertical';
export type CellValue = 0 | 2 | 3; // 0=empty, 2=wall, 3=exit

export interface VehicleData {
  id: string;           // 'v1', 'v2', 'truck_a' ...
  x: number;            // grid column of top-left cell
  y: number;            // grid row of top-left cell
  direction: Direction;
  length: 2 | 3;        // 2=car, 3=truck
  color: string;        // hex color
}

export interface LevelData {
  id: number;
  gridWidth: number;
  gridHeight: number;
  backgroundGrid: CellValue[][];
  vehicles: VehicleData[];
  minMoves: number;
  stars: [number, number, number];  // [3star, 2star, 1star] move thresholds
  exitSide: 'right' | 'left' | 'top' | 'bottom';
  difficulty?: 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';
}

export interface MoveRecord {
  vehicleId: string;
  fromX: number; fromY: number;
  toX: number;   toY: number;
}
```

### Acceptance Criteria
- [ ] App boots without errors on Android & iOS
- [ ] Navigating Home → LevelSelect → Game → Win works
- [ ] TypeScript compiles with no errors

---

## Milestone 2 — Grid Rendering & Occupancy Map
**Week 1–2 | Goal: Draw the game grid and vehicles from JSON data**

### What this milestone does
- Parses `LevelData` JSON and renders an NxM grid
- Draws each vehicle as a colored rectangle spanning its cells
- Builds the **occupancy map** (`Map<string, string>`) for O(1) collision lookup
- Applies wall cells (value `2`) and exit zones (value `3`) styling

### AI Prompt for core logic

> **Prompt:**
> Write a TypeScript function `buildOccupancyMap(vehicles: VehicleData[], gridWidth: number, gridHeight: number): Map<string, string>` that returns a map where each key is `"x,y"` and the value is the vehicle `id` occupying that cell. Horizontal vehicles span cells `(x, y)` to `(x + length - 1, y)`. Vertical vehicles span `(x, y)` to `(x, y + length - 1)`. Include JSDoc and handle out-of-bounds gracefully.

### Files to create
| File | Purpose |
|------|---------|
| `src/utils/gridUtils.ts` | `buildOccupancyMap()`, `cellKey()`, `getVehicleCells()` |
| `src/components/GameGrid.tsx` | Renders background grid cells (walls, exits, empty) |
| `src/components/Vehicle.tsx` | Single vehicle component sized by `length × cellSize` |
| `src/levels/levels.json` | Level data array following `LevelData[]` schema |
| `src/levels/index.ts` | Exports typed level array |

### Key implementation details
```typescript
// cellKey helper — used everywhere for occupancy map
export const cellKey = (x: number, y: number): string => `${x},${y}`;

// Grid cell size is dynamic:
const cellSize = Math.min(screenWidth, screenHeight * 0.65) / gridWidth;
```

### Acceptance Criteria
- [ ] A 6×6 grid renders correctly from level JSON
- [ ] Vehicles appear at correct positions with correct colors
- [ ] Wall cells are visually distinct; exit zones are highlighted
- [ ] Occupancy map correctly lists all occupied cells

---

## Milestone 3 — Movement Engine (canMove + slide logic)
**Week 2 | Goal: Implement the core movement rules**

### What this milestone does
- Implements `canMove(vehicleId, direction, steps, vehicles, occupancyMap, grid)` — checks if a vehicle can move N cells in a given direction
- Implements `slideVehicle(...)` — moves a vehicle as far as possible (up to `steps`)
- Handles **escape detection**: when a vehicle's leading edge reaches the grid boundary with enough clearance, it escapes
- Enforces all movement rules from the GDD

### Movement Rules (from GDD)
| Rule | Description |
|------|-------------|
| Axis lock | Horizontal vehicles move only left/right; vertical only up/down |
| Escape clearance | Vehicle escapes only when `length` free cells exist between leading edge and boundary |
| Partial step | If player drags 3 cells but 1 is free, vehicle moves 1 cell |
| Wall collision | Vehicle stops before cell value `2` |
| Snap to grid | On gesture release, snap to nearest cell based on >50% crossing |

### AI Prompt for core logic

> **Prompt:**
> Write a TypeScript function `canMove(vehicleId: string, deltaX: number, deltaY: number, vehicles: VehicleData[], occupancyMap: Map<string, string>, gridWidth: number, gridHeight: number, backgroundGrid: CellValue[][]): number` that returns the maximum number of cells the vehicle can legally slide. It must:
> 1. Reject motion on the wrong axis (axis-locked).
> 2. For each step from 1 to `|delta|`, check that all cells the vehicle would newly occupy are empty (not in occupancyMap, not walls).
> 3. Return the maximum valid steps (may be less than requested).
> 4. Return a special sentinel value (e.g., `Infinity` or `'escape'`) when the vehicle reaches the board edge with full clearance and should escape the grid.

### AI Prompt for escape logic

> **Prompt:**
> Write a TypeScript function `checkEscape(vehicle: VehicleData, gridWidth: number, gridHeight: number): { canEscape: boolean; direction: Direction; exitAxis: 'x' | 'y' }` that returns whether a vehicle's leading edge is at a free boundary. A horizontal vehicle escapes right if `x + length === gridWidth` (no cell beyond). A vertical vehicle escapes down if `y + length === gridHeight`. Similarly for left/up. Return the escape direction and axis.

### Files to create/modify
| File | Purpose |
|------|---------|
| `src/engine/Grid.ts` | `canMove()`, `slideVehicle()`, `checkEscape()`, `buildOccupancyMap()` |

### Acceptance Criteria
- [ ] Vehicles cannot pass through other vehicles
- [ ] Vehicles cannot pass through walls (cell value `2`)
- [ ] Vehicles correctly escape when at the grid edge with clearance
- [ ] Partial steps work: drag 5 cells, move only 2 if blocked

---

## Milestone 4 — Gesture System & Reanimated Animations
**Week 2–3 | Goal: Draggable vehicles with smooth, axis-locked gestures**

### What this milestone does
- Wraps each `<Vehicle>` in a `PanGestureHandler`
- Implements **axis lock** at gesture start: first dominant axis (X or Y) wins for the entire drag
- Animates vehicle position on the **UI thread** using Reanimated 3 shared values
- On gesture end: snaps vehicle to committed grid position or triggers escape animation

### AI Prompt for core logic

> **Prompt:**
> Write a React Native component `<DraggableVehicle>` using `react-native-gesture-handler` v2 and `react-native-reanimated` v3. The component should:
> 1. Use `useSharedValue` for `translateX` and `translateY`.
> 2. On `PanGestureHandler` start, determine the dominant axis by comparing `|velocityX|` vs `|velocityY|` and lock to that axis for the entire gesture.
> 3. During drag, update only the locked-axis shared value. Clamp movement to the maximum allowed cells (passed in as a prop callback `getMaxDelta(deltaX, deltaY): number`).
> 4. On gesture end, call `runOnJS(onCommitMove)(finalDelta)` to trigger the store update.
> 5. Use `withSpring` to snap the vehicle back to grid position after commit.

### Animation types to implement
| Animation | Trigger | Implementation |
|-----------|---------|----------------|
| Vehicle slide | Drag gesture | `translateX/Y` shared value, UI thread |
| Snap to grid | Gesture release | `withSpring({ damping: 20, stiffness: 200 })` |
| Escape sequence | Escape trigger | `withTiming` slide off screen + `FadeOut` |
| Illegal move shake | Blocked drag | `withSequence(withTiming(-5), withTiming(5), ...)` |
| Win popup | Board empty | `SlideInDown` layout animation |

### Files to create
| File | Purpose |
|------|---------|
| `src/components/Vehicle.tsx` | Full draggable vehicle with gesture + animation |
| `src/components/GameGrid.tsx` | Updated to position vehicles absolutely via shared values |

### Acceptance Criteria
- [ ] Vehicles drag smoothly at 60fps
- [ ] Axis is locked correctly on gesture start
- [ ] Vehicle snaps to grid position on release
- [ ] Escape vehicles animate off screen
- [ ] No JS thread freezes during drag

---

## Milestone 5 — Zustand Game Store
**Week 3 | Goal: Centralized reactive state for the entire game session**

### What this milestone does
- Creates the Zustand store holding all live game state
- Exposes actions: `loadLevel()`, `moveVehicle()`, `undoMove()`, `resetLevel()`
- Manages `occupancyMap` updates in sync with `vehicles` array changes
- Detects win condition when `vehicles` array is empty

### State shape
```typescript
interface GameState {
  // Data
  vehicles: VehicleData[];
  occupancyMap: Map<string, string>;
  moveHistory: MoveRecord[];
  moveCount: number;
  currentLevelId: number | null;
  levelStatus: 'idle' | 'playing' | 'won' | 'stuck';
  stars: 0 | 1 | 2 | 3;

  // Actions
  loadLevel: (level: LevelData) => void;
  moveVehicle: (vehicleId: string, deltaX: number, deltaY: number) => void;
  escapeVehicle: (vehicleId: string) => void;
  undoMove: () => void;
  resetLevel: () => void;
}
```

### AI Prompt for core logic

> **Prompt:**
> Write a Zustand store (TypeScript, `create<GameState>()`) for a puzzle game called Parking Escape. The `moveVehicle(vehicleId, deltaX, deltaY)` action must:
> 1. Call `canMove()` to get the maximum legal steps.
> 2. Compute the new `(x, y)` for the vehicle.
> 3. Remove old cells from `occupancyMap`, add new cells.
> 4. Push a `MoveRecord` to `moveHistory` and increment `moveCount`.
> 5. Call `checkEscape()` — if vehicle should escape, call `escapeVehicle(vehicleId)`.
> The `escapeVehicle(vehicleId)` action removes the vehicle from the `vehicles` array and its cells from `occupancyMap`, then checks if `vehicles.length === 0` to set `levelStatus = 'won'`.
> The `undoMove()` action pops the last `MoveRecord` and reverses the vehicle position, including re-adding escaped vehicles back to the board.

### Files to create
| File | Purpose |
|------|---------|
| `src/store/gameStore.ts` | Full Zustand store with all actions |

### Acceptance Criteria
- [ ] `loadLevel()` correctly initializes all state
- [ ] `moveVehicle()` updates vehicle position and occupancy map atomically
- [ ] `escapeVehicle()` removes vehicle; win triggers when vehicles = []
- [ ] `undoMove()` perfectly reverses the last move including escapes
- [ ] Components re-render only when their subscribed slice changes

---

## Milestone 6 — Win Screen, Scoring & Level Progress
**Week 3–4 | Goal: Star rating, win modal, and persistent progress**

### What this milestone does
- Renders the WinScreen / overlay when `levelStatus === 'won'`
- Calculates star rating from `moveCount` vs `stars` thresholds in `LevelData`
- Saves level progress (stars, bestMoves) to local storage via MMKV
- Unlocks the next level in `LevelSelectScreen`

### Scoring logic
```typescript
function calculateStars(moveCount: number, thresholds: [number, number, number]): 0 | 1 | 2 | 3 {
  if (moveCount <= thresholds[0]) return 3;
  if (moveCount <= thresholds[1]) return 2;
  if (moveCount <= thresholds[2]) return 1;
  return 0; // move limit exceeded (lose condition)
}
```

### Files to create
| File | Purpose |
|------|---------|
| `src/components/LevelCompleteModal.tsx` | Win overlay with stars + Next Level button |
| `src/utils/storage.ts` | MMKV-backed save/load for level progress |
| `src/screens/WinScreen.tsx` | Full win screen (alternative to modal) |

### Acceptance Criteria
- [ ] Stars display correctly for all 3 thresholds
- [ ] Progress is saved and persists across app restarts
- [ ] Next Level button navigates correctly
- [ ] Replay button resets the level

---

## Milestone 7 — BFS Hint Engine
**Week 4 | Goal: Optimal hint highlighting using breadth-first search**

### What this milestone does
- Implements a BFS solver that finds the **minimum number of moves** to clear all vehicles
- Exposes a hint: highlights the vehicle the player should move next (optimal path step 1)
- Runs BFS off the main thread (via `InteractionManager` or a Web Worker) to avoid UI freeze

### AI Prompt for core logic

> **Prompt:**
> Write a TypeScript BFS function `findOptimalMove(initialVehicles: VehicleData[], gridWidth: number, gridHeight: number, backgroundGrid: CellValue[][]): { vehicleId: string; deltaX: number; deltaY: number } | null` that:
> 1. Encodes the board state as a string key: `vehicles.map(v => \`${v.id}:${v.x},${v.y}\`).sort().join('|')`.
> 2. Uses a queue of `{ vehicles: VehicleData[], path: Move[] }`.
> 3. For each state, generates all legal moves for all vehicles (slide 1 to N cells in both axis directions, plus escape moves).
> 4. Returns the first move from the shortest path to the solved state (all vehicles escaped / `vehicles.length === 0`).
> 5. Memoizes visited states in a `Set<string>` to avoid cycles.

### Files to create
| File | Purpose |
|------|---------|
| `src/utils/hintSystem.ts` | `findOptimalMove()` BFS solver |
| `src/components/HelpModal.tsx` | UI to show hint, cost (hint penalty moves) |

### Acceptance Criteria
- [ ] BFS returns the correct first move for simple boards
- [ ] Hint highlights the correct vehicle in the UI
- [ ] BFS does not freeze the UI (async execution)

---

## Milestone 8 — Polish, Audio & Haptics
**Week 5 | Goal: Game feels complete and responsive**

### What this milestone does
- Adds haptic feedback for moves, illegal moves, and wins
- Adds sound effects (slide sound, escape sound, win jingle)
- Implements the confetti win animation
- Polishes all screen transitions and micro-animations
- Implements stuck detection (no moves available → prompt Undo/Reset)

### AI Prompt for stuck detection

> **Prompt:**
> Write a TypeScript function `isStuck(vehicles: VehicleData[], occupancyMap: Map<string, string>, gridWidth: number, gridHeight: number, backgroundGrid: CellValue[][]): boolean` that returns `true` if every vehicle has `canMove()` returning 0 in all of its legal directions. Use the existing `canMove` function. A vehicle is stuck if it cannot slide at all in either direction along its axis, and it cannot escape.

### Files to create
| File | Purpose |
|------|---------|
| `src/utils/haptics.ts` | Haptic feedback wrappers (move, illegal, win) |
| `src/utils/soundManager.ts` | Audio playback for slide, escape, win sounds |
| `src/components/ConfettiEffect.tsx` | Confetti particle animation on win |
| `src/utils/gameLogic.ts` | `isStuck()`, `calculateStars()`, helper functions |

### Acceptance Criteria
- [ ] Haptics fire on move, illegal drag, and win
- [ ] Sound plays on slide and escape with correct timing
- [ ] Confetti animates on win screen
- [ ] Stuck detection prompts undo/reset after 2 seconds of no input

---

## Milestone 9 — Level Design & Undo System
**Week 4–5 | Goal: 20+ hand-crafted levels and reliable undo**

### What this milestone does
- Creates 20+ levels in `levels.json` spanning tutorial → expert difficulty
- Verifies each level is solvable (BFS confirms `minMoves`)
- Implements full **undo stack** including re-adding escaped vehicles

### Difficulty tiers (from GDD)
| Tier | Moves | Example levels |
|------|-------|----------------|
| Tutorial | 1–5 | Levels 1–3 |
| Easy | 6–15 | Levels 4–10 |
| Medium | 16–30 | Levels 11–17 |
| Hard | 31–50 | Levels 18–22 |
| Expert | 51+ | Levels 23+ |

### Level JSON schema
```jsonc
{
  "id": 1,
  "gridWidth": 6,
  "gridHeight": 6,
  "backgroundGrid": [
    [0, 0, 0, 0, 0, 3],  // 3 = exit cell on right edge
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ],
  "vehicles": [
    { "id": "v1", "x": 0, "y": 0, "direction": "horizontal", "length": 2, "color": "#4A90E2" },
    { "id": "v2", "x": 3, "y": 2, "direction": "vertical",   "length": 3, "color": "#F5A623" }
  ],
  "minMoves": 4,
  "stars": [4, 6, 9],
  "exitSide": "right",
  "difficulty": "tutorial"
}
```

### Acceptance Criteria
- [ ] At least 20 levels spanning all difficulty tiers
- [ ] Every level is solvable (BFS verified)
- [ ] Undo correctly reverses every move type including escapes
- [ ] Level select shows unlock status and star count

---

## Milestone 10 — Final QA, Performance & Release Build
**Week 6–8 | Goal: Ship-ready build at 60fps on budget Android hardware**

### What this milestone does
- Runs performance profiling — targets 60fps constant during gesture
- Applies `React.memo` to `<Vehicle>` and `<GameGrid>` components
- Uses Zustand selector subscriptions to minimize re-renders
- Validates on physical Android (mid-range) and iOS devices
- Generates signed APK and AAB for release

### Performance checklist
- [ ] All gesture animation runs on UI thread (Reanimated worklets, no JS bridge)
- [ ] `<Vehicle>` wrapped in `React.memo` — re-renders only on position change
- [ ] Zustand slices: components subscribe only to their own vehicle id
- [ ] BFS hint runs async — never blocks main thread
- [ ] Hermes engine enabled in `app.json`

### Release build commands
```bash
# Local Android APK
cd android && ./gradlew assembleRelease

# EAS Build (AAB for Play Store)
eas build --platform android --profile production
```

### Acceptance Criteria
- [ ] 60fps maintained on mid-range Android during vehicle drag
- [ ] No TypeScript errors — `tsc --noEmit` passes clean
- [ ] App tested on Android 9+ and iOS 14+
- [ ] Level progress correctly persists across restarts

---

## Summary Table

| Milestone | Week | Core Deliverable | AI Prompt Needed |
|-----------|------|-----------------|-----------------|
| 1 — Scaffold | 1 | Project + Navigation + Types | No |
| 2 — Grid Rendering | 1–2 | `buildOccupancyMap()`, Vehicle + Grid UI | `buildOccupancyMap` |
| 3 — Movement Engine | 2 | `canMove()`, `slideVehicle()`, `checkEscape()` | `canMove`, `checkEscape` |
| 4 — Gesture & Animation | 2–3 | `<DraggableVehicle>` with axis lock | `DraggableVehicle` component |
| 5 — Zustand Store | 3 | Full game store with all actions | `moveVehicle`, `escapeVehicle`, `undoMove` |
| 6 — Win & Scoring | 3–4 | Star rating + MMKV persistence | No |
| 7 — BFS Hints | 4 | `findOptimalMove()` BFS solver | `findOptimalMove` |
| 8 — Polish | 5 | Haptics, audio, confetti, stuck detection | `isStuck` |
| 9 — Level Design | 4–5 | 20+ levels + undo system | No |
| 10 — QA & Release | 6–8 | 60fps verified, signed build | No |
