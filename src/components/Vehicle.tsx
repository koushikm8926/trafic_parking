import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { VehicleData } from '../types';

interface Props {
  vehicle: VehicleData;
  cellSize: number;
}

export const Vehicle: React.FC<Props> = ({ vehicle, cellSize }) => {
  const isHorizontal = vehicle.direction === 'horizontal';

  return (
    <View
      style={[
        styles.vehicle,
        {
          width: isHorizontal ? vehicle.length * cellSize - 4 : cellSize - 4,
          height: isHorizontal ? cellSize - 4 : vehicle.length * cellSize - 4,
          top: vehicle.y * cellSize + 2,
          left: vehicle.x * cellSize + 2,
          backgroundColor: vehicle.color,
        },
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.idText}>{vehicle.id.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  vehicle: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow/Elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inner: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  idText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.6,
  },
});
