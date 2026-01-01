import { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const BASE_URL = "https://s5-01-gsoif.onrender.com";

const LoginScreen = ({ navigation, onLogin  }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // -------------------------
    //   CONNEXION
    // -------------------------
    const handleLogin = async () => {

    if (!email.trim() || !password.trim()) {
        return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }

    try {
        console.log("📤 Envoi au backend :", {
            email: email,
            mot_de_passe: password
        });

        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                mot_de_passe: password
            })
        });

        const data = await response.json();

        console.log("📥 Réponse brute backend :", data);
        console.log("📡 Statut HTTP :", response.status);

        if (!response.ok) {
            console.log("❌ Erreur backend :", data.error);

            if (data.error === "Champs manquants") {
                return Alert.alert("Erreur", `Champs manquants : ${data.details.join(", ")}`);
            }
            if (data.error === "Utilisateur non trouvé") {
                return Alert.alert("Erreur", "Aucun compte trouvé avec cet email");
            }
            if (data.error === "Mot de passe incorrect") {
                return Alert.alert("Erreur", "Mot de passe incorrect");
            }

            return Alert.alert("Erreur", "Une erreur est survenue");
        }

        Alert.alert("Succès", "Connexion réussie !");
        const userId = data.utilisateur.id;
        onLogin(email, userId);
        

    } catch (error) {
        console.log("🔥 Erreur FETCH :", error);
        Alert.alert("Erreur", "Impossible de se connecter au serveur");
    }
};

    return (
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

                <View style={{ width: '100%', fontFamily: fonts.inter, display: 'flex', gap: 60 }}>

                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                        <CustomInput
                            placeholder="E-mail"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <CustomInput
                            placeholder="Mot de passe"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity onPress={() => console.log('Mot de passe oublié')} style={{width: '100%'}}>
                            <Text style={{
                                textDecorationLine: 'underline',
                                alignSelf: 'flex-end',
                                fontSize: 14,
                                color: '#575757',
                                marginTop: -10,
                            }}>
                                Mot de passe oublié ?
                            </Text>
                        </TouchableOpacity> 
                    </View>

                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', gap: 80 }}>
                        <CustomButton 
                            title="Se connecter" 
                            onPress={handleLogin}
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
};

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
