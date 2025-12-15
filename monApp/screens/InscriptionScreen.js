import React from 'react';
import AuthCard from '../components/AuthCard'; // Assurez-vous du chemin correct
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const InscriptionScreen = () => (
    <AuthCard title="S'inscrire" isLogin={false}>
        <CustomInput placeholder="E-mail" keyboardType="email-address" />
        <CustomInput placeholder="Mot de passe" secureTextEntry={true} />
        <CustomInput placeholder="Confirmer le mot de passe" secureTextEntry={true} />

        <CustomButton title="S'inscrire" onPress={() => console.log('Inscription')} />
    </AuthCard>
);

export default InscriptionScreen;