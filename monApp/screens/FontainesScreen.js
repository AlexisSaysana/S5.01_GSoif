import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import { fonts } from "../styles/fonts";

import CustomInput from "../components/CustomInput";
import FountainTab from "../components/FountainTab";

export default function FontainesScreen() {
  const [fontaines, setFontaines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=fontaines-a-boire&rows=200"
    )
      .then((res) => res.json())
      .then((data) => {
        setFontaines(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Chargement…</Text>
      </View>
    );
  }

  return (
<<<<<<< HEAD
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
=======
    <View style={{ flex: 1, backgroundColor: WHITE }}>

>>>>>>> 7acccfdddc55c4d13a378e56ee2b86f817abb43b
      {/* MAP */}
      <View style={styles.topBlue}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {fontaines.map((f) => {
            if (!f.fields?.geom_x || !f.fields?.geom_y) return null;

            return (
              <Marker
                key={f.recordid}
                coordinate={{
                  latitude: f.fields.geom_y,
                  longitude: f.fields.geom_x,
                }}
              />
            );
          })}
        </MapView>
      </View>

      {/* LISTE SCROLLABLE */}
      <View style={styles.bottomWhite}>
        <CustomInput placeholder="Rechercher un point d'eau" />

        <Text style={styles.text}>
<<<<<<< HEAD
          {fontaines.length} points d’eau trouvés
=======
          {filteredFontaines.length} point{filteredFontaines.length == 1 ? '' : 's'} d'eau trouvé{filteredFontaines.length == 1 ? '' : 's'}
>>>>>>> 7acccfdddc55c4d13a378e56ee2b86f817abb43b
        </Text>

        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {fontaines.map((f, index) => (
            <FountainTab
              key={f.recordid}
<<<<<<< HEAD
              name={f.fields.nom || "Fontaine"}
              location={f.fields.commune || "Paris"}
              distance="—"
              time="—"
              nearest={index === 0}
            />
=======
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
>>>>>>> 7acccfdddc55c4d13a378e56ee2b86f817abb43b
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: {
<<<<<<< HEAD
    height: "40%",
=======
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
>>>>>>> 7acccfdddc55c4d13a378e56ee2b86f817abb43b
  },
  bottomWhite: {
    height: "60%",
    backgroundColor: WHITE,
<<<<<<< HEAD
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    gap: 15,
  },
  listContainer: {
    paddingBottom: 40,
    gap: 15,
    alignItems: "center",
  },
  text: {
    fontFamily: fonts.Inter,
    fontSize: 14,
    color: "#575757",
    textAlign: "center",
=======
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
>>>>>>> 7acccfdddc55c4d13a378e56ee2b86f817abb43b
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE,
  },
});
