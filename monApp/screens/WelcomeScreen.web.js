import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { useState } from 'react';

const WelcomeScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextSlide = () => {
    if (activeIndex < welcome.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };
  const previousSlide = () => {
      setActiveIndex(activeIndex - 1);
  };
  
  return (
    <View style={{flex: 1, backgroundColor: PRIMARY_BLUE}}>
      <View style={styles.topBlue}>
        <Image
          style={styles.icon}
          source={require('../assets/icon-light.png')}
        />
      </View>
      <View style={styles.bottomWhite}>
        <Text style={styles.title}>
          {welcome[activeIndex].title}
        </Text>
        <Text style={styles.text}>
          {welcome[activeIndex].text}
				</Text>
        <View style={styles.bottomNav}>
          <Text
            onPress={() => activeIndex == 0 ? navigation.navigate('Login') : previousSlide()}
            style={
              {
                fontFamily: fonts.inter,
							  fontSize: 16,
							  color: '#575757'
						  }
            }
					>
						{activeIndex == 0 ? 'Passer' : 'Retour'}
          </Text>
          <TouchableOpacity
            testID="arrow-button"
            style={styles.arrowButton}
            onPress={nextSlide}
          >
            <Image source={require('../assets/Arrow.png')} />
          </TouchableOpacity>
        </View>
        <View style={styles.dotsContainer}>
          {welcome.map((_, index) => (
            <View
              testID={`dot-${index}`}
              key={index}
              style={[
								styles.dot,
								index === activeIndex ? styles.dotActive : styles.dotInactive
							]}
						/>
					))}
				</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWhite: {
    height: '50%',
    width: '50%',
    backgroundColor: WHITE,
    padding: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 120,
		borderRadius: 50,
		paddingTop: 50,
    marginBottom: 50,
  },
  title: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    fontFamily: fonts.Inter,
    fontSize: 16,
    color: '#575757',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 70,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
		backgroundColor: 'white',
		paddingHorizontal: 70,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: PRIMARY_BLUE,
    marginHorizontal: 4,
  },
  dotActive: {
    opacity: 1
  },
  dotInactive: {
    opacity: 0.3,
  },
  arrowButton: {
    backgroundColor: PRIMARY_BLUE,
    display: 'flex',
    height: 65,
    width: 65,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
	icon: {
    width: 130,
    height: 130,
	}
});

const welcome = [
  {
    title: "Bienvenue sur GSoif",
    text: "La nouvelle application du groupe KBSA (305.1)",
  },
  {
    title: "Restez hydraté",
    text: "GSoif permet aux utilisateurs de suivre votre consommation journalière d'eau selon un objectif fixé",
  },
  {
    title: "Des fontaines à portée de main",
    text: "L'app vous permet aussi de localiser les points d'eau les plus proches de vous afin de remplir votre gourde"
  },
]

export default WelcomeScreen;