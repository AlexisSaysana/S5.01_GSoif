import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../screens/SignupScreen';
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

describe('SignupScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithTheme = () =>
    render(
      <ThemeContext.Provider value={themeMock}>
        <SignupScreen navigation={mockNavigation} onLogin={mockOnLogin} />
      </ThemeContext.Provider>
    );

  it('rend les éléments principaux', () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderWithTheme();

    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByTestId('s-inscrire')).toBeTruthy();
    expect(getByText('Poursuivre en tant qu\'invité')).toBeTruthy();
    expect(getByText('J\'ai déjà un compte')).toBeTruthy();
  });

  it('toggle la visibilité du mot de passe', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme();

    const passwordInput = getByPlaceholderText('Mot de passe');
    const toggleButton = getByTestId('eye-icon');
    const passwordConfirmInput = getByPlaceholderText('Confirmer le mot de passe');
    const toggleConfirmButton = getByTestId('eye-icon-confirm');


    expect(passwordInput.props.secureTextEntry).toBe(true);
        expect(passwordConfirmInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    fireEvent.press(toggleConfirmButton);
        expect(passwordInput.props.secureTextEntry).toBe(false);
    expect(passwordConfirmInput.props.secureTextEntry).toBe(false);
  });

  it('appelle onLogin en mode invité', () => {
    const { getByText } = renderWithTheme();
    fireEvent.press(getByText('Poursuivre en tant qu\'invité'));
    expect(mockOnLogin).toHaveBeenCalledWith(null, null);
  });

  it('appelle navigation pour s\'inscrire', () => {
    const { getByText } = renderWithTheme();
    fireEvent.press(getByText('J\'ai déjà un compte'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('affiche une alerte si email ou mot de passe manquant', async () => {
    const { getByTestId } = renderWithTheme();
    fireEvent.press(getByTestId('s-inscrire'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
