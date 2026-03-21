import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CellValue } from '../types';

interface Props {
  gridWidth: number;
  gridHeight: number;
  backgroundGrid: CellValue[][];
  cellSize: number;
}

export const GameGrid: React.FC<Props> = ({ gridWidth, gridHeight, backgroundGrid, cellSize }) => {
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
              cellValue === 3 && styles.exitCell,
            ]}
          >
            {cellValue === 2 && <Text style={styles.cellIcon}>🚧</Text>}
            {cellValue === 3 && <Text style={styles.cellIcon}>🏁</Text>}
          </View>
        );
      }
    }
    return cells;
  };

  return (
    <View style={[styles.gridContainer, { width: gridWidth * cellSize, height: gridHeight * cellSize }]}>
      {renderCells()}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: '#2A2A3C',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#3E3E5C',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallCell: {
    backgroundColor: '#3E3E5C',
  },
  exitCell: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  cellIcon: {
    fontSize: 16,
  },
});
