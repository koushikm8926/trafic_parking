import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CELL_WIDTH, CELL_HEIGHT, GRID_SIZE, GRID_OFFSET_X } from '../utils/gridUtils';

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
          width: CELL_WIDTH * GRID_SIZE,
          height: CELL_HEIGHT * GRID_SIZE,
          left: GRID_OFFSET_X,
          top: gridOffsetY,
        },
      ]}
      pointerEvents="none"
    >
      {/* Parking lot cells with lines */}
      {backgroundGrid.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          let cellStyle = styles.parkingSpace;
          let isExit = false;
          let isWall = false;
          
          if (cell === 2) {
            isWall = true; // Wall/obstacle
          } else if (cell === 3) {
            isExit = true; // Exit
          }

          return (
            <View
              key={`${rIndex}-${cIndex}`}
              style={[
                styles.cell,
                {
                  width: CELL_WIDTH,
                  height: CELL_HEIGHT,
                  left: cIndex * CELL_WIDTH,
                  top: rIndex * CELL_HEIGHT,
                },
                !isWall && !isExit && cellStyle,
                isWall && styles.wallCell,
                isExit && styles.exitCell,
              ]}
            >
              {/* Parking space markings */}
              {!isWall && !isExit && (
                <>
                  <View style={styles.parkingLineTop} />
                  <View style={styles.parkingLineLeft} />
                </>
              )}
              
              {/* Exit arrow and markings */}
              {isExit && (
                <View style={styles.exitContainer}>
                  <View style={styles.exitArrow}>
                    <View style={styles.exitArrowShape} />
                  </View>
                  <View style={styles.exitText}>
                    <View style={styles.exitLineTop} />
                    <View style={styles.exitLineBottom} />
                  </View>
                </View>
              )}
              
              {/* Wall/Obstacle */}
              {isWall && (
                <View style={styles.wallPattern}>
                  <View style={styles.wallStripe} />
                  <View style={[styles.wallStripe, styles.wallStripe2]} />
                </View>
              )}
            </View>
          );
        })
      )}
      
      {/* Outer border */}
      <View style={styles.borderFrame} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#2d2d2d', // Darker asphalt
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  cell: {
    position: 'absolute',
    backgroundColor: '#3A3A3A', // Parking space color
  },
  parkingSpace: {
    backgroundColor: '#373737',
  },
  parkingLineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFD700', // Bright yellow parking line
    opacity: 0.9,
  },
  parkingLineLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    backgroundColor: '#FFD700',
    opacity: 0.9,
  },
  wallCell: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  wallPattern: {
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 6,
  },
  wallStripe: {
    height: 4,
    backgroundColor: '#FFD700',
    opacity: 0.7,
    borderRadius: 2,
  },
  wallStripe2: {
    opacity: 0.5,
  },
  exitCell: {
    backgroundColor: '#27AE60',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  exitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitArrowShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 0,
    borderTopWidth: 20,
    borderBottomWidth: 20,
    borderLeftColor: '#FFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  exitText: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
  },
  exitLineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFF',
  },
  exitLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFF',
  },
  borderFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 10,
  },
});

export default GameGrid;
