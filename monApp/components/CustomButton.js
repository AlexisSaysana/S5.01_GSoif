import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const CustomButton = ({ title, onPress, style }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, style]} onPress={onPress}>
            <Text style={[styles.buttonText, { color: colors.surface }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CustomButton;