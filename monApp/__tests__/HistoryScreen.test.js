import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryScreen from '../screens/HistoryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

// Mock navigation
const mockNavigation = { goBack: jest.fn() };

// Mock Theme
const mockTheme = {
  colors: {
    background: '#fff',
    surface: '#f0f0f0',
    text: '#000',
    textSecondary: '#666',
    primary: '#0000FF',
    border: '#ccc',
  },
};

// Helper pour rendre le composant avec ThemeContext
const renderWithTheme = () =>
  render(
    <ThemeContext.Provider value={mockTheme}>
      <HistoryScreen navigation={mockNavigation} />
    </ThemeContext.Provider>
  );

it('affiche les éléments de l\'historique', async () => {
  await AsyncStorage.setItem(
    '@fountainHistory',
    JSON.stringify([
      {
        id: '1',
        name: 'FONTAINE_TEST1',
        location: 'AVENUE DU PREMIER TEST',
        date: '2026-01-08',
      },
      {
        id: '2',
        name: 'FONTAINE_TEST2',
        location: 'RUE DU SECOND ESSAI',
        date: '2026-01-09',
      },
    ])
  );

  const { getByText } = renderWithTheme();

  await waitFor(() => {
    expect(getByText('FONTAINE_TEST1')).toBeTruthy();
    expect(getByText('AVENUE DU PREMIER TEST')).toBeTruthy();
    expect(getByText('FONTAINE_TEST2')).toBeTruthy();
    expect(getByText('RUE DU SECOND ESSAI')).toBeTruthy();
  });
});

it('affiche un message si l\'historique est vide', async () => {
  await AsyncStorage.removeItem('@fountainHistory');

  const { getByText } = renderWithTheme();

  await waitFor(() => {
    expect(getByText('Aucun point d\'eau dans l\'historique')).toBeTruthy();
  });
});

import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons = []) => {
  const deleteButton = buttons.find(b => b.text === 'Supprimer');
  if (deleteButton && deleteButton.onPress) {
    deleteButton.onPress();
  }
});


it('supprime tout l\'historique', async () => {
  await AsyncStorage.setItem(
    '@fountainHistory',
    JSON.stringify([{ id: '1', name: 'FONTAINE_TEST3', location: 'PLACE DE LA TROISIEME FOIS', date: '2026-01-10' }])
  );

  const { getByText, queryByText } = renderWithTheme();

  await waitFor(() => expect(getByText('FONTAINE_TEST3')).toBeTruthy());

  fireEvent.press(getByText('Supprimer l\'historique'));

  await waitFor(() => {
    expect(queryByText('FONTAINE_TEST3')).toBeNull();
  });
});


