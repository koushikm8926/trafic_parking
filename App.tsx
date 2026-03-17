import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Suppress ExpoKeepAwake errors globally
const originalErrorHandler = (global as any).ErrorUtils?.getGlobalHandler();
(global as any).ErrorUtils?.setGlobalHandler((error: any, isFatal: boolean) => {
  const errorMessage = error?.message || String(error);
  if (errorMessage.includes('ExpoKeepAwake') || 
      errorMessage.includes('activity is no longer available')) {
    // Ignore this non-critical error
    return;
  }
  if (originalErrorHandler) {
    originalErrorHandler(error, isFatal);
  }
});

export default function App() {
  // Suppress non-critical warnings
  useEffect(() => {
    LogBox.ignoreLogs([
      'ExpoKeepAwake',
      'Keep awake',
      'activity is no longer available',
      'Call to function',
    ]);
  }, []);
  
  // Handle unhandled promise rejections to prevent crashes
  useEffect(() => {
    const handler = (event: any) => {
      try {
        const reason = event?.reason;
        const message = reason?.message || reason || '';
        const errorString = typeof message === 'string' ? message : String(message);
        
        // Suppress ExpoKeepAwake errors (non-critical, happens during navigation)
        if (errorString.toLowerCase().includes('expokeepawake') || 
            errorString.toLowerCase().includes('keep-awake') ||
            errorString.toLowerCase().includes('keep awake') ||
            (errorString.includes('activate') && errorString.includes('activity is no longer available')) ||
            errorString.includes('Call to function') && errorString.includes('ExpoKeepAwake')) {
          event.preventDefault?.();
          return;
        }
        
        console.warn('Unhandled promise rejection:', reason);
      } catch (err) {
        // Silently fail if we can't parse the error
      }
    };
    
    // @ts-ignore - addEventListener exists on global in React Native
    if (global.addEventListener) {
      global.addEventListener('unhandledrejection', handler);
    }
    
    return () => {
      // @ts-ignore
      if (global.removeEventListener) {
        global.removeEventListener('unhandledrejection', handler);
      }
    };
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ 
  root: { flex: 1, backgroundColor: '#fff'} 
});
