import { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const BASE_URL = "https://s5-01-gsoif.onrender.com";

const SignupScreen = ({ navigation, onLogin }) => {

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (
      !prenom.trim() ||
      !nom.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
    }

    try {
      const response = await fetch(`${BASE_URL}/utilisateurs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          nom: nom,
          prenom: prenom,
          mot_de_passe: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Champs manquants") {
          return Alert.alert("Erreur", `Champs manquants : ${data.details.join(", ")}`);
        }
        if (data.error === "Email déjà utilisé") {
          return Alert.alert("Erreur", "Cet email est déjà utilisé");
        }
        return Alert.alert("Erreur", "Une erreur est survenue");
      }

      Alert.alert("Succès", "Compte créé avec succès !");
      onLogin(email);

    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
      
      {/* TOP BLUE */}
      <View style={styles.topBlue}>
        <Image
          style={styles.icon}
          source={require('../assets/icon-light.png')}
        />
      </View>
      
      {/* BOTTOM WHITE */}
      <View style={styles.bottomWhite}>

        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{
            alignItems: 'center',
            gap: 60,
            paddingBottom: 80
          }}
          showsVerticalScrollIndicator={false}
        >

          <Text style={styles.title}>
            S'inscrire
          </Text>

          <View
            style={{
              width: '100%',
              fontFamily: fonts.inter,
              display: 'flex',
              gap: 60
            }}
          >
            {/* INPUTS */}
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 30,
              }}
            >
              <CustomInput
                placeholder="Prénom"
                value={prenom}
                onChangeText={setPrenom}
              />

              <CustomInput
                placeholder="Nom"
                value={nom}
                onChangeText={setNom}
              />

              <CustomInput
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <CustomInput
                placeholder="Mot de passe"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />

              <CustomInput
                placeholder="Confirmer le mot de passe"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />  
            </View>

            {/* BUTTONS */}
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 30,
              }}
            >
              <CustomButton title="S'inscrire" onPress={handleSignup}/>
              
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.smallLink}>
                  J'ai déjà un compte
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onLogin}>
                <Text style={styles.smallLink}>Poursuivre en tant qu'invité</Text>
              </TouchableOpacity>

            </View>
          </View>

        </ScrollView>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBlue: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWhite: {
    backgroundColor: WHITE,
    height: '75%',
    padding: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 60,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 50,
  },
  title: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 28,
    fontWeight: '900',
  },
  text: {
    fontFamily: fonts.Inter,
    fontSize: 16,
    color: '#575757',
    textAlign: 'center',
  },
  bottomNav: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: PRIMARY_BLUE,
    marginHorizontal: 4,
  },
  dotActive: {
    opacity: 1
  },
  dotInactive: {
    opacity: 0.3,
  },
  arrowButton: {
    backgroundColor: PRIMARY_BLUE,
    display: 'flex',
    height: 65,
    width: 65,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 90,
    height: 90,
    marginTop: 40,
  },
  smallLink: {
    color: PRIMARY_BLUE,
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600'
  }
});

export default SignupScreen;
