import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'


import WelcomeScreen from './screens/WelcomeScreen';
import ConnexionScreen from './screens/ConnexionScreen';
import InscriptionScreen from './screens/InscriptionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (

      <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={ConnexionScreen} />
        <Stack.Screen name="Inscription" component={InscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
