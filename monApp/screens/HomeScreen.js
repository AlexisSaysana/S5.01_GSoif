import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';

import CustomInput from '../components/CustomInput';
import FountainTab from '../components/FountainTab';


const HomeScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
    	<View style={styles.topBlue}>
    	    <Image
    			source={require('../assets/map_ex.png')}
    		/>
        </View>
        <View style={[styles.bottomWhite, { backgroundColor: colors.background }]}>
        	<CustomInput
				placeholder="Rechercher un point d'eau"
			/>
      		<Text style={[styles.text, { color: colors.text }]}>
        		2 points d'eau à proximité
            </Text>
			<View
				style={
					{
						display: 'flex',
						flexDirection: 'column',
						gap: 15,
						justifyContent: 'center',
						alignItems: 'center',
					}
				}
			>
            <FountainTab
            	name={'Parc Sainte-Périne'}
            	location={'Paris 16ème Arr.'}
            	distance={'270 m'}
            	time={'3 min'}
            	nearest={true}
            />
			<FountainTab
            	name={'Parc Sainte-Périne'}
            	location={'Paris 16ème Arr.'}
            	distance={'350 m'}
            	time={'4 min'}
            	nearest={false}
            />
			</View>
        </View>
	</View>
  );
};

const styles = StyleSheet.create({
    topBlue: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomWhite: {
        height: '60%',
        padding: 30,
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 40,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: 30,
    },
    title: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 28,
    fontWeight: '900',
  },
    text: {
        fontFamily: fonts.Inter,
        fontSize: 16,
        textAlign: 'center',
    },
    bottomNav: {
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
});

export default HomeScreen;