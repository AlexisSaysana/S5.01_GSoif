import React from 'react';
import { View, Text } from 'react-native';
import { baseStyles } from '../styles/baseStyles'; // Assurez-vous du chemin correct

const SplashScreen = () => (
    <View style={baseStyles.fullScreenBlue}>
        <Text style={baseStyles.logoText}>G</Text>
        {/* Ici vous intégreriez votre <Image /> réelle */}
    </View>
);

export default SplashScreen;