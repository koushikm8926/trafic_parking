# Milestone 1: Prototype — Draggable Cars

## Goal
Establish the foundational game elements: a static grid and draggable vehicles that respect grid constraints and axis restrictions.

## Tasks

### 1. Project Initialization
- [ ] Bootstrap the Expo project.
- [ ] Install and link all required game dependencies (e.g., `react-native-game-engine`, `react-native-reanimated`, `react-native-gesture-handler`, etc.).
- [ ] Configure `babel.config.js` for Reanimated.
- [ ] Wrap the root `App` component in `GestureHandlerRootView` to ensure proper gesture handling.

### 2. Grid System Foundation
- [ ] Implement `gridUtils.ts` to calculate `CELL_SIZE` and grid offsets dynamically based on the device's screen size (reserving a 4% margin).
- [ ] Create the `GameGrid` component to render the static 6x6 puzzle board accurately based on hardcoded level data.
- [ ] Setup the initial hardcoded JSON level data schema to render the board correctly.

### 3. Vehicle Components & Gesture Controls
- [ ] Create the `Vehicle` component using `react-native-reanimated`.
- [ ] Implement robust `PanGesture` handling:
  - **Axis Lock:** Ensure horizontal cars strictly move horizontally, and vertical cars move vertically.
  - **Grid Snapping:** Vehicles should snap to the nearest grid cell upon gesture release, rather than during the drag.
  - **Clamping:** Prevent vehicles from being dragged outside the boundaries of the 6x6 grid.

## Checkpoint Success Condition
Two car entities can successfully slide along their respective axes on a real device, snap properly to the grid, and will not move or bleed outside of the game bounds.
