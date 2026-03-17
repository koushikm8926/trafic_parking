import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Circle, Ellipse, Path, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';
import { getTotalStars, getCurrentLevelId } from '../utils/storage';
import { getTotalLevels } from '../levels';
import HelpModal from '../components/HelpModal';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

// Animated floating car decoration
const FloatingCar = ({ x, y, color, rotation, delay }: { x: number; y: number; color: string; rotation: number; delay: number }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);
  
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  
  return (
    <Animated.View style={[styles.miniCar, { left: x, top: y, transform: [{ translateY }, { rotate: `${rotation}deg` }] }]}>
      <Svg width={35} height={18} viewBox="0 0 35 18">
        <Defs>
          <SvgGradient id={`carGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.7" />
          </SvgGradient>
        </Defs>
        <Rect x={2} y={2} width={30} height={14} rx={6} fill={`url(#carGrad-${color})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
        <Rect x={20} y={4} width={9} height={10} rx={3} fill="rgba(135,206,235,0.5)" />
        <Circle cx={8} cy={3} r={2.5} fill="#2C2C2C" />
        <Circle cx={24} cy={3} r={2.5} fill="#2C2C2C" />
        <Circle cx={8} cy={15} r={2.5} fill="#2C2C2C" />
        <Circle cx={24} cy={15} r={2.5} fill="#2C2C2C" />
        <Ellipse cx={31} cy={6} rx={1.5} ry={2} fill="#FFF9C4" opacity="0.9" />
        <Ellipse cx={31} cy={12} rx={1.5} ry={2} fill="#FFF9C4" opacity="0.9" />
      </Svg>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }: Props) {
  const totalStars = getTotalStars();
  const currentLevel = getCurrentLevelId();
  const totalLevels = getTotalLevels();
  const [showHelp, setShowHelp] = useState(false);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulse animation for primary button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Animated background overlay */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.bgCircle, { top: '10%', left: '10%', width: 200, height: 200 }]} />
        <View style={[styles.bgCircle, { top: '60%', right: '10%', width: 150, height: 150 }]} />
      </View>
      
      {/* Decorative floating cars */}
      <FloatingCar x={width * 0.1} y={120} color="#FF6B6B" rotation={15} delay={0} />
      <FloatingCar x={width * 0.75} y={180} color="#4ECDC4" rotation={-10} delay={500} />
      <FloatingCar x={width * 0.15} y={height * 0.65} color="#95E1D3" rotation={5} delay={1000} />
      <FloatingCar x={width * 0.7} y={height * 0.72} color="#F38181" rotation={-20} delay={1500} />
      
      {/* Parking lot accent lines */}
      <View style={styles.bgLines}>
        <View style={[styles.bgLine, { top: '28%', width: '65%', left: '17.5%' }]} />
        <View style={[styles.bgLine, { top: '48%', width: '45%', left: '27.5%' }]} />
        <View style={[styles.bgLine, { top: '68%', width: '55%', left: '22.5%' }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top Action Buttons */}
          <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => navigation.navigate('Achievements')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
                colors={['#4CAF50', '#45a049', '#388E3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
                colors={['#2196F3', '#1976D2', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
                colors={['#9C27B0', '#7B1FA2', '#6A1B9A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topButtonGradient}
              >
                <Text style={styles.topButtonText}>⚙️</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Logo & Title – Premium Style */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
            <View style={styles.licensePlate}>
              <LinearGradient
                colors={['#FFFFFF', '#E8E8E8']}
                style={styles.plateInner}
              >
                <Text style={styles.plateEmoji}>🚗</Text>
              </LinearGradient>
            </View>
            <View style={styles.titleGlow}>
              <Text style={styles.title}>TRAFFIC</Text>
              <Text style={styles.titleSecond}>PARKING</Text>
            </View>
            <LinearGradient
              colors={['#FF6B6B', '#EE5A6F', '#D63447']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subtitleBadge}
            >
              <Text style={styles.subtitle}>⚡ PUZZLE CHALLENGE ⚡</Text>
            </LinearGradient>
          </Animated.View>
          
          {/* Stats - Premium Dashboard */}
          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255,215,0,0.25)', 'rgba(255,165,0,0.15)', 'rgba(255,140,0,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconWrapper}>
                  <Text style={styles.statEmoji}>⭐</Text>
                </View>
                <Text style={styles.statValue}>{totalStars}</Text>
                <Text style={styles.statLabel}>STARS</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(76,175,80,0.25)', 'rgba(69,160,73,0.15)', 'rgba(56,142,60,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconWrapper}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </View>
                <Text style={styles.statValue}>{currentLevel}/{totalLevels}</Text>
                <Text style={styles.statLabel}>LEVEL</Text>
              </LinearGradient>
            </View>
          </Animated.View>
          
          {/* Main Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <Animated.View style={[styles.primaryButtonWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LevelSelect')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#00D9FF', '#00B4D8', '#0096C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <View style={styles.buttonShine} />
                  <Text style={styles.primaryButtonText}>🎮 START GAME</Text>
                  <View style={styles.buttonBorder} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.secondaryButtonWrapper}
              onPress={() => navigation.navigate('Game', { levelId: currentLevel })}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>▶️  CONTINUE LEVEL {currentLevel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>TRAFFIC PARKING v1.0</Text>
          </Animated.View>
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
  backgroundPattern: {
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
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
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
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  miniCar: {
    position: 'absolute',
   opacity: 0.2,
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
    gap: 12,
    zIndex: 10,
  },
  topButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  topButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topButtonText: {
    fontSize: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  licensePlate: {
    padding: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#424242',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  plateInner: {
    width: 90,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1976D2',
  },
  plateEmoji: {
    fontSize: 42,
  },
  titleGlow: {
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleSecond: {
    fontSize: 56,
    fontWeight: '900',
    color: '#00FF88',
    letterSpacing: 6,
    marginTop: -8,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitleBadge: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#FFF',
    letterSpacing: 3,
    fontWeight: '900',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 45,
    justifyContent: 'center',
  },
  statCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statCardGradient: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    minWidth: 130,
  },
  statIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '900',
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 16,
    marginTop: 10,
  },
  primaryButtonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButton: {
    paddingVertical: 22,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  secondaryButtonWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerLine: {
    width: 200,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    letterSpacing: 2.5,
  },
});
