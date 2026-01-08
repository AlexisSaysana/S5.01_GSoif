import { StyleSheet } from 'react-native';

export const PRIMARY_BLUE = '#2B8CDB';
export const WHITE = '#FFFFFF';

export const baseStyles = StyleSheet.create({
    // Styles généraux pour le fond blanc de la zone de contenu
    container: {
        flex: 1,
        backgroundColor: WHITE,
        padding: 20,
        justifyContent: 'center',
    },
    // Style pour les écrans de chargement/splash entièrement bleus
    fullScreenBlue: {
        flex: 1,
        backgroundColor: PRIMARY_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Style de base pour le logo 'G'
    logoText: {
        fontSize: 72,
        fontWeight: 'bold',
        color: WHITE,
    },
    // Style de la carte blanche flottante (Connexion/Inscription)
    card: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 30,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
    }
});