import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, type ErrorBoundaryProps, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import {
  hideSplashScreen,
  initializeSplashScreen,
} from "@/utils/splashScreenManager";
import { ThemeProvider, useTheme } from "@providers/ThemeProvider";
import ReactQueryProvider from "@providers/ReactQueryProvider";
import { ThemedCustomText, ThemedButton } from "@components/themed";
import { StackHeader } from "@components/navigation/StackHeader";
import { MemoryDiagnosticsOverlay } from "../components/MemoryDiagnosticsOverlay";
import { useBackHandler } from "../hooks/useBackHandler";
import { Sentry, initializeSentry } from "@/config/sentry";
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, type ErrorBoundaryProps, useRouter } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hideSplashScreen, initializeSplashScreen } from '@utils/splashScreenManager';
import { ThemeProvider, useTheme } from '@providers/ThemeProvider';
import ReactQueryProvider from '@providers/ReactQueryProvider';
import { ThemedButton, ThemedCustomText } from '@components/themed';
import { useFonts } from '@app/hooks/useFonts';
import { useBackHandler } from '@hooks/useBackHandler';
import { MemoryDiagnosticsOverlay } from '@components/MemoryDiagnosticsOverlay';
import { StackHeader } from '@components/navigation/StackHeader';
import { Sentry, initializeSentry } from '@config/sentry';

initializeSplashScreen();
initializeSentry();

export const unstable_settings = { initialRouteName: "(tabs)" };
export const unstable_settings = { initialRouteName: '(tabs)' };

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.Native.captureException(error);
  }, [error]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "right", "bottom", "left"]}
      >
        <View style={styles.errorContainer}>
          <ThemedCustomText variant="h2" style={styles.centered}>
          <ThemedCustomText variant="h2" style={styles.errorTitle}>
            Something went wrong
          </ThemedCustomText>
          <ThemedCustomText variant="body" style={styles.centered}>
            {error.message || "Unexpected navigation error."}
          </ThemedCustomText>
          <ThemedButton
            text="Try again"
            onPress={retry}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loaded, error] = useFonts({});
  const [fontsLoaded, fontError] = useFonts();
  const [onboardingResolved, setOnboardingResolved] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void hideSplashScreen();
    }
  }, [fontsLoaded, fontError]);

  useBackHandler(
    useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    }, [router]),
  );

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top", "right", "bottom", "left"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            header: (props) => <StackHeader {...(props as any)} />,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="hunt/[id]" options={{ title: "Hunt Details" }} />
          <Stack.Screen name="details" options={{ title: "Details" }} />
          <Stack.Screen name="nested" options={{ title: "Nested" }} />
        </Stack>
        <MemoryDiagnosticsOverlay />
      </SafeAreaView>
    </SafeAreaProvider>
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let isMounted = true;

    const maybeShowOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('hunty_onboarding_seen');
        if (!seen && isMounted) {
          router.replace('/onboarding');
        }
      } finally {
        if (isMounted) {
          setOnboardingResolved(true);
        }
      }
    };

    void maybeShowOnboarding();

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded, fontError, router]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    return false;
  }, [router]);

  useBackHandler(handleBackPress);

  if ((!fontsLoaded && !fontError) || !onboardingResolved) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <Stack
        screenOptions={{
          header: (props) => <StackHeader {...props} />,
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: colors.background },
          statusBarStyle: isDark ? 'light' : 'dark',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="hunt/[id]" options={{ title: 'Hunt Details' }} />
        <Stack.Screen name="transaction/pending" options={{ title: 'Transaction Pending' }} />
        <Stack.Screen name="details" options={{ title: 'Details' }} />
        <Stack.Screen name="nested" options={{ title: 'Nested' }} />
      </Stack>
      <MemoryDiagnosticsOverlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  centered: { textAlign: "center" },
});
