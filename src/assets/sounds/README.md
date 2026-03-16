# Sound Assets

This directory should contain the following sound files for the game:

## Required Sound Files

### 1. move.mp3 (or move.wav)
- **Purpose:** Plays when a vehicle successfully moves
- **Characteristics:** Short sliding/swoosh sound (100-300ms)
- **Suggested tone:** Smooth, satisfying slide sound

### 2. win.mp3 (or win.wav)
- **Purpose:** Plays when level is completed
- **Characteristics:** Celebration/victory sound (1-2 seconds)
- **Suggested tone:** Uplifting, positive completion jingle

### 3. invalid.mp3 (or invalid.wav)
- **Purpose:** Plays when attempting an invalid move (blocked)
- **Characteristics:** Short bump/click sound (50-150ms)
- **Suggested tone:** Subtle thud or gentle error tone

## How to Add Sound Files

1. Place your .mp3 or .wav files in this directory
2. Update `/src/utils/soundManager.ts`:
   - Uncomment the `require()` statements in the `soundFiles` object
   - Match the filenames to your actual sound files
   
Example:
```typescript
const soundFiles: Record<SoundType, any> = {
  move: require('../assets/sounds/move.mp3'),
  win: require('../assets/sounds/win.mp3'),
  invalid: require('../assets/sounds/invalid.mp3'),
};
```

## Where to Find Sound Effects

- **Free Resources:**
  - Freesound.org
  - Zapsplat.com
  - Mixkit.co
  - Free Music Archive

- **Premium Resources:**
  - Epidemic Sound
  - AudioJungle
  - Soundstripe

## Notes

- Keep file sizes small (< 100KB per sound)
- Use .mp3 format for compatibility
- Test sounds on both iOS and Android
- Consider adding volume levels in soundManager if needed
