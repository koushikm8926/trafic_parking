import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, { top: '10%', right: '15%', width: 100, height: 100 }]} />
        <View style={[styles.bgCircle, { bottom: '25%', left: '10%', width: 140, height: 140 }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Enhanced Header */}
        <View style={styles.headerOuter}>
          <LinearGradient
            colors={['rgba(0,217,255,0.15)', 'rgba(0,180,216,0.1)', 'rgba(0,150,199,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F', '#D63447']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backButtonText}>←</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.headerEmoji}>⚙️</Text>
              <Text style={styles.headerTitle}>SETTINGS</Text>
            </View>
            
            <View style={styles.placeholder} />
          </LinearGradient>
        </View>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 AUDIO</Text>
          
          <LinearGradient
            colors={['rgba(0,217,255,0.12)', 'rgba(0,180,216,0.08)']}
            style={styles.settingRow}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for moves and events
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#555', true: '#4CAF50' }}
              thumbColor="#fff"
              ios_backgroundColor="#555"
            />
          </LinearGradient>
        </View>
        
        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📳 FEEDBACK</Text>
          
          <LinearGradient
            colors={['rgba(0,217,255,0.12)', 'rgba(0,180,216,0.08)']}
            style={styles.settingRow}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibration feedback for actions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#555', true: '#9C27B0' }}
              thumbColor="#fff"
              ios_backgroundColor="#555"
            />
          </LinearGradient>
        </View>
        
        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 DATA</Text>
          
          <TouchableOpacity
            style={styles.dangerButtonWrapper}
            onPress={handleResetProgress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.25)', 'rgba(244, 67, 54, 0.15)']}
              style={styles.dangerButton}
            >
              <Text style={styles.dangerIcon}>⚠️</Text>
              <Text style={styles.dangerButtonText}>Reset All Progress</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>
          
          <LinearGradient
            colors={['rgba(0,217,255,0.15)', 'rgba(0,180,216,0.1)', 'rgba(0,150,199,0.05)']}
            style={styles.aboutCard}
          >
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>🚗</Text>
            </View>
            <Text style={styles.aboutTitle}>TRAFFIC PARKING</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.aboutVersion}>v1.0.0</Text>
            </View>
            <Text style={styles.aboutDescription}>
              A challenging puzzle game where you slide vehicles to clear a path for your car to escape. Master each level with optimal moves!
            </Text>
          </LinearGradient>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 217, 255, 0.06)',
  },
  safeArea: {
    flex: 1,
  },
  headerOuter: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 24,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00D9FF',
    marginBottom: 14,
    letterSpacing: 2,
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 18,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  dangerButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(244, 67, 54, 0.5)',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerButton: {
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dangerIcon: {
    fontSize: 20,
  },
  dangerButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aboutCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  appIconText: {
    fontSize: 38,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00FF88',
    marginBottom: 10,
    letterSpacing: 2,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aboutVersion: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '800',
    letterSpacing: 1,
  },
  aboutDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});
