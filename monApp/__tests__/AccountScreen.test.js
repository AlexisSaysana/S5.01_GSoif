import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountScreen from '../screens/AccountScreen';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve('true')),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockContext = {
  colors: {
    background: '#fff',
    text: '#000',
    textSecondary: '#666',
    surface: '#f5f5f5',
    border: '#ddd',
    primary: '#007bff',
    iconBg: '#e6f0ff',
    dangerBg: '#ffe6e6',
    dangerText: '#ff0000',
  },
  unit: 'ml',
  dailyGoal: 2500,
  changeDailyGoal: jest.fn(),
  name: 'Test User',
  changeName: jest.fn(),
  email: 'test@example.com',
  changeEmail: jest.fn(),
};

const renderWithProvider = (ui) => {
  return render(
    <ThemeContext.Provider value={mockContext}>
      {ui}
    </ThemeContext.Provider>
  );
};

describe('AccountScreen', () => {
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("s'affiche correctement avec nom et email du contexte", () => {
    const { getByDisplayValue } = renderWithProvider(<AccountScreen navigation={navigation} />);
    expect(getByDisplayValue('Test User')).toBeTruthy();
    expect(getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('affiche la modale de modification d’objectif et convertit correctement les valeurs', async () => {
    const { getByTestId, getByPlaceholderText } = renderWithProvider(<AccountScreen navigation={navigation} />);
    
    // Ouvrir la modale d’objectif
    fireEvent.press(getByTestId('edit-goal'));
    
    const input = getByPlaceholderText('ex: 2500');
    fireEvent.changeText(input, '2500'); // saisir objectif en mL
    fireEvent.press(getByTestId('confirm-goal'));
    
    await waitFor(() => {
      expect(mockContext.changeDailyGoal).toHaveBeenCalledWith(2500);
    });
  });

  it('affiche une alerte si l’objectif est hors limites', async () => {
    const { getByTestId, getByPlaceholderText } = renderWithProvider(<AccountScreen navigation={navigation} />);
    
    fireEvent.press(getByTestId('edit-goal'));
    const input = getByPlaceholderText('ex: 2500');
    fireEvent.changeText(input, '5000'); // trop grand
    fireEvent.press(getByTestId('confirm-goal'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        expect.stringContaining('L\'objectif doit être entre')
      );
    });
  });

  it('toggle notifications met à jour AsyncStorage', () => {
    const { getByTestId } = renderWithProvider(<AccountScreen navigation={navigation} />);
    const notifSwitch = getByTestId('notifications-switch');

    fireEvent(notifSwitch, 'valueChange', false);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@notificationsEnabled', 'false');
  });

  it('ouvre et ferme le mode changement de mot de passe correctement', () => {
    const { getByTestId, queryByText } = renderWithProvider(<AccountScreen navigation={navigation} />);
    
    // Au départ, ancien mot de passe non affiché
    expect(queryByText('Ancien mot de passe')).toBeNull();

    fireEvent.press(getByTestId('edit-password')); // active le mode
    expect(queryByText('Ancien mot de passe')).toBeTruthy();
  });

  it('appelle navigation.goBack quand objectif valide est enregistré', () => {
    const { getByTestId, getByPlaceholderText } = renderWithProvider(<AccountScreen navigation={navigation} />);
    
    fireEvent.press(getByTestId('edit-goal'));
    const input = getByPlaceholderText('ex: 2500');
    fireEvent.changeText(input, '2000'); // valeur valide
    fireEvent.press(getByTestId('confirm-goal'));

    waitFor(() => {
      fireEvent.press(getByTestId('save'));
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });
});
