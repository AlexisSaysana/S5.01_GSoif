import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
const LoginScreen = ({ navigation }) => (
	<View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
    	<View style={styles.topBlue}>
        	<Image
            	style={styles.icon}
            	source={require('../assets/icon-light.png')}
            />
        </View>
        
        <View style={styles.bottomWhite}>
            <Text style={styles.title}>
        		Se connecter
      		</Text>
			<View
				style={
					{
						width: '100%',
						fontFamily: fonts.inter,
						display: 'flex',
						gap: 60
					}
				}
			>
				<View
					style={
						{
							width: '100%',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 30,
						}
					}
				>
					<CustomInput
						placeholder="E-mail"
						keyboardType="email-address"
					/>
					<CustomInput
						placeholder="Mot de passe"
						secureTextEntry={true}
					/>
					<TouchableOpacity onPress={() => console.log('Mot de passe oublié')} style={{width: '100%'}}>
						<Text
							style={
								{
									textDecorationLine: 'underline',
									alignSelf: 'flex-end',
									fontSize: 14,
									color: '#575757',
									marginTop: -10,
								}
							}
						>
							Mot de passe oublié ?
						</Text>
					</TouchableOpacity>	
				</View>
				<View
					style={
						{
							width: '100%',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 80,
						}
					}
				>
					<CustomButton title="Se connecter" onPress={() => console.log('Connexion')}/>
					
					<TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
						<Text style={styles.smallLink}>
							Je n'ai pas de compte
						</Text>
					</TouchableOpacity>
				</View>
			</View>
    	</View>
	</View>
);

const styles = StyleSheet.create({
    topBlue: {
        height: '25%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomWhite: {
		backgroundColor: WHITE,
        height: '75%',
        padding: 30,
        justifyContent: 'flex-start',
        alignItems: 'center',
		gap: 60,
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
		width: 90,
		height: 90,
		marginTop: 40,
	},
	smallLink: {
		color: PRIMARY_BLUE,
		fontSize: 14,
		marginTop: 5,
		fontWeight: '600'
	}
});

export default LoginScreen;