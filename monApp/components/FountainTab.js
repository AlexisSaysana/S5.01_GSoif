import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";

import { fonts } from "../styles/fonts";



export default function FountainTab({

  name,

  location,

  distance,

  time,

  nearest,

  onPress,

}) {

  return (

    <TouchableOpacity

      style={styles.container}

      activeOpacity={0.7}

      onPress={onPress}

    >

      {/* LEFT */}

      <View style={styles.left}>

        <View style={styles.titleRow}>

          <Image

            style={styles.icon}

            source={require("../assets/circle_blue.png")}

          />

          <Text style={styles.name}>{name}</Text>

        </View>



        <Text style={styles.location}>{location}</Text>



        {nearest && (

          <View style={styles.nearestRow}>

            <Image

              style={styles.star}

              source={require("../assets/star_filled.png")}

            />

            <Text style={styles.nearestText}>Le plus proche</Text>

          </View>

        )}

      </View>



      {/* RIGHT */}

      <View style={styles.right}>

        <Text style={styles.distance}>{distance}</Text>

        <View style={styles.timeRow}>

          <Image

            style={styles.walk}

            source={require("../assets/directions_walk.png")}

          />

          <Text style={styles.time}>{time}</Text>

        </View>

      </View>

    </TouchableOpacity>

  );

}



const styles = StyleSheet.create({

  container: {

    backgroundColor: "white",

    width: "100%", // ✅ PLUS DE 110%

    flexDirection: "row",

    justifyContent: "space-between",

    borderRadius: 15,

    borderWidth: 2,

    borderColor: "#D9D9D9",

    padding: 15,

  },

  left: {

    flex: 1,

    gap: 4,

  },

  titleRow: {

    flexDirection: "row",

    alignItems: "center",

    gap: 10,

  },

  icon: {

    width: 20,

    height: 20,

  },

  name: {

    fontFamily: fonts.bricolageGrotesque,

    fontSize: 18,

    color: "#000",

    flexShrink: 1,

  },

  location: {

    fontFamily: fonts.inter,

    fontSize: 12,

    color: "#4D4D4D",

    paddingLeft: 30,

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

    color: "#4D4D4D",

  },

  right: {

    alignItems: "flex-end",

    justifyContent: "center",

  },

  distance: {

    fontFamily: fonts.inter,

    fontSize: 16,

    fontWeight: "700",

    color: "#575757",

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

    color: "#575757",

  },

});