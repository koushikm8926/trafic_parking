import { Audio } from 'expo-av';

export type SoundType = 'move' | 'win' | 'invalid' | 'escape';

const soundFiles: Record<SoundType, any> = {
  move: require('../assets/sounds/move.wav'),
  win: require('../assets/sounds/move.wav'),
  invalid: require('../assets/sounds/move.wav'),
  escape: require('../assets/sounds/move.wav'), // Placeholder if escape sound not separate
};

class SoundManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isLoaded: boolean = false;

  async loadSounds() {
    if (this.isLoaded) return;

    try {
      const loadPromises = Object.entries(soundFiles).map(async ([key, source]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(source);
          this.sounds.set(key as SoundType, sound);
        } catch (e) {
          console.warn(`Failed to load sound: ${key}`, e);
        }
      });

      await Promise.all(loadPromises);
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async playSound(type: SoundType) {
    try {
      const sound = this.sounds.get(type);
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.warn(`Error playing sound ${type}:`, error);
    }
  }

  async unloadSounds() {
    const unloadPromises = Array.from(this.sounds.values()).map(sound => sound.unloadAsync());
    await Promise.all(unloadPromises);
    this.sounds.clear();
    this.isLoaded = false;
  }
}

export const soundManager = new SoundManager();
