import { TextInput, StyleSheet } from 'react-native';
import { fonts } from '../styles/fonts';

const CustomInput = (props) => {
    return (
    <TextInput
        style={styles.input}
        placeholderTextColor="#999"
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
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        borderRadius: 15,
        fontSize: 16,
        fontFamily: fonts.inter,
    },
});

export default CustomInput;