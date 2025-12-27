import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import { fonts } from "../styles/fonts";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";

export default function FontainesScreen() {
  const [fontaines, setFontaines] = useState([]); // Liste complète
  const [filteredFontaines, setFilteredFontaines] = useState([]); // Liste affichée
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
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
        const res = await fetch(
          "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=200"
        );
        const data = await res.json();

        let cleanData = (data.records || []).filter(
          (item) =>
            item?.fields?.geo_point_2d &&
            Array.isArray(item.fields.geo_point_2d)
        );

        if (currentUserLoc) {
          cleanData = cleanData
            .map((f) => {
              const dist = calculateDistance(
                currentUserLoc.latitude,
                currentUserLoc.longitude,
                f.fields.geo_point_2d[0],
                f.fields.geo_point_2d[1]
              );
              return { ...f, distanceKm: dist };
            })
            .sort((a, b) => a.distanceKm - b.distanceKm);
        }

        setFontaines(cleanData);
        setFilteredFontaines(cleanData); // Initialise la liste filtrée
      } catch (err) {
        console.error("Erreur Fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- LOGIQUE DE RECHERCHE ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredFontaines(fontaines);
    } else {
      const filtered = fontaines.filter((f) => {
        const name = (f.fields.nom || "").toLowerCase();
        const street = (f.fields.voie || "").toLowerCase();
        const search = text.toLowerCase();
        return name.includes(search) || street.includes(search);
      });
      setFilteredFontaines(filtered);
    }
  };

  const focusOnFontaine = (fontaine) => {
    const coords = fontaine.fields?.geo_point_2d;
    if (!coords || !mapRef.current) return;

    mapRef.current.animateCamera(
      {
        center: { latitude: coords[0], longitude: coords[1] },
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 17,
      },
      { duration: 800 }
    );
  };

  const formatDistance = (dist) => {
    if (!dist) return "—";
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
  };

  const formatTime = (dist) => {
    if (!dist) return "—";
    const time = Math.round(dist * 12);
    return `${time} min`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{color: 'white', marginTop: 10, fontFamily: fonts.inter}}>Chargement des fontaines...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
      <View style={styles.topBlue}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          initialRegion={{
            latitude: userLocation?.latitude || 48.8566,
            longitude: userLocation?.longitude || 2.3522,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* On n'affiche que les markers filtrés sur la carte aussi ? 
              Ou tous ? Ici on garde tous les markers pour la visibilité */}
          {fontaines.map((f) => (
            <Marker
              key={f.recordid}
              coordinate={{
                latitude: f.fields.geo_point_2d[0],
                longitude: f.fields.geo_point_2d[1],
              }}
              title={f.fields.nom || "Fontaine"}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.bottomWhite}>
        <CustomInput 
          placeholder="Rechercher une rue ou un nom" 
          value={searchText}
          onChangeText={handleSearch}
        />
        
        <Text style={styles.countText}>
          {filteredFontaines.length} points d’eau trouvés
        </Text>

        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredFontaines.map((f, index) => (
            <FountainTab
              key={f.recordid}
              name={f.fields.nom || f.fields.type_objet || "Fontaine"}
              location={f.fields.voie || "Paris"}
              distance={formatDistance(f.distanceKm)}
              time={formatTime(f.distanceKm)}
              nearest={index === 0 && searchText === "" && userLocation !== null}
              onPress={() => focusOnFontaine(f)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: { height: "40%" },
  bottomWhite: {
    height: "60%",
    backgroundColor: WHITE || "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    gap: 15,
  },
  listContainer: { paddingBottom: 40, gap: 15 },
  countText: {
    fontSize: 14,
    color: "#575757",
    textAlign: "center",
    fontFamily: fonts.inter,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE || "#0000FF",
  },
});