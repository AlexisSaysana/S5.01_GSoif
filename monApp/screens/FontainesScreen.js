import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { showLocation } from "react-native-map-link";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fonts } from "../styles/fonts";
import { ThemeContext } from "../context/ThemeContext";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";

export default function FontainesScreen() {
  const { colors } = useContext(ThemeContext);
  const [pointsDEau, setPointsDEau] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const mapRef = useRef(null);

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
        const timeout = setTimeout(() => controller.abort(), 10000);

        // Correction : Utilisation du dataset correct pour les commerces
        const urlFontaines = "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=50";
        const urlCommerces = "https://opendata.paris.fr/api/records/1.0/search/?dataset=commerces-eau-de-paris&rows=50";

        const [resF, resC] = await Promise.all([
          fetch(urlFontaines, { signal: controller.signal }),
          fetch(urlCommerces, { signal: controller.signal })
        ]);

        const dataF = await resF.json();
        const dataC = await resC.json();
        clearTimeout(timeout);

        // Normalisation Fontaines (Champ: nom / voie)
        const cleanF = (dataF.records || []).map(item => ({
          id: item.recordid,
          name: item.fields.nom || item.fields.type_objet || "Fontaine à boire",
          address: item.fields.voie || "Paris",
          coords: item.fields.geo_point_2d,
          type: 'fontaine'
        }));

        // Normalisation Commerces (Champ: nom_du_commerce / adresse)
        const cleanC = (dataC.records || []).map(item => ({
          id: item.recordid,
          name: item.fields.nom_commerce || "Commerce partenaire",
          address: item.fields.nom_voie || "Paris",
          coords: item.fields.geo_point_2d,
          type: 'commerce'
        }));

        let allPoints = [...cleanF, ...cleanC];

        if (currentUserLoc) {
          allPoints = allPoints.map((p) => ({
            ...p,
            distanceKm: calculateDistance(currentUserLoc.latitude, currentUserLoc.longitude, p.coords[0], p.coords[1])
          })).sort((a, b) => a.distanceKm - b.distanceKm);
        }

        setPointsDEau(allPoints);
        setFilteredPoints(allPoints);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = pointsDEau.filter(p =>
      p.name.toLowerCase().includes(text.toLowerCase()) ||
      p.address.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPoints(filtered);
  };

  const focusOnPoint = (p) => {
    setSelectedPoint(p);
    mapRef.current?.animateCamera({
      center: { latitude: p.coords[0], longitude: p.coords[1] },
      zoom: 17
    }, { duration: 800 });
  };

  const openExternalMaps = async () => {
    if (!selectedPoint) return;

    try {
      const historyItem = {
        name: selectedPoint.name,
        location: selectedPoint.address,
        date: new Date().toISOString(),
        type: selectedPoint.type
      };

      const saved = await AsyncStorage.getItem('@fountainHistory');
      let history = saved ? JSON.parse(saved) : [];
      history = history.filter(h => h.name !== historyItem.name);
      history.unshift(historyItem);
      await AsyncStorage.setItem('@fountainHistory', JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.log('Erreur historique:', e);
    }

    showLocation({
      latitude: selectedPoint.coords[0],
      longitude: selectedPoint.coords[1],
      title: selectedPoint.name,
      appsWhiteList: ['google-maps', 'apple-maps', 'waze']
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={styles.topBlue}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          initialRegion={{
            latitude: 48.8566, longitude: 2.3522,
            latitudeDelta: 0.05, longitudeDelta: 0.05,
          }}
          onPress={() => setSelectedPoint(null)}
        >
          {filteredPoints.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.coords[0], longitude: p.coords[1] }}
              pinColor={p.type === 'fontaine' ? colors.primary : '#4CAF50'}
              onPress={() => setSelectedPoint(p)}
            />
          ))}
        </MapView>
      </View>

      <View style={[styles.bottomWhite, { backgroundColor: colors.background }]}>
        {!selectedPoint ? (
          <>
            <CustomInput
              placeholder="Rechercher fontaine ou commerce"
              value={searchText}
              onChangeText={handleSearch}
            />

            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
              {filteredPoints.map((p, index) => (
                <View key={p.id} style={{ width: '100%' }}>
                  <View style={[
                    styles.badge,
                    { backgroundColor: p.type === 'fontaine' ? colors.primary : '#4CAF50' }
                  ]}>
                    <Text style={styles.badgeText}>
                      {p.type === 'fontaine' ? 'FONTAINE' : 'COMMERCE'}
                    </Text>
                  </View>

                  <FountainTab
                    name={p.name}
                    location={p.address}
                    distance={p.distanceKm ? (p.distanceKm < 1 ? `${(p.distanceKm * 1000).toFixed(0)} m` : `${p.distanceKm.toFixed(1)} km`) : "—"}
                    time={p.distanceKm ? `${Math.round(p.distanceKm * 12)} min` : "—"}
                    nearest={index === 0 && !searchText}
                    onPress={() => focusOnPoint(p)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={[styles.detailContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={[styles.badgeDetail, { backgroundColor: selectedPoint.type === 'fontaine' ? colors.primary : '#4CAF50' }]}>
                <Text style={styles.badgeText}>{selectedPoint.type === 'fontaine' ? 'FONTAINE À BOIRE' : 'COMMERCE PARTENAIRE'}</Text>
            </View>

            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedPoint.name}</Text>
            <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{selectedPoint.address}</Text>

            <TouchableOpacity style={[styles.mainButton, { backgroundColor: colors.primary }]} onPress={openExternalMaps}>
              <Text style={[styles.mainButtonText, { color: 'white' }]}>Itinéraire</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedPoint(null)} style={{marginTop: 20}}>
              <Text style={{color: colors.primary, fontWeight: '700', fontSize: 16}}>Retour à la liste</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: { height: "50%" },
  bottomWhite: {
    height: "55%",
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    gap: 15,
    marginTop: -40,
  },
  listContainer: { paddingBottom: 100, gap: 20, width: '100%' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: -12,
    marginLeft: 12,
    zIndex: 10,
    elevation: 2,
  },
  badgeDetail: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  detailContainer: { alignItems: 'center', width: '100%' },
  handle: { width: 40, height: 5, borderRadius: 10, marginBottom: 15 },
  detailTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 5 },
  detailSub: { fontFamily: fonts.inter, fontSize: 16, marginBottom: 25, textAlign: 'center', opacity: 0.8 },
  mainButton: { width: '100%', height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  mainButtonText: { fontSize: 18, fontWeight: '700' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)' }
});