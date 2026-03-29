import React, { useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { getLevelById } from '../levels';
import { GameGrid } from '../components/GameGrid';
import { Vehicle } from '../components/Vehicle';
import { Guard } from '../components/Guard';
import { buildOccupancyMap } from '../utils/gridUtils';
import { useGameStore } from '../store/useGameStore';
import { VehicleData, CellValue } from '../types';
import { findOptimalMove, HintMove } from '../utils/hintSystem';
import { soundManager } from '../utils/soundManager';
import { isStuck } from '../utils/gameLogic';
import { haptics } from '../utils/haptics';

interface Props {
  navigation: any;
  route: any;
}

const { width: screenWidth } = Dimensions.get('window');
const LEVEL_TOP_IMAGE = require('../../level-top.png');

export default function GameScreen({ navigation, route }: Props) {
  const levelId = route.params?.levelId || 1;
  const initialLevel = useMemo(() => getLevelById(levelId), [levelId]);

  // Zustand Store
  const {
    vehicles,
    guards,
    moveCount,
    isWin,
    isGameOver,
    initLevel,
    moveVehicle,
    undo,
    resetLevel,
    removeEscapedVehicle,
    updateGuardPosition,
    checkGuardCollision,
  } = useGameStore();

  const [activeHint, setActiveHint] = React.useState<HintMove | null>(null);
  const [isStuckState, setIsStuckState] = React.useState(false);
  const hintTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // SharedValues for the UI thread (worklets)
  const vehiclesSV: SharedValue<VehicleData[]> = useSharedValue(vehicles);
  const occupancyMapSV: SharedValue<Record<string, string>> = useSharedValue({});
  const backgroundGridSV: SharedValue<CellValue[][]> = useSharedValue(initialLevel?.backgroundGrid || []);

  // Initialize level and load sounds
  useEffect(() => {
    initLevel(levelId);
    soundManager.loadSounds();
    return () => {
      soundManager.unloadSounds();
    };
  }, [levelId, initLevel]);

  // Sync SharedValues with Store State
  useEffect(() => {
    vehiclesSV.value = vehicles;
    if (initialLevel) {
      occupancyMapSV.value = buildOccupancyMap(vehicles, initialLevel.gridWidth, initialLevel.gridHeight);
      backgroundGridSV.value = initialLevel.backgroundGrid;
    }
  }, [vehicles, initialLevel, vehiclesSV, occupancyMapSV, backgroundGridSV]);

  // Win and Stuck Detection
  useEffect(() => {
    if (isWin) {
      soundManager.playSound('win');
      haptics.notification('success');
      navigation.replace('Win', { levelId, moves: moveCount, stars: 3 });
    } else if (initialLevel && vehicles.length > 0) {
      const stuck = isStuck(initialLevel, vehicles);
      setIsStuckState(stuck);
      if (stuck) {
        haptics.notification('warning');
      }
    }
  }, [isWin, levelId, moveCount, navigation, vehicles, initialLevel]);

  // Game Over Detection (collision with guard)
  useEffect(() => {
    if (isGameOver) {
      // soundManager.playSound('move'); // Removed as per user request
      // haptics.notification('error'); // Removed as per user request
      // Show game over after a short delay
      setTimeout(() => {
        setIsStuckState(true); // Reuse stuck overlay for now
      }, 100);
    }
  }, [isGameOver]);

  // Check collisions periodically
  useEffect(() => {
    if (guards.length === 0 || isGameOver) return;

    const interval = setInterval(() => {
      checkGuardCollision();
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [guards, vehicles, isGameOver, checkGuardCollision]);

  const cellSize = useMemo(() => {
    if (!initialLevel) return 0;
    return (screenWidth - 40) / initialLevel.gridWidth;
  }, [initialLevel]);

  const handleCommitMove = useCallback((id: string, dx: number, dy: number, isEscapeMove: boolean = false) => {
    moveVehicle(id, dx, dy);
    
    // Skip the regular 'move' sound (popping) if the car is exiting
    if (!isEscapeMove) {
      soundManager.playSound('move');
    }

    // Clear hint when a move is made
    setActiveHint(null);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
  }, [moveVehicle]);

  const handleEscapeComplete = useCallback((id: string) => {
    removeEscapedVehicle(id);
  }, [removeEscapedVehicle]);

  const handleHint = useCallback(() => {
    if (!initialLevel || vehicles.length === 0) return;

    const hint = findOptimalMove(initialLevel, vehicles);
    if (hint) {
      setActiveHint(hint);

      // Clear previous timeout if exists
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);

      // Auto-clear hint after 3 seconds
      hintTimeoutRef.current = setTimeout(() => {
        setActiveHint(null);
      }, 3000);
    }
  }, [initialLevel, vehicles]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  if (!initialLevel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={LEVEL_TOP_IMAGE}
        style={styles.headerTopImage}
        resizeMode="stretch"
      />

      <View style={styles.gameArea}>
        <View style={styles.gridWrapper}>
          <GameGrid
            gridWidth={initialLevel.gridWidth}
            gridHeight={initialLevel.gridHeight}
            backgroundGrid={initialLevel.backgroundGrid}
            cellSize={cellSize}
            activeHint={activeHint}
          />
          {vehicles.map((vehicle) => (
            <Vehicle
              key={vehicle.id}
              vehicle={vehicle}
              cellSize={cellSize}
              onCommitMove={handleCommitMove}
              onEscape={handleEscapeComplete}
              vehiclesSV={vehiclesSV}
              occupancyMapSV={occupancyMapSV}
              backgroundGridSV={backgroundGridSV}
              gridWidth={initialLevel.gridWidth}
              gridHeight={initialLevel.gridHeight}
              isHinted={activeHint?.vehicleId === vehicle.id}
            />
          ))}
          {guards.map((guard) => (
            <Guard
              key={guard.id}
              guard={guard}
              cellSize={cellSize}
              gridWidth={initialLevel.gridWidth}
              gridHeight={initialLevel.gridHeight}
              onPositionUpdate={updateGuardPosition}
            />
          ))}
          {isStuckState && !isGameOver && (
            <View style={styles.stuckOverlay} pointerEvents="none">
              <Text style={styles.stuckText}>STUCK!</Text>
              <Text style={styles.stuckSubText}>Try Undo or Reset</Text>
            </View>
          )}
          {isGameOver && (
            <View style={styles.gameOverOverlay} pointerEvents="none">
              <Text style={styles.gameOverText}>GAME OVER!</Text>
              <Text style={styles.gameOverSubText}>Hit the guard!</Text>
            </View>
          )}
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F7953',
  },
  headerTopImage: {
    width: screenWidth,
    height: 300,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    padding: 0,
  },
  gridWrapper: {
    position: 'relative',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  stuckOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  stuckText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stuckSubText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF0000',
  },
  gameOverText: {
    color: '#FFF',
    fontSize: 45,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  gameOverSubText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
});

