# Milestone 3: Multiple Levels & Navigation

## Goal
Expand the game with multiple levels, implement navigation between screens, add undo/redo functionality, and create a hint system. Build a complete game experience with level progression and selection.

## Tasks

### 1. Additional Levels
- [ ] Create at least 5 more levels (level_002 to level_006)
- [ ] Increase difficulty progressively
- [ ] Different vehicle configurations and obstacles
- [ ] Vary grid layouts and exit positions
- [ ] Test each level for solvability

### 2. Navigation System
- [ ] Create Home/Menu screen
- [ ] Create Level Selection screen showing:
  - All levels with lock/unlock status
  - Stars earned for each completed level
  - Current level indicator
  - Total stars counter
- [ ] Implement navigation flow:
  - Home → Level Select → Game → Completion → Next Level or Back
- [ ] Add back button in game header

### 3. Undo/Redo System
- [ ] Implement move history stack
- [ ] Add Undo button to game header
- [ ] Add Redo button to game header
- [ ] Update move counter to not count undone moves
- [ ] Prevent undo/redo after level completion
- [ ] Visual feedback for undo/redo actions

### 4. Hint System
- [ ] Implement hint algorithm to show next optimal move
- [ ] Add Hint button to game header
- [ ] Highlight vehicle to move with pulsing animation
- [ ] Track hint usage count
- [ ] Penalize star rating if hints are used (optional)
- [ ] Limit hints per level (e.g., 3 hints max)

### 5. Enhanced UI/UX
- [ ] Add level transition animations
- [ ] Improve vehicle movement animations
- [ ] Add particle effects or celebrations on win
- [ ] Better visual feedback for invalid moves
- [ ] Loading states for level transitions
- [ ] Polished completion modal with animations

### 6. Level Progression
- [ ] Auto-unlock next level on completion
- [ ] Load next level from completion modal
- [ ] Save/load current level progress
- [ ] Return to level select from game
- [ ] Handle last level completion (show victory screen)

### 7. Settings & Polish
- [ ] Create Settings screen
- [ ] Add options for:
  - Sound toggle (already implemented)
  - Haptic feedback toggle
  - Reset all progress
  - About/Credits section
- [ ] Improve overall styling and theme
- [ ] Add app icon preparation

## Checkpoint Success Condition
Player can navigate through the app, select from multiple levels, complete them in sequence, use undo/redo to correct mistakes, get hints when stuck, and see their overall progress. The game feels complete and polished with smooth transitions and clear feedback.
