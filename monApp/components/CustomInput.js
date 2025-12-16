import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { fonts } from '../styles/fonts';

const CustomInput = (props) => (
    <TextInput
        style={styles.input}
        placeholderTextColor="#575757"
        {...props}
    />
);

const styles = StyleSheet.create({
    input: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        fontSize: 16,
        fontFamily: fonts.inter,
    },
});

export default CustomInput;