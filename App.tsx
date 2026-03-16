import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // Handle unhandled promise rejections to prevent crashes
  useEffect(() => {
    const handler = (event: any) => {
      // Suppress ExpoKeepAwake errors (non-critical)
      if (event?.reason?.message?.includes('ExpoKeepAwake')) {
        event.preventDefault();
        return;
      }
      console.warn('Unhandled promise rejection:', event?.reason);
    };
    
    // @ts-ignore - addEventListener exists on global in React Native
    global.addEventListener?.('unhandledrejection', handler);
    
    return () => {
      // @ts-ignore
      global.removeEventListener?.('unhandledrejection', handler);
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
