import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState('mL');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserId = await AsyncStorage.getItem('userId');

      console.log("🛠️ Chargement stockage - ID:", storedUserId, "Token présent:", !!storedToken);

      if (storedToken) setToken(storedToken);
      if (storedUserId) setUserId(storedUserId);

      const storedTheme = await AsyncStorage.getItem('appTheme');
      const storedUnit = await AsyncStorage.getItem('appUnit');
      const storedGoal = await AsyncStorage.getItem('@dailyGoal');
      const storedName = await AsyncStorage.getItem('@name');
      const storedEmail = await AsyncStorage.getItem('@email');

      if (storedTheme !== null) setIsDarkMode(storedTheme === 'dark');
      if (storedUnit !== null) setUnit(storedUnit);
      if (storedGoal !== null) setDailyGoal(parseInt(storedGoal, 10));
      if (storedName !== null) setName(storedName || "");
      if (storedEmail !== null) setEmail(storedEmail || "");
    } catch (e) {
      console.error("Erreur chargement préférences", e);
    }
  };

  const saveUserSession = async (userToken, id) => {
    console.log("💾 saveUserSession APPELÉE - Nouvel ID:", id);
    setToken(userToken);
    setUserId(String(id));

    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userId', String(id));
      console.log("✅ Session sauvegardée dans AsyncStorage");
    } catch (e) {
      console.error("❌ Erreur sauvegarde AsyncStorage", e);
    }
  };

  const logout = async () => {
    console.log("🚪 Déconnexion...");
    setToken(null);
    setUserId(null);
    setName("");
    setEmail("");
    await AsyncStorage.multiRemove(['userToken', 'userId', '@name', '@email']);
  };

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

  const changeName = async (newName) => {
    setName(newName);
    await AsyncStorage.setItem('@name', newName);
  };

  const changeEmail = async (newEmail) => {
    setEmail(newEmail);
    await AsyncStorage.setItem('@email', newEmail);
  };

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
    token,
    userId,
    saveUserSession,
    logout
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};