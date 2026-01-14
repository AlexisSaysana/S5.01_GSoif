import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

// 🔹 MOCKS COMPOSANTS ENFANTS
jest.mock('../components/ProgressCircle', () => {
  return ({ children }) => <>{children}</>;
});

jest.mock('../components/QuickAddButton', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return ({ title, onPress }) => (
    <Text onPress={onPress}>{title}</Text>
  );
});

jest.mock('../components/Select', () => {
  return ({ value }) => <text>{value}</text>;
});

jest.mock('../components/CustomInput', () => 'CustomInput');
jest.mock('../components/CustomButton', () => {
  return ({ title, onPress }) => (
    <button onClick={onPress}>{title}</button>
  );
});

// 🔹 MOCK ASYNC STORAGE
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockNavigate = jest.fn();

const mockNavigation = {
  getParent: jest.fn(() => ({
    navigate: mockNavigate,
  })),
};


const mockTheme = {
  colors: {
    background: '#fff',
    primary: '#00f',
    secondary: '#ddd',
    text: '#000',
    textSecondary: '#666',
    border: '#ccc',
    dangerText: '#f00',
  },
  isDarkMode: false,
  unit: 'mL',
  dailyGoal: 2000,
};

const renderWithTheme = () =>
  render(
    <ThemeContext.Provider value={mockTheme}>
      <HomeScreen navigation={mockNavigation} />
    </ThemeContext.Provider>
  );

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('affiche le titre principal', () => {
    const { getByText } = renderWithTheme();
    expect(getByText('Votre progression')).toBeTruthy();
  });

  it('affiche la progression initiale à 0%', async () => {
    const { getByText } = renderWithTheme();

    await waitFor(() => {
      expect(getByText('0%')).toBeTruthy();
      expect(getByText('Bu : 0 mL / 2000 mL')).toBeTruthy();
    });
  });

  it('ouvre les paramètres quand on appuie sur le bouton settings', () => {
    const { getByTestId } = renderWithTheme();
    
    fireEvent.press(getByTestId('settings-button'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Setting');
  });

  it('ajoute de l’eau quand on appuie sur un bouton rapide', async () => {
    const { getByText } = renderWithTheme();

    fireEvent.press(getByText('+100mL'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
