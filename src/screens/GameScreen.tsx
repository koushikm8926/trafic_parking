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
  const hintTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // SharedValues for the UI thread (worklets)
  const vehiclesSV: SharedValue<VehicleData[]> = useSharedValue(vehicles);
  const occupancyMapSV: SharedValue<Record<string, string>> = useSharedValue({});
  const backgroundGridSV: SharedValue<CellValue[][]> = useSharedValue(initialLevel?.backgroundGrid || []);

  // Initialize level
  useEffect(() => {
    initLevel(levelId);
  }, [levelId, initLevel]);

  // Sync SharedValues with Store State
  useEffect(() => {
    vehiclesSV.value = vehicles;
    if (initialLevel) {
      occupancyMapSV.value = buildOccupancyMap(vehicles, initialLevel.gridWidth, initialLevel.gridHeight);
      backgroundGridSV.value = initialLevel.backgroundGrid;
    }
  }, [vehicles, initialLevel, vehiclesSV, occupancyMapSV, backgroundGridSV]);

  // Win Detection
  useEffect(() => {
    if (isWin) {
      navigation.replace('Win', { levelId, moves: moveCount, stars: 3 });
    }
  }, [isWin, levelId, moveCount, navigation]);

  const cellSize = useMemo(() => {
    if (!initialLevel) return 0;
    return (screenWidth - 40) / initialLevel.gridWidth;
  }, [initialLevel]);

  const handleCommitMove = useCallback((id: string, dx: number, dy: number) => {
    moveVehicle(id, dx, dy);
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
    backgroundColor: '#1E1E2C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
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
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerButton: {
    flex: 0.45,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerButtonText: {
    color: '#FFF',
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
});

