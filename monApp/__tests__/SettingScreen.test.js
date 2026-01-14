import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SettingScreen from '../screens/SettingScreen';
import { ThemeContext } from '../context/ThemeContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockOnLogout = jest.fn();

const renderWithContext = ({
  isDarkMode = false,
  toggleTheme = jest.fn(),
  changeUnit = jest.fn(),
  userEmail = 'test@test.com',
} = {}) =>
  render(
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        unit: 'mL',
        changeUnit,
        colors: {
          background: '#fff',
          surface: '#f0f0f0',
          text: '#000',
          textSecondary: '#666',
          iconBg: '#eee',
          dangerBg: '#fee',
          dangerText: '#f00',
          border: '#ccc',
          primary: '#00f',
        },
      }}
    >
      <SettingScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        onLogout={mockOnLogout}
        userEmail={userEmail}
      />
    </ThemeContext.Provider>
  );

describe('SettingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les sections principales', () => {
    const { getByText } = renderWithContext();

    expect(getByText('Paramètres')).toBeTruthy();
    expect(getByText('Général')).toBeTruthy();
    expect(getByText('Confidentialité (RGPD)')).toBeTruthy();
    expect(getByText('À propos')).toBeTruthy();
  });

  it('toggle Dark Mode', () => {
    const toggleTheme = jest.fn();
    const { getAllByRole } = renderWithContext({ toggleTheme });

    const switches = getAllByRole('switch');
    const darkModeSwitch = switches[0]; // ✅ le premier = Mode sombre

    fireEvent(darkModeSwitch, 'valueChange', true);

    expect(toggleTheme).toHaveBeenCalled();
  });

  it('ouvre la modale des unités et change unité', () => {
    const changeUnit = jest.fn();
    const { getByText } = renderWithContext({ changeUnit });

    fireEvent.press(getByText('Unités de mesure'));
    fireEvent.press(getByText('L'));

    expect(changeUnit).toHaveBeenCalledWith('L');
  });

  it('affiche une alerte pour effacer l’historique', () => {
    const { getByText } = renderWithContext();

    fireEvent.press(getByText("Effacer l'historique"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Supprimer l'historique",
      "Êtes-vous sûr ? Cette action est irréversible.",
      expect.any(Array)
    );
  });

  it('affiche une alerte pour supprimer le compte', () => {
    const { getByText } = renderWithContext();

    fireEvent.press(getByText('Supprimer mon compte'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Supprimer le compte',
      'Action définitive. Toutes vos données seront effacées.',
      expect.any(Array)
    );
  });

  it('affiche une alerte pour la déconnexion', () => {
    const { getByText } = renderWithContext();

    fireEvent.press(getByText('Se déconnecter'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      expect.any(Array)
    );
  });

  it('cache la zone danger pour un invité', () => {
    const { queryByText } = renderWithContext({ userEmail: null });

    expect(queryByText('Supprimer mon compte')).toBeNull();
    expect(queryByText('Se déconnecter')).toBeNull();
  });
});
