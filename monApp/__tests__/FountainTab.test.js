import { render, fireEvent } from '@testing-library/react-native';
import FountainTab from '../components/FountainTab';
import { ThemeContext } from '../context/ThemeContext';

jest.mock('../assets/star_filled.png', () => 1);
jest.mock('../assets/directions_walk.png', () => 1);

const mockTheme = {
  colors: {
    surface: '#FFFFFF',
    border: '#CCCCCC',
    text: '#000000',
    textSecondary: '#666666',
  },
};

const renderWithTheme = (ui) => {
  return render(
    <ThemeContext.Provider value={mockTheme}>
      {ui}
    </ThemeContext.Provider>
  );
};

describe('FountainTab', () => {
  it('affiche les informations principales d\'une fontaine', () => {
    const { getByText, queryByText } = renderWithTheme(
      <FountainTab
        name="FONTAINE_BOIS"
        location="PARC DES BUTTES CHAUMONT"
        distance="11.9 km"
        time="143 min"
        isAvailable={false}
        motif="FERMETURE HIVERNALE"
        nearest={false}
        onPress={jest.fn()}
      />
    );

    expect(getByText('FONTAINE_BOIS')).toBeTruthy();
    expect(getByText('PARC DES BUTTES CHAUMONT')).toBeTruthy();
    expect(getByText('11.9 km')).toBeTruthy();
    expect(getByText('143 min')).toBeTruthy();
    expect(queryByText('Le plus proche')).toBeNull();
  });

  it('affiche "Le plus proche" si nearest est true', () => {
    const { getByText } = renderWithTheme(
      <FountainTab
        name="FONTAINE_BOIS"
        location="AVENUE CIMETIERE BATIGNOLES"
        distance="6.7 km"
        time="81 min"
        isAvailable={true}
        nearest={true}
        onPress={jest.fn()}
      />
    );

    expect(getByText('Le plus proche')).toBeTruthy();
  });

  it('appelle onPress quand on appuie sur la carte', () => {
    const onPressMock = jest.fn();

    const { getByText } = renderWithTheme(
      <FountainTab
        name="FONTAINE_2EN1"
        location="QUAI BRANLY"
        distance="7.9 km"
        time="94 min"
        isAvailable={true}
        nearest={false}
        onPress={onPressMock}
      />
    );

    fireEvent.press(getByText('FONTAINE_2EN1'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
