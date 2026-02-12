import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { fonts } from "../styles/fonts";
import { ThemeContext } from "../context/ThemeContext";

const getNoteMoyenne = (avis) => {
  if (!avis || avis.length === 0)
    return 0;
  const somme = avis.reduce((acc, a) => acc + a.note, 0);
  return somme / avis.length;
};

export default function FountainTab({
  name,
  location,
  distance,
  time,
  nearest,
  isAvailable,
  motif,
  avis,
  onPress,
}) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* LEFT */}
      <View style={styles.left}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          </View>
          {avis.length > 0 && <View
                        style={
                          {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: colors.primary,
                            paddingVertical: 4,
                            paddingHorizontal: 5,
                            borderRadius: 15,
                          }
                        }
                      >
                        <Text
                          style={{ fontSize: 10, fontWeight: "600", color: 'white'}}
                        >
                          💧{getNoteMoyenne(avis).toFixed(1)}/5
                        </Text>
                      </View>}
        </View>

        <Text style={[styles.location, { color: colors.textSecondary }]}>{location}</Text>

        {/* AFFICHAGE INDISPONIBLE ICI POUR UN ALIGNEMENT PARFAIT */}
        {!isAvailable && (
          <Text style={styles.statusText}>
            Indisponible : {motif || "Hors service"}
          </Text>
        )}

        {nearest && (
          <View style={styles.nearestRow}>
            <Image
              style={styles.star}
              source={require("../assets/star_filled.png")}
            />
            <Text style={[styles.nearestText, { color: colors.textSecondary }]}>Le plus proche</Text>
          </View>
        )}
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <Text style={[styles.distance, { color: colors.text }]}>{distance}</Text>
        <View style={styles.timeRow}>
          <Image
            style={styles.walk}
            source={require("../assets/directions_walk.png")}
          />
          <Text style={[styles.time, { color: colors.textSecondary }]}>{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 15,
    borderWidth: 2,
    padding: 15,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },
  location: {
    fontFamily: fonts.inter,
    fontSize: 12,
    opacity: 0.7,
  },
  statusText: {
    color: '#FF5252',
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: fonts.inter,
    marginTop: 2,
  },
  nearestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  star: {
    width: 18,
    height: 18,
  },
  nearestText: {
    fontFamily: fonts.inter,
    fontSize: 12,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 75,
  },
  distance: {
    fontFamily: fonts.inter,
    fontSize: 16,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  walk: {
    width: 14,
    height: 14,
  },
  time: {
    fontFamily: fonts.inter,
    fontSize: 12,
  },
});