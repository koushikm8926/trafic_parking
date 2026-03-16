import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HelpModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How to Play</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Goal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Goal</Text>
              <Text style={styles.text}>
                Move the <Text style={styles.highlight}>RED car with gold border ⭐</Text> to the{' '}
                <Text style={styles.highlight}>GREEN EXIT ➤</Text> on the right side of the board.
              </Text>
            </View>
            
            {/* How to Move */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👆 How to Move</Text>
              <Text style={styles.text}>
                • <Text style={styles.bold}>Drag</Text> any car with your finger{'\n'}
                • Cars can only move in their own direction{'\n'}
                • Horizontal cars move left/right only{'\n'}
                • Vertical cars move up/down only
              </Text>
            </View>
            
            {/* Identify Elements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Game Elements</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#D85A30', borderWidth: 3, borderColor: '#FFD700' }]} />
                <Text style={styles.text}>Your Car (RED with gold border ⭐)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.arrow}>➤</Text>
                </View>
                <Text style={styles.text}>Exit (GREEN with arrow)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#333' }]} />
                <Text style={styles.text}>Wall (blocks movement)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#534AB7' }]} />
                <Text style={styles.text}>Other cars (blocking)</Text>
              </View>
            </View>
            
            {/* Controls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎮 Controls</Text>
              <Text style={styles.text}>
                • <Text style={styles.bold}>‹ Back</Text> - Return to level select{'\n'}
                • <Text style={styles.bold}>💡 Hint</Text> - Get a helpful suggestion{'\n'}
                • <Text style={styles.bold}>↶ Undo</Text> - Reverse last move{'\n'}
                • <Text style={styles.bold}>↷ Redo</Text> - Redo undone move{'\n'}
                • <Text style={styles.bold}>🔊 Sound</Text> - Toggle sound on/off{'\n'}
                • <Text style={styles.bold}>↻ Reset</Text> - Restart level
              </Text>
            </View>
            
            {/* Stars */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Stars</Text>
              <Text style={styles.text}>
                Complete levels efficiently to earn stars:{'\n'}
                • 3 stars ⭐⭐⭐ - Optimal moves{'\n'}
                • 2 stars ⭐⭐ - Good moves{'\n'}
                • 1 star ⭐ - Completed
              </Text>
            </View>
            
            {/* Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Tips</Text>
              <Text style={styles.text}>
                • Plan ahead - think about which cars block your path{'\n'}
                • Use Undo freely to experiment{'\n'}
                • Use Hints if you're stuck{'\n'}
                • Clear blocking cars first
              </Text>
            </View>
          </ScrollView>
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.gotItButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#D85A30',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  legendBox: {
    width: 50,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#fff',
  },
  gotItButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
