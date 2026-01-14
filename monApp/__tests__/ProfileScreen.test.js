import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

// ---------- MOCKS ----------
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(), // ⚠️ NE RIEN FAIRE
}));

jest.mock('react-native-map-link', () => ({
  showLocation: jest.fn(),
}));

// ---------- NAVIGATION ----------
const mockNavigate = jest.fn();

const mockNavigation = {
  navigate: jest.fn(),
  getParent: () => ({
    navigate: mockNavigate,
  }),
};

// ---------- RENDER ----------
const renderWithContext = (props = {}) => {
  return render(
    <ThemeContext.Provider
      value={{
        colors: {
          background: '#fff',
          primary: '#007AFF',
          text: '#000',
          textSecondary: '#666',
          border: '#ddd',
          surface: '#f5f5f5',
        },
        name: null,
        email: null,
      }}
    >
      <ProfileScreen
        navigation={mockNavigation}
        userEmail={null}
        onLogout={jest.fn()}
        route={{ params: {} }}
        {...props}
      />
    </ThemeContext.Provider>
  );
};

// ---------- TESTS ----------
describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre principal', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Mon profil')).toBeTruthy();
  });

  it('affiche le mode invité', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Invité')).toBeTruthy();
    expect(getByText('Mode invité activé')).toBeTruthy();
  });

  it('affiche un message si aucun historique', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Aucun itinéraire enregistré.')).toBeTruthy();
  });

  it('appelle onLogout quand on est invité et qu’on appuie sur "Se connecter"', () => {
    const onLogoutMock = jest.fn();
    const { getByText } = renderWithContext({ onLogout: onLogoutMock });

    fireEvent.press(getByText('Se connecter'));
    expect(onLogoutMock).toHaveBeenCalled();
  });
});
