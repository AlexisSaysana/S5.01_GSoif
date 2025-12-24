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
    <View style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
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
          {fontaines.length} points d’eau trouvés
        </Text>

        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {fontaines.map((f, index) => (
            <FountainTab
              key={f.recordid}
              name={f.fields.nom || "Fontaine"}
              location={f.fields.commune || "Paris"}
              distance="—"
              time="—"
              nearest={index === 0}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBlue: {
    height: "40%",
  },
  bottomWhite: {
    height: "60%",
    backgroundColor: WHITE,
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE,
  },
});
