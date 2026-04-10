import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { subscribeAuth } from './src/services/auth';
import { ensureUserDoc, getUserDoc } from './src/services/user';
import { theme } from './src/config/theme';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [bootError, setBootError] = useState('');

  function isOfflineFirestoreError(e) {
    const msg = (e?.message || '').toLowerCase();
    const code = (e?.code || '').toLowerCase();
    return msg.includes('client is offline') || code.includes('unavailable');
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(async (u) => {
      try {
        setBootError('');
        setUser(u);
        if (u) {
          // These Firestore calls can fail if the device is offline.
          // Don't block app start; user can pick a username later.
          await ensureUserDoc(u);

          let profile = null;
          try {
            profile = await getUserDoc(u.uid);
          } catch (e) {
            if (!isOfflineFirestoreError(e)) throw e;
          }

          setNeedsUsername(!u.isAnonymous && profile ? !profile?.username : false);
        } else {
          setNeedsUsername(false);
        }
      } catch (e) {
        if (!isOfflineFirestoreError(e)) {
          setBootError(e?.message || 'Failed to initialize');
        }
      } finally {
        setBooting(false);
      }
    });
    return unsub;
  }, []);

  if (showSplash || booting) {
    return (
      <>
        <SplashScreen />
        <StatusBar style="light" />
      </>
    );
  }

  if (booting) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Quiz App</Text>
        <Text style={styles.muted}>Loading…</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Quiz App</Text>
        <Text style={styles.error}>{bootError}</Text>
        <Text style={styles.muted}>Check your .env values and restart.</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator user={user} needsUsername={needsUsername} />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 26,
    marginBottom: 8,
  },
  muted: {
    color: theme.colors.muted,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
});
