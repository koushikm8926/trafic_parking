import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getSoundEnabled,
  setSoundEnabled,
  getHapticsEnabled,
  setHapticsEnabled,
  clearAllStorage,
} from '../utils/storage';
import { GameHaptics } from '../utils/haptics';

interface Props {
  navigation: any;
}

export default function SettingsScreen({ navigation }: Props) {
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled());
  const [hapticsEnabled, setHapticsEnabledState] = useState(getHapticsEnabled());
  
  const handleToggleSound = (value: boolean) => {
    setSoundEnabledState(value);
    setSoundEnabled(value);
    GameHaptics.buttonPress(hapticsEnabled);
  };
  
  const handleToggleHaptics = (value: boolean) => {
    setHapticsEnabledState(value);
    setHapticsEnabled(value);
    GameHaptics.buttonPress(value);
  };
  
  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'Are you sure you want to delete all your progress? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearAllStorage();
            Alert.alert('Success', 'All progress has been reset.');
            navigation.navigate('Home');
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for moves and events
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibration feedback for actions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetProgress}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>Reset All Progress</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Traffic Parking</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A challenging puzzle game where you slide vehicles to clear a path for your car to escape.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#333',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D85A30',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
