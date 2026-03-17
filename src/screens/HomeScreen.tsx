import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Circle, Ellipse, Path, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';
import { getTotalStars, getCurrentLevelId } from '../utils/storage';
import { getTotalLevels } from '../levels';
import HelpModal from '../components/HelpModal';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

// Mini car decoration for home screen
const MiniCar = ({ x, y, color, rotation }: { x: number; y: number; color: string; rotation: number }) => (
  <View style={[styles.miniCar, { left: x, top: y, transform: [{ rotate: `${rotation}deg` }] }]}>
    <Svg width={30} height={16} viewBox="0 0 30 16">
      <Rect x={1} y={1} width={28} height={14} rx={5} fill={color} />
      <Rect x={18} y={3} width={8} height={10} rx={3} fill="rgba(135,206,235,0.6)" />
      <Circle cx={7} cy={2} r={2.5} fill="#333" />
      <Circle cx={22} cy={2} r={2.5} fill="#333" />
      <Circle cx={7} cy={14} r={2.5} fill="#333" />
      <Circle cx={22} cy={14} r={2.5} fill="#333" />
      <Ellipse cx={29} cy={5} rx={1.5} ry={2} fill="#FFFDE7" />
      <Ellipse cx={29} cy={11} rx={1.5} ry={2} fill="#FFFDE7" />
    </Svg>
  </View>
);

export default function HomeScreen({ navigation }: Props) {
  const totalStars = getTotalStars();
  const currentLevel = getCurrentLevelId();
  const totalLevels = getTotalLevels();
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <LinearGradient
      colors={['#87CEEB', '#B0C4DE', '#8B9DAF', '#5D6B7A', '#4A4A4A', '#3D3D3D']}
      locations={[0, 0.15, 0.3, 0.45, 0.65, 1]}
      style={styles.container}
    >
      {/* Decorative cars in background */}
      <MiniCar x={width * 0.1} y={120} color="#D85A30" rotation={15} />
      <MiniCar x={width * 0.75} y={180} color="#534AB7" rotation={-10} />
      <MiniCar x={width * 0.15} y={500} color="#0F6E56" rotation={5} />
      <MiniCar x={width * 0.7} y={560} color="#1976D2" rotation={-20} />
      
      {/* Parking lot lines in background */}
      <View style={styles.bgLines}>
        <View style={[styles.bgLine, { top: '30%', width: '60%', left: '20%' }]} />
        <View style={[styles.bgLine, { top: '50%', width: '40%', left: '30%' }]} />
        <View style={[styles.bgLine, { top: '70%', width: '50%', left: '25%' }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top Action Buttons */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => navigation.navigate('Achievements')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.topButtonGradient}
              >
                <Text style={styles.topButtonText}>🏆</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => navigation.navigate('Statistics')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.topButtonGradient}
              >
                <Text style={styles.topButtonText}>📊</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => setShowHelp(true)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.topButtonGradient}
              >
                <Text style={styles.topButtonText}>❓</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.topButtonGradient}
              >
                <Text style={styles.topButtonText}>⚙️</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Logo & Title – License Plate Style */}
          <View style={styles.logoContainer}>
            <View style={styles.licensePlate}>
              <View style={styles.plateInner}>
                <Text style={styles.plateEmoji}>🚗</Text>
              </View>
            </View>
            <Text style={styles.title}>TRAFFIC</Text>
            <Text style={styles.titleSecond}>PARKING</Text>
            <View style={styles.subtitleBadge}>
              <Text style={styles.subtitle}>PUZZLE CHALLENGE</Text>
            </View>
          </View>
          
          {/* Stats - Dashboard Style */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.05)']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statEmoji}>⭐</Text>
                <Text style={styles.statValue}>{totalStars}</Text>
                <Text style={styles.statLabel}>STARS</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(76,175,80,0.15)', 'rgba(76,175,80,0.05)']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statValue}>{currentLevel}/{totalLevels}</Text>
                <Text style={styles.statLabel}>LEVEL</Text>
              </LinearGradient>
            </View>
          </View>
          
          {/* Main Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButtonWrapper}
              onPress={() => navigation.navigate('LevelSelect')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#43A047', '#2E7D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>🚦  START DRIVING</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButtonWrapper}
              onPress={() => navigation.navigate('Game', { levelId: currentLevel })}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>▶️  CONTINUE LEVEL {currentLevel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>TRAFFIC PARKING v1.0.0</Text>
          </View>
        </View>
      </SafeAreaView>
      
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
  },
  miniCar: {
    position: 'absolute',
    opacity: 0.15,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  topButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  topButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonText: {
    fontSize: 22,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  licensePlate: {
    padding: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#BDBDBD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  plateInner: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  plateEmoji: {
    fontSize: 38,
  },
  title: {
    fontSize: 50,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  titleSecond: {
    fontSize: 50,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: 5,
    marginTop: -6,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitleBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  subtitle: {
    fontSize: 12,
    color: '#FFF',
    letterSpacing: 3,
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
    justifyContent: 'center',
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  statEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 14,
    marginTop: 5,
  },
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButton: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerLine: {
    width: 180,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '700',
    letterSpacing: 2,
  },
});
