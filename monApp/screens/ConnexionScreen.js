import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AuthCard from '../components/AuthCard'; // Assurez-vous du chemin correct
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { PRIMARY_BLUE } from '../styles/baseStyles';

const ConnexionScreen = ({ navigation }) => (
    <AuthCard title="Se connecter" isLogin={true}>
        <CustomInput placeholder="E-mail" keyboardType="email-address" />
        <CustomInput placeholder="Mot de passe" secureTextEntry={true} />

        <TouchableOpacity onPress={() => console.log('Mot de passe oublié')} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      


        <CustomButton title="Se connecter" onPress={() => console.log('Connexion')} />
    </AuthCard>
);

const styles = StyleSheet.create({
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: -5, // Pour que le lien soit plus proche du champ
    },
    forgotPassword: {
        color: PRIMARY_BLUE,
        fontSize: 12,
    },
});

export default ConnexionScreen;