import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Plus, Map, User, Settings, Home } from 'lucide-react-native';

// Context & Theme
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import FontainesScreen from './screens/FontainesScreen';
import ProfileScreen from './screens/ProfileScreen';
import InviteScreen from './screens/InviteScreen';
import MonCompteScreen from './screens/MonCompteScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingScreen from './screens/SettingScreen';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVIGATION BASSE (TABS) ---
function TabNavigator({ onLogout, userEmail, userId, isGuest }) {
  const { colors } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary || '#1A1A1A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface || '#FFF' }],
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={28} /> }}
      />
      <Tab.Screen
        name="Rechercher"
        component={FontainesScreen}
        options={{ tabBarIcon: ({ color }) => <Map color={color} size={28} /> }}
      />
      <Tab.Screen
        name="Profil"
        // Pass onLogout to InviteScreen if guest, and to ProfileScreen if not guest
        children={props => isGuest ? <InviteScreen {...props} onLogout={onLogout} /> : <ProfileScreen {...props} onLogout={onLogout} />}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={28} /> }}
      />
    </Tab.Navigator>
  );
}

// --- COMPOSANT RACINE (NAVIGATION LOGIC) ---
function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function initApp() {
      try {
        // 1. Charger la session
        const savedId = await AsyncStorage.getItem("userId");
        const savedEmail = await AsyncStorage.getItem("userEmail");
        if (savedId && savedEmail) {
          setUserId(savedId);
          setUserEmail(savedEmail);
          setIsLoggedIn(true);
        }

        // 2. Charger les polices
        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });

        // 3. Notifications
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
          });
        }
      } catch (e) {
        console.warn("Erreur d'initialisation:", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    initApp();
  }, []);

  const handleLogin = async (email, id) => {
    if (!email && (!id || id === 0)) {
      // Mode invité
      setIsGuest(true);
      setUserEmail(null);
      setUserId(null);
      setIsLoggedIn(true);
      return;
    }
    setIsGuest(false);
    await AsyncStorage.setItem("userId", id.toString());
    await AsyncStorage.setItem("userEmail", email);
    setUserEmail(email);
    setUserId(id);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserId(null);
    setIsGuest(false);
  };

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Group>
            <Stack.Screen name="Welcome">
              {(props) => <WelcomeScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Inscription">
              {(props) => <SignupScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main">
              {(props) => (
                <TabNavigator
                  {...props}
                  onLogout={handleLogout}
                  userEmail={userEmail}
                  userId={userId}
                  isGuest={isGuest}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="MonCompte">
              {(props) => <MonCompteScreen {...props} userEmail={userEmail} isGuest={isGuest} />}
            </Stack.Screen>
            <Stack.Screen name="Notifications">
              {(props) => <NotificationsScreen {...props} userEmail={userEmail} userId={userId} isGuest={isGuest} />}
            </Stack.Screen>
            <Stack.Screen name="Setting" component={SettingScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    position: 'absolute',
    borderTopWidth: 0,
  }
});