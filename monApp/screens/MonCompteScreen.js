import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const BASE_URL = "https://s5-01-gsoif.onrender.com";

export default function MonCompteScreen({ navigation, route }) {
  const { userEmail } = route.params;  // ✅ récupéré correctement
  console.log("EMAIL REÇU DANS MonCompteScreen :", userEmail);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const encodedEmail = encodeURIComponent(userEmail);
        const res = await fetch(`${BASE_URL}/utilisateurs/${encodedEmail}`);
        const raw = await res.text();
        console.log("RAW RESPONSE GET :", raw);

        let data;
        try {
        data = JSON.parse(raw);
        } catch (e) {
        console.log("❌ Impossible de parser JSON :", e);
        return;
        }

        setPrenom(data.prenom);
        setNom(data.nom);
        setEmail(data.email);
      } catch (error) {
        console.log(error);
        Alert.alert("Erreur", "Impossible de charger vos informations");
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async () => {
    try {
        const encodedEmail = encodeURIComponent(userEmail);

      const res = await fetch(`${BASE_URL}/utilisateurs/${encodedEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prenom,
            nom,
            email
        })
        });


const raw = await res.text();
console.log("RAW RESPONSE PUT :", raw);

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.log("❌ Impossible de parser JSON :", e);
  return;
}

      if (!res.ok) {
        return Alert.alert("Erreur", data.error || "Impossible de mettre à jour");
      }

      Alert.alert("Succès", "Informations mises à jour !");
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de modifier vos informations");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon compte</Text>
      </View>

      {/* CONTENU */}
      <View style={styles.content}>
        <CustomInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
        <CustomInput placeholder="Nom" value={nom} onChangeText={setNom} />
        <CustomInput placeholder="E-mail" value={email} onChangeText={setEmail} />
        <CustomButton title="Enregistrer les modifications" onPress={handleUpdate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  header: {
    backgroundColor: PRIMARY_BLUE,
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40
  },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: '700'
  },
  content: {
    padding: 25,
    gap: 25
  }
});
