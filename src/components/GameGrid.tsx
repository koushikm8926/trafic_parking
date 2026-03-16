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
          if (cell === 2) {
            backgroundColor = '#333'; // Wall
          } else if (cell === 3) {
            backgroundColor = '#aaf'; // Exit
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
              ]}
            />
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
