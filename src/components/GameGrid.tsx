import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GridMetrics } from '../utils/gridUtils';

interface Props {
  backgroundGrid: number[][];
  metrics: GridMetrics;
}

const GameGrid = memo(({ backgroundGrid, metrics }: Props) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: metrics.cellWidth * metrics.gridWidth,
          height: metrics.cellHeight * metrics.gridHeight,
          left: metrics.offsetX,
          top: metrics.offsetY,
        },
      ]}
      pointerEvents="none"
    >
      {/* Parking lot cells with black grid lines */}
      {backgroundGrid.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          let isExit = cell === 3;
          let isWall = cell === 2;

          return (
            <View
              key={`${rIndex}-${cIndex}`}
              style={[
                styles.cell,
                {
                  width: metrics.cellWidth,
                  height: metrics.cellHeight,
                  left: cIndex * metrics.cellWidth,
                  top: rIndex * metrics.cellHeight,
                },
                isWall && styles.wallCell,
                isExit && styles.exitCell,
              ]}
            />
          );
        })
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#E0E0E0', // Light grey background
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000000',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#000000', // Black grid lines
  },
  wallCell: {
    backgroundColor: '#999999', // Slightly darker for walls
  },
  exitCell: {
    backgroundColor: '#D1E8E2', // Light teal for exit
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default GameGrid;
