import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, useWindowDimensions, Text } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, User, Home, Search, Droplet } from 'lucide-react-native';

// Context & Theme
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import FontainesScreen from './screens/FontainesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MonCompteScreen from './screens/MonCompteScreen';
import SettingScreen from './screens/SettingScreen';
import QuestsScreen from './screens/QuestsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVBAR WEB ÉPURÉE ---
function WebHeader({ navigation, state }) {
  const { colors } = useContext(ThemeContext);
  const currentRoute = state.routeNames[state.index];

  const navItems = [
    { name: 'Accueil', icon: Home, route: 'Accueil' },
    { name: 'Rechercher', icon: Map, route: 'Rechercher' },
    { name: 'Quêtes', icon: Search, route: 'Quêtes' },
    { name: 'Profil', icon: User, route: 'Profil' },
  ];

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface || '#FFF' }]}>
      <View style={styles.headerContent}>

        {/* LOGO SEUL (SANS TEXTE) */}
        <TouchableOpacity
          style={styles.logoSection}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Droplet color={colors.primary || '#2196F3'} size={32} />
        </TouchableOpacity>

        {/* NAVIGATION ESPACÉE */}
        <View style={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => navigation.navigate(item.route)}
                style={[styles.navItem, isActive && { borderBottomColor: colors.primary || '#2196F3' }]}
              >
                <item.icon
                  color={isActive ? (colors.primary || '#2196F3') : '#888'}
                  size={22}
                />
                <Text style={[
                  styles.navText,
                  isActive && { color: colors.primary || '#2196F3', fontWeight: 'bold' }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PETIT ESPACE VIDE À DROITE POUR ÉQUILIBRER LE LOGO */}
        <View style={{ width: 40 }} />
      </View>
    </View>
  );
}

function TabNavigator({ onLogout, userEmail, userId, userName }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <WebHeader {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Rechercher" component={FontainesScreen} />
      <Tab.Screen name="Quêtes" component={QuestsScreen} />
      <Tab.Screen name="Profil">
        {(props) => <ProfileScreen {...props} userEmail={userEmail} userName={userName} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    async function initApp() {
      try {
        const savedId = await AsyncStorage.getItem("userId");
        const savedEmail = await AsyncStorage.getItem("userEmail");
        const savedName = await AsyncStorage.getItem("userName");
        if (savedId && savedEmail) {
          setUserId(savedId); setUserEmail(savedEmail); setUserName(savedName);
          setIsLoggedIn(true);
        }
        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });
      } catch (e) { console.warn(e); } finally { setFontsLoaded(true); }
    }
    initApp();
  }, []);

  const handleLogin = (email, id, fullName) => {
    setUserEmail(email); setUserId(id); setUserName(fullName);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <View style={styles.webMainWrapper}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Group>
              <Stack.Screen name="Welcome">{(props) => <WelcomeScreen {...props} onLogin={handleLogin} />}</Stack.Screen>
              <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onLogin={handleLogin} />}</Stack.Screen>
              <Stack.Screen name="Inscription">{(props) => <SignupScreen {...props} onLogin={handleLogin} />}</Stack.Screen>
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Main">
                {(props) => <TabNavigator {...props} onLogout={handleLogout} userEmail={userEmail} userId={userId} userName={userName} />}
              </Stack.Screen>
              <Stack.Screen name="Setting" component={SettingScreen} />
              <Stack.Screen name="MonCompte" component={MonCompteScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}

const styles = StyleSheet.create({
  webMainWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    width: '100%',
    height: 80, // Un peu plus haut pour l'élégance
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        zIndex: 1000,
      }
    })
  },
  headerContent: {
    flex: 1,
    maxWidth: 1200, // Plus large pour respirer
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40, // Plus d'espace sur les côtés
  },
  logoSection: {
    padding: 10,
  },
  navLinks: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    // Gap n'est pas supporté partout en RN, on utilise des marges sur les items
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25, // Beaucoup plus d'espace entre les liens
    height: '100%',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  navText: {
    marginLeft: 12, // Plus d'espace entre l'icône et le texte
    fontSize: 16,
    letterSpacing: 0.5,
    color: '#666',
  }
});