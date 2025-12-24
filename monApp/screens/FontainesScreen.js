import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

import CustomInput from '../components/CustomInput';
import FountainTab from '../components/FountainTab';

export default function FontainesScreen() {
  const [fontaines, setFontaines] = useState([]);
  const [filteredFontaines, setFilteredFontaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const mapRef = useRef(null);

  // FETCH
  useEffect(() => {
    fetch(
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=1500"
    )
      .then(res => res.json())
      .then(data => {
        setFontaines(data.records);
        setFilteredFontaines(data.records);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // SEARCH
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredFontaines(fontaines);
      return;
    }

    const results = fontaines.filter(f => {
      const fields = f.fields || {};
      const searchableText = `
        ${fields.nom || ''}
        ${fields.voie || ''}
        ${fields.commune || ''}
        ${fields.type_objet || ''}
      `.toLowerCase();

      return searchableText.includes(search.toLowerCase());
    });

    setFilteredFontaines(results);
  }, [search, fontaines]);

  // ZOOM MAP
  const focusOnFountain = (fountain) => {
    if (!fountain.fields?.geom_x || !fountain.fields?.geom_y) return;

    mapRef.current?.animateToRegion({
      latitude: fountain.fields.geom_y,
      longitude: fountain.fields.geom_x,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 800);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Chargement des fontaines…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>

      {/* MAP */}
      <View style={styles.topBlue}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {filteredFontaines.map(f => {
            if (!f.fields?.geom_x || !f.fields?.geom_y) return null;

            return (
              <Marker
                key={f.recordid}
                coordinate={{
                  latitude: f.fields.geom_y,
                  longitude: f.fields.geom_x,
                }}
              >
                <View style={styles.dot} />
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* LIST */}
      <View style={styles.bottomWhite}>
        <CustomInput
          placeholder="Rechercher un point d'eau"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.text}>
          {filteredFontaines.length} point{filteredFontaines.length == 1 ? '' : 's'} d'eau trouvé{filteredFontaines.length == 1 ? '' : 's'}
        </Text>

        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredFontaines.map((f, index) => (
            <TouchableOpacity
              key={f.recordid}
              activeOpacity={0.7}
              onPress={() => focusOnFountain(f)}
            >
              <FountainTab
                name={f.fields.voie || "Fontaine à boire"}
                location={f.fields.commune || "Paris"}
                distance="—"
                time="—"
                nearest={index === 0}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: {
    height: '50%',
  },
  map: {
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: PRIMARY_BLUE,
  },
  bottomWhite: {
    backgroundColor: WHITE,
    marginTop: -50,
    padding: 30,
    gap: 20,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  text: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: '#575757',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_BLUE,
  },
});
