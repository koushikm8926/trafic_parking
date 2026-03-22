import React, { useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { getLevelById } from '../levels';
import { GameGrid } from '../components/GameGrid';
import { Vehicle } from '../components/Vehicle';
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

export default function GameScreen({ navigation, route }: Props) {
  const levelId = route.params?.levelId || 1;
  const initialLevel = useMemo(() => getLevelById(levelId), [levelId]);
  
  // Zustand Store
  const { 
    vehicles, 
    moveCount, 
    isWin, 
    initLevel, 
    moveVehicle, 
    undo, 
    resetLevel 
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

  const cellSize = useMemo(() => {
    if (!initialLevel) return 0;
    return (screenWidth - 40) / initialLevel.gridWidth;
  }, [initialLevel]);

  const handleCommitMove = useCallback((id: string, dx: number, dy: number) => {
    moveVehicle(id, dx, dy);
    soundManager.playSound('move');
    // Clear hint when a move is made
    setActiveHint(null);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
  }, [moveVehicle]);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level {levelId}</Text>
        <View style={styles.moveBadge}>
           <Text style={styles.moveText}>{moveCount}</Text>
        </View>
      </View>

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
              onEscape={() => {}}
              vehiclesSV={vehiclesSV}
              occupancyMapSV={occupancyMapSV}
              backgroundGridSV={backgroundGridSV}
              gridWidth={initialLevel.gridWidth}
              gridHeight={initialLevel.gridHeight}
              isHinted={activeHint?.vehicleId === vehicle.id}
            />
          ))}
          {isStuckState && (
            <View style={styles.stuckOverlay} pointerEvents="none">
              <Text style={styles.stuckText}>STUCK!</Text>
              <Text style={styles.stuckSubText}>Try Undo or Reset</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={undo}>
          <Text style={styles.footerButtonText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerButton, styles.hintButton]} 
          onPress={handleHint}
        >
          <Text style={styles.footerButtonText}>Hint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={resetLevel}>
          <Text style={styles.footerButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#1E1E2C',
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#1E1E2C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  moveBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  moveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridWrapper: {
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerButton: {
    flex: 0.45,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButtonText: {
    color: '#1E1E2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintButton: {
    backgroundColor: '#FFCC00',
    borderColor: '#E6B800',
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
});

