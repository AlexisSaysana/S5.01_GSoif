import React, { useEffect, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import * as Location from "expo-location";
import { ThemeContext } from "../context/ThemeContext";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";
import { WHITE } from "../styles/baseStyles";

const getNoteMoyenne = (avis) => {
  if (!avis || avis.length === 0) return 0;
  const sum = avis.reduce((acc, r) => acc + (r.rating || 0), 0);
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

  // États pour le nouveau commentaire
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchAvis = async (fountainId) => {
    try {
      const response = await fetch(`https://s5-01-gsoif.onrender.com/commentaires/${fountainId}`);
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        setAvis([]);
        return;
      }
      const data = await response.json();
      setAvis(data);
    } catch (err) {
      setAvis([]);
    }
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
        const urlFontaines = "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=50";
        const urlCommerces = "https://opendata.paris.fr/api/records/1.0/search/?dataset=commerces-eau-de-paris&rows=50";
        const [resF, resC] = await Promise.all([fetch(urlFontaines), fetch(urlCommerces)]);
        const dataF = await resF.json();
        const dataC = await resC.json();

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
      } catch (err) { console.error(err); } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (selectedPoint) {
      fetchAvis(selectedPoint.id);
      setShowForm(false);
    }
  }, [selectedPoint]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = pointsDEau.filter(p =>
      p.name.toLowerCase().includes(text.toLowerCase()) ||
      p.address.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPoints(filtered);
  };

  const envoyerAvis = async () => {
    if (!commentText.trim()) return alert("Veuillez écrire un commentaire.");
    setSubmitting(true);
    try {
      const response = await fetch("https://s5-01-gsoif.onrender.com/commentaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fountain_id: selectedPoint.id,
          email: userEmail,
          rating: rating,
          comment: commentText
        })
      });

      if (response.ok) {
        setCommentText("");
        setShowForm(false);
        fetchAvis(selectedPoint.id);
        alert("Succès : Votre avis a été ajouté !");
      } else {
        alert("Erreur : Le serveur a refusé l'avis.");
      }
    } catch (e) {
      alert("Erreur : Impossible d'envoyer l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const openExternalMaps = async () => {
    if (!selectedPoint) return;
    try {
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
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.coords[0]},${selectedPoint.coords[1]}`;
      window.open(url, '_blank');
    } catch (e) { console.log(e); }
  };

  // URL dynamique pour l'iframe (centrée sur le point sélectionné ou Paris)
  const mapUrl = selectedPoint
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedPoint.coords[1]-0.005},${selectedPoint.coords[0]-0.005},${selectedPoint.coords[1]+0.005},${selectedPoint.coords[0]+0.005}&layer=mapnik&marker=${selectedPoint.coords[0]},${selectedPoint.coords[1]}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=2.25,48.82,2.42,48.90&layer=mapnik`;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={styles.topBlue}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          title="Fountain Map"
          src={mapUrl}
          style={{ backgroundColor: '#cbd5e1' }}
        />
      </View>

      <View style={[styles.bottomWhite, { backgroundColor: colors.background }]}>
        {!selectedPoint ? (
          <>
            <CustomInput placeholder="Rechercher fontaine ou commerce" value={searchText} onChangeText={handleSearch} />
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
              {filteredPoints.map((p, index) => (
                <View key={p.id} style={styles.itemWrapper}>
                   <View style={[styles.badge, { backgroundColor: p.type === 'fontaine' ? colors.primary : '#4CAF50' }]}>
                    <Text style={styles.badgeText}>{p.type === 'fontaine' ? 'FONTAINE' : 'COMMERCE'}</Text>
                  </View>
                  <FountainTab
                    name={p.name}
                    location={p.address}
                    distance={p.distanceKm ? (p.distanceKm < 1 ? `${(p.distanceKm * 1000).toFixed(0)} m` : `${p.distanceKm.toFixed(1)} km`) : "—"}
                    time={p.distanceKm ? `${Math.round(p.distanceKm * 12)} min` : "—"}
                    isAvailable={p.isAvailable}
                    motif={p.motif}
                    nearest={index === 0 && !searchText}
                    onPress={() => { setSelectedPoint(p); }}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <ScrollView contentContainerStyle={[styles.detailContainer, { backgroundColor: colors.background, paddingBottom: 100 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedPoint.name}</Text>

            {avis.length > 0 && (
              <View style={{ backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: WHITE }}>💧 {getNoteMoyenne(avis).toFixed(1)}/5</Text>
              </View>
            )}

            <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{selectedPoint.address}</Text>

            <TouchableOpacity
              disabled={!selectedPoint.isAvailable}
              style={[styles.mainButton, { backgroundColor: selectedPoint.isAvailable ? colors.primary : colors.border, marginBottom: 10 }]}
              onPress={openExternalMaps}
            >
              <Text style={[styles.mainButtonText, { color: 'white' }]}>Itinéraire (Google Maps)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedPoint(null)}>
              <Text style={{color: colors.primary, fontWeight: '700'}}>Retour à la liste</Text>
            </TouchableOpacity>

            <View style={{ width: '100%', marginTop: 30, backgroundColor: WHITE, borderRadius: 20, padding: 15 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: '800' }}>Avis</Text>
                <TouchableOpacity
                  onPress={() => setShowForm(!showForm)}
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                >
                  <Text style={{ color: WHITE, fontWeight: '700' }}>{showForm ? "Annuler" : "Noter"}</Text>
                </TouchableOpacity>
              </View>

              {showForm && (
                <View style={{ marginBottom: 20, padding: 10, borderBottomWidth: 1, borderColor: colors.border }}>
                  <Text style={{ marginBottom: 5, fontWeight: '600' }}>Note : {rating} 💧</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <TouchableOpacity key={num} onPress={() => setRating(num)}>
                        <Text style={{ fontSize: 24 }}>{num <= rating ? "💧" : "⚪"}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={{ backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, outlineStyle: 'none' }}
                    placeholder="Votre avis..."
                    multiline
                    numberOfLines={3}
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <TouchableOpacity
                    onPress={envoyerAvis}
                    disabled={submitting}
                    style={{ backgroundColor: colors.primary, marginTop: 10, padding: 12, borderRadius: 10, alignItems: 'center' }}
                  >
                    {submitting ? <ActivityIndicator color={WHITE} /> : <Text style={{ color: WHITE, fontWeight: '700' }}>Envoyer l'avis</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {avis.length === 0 ? (
                <Text style={{ textAlign: 'center', opacity: 0.5 }}>Aucun avis</Text>
              ) : (
                avis.map((r, i) => (
                  <View key={i} style={{ paddingVertical: 10, borderBottomWidth: i === avis.length - 1 ? 0 : 1, borderColor: '#eee' }}>
                    <Text style={{ fontWeight: '700' }}>{r.user} <Text style={{ color: colors.primary }}>{r.rating}/5 💧</Text></Text>
                    <Text style={{ marginTop: 3 }}>{r.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBlue: { height: "50%" },
  bottomWhite: { height: "55%", padding: 20, borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: -40 },
  listContainer: { paddingBottom: 100, gap: 20 },
  itemWrapper: { width: '100%' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: -12, marginLeft: 15, zIndex: 10 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900' },
  detailContainer: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 10, marginBottom: 15 },
  detailTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  detailSub: { fontSize: 14, marginBottom: 15, textAlign: 'center', opacity: 0.6 },
  mainButton: { width: '100%', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  mainButtonText: { fontSize: 16, fontWeight: '700' },
});