import React, { useEffect, useState, useRef } from "react";
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

import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import { fonts } from "../styles/fonts";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";

export default function FontainesScreen() {
  const [fontaines, setFontaines] = useState([]);
  const [filteredFontaines, setFilteredFontaines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFontaine, setSelectedFontaine] = useState(null);
  
  const mapRef = useRef(null);

  // Fonction pour calculer la distance entre deux points
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
      // Demande de permission de géolocalisation
      let { status } = await Location.requestForegroundPermissionsAsync();
      let currentUserLoc = null;

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        currentUserLoc = location.coords;
        setUserLocation(currentUserLoc);
      }

      try {
        // Récupération des données Open Data Paris
        const res = await fetch("https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=100");
        const data = await res.json();
        let cleanData = (data.records || []).filter(item => item?.fields?.geo_point_2d);

        // Tri par distance si la localisation est disponible
        if (currentUserLoc) {
          cleanData = cleanData.map((f) => ({
            ...f,
            distanceKm: calculateDistance(currentUserLoc.latitude, currentUserLoc.longitude, f.fields.geo_point_2d[0], f.fields.geo_point_2d[1])
          })).sort((a, b) => a.distanceKm - b.distanceKm);
        }

        setFontaines(cleanData);
        setFilteredFontaines(cleanData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Gestion de la recherche
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = fontaines.filter(f => 
      (f.fields.nom || "").toLowerCase().includes(text.toLowerCase()) || 
      (f.fields.voie || "").toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFontaines(filtered);
  };

  // Centrer la carte sur une fontaine
  const focusOnFontaine = (f) => {
    setSelectedFontaine(f);
    mapRef.current?.animateCamera({
      center: { latitude: f.fields.geo_point_2d[0], longitude: f.fields.geo_point_2d[1] },
      zoom: 17
    }, { duration: 800 });
  };

  // Ouvrir l'application de navigation externe
  const openExternalMaps = () => {
    if (!selectedFontaine) return;
    showLocation({
      latitude: selectedFontaine.fields.geo_point_2d[0],
      longitude: selectedFontaine.fields.geo_point_2d[1],
      title: selectedFontaine.fields.nom || "Fontaine",
      appsWhiteList: ['google-maps', 'apple-maps', 'waze']
    });
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#FFF" /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
      {/* PARTIE CARTE */}
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
          onPress={() => setSelectedFontaine(null)} // Ferme les détails au clic sur la carte
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

      {/* PARTIE BLANCHE (LISTE OU DÉTAILS) */}
      <View style={styles.bottomWhite}>
        {!selectedFontaine ? (
          /* AFFICHAGE DE LA LISTE */
          <>
            <CustomInput 
              placeholder="Rechercher un point d'eau" 
              value={searchText} 
              onChangeText={handleSearch} 
            />
            <Text style={styles.countText}>{filteredFontaines.length} points d’eau trouvés</Text>
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
          /* AFFICHAGE DES DÉTAILS DE LA FONTAINE SÉLECTIONNÉE */
          <View style={styles.detailContainer}>
            <View style={styles.handle} />
            <Text style={styles.detailTitle}>{selectedFontaine.fields.nom || "Fontaine à boire"}</Text>
            <Text style={styles.detailSub}>{selectedFontaine.fields.voie}, Paris</Text>
            
            {/* Rectangle gris pour l'image */}
            <View style={styles.imagePlaceholder} />
            
            <TouchableOpacity style={styles.mainButton} onPress={openExternalMaps}>
              <Text style={styles.mainButtonText}>Faire l'itinéraire</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setSelectedFontaine(null)} style={{marginTop: 15}}>
              <Text style={{color: '#999', fontFamily: fonts.inter}}>Retour à la liste</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: PRIMARY_BLUE },
  topBlue: { height: "45%" },
  bottomWhite: { 
    height: "55%", 
    backgroundColor: WHITE, 
    padding: 20, 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    gap: 15 
  },
  listContainer: { paddingBottom: 100, gap: 15 },
  countText: { fontSize: 14, color: "#575757", textAlign: "center", fontFamily: fonts.inter },
  
  // Styles pour la vue détails
  detailContainer: { alignItems: 'center', width: '100%' },
  handle: { width: 40, height: 5, backgroundColor: '#EEE', borderRadius: 10, marginBottom: 15 },
  detailTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  detailSub: { fontFamily: fonts.inter, color: '#666', marginBottom: 20 },
  imagePlaceholder: { 
    width: '100%', 
    height: 150, 
    backgroundColor: '#F2F2F2', 
    borderRadius: 20, 
    marginBottom: 20 
  },
  mainButton: { 
    backgroundColor: PRIMARY_BLUE, 
    width: '100%', 
    height: 55, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  }
  mainButtonText: { color: WHITE, fontFamily: fonts.inter, fontSize: 18, fontWeight: '700' }
});