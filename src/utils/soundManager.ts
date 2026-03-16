// Sound types
export type SoundType = 'move' | 'win' | 'invalid';

// Try to import expo-av, but gracefully handle if it's not available
let Audio: any = null;
let Sound: any = null;
let audioAvailable = false;

try {
  const expoAV = require('expo-av');
  Audio = expoAV.Audio;
  Sound = expoAV.Sound;
  audioAvailable = true;
} catch (error) {
  console.warn('expo-av not available, sound will be disabled');
  audioAvailable = false;
}

// Sound instances cache
const soundObjects: Record<SoundType, any> = {
  move: null,
  win: null,
  invalid: null,
};

// Sound file paths - Replace these with actual sound files
const soundFiles: Record<SoundType, any> = {
  // TODO: Add actual sound files to src/assets/sounds/
  // For now, these are placeholders - you'll need to add .mp3/.wav files
  move: null, // require('../assets/sounds/move.mp3'),
  win: null,  // require('../assets/sounds/win.mp3'),
  invalid: null, // require('../assets/sounds/invalid.mp3'),
};

/**
 * Initialize the sound system
 * Should be called once at app startup
 */
export async function initSounds(): Promise<void> {
  if (!audioAvailable || !Audio) {
    console.log('Sounds disabled: expo-av not available');
    return;
  }
  
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    // Preload all sounds
    for (const [type, file] of Object.entries(soundFiles)) {
      if (file) {
        const { sound } = await Audio.Sound.createAsync(file);
        soundObjects[type as SoundType] = sound;
      }
    }
  } catch (error) {
    console.warn('Failed to initialize sounds:', error);
  }
}

/**
 * Play a sound effect
 * @param type The type of sound to play
 * @param isSoundEnabled Whether sound is currently enabled
 */
export async function playSound(type: SoundType, isSoundEnabled: boolean = true): Promise<void> {
  if (!audioAvailable || !isSoundEnabled) return;
  
  const sound = soundObjects[type];
  if (!sound) {
    // console.warn(`Sound ${type} not loaded`);
    return;
  }
  
  try {
    // Replay from start
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (error) {
    console.warn(`Failed to play sound ${type}:`, error);
  }
}

/**
 * Clean up all sound resources
 * Call this before app unmount
 */
export async function cleanupSounds(): Promise<void> {
  if (!audioAvailable) return;
  
  for (const sound of Object.values(soundObjects)) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload sound:', error);
      }
    }
  }
}

/**
 * Mute/unmute all sounds
 * @param muted Whether to mute sounds
 */
export async function setMuted(muted: boolean): Promise<void> {
  if (!audioAvailable) return;
  
  for (const sound of Object.values(soundObjects)) {
    if (sound) {
      try {
        await sound.setVolumeAsync(muted ? 0 : 1);
      } catch (error) {
        console.warn('Failed to set volume:', error);
      }
    }
  }
}

/**
 * NOTE: To use actual sound effects:
 * 1. Add .mp3 or .wav files to src/assets/sounds/
 * 2. Uncomment the require() statements in soundFiles object above
 * 3. Replace null values with actual file paths
 * 
 * Example:
 * move: require('../assets/sounds/slide.mp3'),
 * win: require('../assets/sounds/victory.mp3'),
 * invalid: require('../assets/sounds/bump.mp3'),
 */
