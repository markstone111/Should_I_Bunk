// mobile-app/app/_layout.tsx

import { useEffect, useRef, useState } from 'react'; // ADD useRef, keep useState
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider, useApp } from '@/context/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

// Inner component that handles navigation and renders the Stack/Tabs
// This component is a child of AppProvider, so it can safely useApp()
function MainNavigatorContent() {
  const { hasSeenOnboarding } = useApp(); // Access context here

  // --- CRITICAL FIX START ---
  // Use useRef for a flag that doesn't trigger re-renders,
  // to ensure navigation logic runs only once per state change.
  const hasNavigated = useRef(false); // Changed from useState to useRef
  // --- CRITICAL FIX END ---

  useEffect(() => {
    // This effect runs once MainNavigatorContent mounts (which means AppProvider's data is loaded).
    // `hasSeenOnboarding` here should reliably reflect the persisted state.

    // Ensure `hasSeenOnboarding` is definitively loaded and we haven't navigated yet
    // --- CRITICAL FIX START ---
    if (hasSeenOnboarding !== undefined && !hasNavigated.current) { // Access .current for useRef
      if (hasSeenOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/terms');
      }
      SplashScreen.hideAsync();
      hasNavigated.current = true; // Update .current for useRef
    }
    // --- CRITICAL FIX END ---
  }, [hasSeenOnboarding]); // Depend on hasSeenOnboarding

  // Render the Stack immediately. The navigation will happen via useEffect after
  // the component is mounted and data is ready.
  return (
    <> {/* Use a React Fragment to return multiple top-level elements */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subject/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" /> {/* MOVED HERE: Now inside the same component that returns the Stack */}
    </>
  );
}

// Top-level layout. This will satisfy Expo Router as it returns Providers.
// Then the MainNavigatorContent will handle the actual Stack navigation.
export default function RootLayout() {
  useFrameworkReady(); // This hook runs here, at the top level of RootLayout

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        {/* MainNavigatorContent will consume the AppContext and handle navigation */}
        <MainNavigatorContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { AppProvider } from '@/context/AppContext';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <AppProvider>
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="splash" />
//           <Stack.Screen name="terms" />
//           <Stack.Screen name="(tabs)" />
//           <Stack.Screen name="subject/[id]" />
//           <Stack.Screen name="+not-found" />
//         </Stack>
//         <StatusBar style="auto" />
//       </AppProvider>
//     </GestureHandlerRootView>
//   );
// }

