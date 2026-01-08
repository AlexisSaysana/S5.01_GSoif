import { TextInput, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';

const CustomInput = (props) => {
    const { colors } = useContext(ThemeContext);
    return (
    <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholderTextColor={colors.textSecondary}
        {...props}
    />
);
};

const styles = StyleSheet.create({
    input: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderRadius: 15,
        fontSize: 16,
        fontFamily: fonts.inter,
    },
});

export default CustomInput;