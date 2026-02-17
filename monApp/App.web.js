import React, { useEffect, useState, useContext, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Text, Modal } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, User, Home, Search, Cpu, Droplet, Menu, X, Settings } from 'lucide-react-native';

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
import ProfilIAScreen from './screens/ProfilIAScreen';
import HistoryScreen from './screens/HistoryScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- HEADER WEB AVEC HAMBURGER ---
function WebHeader({ navigation, state }) {
  const { colors } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentRoute = state.routeNames[state.index];

  const navItems = [
    { name: 'Accueil', icon: Home, route: 'Accueil' },
    { name: 'Rechercher', icon: Map, route: 'Rechercher' },
    { name: 'Quêtes', icon: Search, route: 'Quêtes' },
    { name: 'Profil', icon: User, route: 'Profil' },
  ];

  const handleNavigate = (route) => {
    navigation.navigate(route);
    setIsMenuOpen(false);
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface || '#FFF' }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')}>
          <Droplet color={colors.primary || '#2196F3'} size={32} />
        </TouchableOpacity>
        <View
          style={
            {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10
            }
          }
        >
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("Setting")}
          >
            <Settings color={colors.text || '#333'} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.hamburgerButton}>
            <Menu color={colors.text || '#333'} size={32} />
          </TouchableOpacity>
          <Modal visible={isMenuOpen} transparent animationType="fade">
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setIsMenuOpen(false)}
            >
              <View style={[styles.menuContent, { backgroundColor: colors.surface || '#FFF' }]}>
                <View style={styles.menuHeader}>
                  <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                    <X color={colors.text || '#333'} size={32} />
                  </TouchableOpacity>
                </View>
                {navItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => handleNavigate(item.route)}
                    style={[styles.menuItem, currentRoute === item.route && { backgroundColor: colors.primary + '20' }]}
                  >
                    <item.icon color={currentRoute === item.route ? colors.primary : '#888'} size={24} />
                    <Text style={[styles.menuText, { color: colors.text }]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
    </View>
  );
}

function TabNavigator({ onLogout, userEmail, userId, userName }) {
  return (
    <Tab.Navigator tabBar={(props) => <WebHeader {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Accueil">
        {(props) => <HomeScreen {...props} userId={userId} userEmail={userEmail} userName={userName} />}
      </Tab.Screen>
      <Tab.Screen name="Rechercher" component={FontainesScreen} />
      <Tab.Screen name="Quêtes" component={QuestsScreen} />
      <Tab.Screen name="IA">
        {(props) => <ProfilIAScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Profil">
        {(props) => <ProfileScreen {...props} userEmail={userEmail} userName={userName} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppContent() {
  const { changeName, changeEmail } = useContext(ThemeContext);
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
          setUserId(savedId);
          setUserEmail(savedEmail);
          setUserName(savedName);
          setIsLoggedIn(true);
        }

        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });
      } catch (e) {
        console.warn("Erreur init:", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    initApp();
  }, []);

  // --- LOGIN CORRIGÉ POUR LES INVITÉS ---
  const handleLogin = async (email, id, fullName) => {
    try {
      if (id && email) {
        // Mode Utilisateur
        await AsyncStorage.setItem("userId", id.toString());
        await AsyncStorage.setItem("userEmail", email);
        if (fullName) await AsyncStorage.setItem("userName", fullName);

        setUserEmail(email);
        setUserId(id);
        setUserName(fullName);
      } else {
        // Mode Invité (On nettoie les anciennes données)
        await AsyncStorage.multiRemove(["userId", "userEmail", "userName"]);
        setUserEmail(null);
        setUserId(null);
        setUserName(null);
      }
      setIsLoggedIn(true);
    } catch(e) {
        console.error("Erreur login storage:", e);
    }
  };

  // --- LOGOUT WEB FIABLE ---
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(["userId", "userEmail", "userName"]);

      if (changeName) changeName("");
      if (changeEmail) changeEmail("");

      setIsLoggedIn(false);
      setUserEmail(null);
      setUserId(null);
      setUserName(null);

      if (Platform.OS === 'web') {
        setTimeout(() => {
            window.location.href = "/";
            window.location.reload();
        }, 100);
      }
    } catch (e) {
      console.error("Erreur logout:", e);
      setIsLoggedIn(false);
    }
  }, [changeName, changeEmail]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
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
              {(props) => (
                <TabNavigator
                  {...props}
                  onLogout={handleLogout}
                  userEmail={userEmail}
                  userId={userId}
                  userName={userName}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Setting">
               {(props) => <SettingScreen {...props} onLogout={handleLogout} userEmail={userEmail} />}
            </Stack.Screen>
            <Stack.Screen name="MonCompte" component={MonCompteScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
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
  headerContainer: {
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
    ...Platform.select({ web: { position: 'fixed', top: 0, width: '100%' } })
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hamburgerButton: { padding: 10 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'flex-end' },
  menuContent: { width: 280, height: '100%', padding: 20 },
  menuHeader: { alignItems: 'flex-end', marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 5 },
  menuText: { marginLeft: 15, fontSize: 16, fontWeight: '600' },
});