import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Exemple d'icône pour la flèche
import { baseStyles, PRIMARY_BLUE, WHITE } from '../styles/baseStyles'; // Assurez-vous du chemin correct

const WelcomeScreen = ({ navigation }) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
        {/* Partie Bleue (Haut) */}
        <View style={styles.topBlue}>
            <Text style={baseStyles.logoText}>G</Text>
        </View>

        {/* Partie Blanche (Bas) */}
        <View style={styles.bottomWhite}>
            <View>
                <Text style={styles.welcomeTitle}>BIENVENUE sur GSoif</Text>
                <Text style={styles.welcomeText}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                </Text>
            </View>

            {/* Navigation (Passer et Flèche) */}
            <View style={styles.bottomNav}>
                <Text style={styles.passerText}>Passer</Text>

                <View style={styles.dotsContainer}>
                    <View style={styles.dotActive} />
                    <View style={styles.dotInactive} />
                    <View style={styles.dotInactive} />
                </View>

             <TouchableOpacity
  style={styles.arrowButton}
  onPress={() => navigation.navigate('Login')}
>
  <AntDesign name="arrowright" size={24} color={WHITE} />
</TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    topBlue: {
        height: '50%',
        backgroundColor: PRIMARY_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomWhite: {
        height: '50%',
        padding: 30,
        justifyContent: 'space-between',
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    bottomNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    passerText: {
        fontSize: 16,
        color: '#999',
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute', // Positionner les points au centre
        left: '50%',
        transform: [{ translateX: -20 }],
    },
    dotActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY_BLUE,
        marginHorizontal: 3,
    },
    dotInactive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#CCC',
        marginHorizontal: 3,
    },
    arrowButton: {
        backgroundColor: PRIMARY_BLUE,
        padding: 15,
        borderRadius: 30,
    },
});

export default WelcomeScreen;