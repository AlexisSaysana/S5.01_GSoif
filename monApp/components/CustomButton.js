import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles'; // Assurez-vous du chemin correct

const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;