import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CELL_SIZE, GRID_SIZE, GRID_OFFSET_X } from '../utils/gridUtils';

interface Props {
  backgroundGrid: number[][];
  gridOffsetY: number;
}

const GameGrid = memo(({ backgroundGrid, gridOffsetY }: Props) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: CELL_SIZE * GRID_SIZE,
          height: CELL_SIZE * GRID_SIZE,
          left: GRID_OFFSET_X,
          top: gridOffsetY,
        },
      ]}
    >
      {/* Render grid cells */}
      {backgroundGrid.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          let backgroundColor = 'transparent';
          let isExit = false;
          if (cell === 2) {
            backgroundColor = '#333'; // Wall
          } else if (cell === 3) {
            backgroundColor = '#4CAF50'; // Exit - bright green
            isExit = true;
          }

          return (
            <View
              key={`${rIndex}-${cIndex}`}
              style={[
                styles.cell,
                {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: cIndex * CELL_SIZE,
                  top: rIndex * CELL_SIZE,
                  backgroundColor,
                },
                isExit && styles.exitCell,
              ]}
            >
              {isExit && (
                <View style={styles.exitArrow}>
                  <View style={styles.exitLabel}>
                    <View style={styles.exitArrowShape} />
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
      
      {/* Grid Border overlay (optional for visuals) */}
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`gridlines-${i}`}>
          <View
            style={[
              styles.horizontalLine,
              { top: i * CELL_SIZE, width: CELL_SIZE * GRID_SIZE },
            ]}
          />
          <View
            style={[
              styles.verticalLine,
              { left: i * CELL_SIZE, height: CELL_SIZE * GRID_SIZE },
            ]}
          />
        </React.Fragment>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#eee', // Board background
  },
  cell: {
    position: 'absolute',
  },
  exitCell: {
    borderWidth: 3,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  exitArrow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitArrowShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: '#FFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#ccc',
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#ccc',
  },
});

export default GameGrid;
