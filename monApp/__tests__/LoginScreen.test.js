import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { ThemeContext } from '../context/ThemeContext';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

global.fetch = jest.fn();

// Mock Alert
jest.spyOn(Alert, 'alert');

const themeMock = {
  colors: {
    primary: '#0000FF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#999999',
    border: '#CCCCCC',
  },
  isDarkMode: false,
};

describe('LoginScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithTheme = () =>
    render(
      <ThemeContext.Provider value={themeMock}>
        <LoginScreen navigation={mockNavigation} onLogin={mockOnLogin} />
      </ThemeContext.Provider>
    );

  it('rend les éléments principaux', () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderWithTheme();

    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByTestId('se-connecter')).toBeTruthy();
    expect(getByText('Poursuivre en tant qu\'invité')).toBeTruthy();
    expect(getByText('Je n\'ai pas de compte')).toBeTruthy();
  });

  it('toggle la visibilité du mot de passe', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme();

    const passwordInput = getByPlaceholderText('Mot de passe');
    const toggleButton = getByTestId('eye-icon'); // 🔹 il faut ajouter testID sur le TouchableOpacity eyeIcon

    expect(passwordInput.props.secureTextEntry).toBe(true);
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('appelle onLogin en mode invité', () => {
    const { getByText } = renderWithTheme();
    fireEvent.press(getByText('Poursuivre en tant qu\'invité'));
    expect(mockOnLogin).toHaveBeenCalledWith(null, null);
  });

  it('appelle navigation pour s\'inscrire', () => {
    const { getByText } = renderWithTheme();
    fireEvent.press(getByText('Je n\'ai pas de compte'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Inscription');
  });

  it('affiche une alerte si email ou mot de passe manquant', async () => {
    const { getByTestId } = renderWithTheme();
    fireEvent.press(getByTestId('se-connecter'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
