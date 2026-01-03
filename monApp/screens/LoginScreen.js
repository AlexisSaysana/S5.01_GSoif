import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

// On ajoute "onLogin" dans les paramètres récupérés par le composant
const LoginScreen = ({ navigation, onLogin }) => (
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
                            gap: 40,
                            marginTop: 40,
                        }
                    }
                >
                    {/* ICI : On appelle onLogin() au clic */}
                    <CustomButton
                        title="Se connecter"
                        onPress={() => onLogin()}
                    />

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