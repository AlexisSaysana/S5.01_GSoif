import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const QuickAddButton = ({ title, onPress, style, disabled = false }) => {
    const { colors, isDarkMode } = useContext(ThemeContext);
    const textColor = isDarkMode ? colors.text : colors.surface;
    const borderStyle = isDarkMode ? { borderWidth: 1, borderColor: colors.border } : { borderWidth: 0 };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { ...borderStyle },
                !isDarkMode && styles.lightElevated,
                style
            ]}
            onPress={onPress}
        >
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    lightElevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
        elevation: 2,
    },
});

export default QuickAddButton;