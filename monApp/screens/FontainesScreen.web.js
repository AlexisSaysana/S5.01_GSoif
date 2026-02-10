import React, { useEffect, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity
} from "react-native";
import * as Location from "expo-location";
import { ThemeContext } from "../context/ThemeContext";

// Composant de secours si CustomInput ou FountainTab posent problème
const FallbackInput = ({ value, onChangeText }) => (
  <View style={{ padding: 10, backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }}>
    <Text style={{ color: '#ccc' }}>Rechercher...</Text>
  </View>
);

export default function FontainesScreen() {
  // Ajout de valeurs par défaut pour éviter le crash si le context est vide
  const theme = useContext(ThemeContext) || {};
  const colors = theme.colors || { primary: '#007AFF', background: '#F2F2F2', text: '#000' };

  const [pointsDEau, setPointsDEau] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlFontaines = "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=20";
        const response = await fetch(urlFontaines);
        const data = await response.json();

        const cleanData = (data.records || []).map(item => ({
          id: item.recordid,
          name: item.fields.nom || "Fontaine",
          address: item.fields.voie || "Paris",
          isAvailable: item.fields.dispo === "OUI",
        }));

        setPointsDEau(cleanData);
        setFilteredPoints(cleanData);
      } catch (err) {
        console.error("Erreur Fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={styles.topWeb}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
          Mode Web (Sans Carte)
        </Text>
        {selectedPoint && (
          <Text style={{ color: 'white', marginTop: 10 }}>📍 {selectedPoint.name}</Text>
        )}
      </View>

      <View style={[styles.bottomWhite, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Liste des points d'eau</Text>

          {filteredPoints.length === 0 ? (
            <Text>Aucune donnée trouvée.</Text>
          ) : (
            filteredPoints.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPoint(p)}
                style={styles.card}
              >
                <Text style={{ fontWeight: 'bold' }}>{p.name}</Text>
                <Text style={{ color: '#666' }}>{p.address}</Text>
                <Text style={{ color: p.isAvailable ? 'green' : 'red', fontSize: 12 }}>
                  {p.isAvailable ? "● Disponible" : "● Indisponible"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topWeb: { height: "30%", justifyContent: 'center', alignItems: 'center', padding: 20 },
  bottomWhite: {
    flex: 1,
    padding: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  }
});