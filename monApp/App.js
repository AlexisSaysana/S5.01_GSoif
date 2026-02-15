import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from "expo-notifications";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Map, Search, Cpu, User } from 'lucide-react-native';

// Context
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import FontainesScreen from './screens/FontainesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MonCompteScreen from './screens/MonCompteScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingScreen from './screens/SettingScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import QuestsScreen from './screens/QuestsScreen';
import ProfilIAScreen from './screens/ProfilIAScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ onLogout }) {
  const { colors, userId, name, email } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface }],
      }}
    >
      <Tab.Screen name="Accueil" options={{ tabBarIcon: ({ color }) => <Home color={color} size={28} /> }}>
        {(props) => <HomeScreen {...props} userId={userId} userEmail={email} userName={name} />}
      </Tab.Screen>
      <Tab.Screen name="Rechercher" component={FontainesScreen} options={{ tabBarIcon: ({ color }) => <Map color={color} size={28} /> }} />
      <Tab.Screen name="Quêtes" component={QuestsScreen} options={{ tabBarIcon: ({ color }) => <Search color={color} size={28} /> }} />
      <Tab.Screen name="IA" options={{ tabBarIcon: ({ color }) => <Cpu color={color} size={28} /> }}>
        {(props) => <ProfilIAScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Profil" options={{ tabBarIcon: ({ color }) => <User color={color} size={28} /> }}>
        {(props) => <ProfileScreen {...props} userEmail={email} userName={name} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppContent() {
  const { token, userId, changeName, changeEmail, logout } = useContext(ThemeContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const isLoggedIn = !!token;

  useEffect(() => {
    async function initApp() {
      try {
        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    }
    initApp();
  }, []);

  const handleLogin = (email, id, fullName) => {
    if (fullName) changeName(fullName);
    if (email) changeEmail(email);
  };

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
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main">{(props) => <TabNavigator {...props} onLogout={logout} />}</Stack.Screen>
            <Stack.Screen name="MonCompte" component={MonCompteScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Setting">{(props) => <SettingScreen {...props} onLogout={logout} />}</Stack.Screen>
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
  tabBar: { height: 80, paddingBottom: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, position: 'absolute', borderTopWidth: 0, elevation: 10 }
});