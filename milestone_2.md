# Milestone 2: Game Logic & Feedback

## Goal
Implement core game mechanics including win condition detection, move tracking, sound feedback, and level completionUI. Make the game fully playable with proper state management.

## Tasks

### 1. Win Condition System
- [ ] Detect when the target vehicle reaches the exit position
- [ ] Trigger win state immediately upon successful exit
- [ ] Prevent further vehicle movement after win
- [ ] Calculate star rating based on moves vs. optimal solution

### 2. Move Counter & Tracking
- [ ] Track and display the current move count in the UI
- [ ] Increment move counter only on valid (non-zero) moves
- [ ] Show optimal move count (minMoves) for player reference
- [ ] Display star thresholds for the current level

### 3. Sound System
- [ ] Set up `expo-av` Audio system
- [ ] Create sound effects for:
  - Vehicle slide/move
  - Win/completion celebration
  - Invalid move/collision (optional)
- [ ] Implement sound manager utility for loading and playing sounds
- [ ] Add mute/unmute toggle functionality

### 4. State Management with Zustand
- [ ] Create game store to manage:
  - Current level state
  - Move history
  - Sound preferences (muted/unmuted)
  - Level progress tracking
- [ ] Implement actions for:
  - Moving vehicles
  - Resetting level
  - Completing level
  - Loading next level

### 5. Level Completion UI
- [ ] Create completion modal/screen showing:
  - Moves taken
  - Stars earned
  - "Next Level" button
  - "Retry" button
- [ ] Animate modal entrance
- [ ] Show star rating visually (filled/unfilled stars)

### 6. Persistent Storage
- [ ] Use `react-native-mmkv` to save:
  - Completed levels with best scores
  - Sound preferences
  - Current/unlocked levels
- [ ] Load saved progress on app startup
- [ ] Update storage when level is completed with better score

### 7. UI Enhancements
- [ ] Create header component showing:
  - Level number
  - Move counter
  - Reset button
  - Sound toggle button
- [ ] Add visual feedback for invalid moves
- [ ] Improve overall layout and styling

## Checkpoint Success Condition
Player can complete level_001 by sliding the target vehicle to the exit, see their move count, earn stars based on performance, hear sound feedback, and have their progress saved. The game should properly detect win conditions and present a completion screen with options to retry or proceed.
