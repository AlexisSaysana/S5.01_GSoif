import { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const BASE_URL = "https://s5-01-gsoif.onrender.com";

const LoginScreen = ({ navigation, onLogin  }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // -------------------------
    //   CONNEXION
    // -------------------------
    const handleLogin = async () => {

    if (!email.trim() || !password.trim()) {
        return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }

    try {
        // 🔒 A09:2025 - Security Logging : Suppression logs sensibles
        // console.log ne doit JAMAIS afficher de mot de passe

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

        if (!response.ok) {
            // 🔒 A10:2025 - Messages d'erreur génériques
            if (response.status === 401) {
                return Alert.alert("Erreur", "Email ou mot de passe incorrect");
            }
            if (response.status === 429) {
                return Alert.alert("Erreur", "Trop de tentatives. Réessayez dans 15 minutes.");
            }
            return Alert.alert("Erreur", data.error || "Une erreur est survenue");
        }

        Alert.alert("Succès", "Connexion réussie !");

        const user = data.utilisateur;
        // Fonction pour mettre la première lettre en majuscule
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const fullName = `${capitalize(user.prenom)} ${capitalize(user.nom)}`;

        // 🔒 A01:2025 - Broken Access Control : Stockage JWT sécurisé
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("userId", user.id.toString());
        await AsyncStorage.setItem("userEmail", user.email);
        await AsyncStorage.setItem("userName", fullName);

        // On transmet les infos à App.js
        onLogin(data.utilisateur.email, data.utilisateur.id, fullName);


    } catch (error) {
        // 🔒 A09:2025 - Pas de log d'erreurs sensibles
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
                        <View style={styles.inputContainer}>
                            <Mail size={20} color="#999" style={styles.inputIcon} />
                            <CustomInput
                                placeholder="E-mail"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.inputWithIcon}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={20} color="#999" style={styles.inputIcon} />
                            <CustomInput
                                placeholder="Mot de passe"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                style={styles.inputWithIcon}
                            />
                            <TouchableOpacity
                                testID='eye-icon'
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                            </TouchableOpacity>
                        </View>

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

                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                        <CustomButton
                            testID="se-connecter"
                            title="Se connecter"
                            onPress={handleLogin}
                        />

                        <View style={{ gap: 20, alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => onLogin(null, null)}>
                                <Text style={styles.smallLink}>
                                    Poursuivre en tant qu'invité
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
                                <Text style={styles.smallLink}>
                                    Je n'ai pas de compte
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topBlue: {
      height: '30%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomWhite: {
        height: '60%',
        width: '50%',
        backgroundColor: WHITE,
        padding: 30,
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 60,
        borderRadius: 50,
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
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        zIndex: 1,
    },
    inputWithIcon: {
        paddingLeft: 45,
    }
});

export default LoginScreen;