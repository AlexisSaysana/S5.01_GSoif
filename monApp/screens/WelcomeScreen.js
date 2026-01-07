import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { useState } from 'react';

const WelcomeScreen = ({ navigation, onLogin }) => {
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
            style={styles.arrowButton}
            onPress={nextSlide}
          >
            <Image source={require('../assets/Arrow.png')} />
          </TouchableOpacity>
        </View>
        {activeIndex === 0 && (
          <TouchableOpacity style={styles.guestButton} onPress={() => onLogin('', 0)}>
            <Text style={styles.guestButtonText}>Continuer en tant qu'invité</Text>
          </TouchableOpacity>
        )}
        <View style={styles.dotsContainer}>
          {welcome.map((_, index) => (
            <View
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
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWhite: {
    height: '50%',
    backgroundColor: WHITE,
    padding: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 80,
		borderTopLeftRadius: 50,
		borderTopRightRadius: 50,
		paddingTop: 50,
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
		paddingHorizontal: 20,
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
,
  guestButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    color: WHITE,
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '600'
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