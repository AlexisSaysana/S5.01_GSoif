import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

const WelcomeScreen = ({ navigation }) => (
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
        <View style={styles.topBlue}>
            <Image
				style={styles.icon}
				source={require('../assets/icon-light.png')}
			/>
        </View>
        
        <View style={styles.bottomWhite}>
            <Text style={styles.title}>
				Bienvenue sur GSoif
			</Text>
			<Text style={styles.text}>
				La nouvelle application du groupe KBSA (305.1)
            </Text>
			
            <View style={styles.bottomNav}>
                <Text style={
					{
						fontFamily: fonts.inter,
						fontSize: 16,
						color: '#575757'
					}
				}>
					Passer
				</Text>
         	    <TouchableOpacity
				 	style={styles.arrowButton}
					onPress={() => navigation.navigate('Login')}
				>
					<Image
						source={require('../assets/Arrow.png')}
					/>
				</TouchableOpacity>
            </View>
			<View style={styles.dotsContainer}>
				<View style={[styles.dot, styles.dotActive]} />
				<View style={[styles.dot, styles.dotInactive]} />
				<View style={[styles.dot, styles.dotInactive]} />
			</View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    topBlue: {
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomWhite: {
		backgroundColor: WHITE,
        height: '50%',
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
		fontSize: 28,
		fontWeight: '900',
	},
    text: {
		fontFamily: fonts.Inter,
        fontSize: 16,
        color: '#575757',
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

export default WelcomeScreen;