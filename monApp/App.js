import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import MonCompteScreen from './screens/MonCompteScreen';
import NotificationsScreen from './screens/NotificationsScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import AccountScreen from './screens/AccountScreen';
import SettingScreen from './screens/SettingScreen';
import HistoryScreen from './screens/HistoryScreen';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ navigation, onLogout, userEmail, userId }) {
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

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadSessionAndInit() {

      // 🔥 Récupérer la session sauvegardée
      const savedId = await AsyncStorage.getItem("userId");
      const savedEmail = await AsyncStorage.getItem("userEmail");

      if (savedId && savedEmail) {
        setUserId(savedId);
        setUserEmail(savedEmail);
        setIsLoggedIn(true);
      }

      // 🔥 Charger les polices + notifications
      try {
        await Font.loadAsync({
          'BricolageGrotesque': require('./assets/fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf'),
          'Inter': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        });
        setFontsLoaded(true);

        const { status } = await Notifications.requestPermissionsAsync();
        console.log("📌 Permission notifications :", status);

        await Notifications.setNotificationChannelAsync("default", {
          name: "Notifications",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });
        console.log("📌 Channel 'default' configuré avec importance MAX + vibration + lumière");
      } catch (e) {
        console.log("❌ Erreur init notifications :", e);
      }
    }

    loadSessionAndInit();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {!isLoggedIn ? (
          <Stack.Group>
            <Stack.Screen name="Welcome">
              {(props) => (
                <WelcomeScreen 
                  {...props} 
                  onLogin={async (email, id) => {
                    await AsyncStorage.setItem("userId", id.toString());
                    await AsyncStorage.setItem("userEmail", email);

                    setUserEmail(email);
                    setUserId(id);
                    setIsLoggedIn(true);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen 
                  {...props} 
                  onLogin={async (email, id) => {
                    await AsyncStorage.setItem("userId", id.toString());
                    await AsyncStorage.setItem("userEmail", email);

                    setUserEmail(email);
                    setUserId(id);
                    setIsLoggedIn(true);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Inscription">
              {(props) => (
                <SignupScreen 
                  {...props} 
                  onLogin={async (email, id) => {
                    await AsyncStorage.setItem("userId", id.toString());
                    await AsyncStorage.setItem("userEmail", email);

                    setUserEmail(email);
                    setUserId(id);
                    setIsLoggedIn(true);
                  }}
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        ) : (
          <Stack.Group>

            <Stack.Screen name="Main">
              {(props) => (
                <TabNavigator 
                  navigation={props.navigation} 
                  userEmail={userEmail}
                  userId={userId}
                  onLogout={async () => {
                    await AsyncStorage.removeItem("userId");
                    await AsyncStorage.removeItem("userEmail");

                    setIsLoggedIn(false);
                    setUserEmail(null);
                    setUserId(null);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="MonCompte">
              {(props) => (
                <MonCompteScreen 
                  {...props} 
                  userEmail={userEmail}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Notifications">
              {(props) => (
                <NotificationsScreen 
                  {...props}
                  userEmail={userEmail}
                  userId={userId}
                />
              )}
            </Stack.Screen>

          </Stack.Group>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
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
