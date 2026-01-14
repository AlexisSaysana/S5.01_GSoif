import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Select from '../components/Select';
import { ThemeContext } from '../context/ThemeContext';

const mockTheme = {
  colors: {
    text: '#000000',
    textSecondary: '#666666',
    surface: '#ffffff',
  },
};

const renderWithTheme = (ui) =>
  render(<ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>);

const options = ['Option 1', 'Option 2', 'Option 3'];

describe('Select', () => {
  it('affiche le texte par défaut (Sélectionner) ou la valeur sélectionnée', () => {
    const { getByText } = renderWithTheme(
      <Select options={options} value={null} onChange={() => {}} />
    );
    expect(getByText('Sélectionner')).toBeTruthy();

    const { getByText: getByText2 } = renderWithTheme(
      <Select options={options} value="Option 2" onChange={() => {}} />
    );
    expect(getByText2('Option 2')).toBeTruthy();
  });

  it('ouvre le modal en cliquant', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Select options={options} value={null} onChange={() => {}} />
    );
    fireEvent.press(getByText('Sélectionner'));
    expect(getByTestId('overlay')).toBeTruthy();
  });

  it('appelle onChange et ferme le modal quand une option est sélectionnée', () => {
    const onChangeMock = jest.fn();
    const { getByText, queryByText } = renderWithTheme(
      <Select options={options} value={null} onChange={onChangeMock} />
    );

    fireEvent.press(getByText('Sélectionner'));
    fireEvent.press(getByText('Option 2'));

    expect(onChangeMock).toHaveBeenCalledWith('Option 2');
    expect(queryByText('Option 1')).toBeNull(); // modal fermé
  });

  it('ferme le modal quand on clique en dehors', () => {
    const { getByText, getByTestId, queryByText } = renderWithTheme(
      <Select options={options} value={null} onChange={() => {}} />
    );

    fireEvent.press(getByText('Sélectionner')); // ouvre le modal
    fireEvent.press(getByTestId('overlay')); // clique sur l'overlay

    expect(queryByText('Option 1')).toBeNull(); // modal fermé
  });
});
