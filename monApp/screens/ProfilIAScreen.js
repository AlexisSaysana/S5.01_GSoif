import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

export default function ProfilIAScreen({ route }) {
  const id_utilisateur = route?.params?.userId;

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [taille, setTaille] = useState("");
  const [poids, setPoids] = useState("");
  const [objectif, setObjectif] = useState(null);
  const [explication, setExplication] = useState("");

  useEffect(() => {
    if (!id_utilisateur) return;

    axios
      .get(`http://<IP>:3000/profile/${id_utilisateur}`)
      .then((res) => {
        if (res.data) {
          setAge(res.data.age?.toString() || "");
          setSexe(res.data.sexe || "");
          setTaille(res.data.taille?.toString() || "");
          setPoids(res.data.poids?.toString() || "");
          setObjectif(res.data.objectif || null);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const saveProfile = () => {
    axios
      .post("http://<IP>:3000/profile/update", {
        id_utilisateur,
        age,
        sexe,
        taille,
        poids,
      })
      .then(() => alert("Profil mis à jour"))
      .catch((err) => console.log(err));
  };

  const recalculateGoal = () => {
    axios
      .post("http://<IP>:3000/profile/calculate", {
        id_utilisateur,
        temperature: 28, // TEMPORAIRE — API météo ensuite
      })
      .then((res) => {
        setObjectif(res.data.objectif);
        setExplication(res.data.explication);
      })
      .catch((err) => console.log(err));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profil IA</Text>

      <TextInput
        style={styles.input}
        placeholder="Âge"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        style={styles.input}
        placeholder="Sexe (homme/femme)"
        value={sexe}
        onChangeText={setSexe}
      />

      <TextInput
        style={styles.input}
        placeholder="Taille (cm)"
        keyboardType="numeric"
        value={taille}
        onChangeText={setTaille}
      />

      <TextInput
        style={styles.input}
        placeholder="Poids (kg)"
        keyboardType="numeric"
        value={poids}
        onChangeText={setPoids}
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Enregistrer mes informations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#4CAF50" }]} onPress={recalculateGoal}>
        <Text style={styles.buttonText}>Recalculer mon objectif</Text>
      </TouchableOpacity>

      {objectif && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Objectif : {objectif} L</Text>
          {explication !== "" && (
            <Text style={styles.explain}>{explication}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFF" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  resultBox: { margin