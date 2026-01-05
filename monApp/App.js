import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Plus, Map, User, Settings, Home } from 'lucide-react-native';
import { ThemeContext } from './context/ThemeContext';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import FontainesScreen from './screens/FontainesScreen';
import ProfileScreen from './screens/ProfileScreen';
import OptionsScreen from './screens/OptionsScreen';
import AccountScreen from './screens/AccountScreen';
import SettingScreen from './screens/SettingScreen';
import HistoryScreen from './screens/HistoryScreen';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVIGATION BASSE (ONGLETS) ---
function TabNavigator() {
  const { colors } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }],
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={28} /> }} />
      <Tab.Screen name="Rechercher" component={FontainesScreen} options={{ tabBarIcon: ({ color }) => <Map color={color} size={28} /> }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={28} /> }} />
    </Tab.Navigator>
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // 1. ÉTAT DE CONNEXION : false par défaut
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* 2. CONDITION DE NAVIGATION */}
          {!isLoggedIn ? (
            // SI PAS CONNECTÉ : Groupe Auth
            <Stack.Group>
              <Stack.Screen name="Welcome">
                 {(props) => <WelcomeScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
              </Stack.Screen>
              <Stack.Screen name="Login">
                 {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
              </Stack.Screen>
              <Stack.Screen name="Inscription" component={SignupScreen} />
            </Stack.Group>
          ) : (
            // SI CONNECTÉ : Groupe App
            <Stack.Group>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="Account" component={AccountScreen} />
              <Stack.Screen name="Setting" component={SettingScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
            </Stack.Group>
          )}
          
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    height: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  }
});