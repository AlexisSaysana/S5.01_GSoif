
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { baseStyles, PRIMARY_BLUE } from '../styles/baseStyles'; // Assurez-vous du chemin correct


 const AuthCard = ({ title, children, isLogin }) => {  const navigation = useNavigation();

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={baseStyles.logoText}>G</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={baseStyles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          {children}

          {isLogin ? (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
                <Text style={styles.smallLink}>Créer un compte</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('Invité')}>
                <Text style={styles.smallLink}>Poursuivre en tant qu'invité</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.smallLink, { marginTop: 15 }]}>
                J'ai déjà un compte
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: PRIMARY_BLUE, // Le fond visible sous la carte
    },
    header: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        position: 'absolute',
        top: '30%',
        width: '100%',
        paddingHorizontal: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    smallLink: {
        color: PRIMARY_BLUE,
        fontSize: 14,
        marginTop: 5,
    }
});

export default AuthCard;