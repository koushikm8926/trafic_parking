import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameGrid from '../components/GameGrid';
import Vehicle from '../components/Vehicle';
import { buildOccupancyMap } from '../utils/gridUtils';
import { canMove } from '../utils/collision';
import { LevelData, VehicleData } from '../types';
import { level_001 } from '../levels/level_001';

const GRID_OFFSET_Y = 100; // Hardcoded for this milestone check

export default function GameScreen() {
  const [level] = useState<LevelData>(level_001 as LevelData);
  const [vehicles, setVehicles] = useState<VehicleData[]>(level.vehicles);

  const handleMoveCommit = useCallback((vehicleId: string, steps: number) => {
    setVehicles(currentVehicles => {
      const vehicle = currentVehicles.find(v => v.id === vehicleId);
      if (!vehicle) return currentVehicles;

      // Build map excluding the moving vehicle
      const others = currentVehicles.filter(v => v.id !== vehicleId);
      const occupancy = buildOccupancyMap(others);

      // Find max steps in requested direction
      const allowedSteps = canMove(vehicle, steps, occupancy, level.backgroundGrid);

      if (allowedSteps !== 0) {
        return currentVehicles.map(v => {
          if (v.id !== vehicleId) return v;
          return {
             ...v,
             x: v.direction === 'horizontal' ? v.x + allowedSteps : v.x,
             y: v.direction === 'vertical' ? v.y + allowedSteps : v.y,
          };
        });
      }

      return currentVehicles; // No change if blocked
    });
  }, [level]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.board}>
        <GameGrid 
          backgroundGrid={level.backgroundGrid} 
          gridOffsetY={GRID_OFFSET_Y} 
        />
        {vehicles.map(v => (
          <Vehicle
            key={v.id}
            {...v}
            gridOffsetY={GRID_OFFSET_Y}
            onMoveCommit={handleMoveCommit}
            isHinted={false}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  board: {
    flex: 1,
    position: 'relative',
  },
});
