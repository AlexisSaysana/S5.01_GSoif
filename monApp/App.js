import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Plus, Map, User, Settings } from 'lucide-react-native';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import FontainesScreen from './screens/FontainesScreen';
import ProfileScreen from './screens/ProfileScreen';
import OptionsScreen from './screens/OptionsScreen';
import MonCompteScreen from './screens/MonCompteScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVIGATION BASSE (ONGLETS) ---
function TabNavigator({ navigation, onLogout,  userEmail }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen name="Ajouter" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Plus color={color} size={28} /> }} />
      <Tab.Screen name="Rechercher" component={FontainesScreen} options={{ tabBarIcon: ({ color }) => <Map color={color} size={28} /> }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={28} /> }} />

      <Tab.Screen 
        name="Options"
        children={(props) => (
          <OptionsScreen 
            {...props}
            onLogout={onLogout}
            userEmail={userEmail}   // ⭐ AJOUT IMPORTANT
          />
        )}
        options={{ tabBarIcon: ({ color }) => <Settings color={color} size={28} /> }}
      />

    </Tab.Navigator>
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);   // ⭐ OBLIGATOIRE

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
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {!isLoggedIn ? (
          <Stack.Group>
            <Stack.Screen name="Welcome">
              {(props) => (
                <WelcomeScreen 
                  {...props} 
                  onLogin={(email) => { setUserEmail(email); setIsLoggedIn(true); }}  // ⭐ MODIFIÉ
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen 
                  {...props} 
                  onLogin={(email) => { setUserEmail(email); setIsLoggedIn(true); }}  // ⭐ MODIFIÉ
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Inscription">
              {(props) => (
                <SignupScreen 
                  {...props} 
                  onLogin={(email) => { setUserEmail(email); setIsLoggedIn(true); }}  // ⭐ MODIFIÉ
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
                  userEmail={userEmail}   // ⭐ AJOUT
                  onLogout={() => {
                    setIsLoggedIn(false);
                    setUserEmail(null);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="MonCompte">
              {(props) => (
                <MonCompteScreen 
                  {...props} 
                  userEmail={userEmail}   // ⭐ AJOUT
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  }
});
