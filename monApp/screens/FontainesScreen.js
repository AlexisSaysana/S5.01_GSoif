import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { showLocation } from "react-native-map-link";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fonts } from "../styles/fonts";
import { ThemeContext } from "../context/ThemeContext";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";

export default function FontainesScreen() {
  const { colors } = useContext(ThemeContext);
  const [fontaines, setFontaines] = useState([]);
  const [filteredFontaines, setFilteredFontaines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFontaine, setSelectedFontaine] = useState(null);

  const mapRef = useRef(null);

  // Calcul de distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let currentUserLoc = null;

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        currentUserLoc = location.coords;
        setUserLocation(currentUserLoc);
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch("https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=30", { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        let cleanData = (data.records || []).filter(item => item?.fields?.geo_point_2d);

        if (currentUserLoc) {
          cleanData = cleanData.map((f) => ({
            ...f,
            distanceKm: calculateDistance(currentUserLoc.latitude, currentUserLoc.longitude, f.fields.geo_point_2d[0], f.fields.geo_point_2d[1])
          })).sort((a, b) => a.distanceKm - b.distanceKm);
        }

        setFontaines(cleanData);
        setFilteredFontaines(cleanData);
      } catch (err) {
        console.error('Fontaines fetch error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = fontaines.filter(f =>
      (f.fields.nom || "").toLowerCase().includes(text.toLowerCase()) ||
      (f.fields.voie || "").toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFontaines(filtered);
  };

  const focusOnFontaine = (f) => {
    setSelectedFontaine(f);
    mapRef.current?.animateCamera({
      center: { latitude: f.fields.geo_point_2d[0], longitude: f.fields.geo_point_2d[1] },
      zoom: 17
    }, { duration: 800 });
  };

  // --- FONCTION MAJ : SAUVEGARDE HISTORIQUE + NAVIGATION ---
  const openExternalMaps = async () => {
    if (!selectedFontaine) return;

    try {
      const historyItem = {
        name: selectedFontaine.fields.nom || selectedFontaine.fields.type_objet || 'Fontaine à boire',
        location: selectedFontaine.fields.voie || 'Paris',
        date: new Date().toISOString(),
        latitude: selectedFontaine.fields.geo_point_2d[0],
        longitude: selectedFontaine.fields.geo_point_2d[1],
      };

      const saved = await AsyncStorage.getItem('@fountainHistory');
      let history = saved ? JSON.parse(saved) : [];

      // Suppression de l'entrée si elle existe déjà (pour la faire remonter en haut)
      history = history.filter(h => h.name !== historyItem.name || h.location !== historyItem.location);

      // Ajout au début et limite à 20 entrées
      history.unshift(historyItem);
      history = history.slice(0, 20);

      await AsyncStorage.setItem('@fountainHistory', JSON.stringify(history));
    } catch (e) {
      console.log('Erreur sauvegarde historique', e);
    }

    // Ouverture de l'application GPS
    showLocation({
      latitude: selectedFontaine.fields.geo_point_2d[0],
      longitude: selectedFontaine.fields.geo_point_2d[1],
      title: selectedFontaine.fields.nom || "Fontaine",
      appsWhiteList: ['google-maps', 'apple-maps', 'waze']
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={styles.topBlue}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          initialRegion={{
            latitude: 48.8566, longitude: 2.3522,
            latitudeDelta: 0.05, longitudeDelta: 0.05,
          }}
          onPress={() => setSelectedFontaine(null)}
        >
          {filteredFontaines.map((f) => (
            <Marker
              key={f.recordid}
              coordinate={{ latitude: f.fields.geo_point_2d[0], longitude: f.fields.geo_point_2d[1] }}
              onPress={() => setSelectedFontaine(f)}
            />
          ))}
        </MapView>
      </View>

      <View style={[styles.bottomWhite, { backgroundColor: colors.background }]}>
        {!selectedFontaine ? (
          <>
            <CustomInput
              placeholder="Rechercher un point d'eau"
              value={searchText}
              onChangeText={handleSearch}
            />
            <Text style={[styles.countText, { color: colors.text }]}>
              {filteredFontaines.length} points d'eau trouvés
            </Text>
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
              {filteredFontaines.map((f, index) => (
                <FountainTab
                  key={f.recordid}
                  name={f.fields.nom || f.fields.type_objet || "Fontaine"}
                  location={f.fields.voie || "Paris"}
                  distance={f.distanceKm ? (f.distanceKm < 1 ? `${(f.distanceKm * 1000).toFixed(0)} m` : `${f.distanceKm.toFixed(1)} km`) : "—"}
                  time={f.distanceKm ? `${Math.round(f.distanceKm * 12)} min` : "—"}
                  nearest={index === 0 && !searchText}
                  onPress={() => focusOnFontaine(f)}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={[styles.detailContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              {selectedFontaine.fields.nom || "Fontaine à boire"}
            </Text>
            <Text style={[styles.detailSub, { color: colors.textSecondary }]}>
              {selectedFontaine.fields.voie}, Paris
            </Text>

            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]} />

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: colors.primary }]}
              onPress={openExternalMaps}
            >
              <Text style={[styles.mainButtonText, { color: colors.surface }]}>Faire l'itinéraire</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedFontaine(null)} style={{marginTop: 15, paddingVertical: 8}}>
              <Text style={{color: colors.primary, fontFamily: fonts.inter, fontWeight: '600'}}>
                Retour à la liste
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: { height: "55%" },
  bottomWhite: {
    height: "55%",
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    gap: 15,
    marginTop: -40,
  },
  listContainer: { paddingBottom: 100, gap: 15, width: '100%' },
  countText: { fontSize: 14, textAlign: "center", fontFamily: fonts.inter },
  detailContainer: { alignItems: 'center', width: '100%' },
  handle: { width: 40, height: 5, borderRadius: 10, marginBottom: 15 },
  detailTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  detailSub: { fontFamily: fonts.inter, marginBottom: 20 },
  imagePlaceholder: { width: '100%', height: 150, borderRadius: 20, marginBottom: 20 },
  mainButton: {
    width: '100%', height: 55, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },
  mainButtonText: { fontFamily: fonts.inter, fontSize: 18, fontWeight: '700' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)'
  }
});