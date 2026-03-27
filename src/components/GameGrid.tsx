import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CellValue } from '../types';
import { HintMove } from '../utils/hintSystem';

interface Props {
  gridWidth: number;
  gridHeight: number;
  backgroundGrid: CellValue[][];
  cellSize: number;
  activeHint?: HintMove | null;
}

export const GameGrid: React.FC<Props> = ({
  gridWidth,
  gridHeight,
  backgroundGrid,
  cellSize,
  activeHint
}) => {
  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cellValue = backgroundGrid[y][x];
        cells.push(
          <View
            key={`cell-${x}-${y}`}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                top: y * cellSize,
                left: x * cellSize,
              },
              cellValue === 2 && styles.wallCell,
              cellValue === 1 && styles.roadCell,
            ]}
          >
            {cellValue === 2 && <Text style={styles.cellIcon}>🚧</Text>}
            {cellValue === 1 && (
              <View style={styles.roadMarkings}>
                <View style={styles.roadMarking} />
              </View>
            )}
          </View>
        );
      }
    }
    return cells;
  };

  const renderHint = () => {
    if (!activeHint) return null;

    // We don't have the vehicle data here to calculate the exact cells,
    // but we can just show a general "Hint Active" indicator or 
    // we could pass the vehicle from GameScreen if we wanted to be precise.
    // For now, let's just add a subtly different style to the whole grid 
    // or wait... GameScreen has the vehicles.
    return null;
  };

  return (
    <View style={[styles.gridContainer, { width: gridWidth * cellSize, height: gridHeight * cellSize }]}>
      {/* Full-width road bars for top and bottom */}
      <View style={[styles.roadCell, { position: 'absolute', top: 0, left: -1000, right: -1000, height: cellSize }]} pointerEvents="none" />
      <View style={[styles.roadCell, { position: 'absolute', top: (gridHeight - 1) * cellSize, left: -1000, right: -1000, height: cellSize }]} pointerEvents="none" />
      
      {renderCells()}
      {activeHint && (
        <View style={[StyleSheet.absoluteFill, styles.hintOverlay]} pointerEvents="none" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: '#b6b6b6',
    borderRadius: 20,
    overflow: 'visible', // Changed from 'hidden' to 'visible'
    position: 'relative',
    borderWidth: 3,
    borderColor: '#CCCCCC',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cell: {
    position: 'absolute',
    borderWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallCell: {
    backgroundColor: '#E0E0E0',
  },
  roadCell: {
    backgroundColor: '#333333', // Dark asphalt color
  },
  roadMarkings: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadMarking: {
    width: '40%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
  cellIcon: {
    fontSize: 16,
  },
  hintOverlay: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    borderWidth: 3,
    borderColor: '#FFCC00',
    borderRadius: 18,
  },
});
