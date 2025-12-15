import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const CustomInput = (props) => (
    <TextInput
        style={styles.input}
        placeholderTextColor="#AAA"
        {...props}
    />
);

const styles = StyleSheet.create({
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
        fontSize: 16,
    },
});

export default CustomInput;