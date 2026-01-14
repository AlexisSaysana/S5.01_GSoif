import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../screens/WelcomeScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le premier slide au chargement', () => {
    const { getByText } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Bienvenue sur GSoif')).toBeTruthy();
    expect(
      getByText('La nouvelle application du groupe KBSA (305.1)')
    ).toBeTruthy();
    expect(getByText('Passer')).toBeTruthy();
  });

  it('passe au slide suivant quand on appuie sur la flèche', () => {
    const { getByText, getByTestId } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('arrow-button'));

    expect(getByText('Restez hydraté')).toBeTruthy();
    expect(
      getByText(
        "GSoif permet aux utilisateurs de suivre votre consommation journalière d'eau selon un objectif fixé"
      )
    ).toBeTruthy();
    expect(getByText('Retour')).toBeTruthy();
  });

  it('revient au slide précédent quand on appuie sur Retour', () => {
    const { getByText, getByTestId } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('arrow-button'));
    fireEvent.press(getByText('Retour'));

    expect(getByText('Bienvenue sur GSoif')).toBeTruthy();
  });

  it('navigue vers Login quand on appuie sur Passer', () => {
    const { getByText } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByText('Passer'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('navigue vers Login quand on arrive au dernier slide et qu’on appuie sur la flèche', () => {
    const { getByTestId } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    // Aller au dernier slide
    fireEvent.press(getByTestId('arrow-button'));
    fireEvent.press(getByTestId('arrow-button'));
    fireEvent.press(getByTestId('arrow-button'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('met à jour les dots selon le slide actif', () => {
    const { getByTestId } = render(
      <WelcomeScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('arrow-button'));

    expect(getByTestId('dot-1').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
    );
  });
});
