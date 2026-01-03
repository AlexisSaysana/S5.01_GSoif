import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles'; // Assurez-vous du chemin correct

const QuickAddButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        padding: 15,
                      backgroundColor: '#c8e0e8',
                borderRadius: 15,
                alignItems: 'center',
    },
    buttonText: {
        color: '#000',
                fontSize: 16,
                fontWeight: 'bold',
    },
});

export default QuickAddButton;