import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FontainesScreen from '../screens/FontainesScreen';
import { ThemeContext } from '../context/ThemeContext';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }) => <View>{children}</View>,
    Marker: ({ children }) => <View>{children}</View>,
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 48.842960357666016, longitude: 2.269240617752075 },
    })
  ),
}));

jest.mock('react-native-map-link', () => ({
  showLocation: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        records: [
          {
            recordid: '1',
            fields: {
              nom: 'FONTAINE_TEST',
              voie: 'RUE DE TEST',
              geo_point_2d: [48.842960357666016,2.269240617752075],
              dispo: 'OUI',
            },
          },
        ],
      }),
  })
);

const mockTheme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    border: '#CCCCCC',
    text: '#000000',
    textSecondary: '#666666',
  },
};

const renderWithTheme = () =>
  render(
    <ThemeContext.Provider value={mockTheme}>
      <FontainesScreen />
    </ThemeContext.Provider>
  );

describe('FontainesScreen', () => {
  it('affiche une fontaine après le chargement', async () => {
    const { getByText } = renderWithTheme();

    await waitFor(() => {
      expect(getByText('FONTAINE_TEST')).toBeTruthy();
    });
  });

  it('affiche le détail quand on clique sur une fontaine', async () => {
    const { getByText } = renderWithTheme();

    await waitFor(() => {
      fireEvent.press(getByText('FONTAINE_TEST'));
    });

    expect(getByText('Itinéraire')).toBeTruthy();
    expect(getByText('Retour à la liste')).toBeTruthy();
  });

  it('revient à la liste quand on clique sur "Retour à la liste"', async () => {
    const { getByText } = renderWithTheme();

    await waitFor(() => {
      fireEvent.press(getByText('FONTAINE_TEST'));
    });

    fireEvent.press(getByText('Retour à la liste'));

    expect(getByText('FONTAINE_TEST')).toBeTruthy();
  });

  it('filtre les fontaines avec la recherche', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme();

    await waitFor(() => {
      expect(getByText('FONTAINE_TEST')).toBeTruthy();
    });

    const input = getByPlaceholderText('Rechercher fontaine ou commerce');

    fireEvent.changeText(input, 'test');
    expect(getByText('FONTAINE_TEST')).toBeTruthy();

    fireEvent.changeText(input, 'inexistant');
    expect(queryByText('FONTAINE_TEST')).toBeNull();
  });
});
