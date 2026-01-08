import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { ChevronLeft, Bell, Clock, Plus, Trash2 } from "lucide-react-native";
import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import { fonts } from "../styles/fonts";

const BASE_URL = "https://s5-01-gsoif.onrender.com";

export default function NotificationsScreen({ navigation, route }) {
  const { userEmail } = route.params;
  const [userId, setUserId] = useState(null);

  const [mode, setMode] = useState("interval"); // interval | fixed
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  const [fixedTimes, setFixedTimes] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // ----------------------------
  // 🔐 Permissions notifications
  // ----------------------------
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // ----------------------------
  // 🔍 Récupérer l'ID utilisateur
  // ----------------------------
  useEffect(() => {
    const loadUser = async () => {
      const encoded = encodeURIComponent(userEmail);
      const res = await fetch(`${BASE_URL}/utilisateurs/${encoded}`);
      const data = await res.json();
      setUserId(data.id_utilisateur);
    };
    loadUser();
  }, []);

  // ----------------------------
  // 🔔 Récupérer un message aléatoire
  // ----------------------------
  const fetchMessage = async () => {
    const res = await fetch(`${BASE_URL}/notification/random/${userId}`);
    const data = await res.json();
    return data.message || "Pense à boire un verre d’eau 💧";
  };

  // ----------------------------
  // ➕ Ajouter une heure fixe
  // ----------------------------
  const addFixedTime = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;

    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();

    setFixedTimes((prev) => [...prev, { hour, minute }]);
  };

  // ----------------------------
  // 💾 Enregistrer en base
  // ----------------------------
  const saveToDatabase = async () => {
    if (!userId) return;

    if (mode === "fixed") {
      const horaires = fixedTimes.map((t) => ({
        heure: `${t.hour.toString().padStart(2, "0")}:${t.minute
          .toString()
          .padStart(2, "0")}:00`,
      }));

      await fetch(`${BASE_URL}/preferences/horaires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilisateur: userId,
          horaires,
        }),
      });
    }
  };

  // ----------------------------
  // 🔔 Programmer les notifications
  // ----------------------------
  const saveNotifications = async () => {
    const message = await fetchMessage();

    // Supprimer anciennes notifs
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (mode === "interval") {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Hydratation 💧", body: message },
        trigger: {
          type: Notifications.ScheduledNotificationTriggerType.TIME_INTERVAL,
          seconds: intervalMinutes * 60,
          repeats: true,
        },
      });

      console.log("🔔 Notifications programmées en mode intervalle");
    } else {
      for (const t of fixedTimes) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Hydratation 💧", body: message },
          trigger: {
            type: Notifications.ScheduledNotificationTriggerType.DAILY,
            hour: t.hour,
            minute: t.minute,
          },
        });
      }

      console.log("🔔 Notifications programmées en mode horaires fixes");
    }

    await saveToDatabase();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={{ padding: 20 }}>
        {/* MODE SELECTOR */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "interval" && styles.modeActive]}
            onPress={() => setMode("interval")}
          >
            <Clock size={20} color={mode === "interval" ? WHITE : PRIMARY_BLUE} />
            <Text
              style={[
                styles.modeText,
                mode === "interval" && { color: WHITE },
              ]}
            >
              Intervalle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === "fixed" && styles.modeActive]}
            onPress={() => setMode("fixed")}
          >
            <Bell size={20} color={mode === "fixed" ? WHITE : PRIMARY_BLUE} />
            <Text
              style={[styles.modeText, mode === "fixed" && { color: WHITE }]}
            >
              Horaires fixes
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODE INTERVAL */}
        {mode === "interval" && (
          <View style={styles.card}>
            <Text style={styles.label}>Toutes les X minutes</Text>

            <View style={styles.intervalRow}>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() =>
                  setIntervalMinutes((prev) => Math.max(10, prev - 10))
                }
              >
                <Text style={styles.intervalButtonText}>-10</Text>
              </TouchableOpacity>

              <Text style={styles.intervalValue}>{intervalMinutes} min</Text>

              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => setIntervalMinutes((prev) => prev + 10)}
              >
                <Text style={styles.intervalButtonText}>+10</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MODE FIXED */}
        {mode === "fixed" && (
          <View style={styles.card}>
            <Text style={styles.label}>Horaires programmés</Text>

            {fixedTimes.map((t, index) => (
              <View key={index} style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {t.hour.toString().padStart(2, "0")}:
                  {t.minute.toString().padStart(2, "0")}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setFixedTimes((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowPicker(true)}
            >
              <Plus size={20} color={WHITE} />
              <Text style={styles.addButtonText}>Ajouter une heure</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} onPress={saveNotifications}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>

        {/* TIME PICKER */}
        {showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={addFixedTime}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  header: {
    backgroundColor: PRIMARY_BLUE,
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  backButton: { position: "absolute", left: 20, paddingTop: 40 },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "700",
  },

  modeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PRIMARY_BLUE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modeActive: { backgroundColor: PRIMARY_BLUE },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },

  card: {
    backgroundColor: WHITE,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 15 },

  intervalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  intervalButton: {
    backgroundColor: PRIMARY_BLUE,
    padding: 10,
    borderRadius: 10,
  },
  intervalButtonText: { color: WHITE, fontWeight: "700" },
  intervalValue: { fontSize: 20, fontWeight: "700" },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  timeText: { fontSize: 18, fontWeight: "600" },

  addButton: {
    marginTop: 15,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: { color: WHITE, fontWeight: "700" },

  saveButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
});
