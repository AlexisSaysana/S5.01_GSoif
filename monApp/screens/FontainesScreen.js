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
import { QUESTS } from "../utils/questsData";
import { WHITE } from "../styles/baseStyles";

const COMMENTAIRES = {
  "c800e3c0b0bbc69fea035558bc8c6c080fe4f03b": [
    {
      utilisateur: "Alya",
      note: 4,
      commentaire: "Eau fraîche et propre 👍"
    },
    {
      utilisateur: "Alexis",
      note: 5,
      commentaire: "Très pratique après le sport"
    }
  ],

  "e2d4f277d8ec58ee425a74387f1b84e058b5cda8": [
    {
      utilisateur: "Kenza",
      note: 3
    },
  ]
};

const getNoteMoyenne = (avis) => {
  if (!avis || avis.length === 0) return 0;
  const sum = avis.reduce((acc, r) => acc + r.rating, 0);
  return sum / avis.length;
};


export default function FontainesScreen() {
  const { colors, email: userEmail } = useContext(ThemeContext);
  const [pointsDEau, setPointsDEau] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [avis, setAvis] = useState([]);

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

        const urlFontaines = "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=50";
        const urlCommerces = "https://opendata.paris.fr/api/records/1.0/search/?dataset=commerces-eau-de-paris&rows=50";

        const [resF, resC] = await Promise.all([
          fetch(urlFontaines, { signal: controller.signal }),
          fetch(urlCommerces, { signal: controller.signal })
        ]);

        const dataF = await resF.json();
        const dataC = await resC.json();
        clearTimeout(timeout);

        const cleanF = (dataF.records || []).map(item => ({
          id: item.recordid,
          name: item.fields.nom || item.fields.type_objet || "Fontaine à boire",
          address: item.fields.voie || "Paris",
          coords: item.fields.geo_point_2d,
          type: 'fontaine',
          isAvailable: item.fields.dispo === "OUI",
          motif: item.fields.motif_ind || "Fermeture saisonnière"
        }));

        const cleanC = (dataC.records || []).map(item => ({
          id: item.recordid,
          name: item.fields.nom_commerce || "Commerce partenaire",
          address: item.fields.nom_voie || "Paris",
          coords: item.fields.geo_point_2d,
          type: 'commerce',
          isAvailable: true
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

  useEffect(() => {
    if (!selectedPoint) return;
    
    const comments = COMMENTAIRES[selectedPoint.id] || [];
    setAvis(comments);
  }, [selectedPoint]);


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
      // 1️⃣ AJOUTER DANS L'HISTORIQUE
      await fetch("https://s5-01-gsoif.onrender.com/historique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name: selectedPoint.name,
          location: selectedPoint.address,
          latitude: selectedPoint.coords[0],
          longitude: selectedPoint.coords[1],
          date: new Date().toISOString()
        })
      });

      // 2️⃣ INCRÉMENTER LE CLICKCOUNT
      await fetch(`https://s5-01-gsoif.onrender.com/stats/click/${userEmail}`, {
        method: "PUT"
      });

      // 3️⃣ VÉRIFIER LES QUÊTES ET ENREGISTRER LES BADGES
      const statsRes = await fetch(`https://s5-01-gsoif.onrender.com/stats/${userEmail}`);
      const stats = await statsRes.json();

      for (const quest of QUESTS) {
        const progress = quest.type === "click" ? stats.clickCount : 0;

        if (progress >= quest.goal) {
          await fetch("https://s5-01-gsoif.onrender.com/badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              badge_id: quest.id
            })
          });
        }
      }

    } catch (e) {
      console.log("Erreur historique/stats/badges:", e);
    }

    // 4️⃣ OUVERTURE GPS
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
              pinColor={!p.isAvailable ? '#B0B0B0' : (p.type === 'fontaine' ? colors.primary : '#4CAF50')}
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
                <View key={p.id} style={styles.itemWrapper}>
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
                    isAvailable={p.isAvailable}
                    motif={p.motif}
                    nearest={index === 0 && !searchText}
                    avis={COMMENTAIRES[p.id] || []}
                    onPress={() => focusOnPoint(p)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <ScrollView contentContainerStyle={[styles.detailContainer, { backgroundColor: colors.background, paddingBottom: 100, }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={[styles.badge, { backgroundColor: selectedPoint.type === 'fontaine' ? colors.primary : '#4CAF50', marginBottom: 10, marginLeft: 0 }]}>
              <Text style={styles.badgeText}>{selectedPoint.type === 'fontaine' ? 'FONTAINE' : 'COMMERCE'}</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedPoint.name}</Text>
            {avis.length > 0 && <View
              style={
                {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  paddingVertical: 5,
                  paddingHorizontal: 5,
                  borderRadius: 15,
                  marginBottom: 5,
                }
              }
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: WHITE}}
              >
                💧{getNoteMoyenne(avis).toFixed(1)}/5
              </Text>
            </View>}
              
            </View>
            <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{selectedPoint.address}</Text>
          
            {!selectedPoint.isAvailable && (
                 <Text style={styles.motifTextDetail}>Ce point d'eau est actuellement indisponible.</Text>
            )}
            
            <TouchableOpacity
              disabled={!selectedPoint.isAvailable}
              style={[styles.mainButton, { backgroundColor: selectedPoint.isAvailable ? colors.primary : colors.border }]}
              onPress={openExternalMaps}
            >
              <Text style={[styles.mainButtonText, { color: 'white' }]}>
                {selectedPoint.isAvailable ? "Itinéraire" : "Indisponible"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedPoint(null)} style={{marginTop: 20}}>
              <Text style={{color: colors.primary, fontWeight: '700', fontSize: 16}}>Retour à la liste</Text>
            </TouchableOpacity>

            <View
              style={
                {
                  backgroundColor: WHITE,
                  width: "100%",
                  gap: 0,
                  marginTop: 25,
                  paddingVertical: 40,
                  borderRadius: 25,
                }
              }
            >
              <Text style={{ fontFamily: fonts.bricolageGrotesque, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 15 }}>
                Avis des utilisateurs
              </Text>
              
              {avis.length === 0 && (
                <Text style={{ alignSelf: "center" }}>
                  Aucun avis pour le moment
                </Text>
              )}
              
              {avis.map((r, i) => (
                <View
                  key={i}
                  style={
                    {
                      borderTopWidth: (i == 0 ? 0 : 1),
                      borderColor: colors.border,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10
                    }
                  }>
                  <View
                    style={
                      {
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                      }
                    }
                  >
                    <Text
                      style={{ fontWeight: "700", paddingVertical: 3, fontFamily: fonts.bricolageGrotesque, fontSize: 18}}
                    >
                      {r.user} 
                    </Text>
                    <View
                      style={
                        {
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: colors.primary,
                          paddingHorizontal: 6,
                          borderRadius: 15,
                        }
                      }
                    >
                      <Text
                        style={{ fontSize: 10, fontWeight: "600", color: WHITE}}
                      >
                        💧{r.rating}/5
                      </Text>
                    </View>
                  </View>
                  {r.comment && <Text>{r.comment}</Text>}
                </View>
              ))}
            </View>

          </ScrollView>
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
  itemWrapper: { width: '100%' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: -12,
    marginLeft: 15,
    zIndex: 10,
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900' },
  detailContainer: { alignItems: 'center', width: '100%' },
  handle: { width: 40, height: 5, borderRadius: 10, marginBottom: 15 },
  detailTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 5 },
  detailSub: { fontFamily: fonts.inter, fontSize: 16, marginBottom: 15, textAlign: 'center', opacity: 0.8 },
  motifTextDetail: { fontFamily: fonts.inter, color: '#FF5252', fontSize: 14, marginBottom: 20, fontStyle: 'italic' },
  mainButton: { width: '100%', height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  mainButtonText: { fontSize: 18, fontWeight: '700' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)' }
});