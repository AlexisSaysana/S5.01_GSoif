// context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles'; // Ajustez le chemin selon votre structure

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // --- États globaux ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState('mL'); // mL, cL, L
  const [dailyGoal, setDailyGoal] = useState(2000); // stored in mL
  const [name, setName] = useState("Alya Ayinde");
  const [email, setEmail] = useState("alya.ayinde@gsoif.fr");

  // --- Chargement initial ---
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('appTheme');
      const storedUnit = await AsyncStorage.getItem('appUnit');
      const storedGoal = await AsyncStorage.getItem('@dailyGoal');
      const storedName = await AsyncStorage.getItem('@name');
      const storedEmail = await AsyncStorage.getItem('@email');

      if (storedTheme !== null) setIsDarkMode(storedTheme === 'dark');
      if (storedUnit !== null) setUnit(storedUnit);
      if (storedGoal !== null) setDailyGoal(parseInt(storedGoal, 10));
      if (storedName !== null) setName(storedName);
      if (storedEmail !== null) setEmail(storedEmail);
    
    } catch (e) {
      console.error("Erreur chargement préférences", e);
    }
  };

  // --- Actions ---
  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
  };

  const changeUnit = async (newUnit) => {
    setUnit(newUnit);
    await AsyncStorage.setItem('appUnit', newUnit);
  };

  const changeDailyGoal = async (goalMl) => {
    setDailyGoal(goalMl);
    await AsyncStorage.setItem('@dailyGoal', String(goalMl));
  };

  const changeName = async (name) => {
    setName(name);
    await AsyncStorage.setItem('@name', name)
  }

  const changeEmail = async (email) => {
    setEmail(email);
    await AsyncStorage.setItem('@email', email)
  }

  // --- Définition des couleurs dynamiques ---
  // C'est ici qu'on définit les couleurs pour chaque mode
  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#F5F7FA',
      surface: isDarkMode ? '#1E1E1E' : WHITE,
      text: isDarkMode ? '#E0E0E0' : '#333333',
      textSecondary: isDarkMode ? '#A0A0A0' : '#888888',
      primary: PRIMARY_BLUE,
      secondary: isDarkMode ? '#2A4B55' : '#C8E0E8',
      border: isDarkMode ? '#333333' : '#F0F0F0',
      iconBg: isDarkMode ? '#2C2C2C' : '#F5F7FA',
      dangerBg: isDarkMode ? '#4a1515' : '#FFEBEE',
      dangerText: '#E53935',
    },
    toggleTheme,
    unit,
    dailyGoal,
    changeDailyGoal,
    changeUnit,
    name,
    changeName,
    email,
    changeEmail,

  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};