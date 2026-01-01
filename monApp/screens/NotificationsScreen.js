import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Bell, Clock, Plus, Trash2 } from "lucide-react-native";
import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import { scheduleHydrationNotification } from "../utils/notifications";

const BASE_URL = "https://s5-01-gsoif.onrender.com";

export default function NotificationsScreen({ route }) {
  const userId = route?.params?.userId;

  // Vérification userId
  if (!userId) {
    console.error("❌ userId manquant dans les paramètres de navigation");
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erreur : identifiant utilisateur manquant</Text>
      </View>
    );
  }

  console.log("📌 NotificationsScreen chargé avec userId :", userId);

  const [mode, setMode] = useState("interval"); // "interval" | "fixed"
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  const [fixedTimes, setFixedTimes] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const [tempDate, setTempDate] = useState(new Date());

  // ----------------------------
  // 🔔 Récupération message backend
  // ----------------------------
  const fetchMessage = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notification/random/${userId}`);
      const data = await res.json();

      console.log("📥 Message backend :", data);

      return data.message || "Pense à boire un verre d’eau 💧";
    } catch (err) {
      console.error("🔥 Erreur fetchMessage :", err);
      return "Hydrate-toi 💧";
    }
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
  // 💾 Enregistrer les notifications (backend + local)
  // ----------------------------
  const saveNotifications = async () => {
    console.log("📌 userId reçu dans saveNotifications :", userId);

    const message = await fetchMessage();

    // Objet envoyé au backend
    const payload = {
      mode,
      intervalMinutes,
      fixedTimes,
    };

    console.log("📤 Envoi des préférences au backend :", payload);

    try {
      const res = await fetch(`${BASE_URL}/notification/preferences/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Réponse backend :", data);

      if (!res.ok) {
        console.error("❌ Erreur backend :", data);
        return alert("Erreur lors de l’enregistrement des préférences");
      }

      console.log("✅ Préférences enregistrées en base !");
    } catch (err) {
      console.error("🔥 Erreur FETCH :", err);
      return alert("Erreur de connexion au serveur");
    }

    // ----------------------------
    // 🔔 Programmation des notifications locales
    // ----------------------------
    if (mode === "interval") {
      await scheduleHydrationNotification(intervalMinutes, message);
      console.log("🔔 Notifications programmées en mode intervalle");
    } else {
      for (const t of fixedTimes) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Hydratation 💧",
            body: message,
          },
          trigger: {
            type: Notifications.ScheduledNotificationTriggerType.DAILY,
            hour: t.hour,
            minute: t.minute,
          },
        });
      }
      console.log("🔔 Notifications programmées en mode horaires fixes");
    }

    alert("Préférences enregistrées !");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {/* MODE SELECTOR */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "interval" && styles.modeActive]}
          onPress={() => setMode("interval")}
        >
          <Clock size={20} color={mode === "interval" ? WHITE : PRIMARY_BLUE} />
          <Text style={[styles.modeText, mode === "interval" && { color: WHITE }]}>
            Intervalle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === "fixed" && styles.modeActive]}
          onPress={() => setMode("fixed")}
        >
          <Bell size={20} color={mode === "fixed" ? WHITE : PRIMARY_BLUE} />
          <Text style={[styles.modeText, mode === "fixed" && { color: WHITE }]}>
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
              onPress={() => setIntervalMinutes((prev) => Math.max(10, prev - 10))}
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

      {/* MODE FIXED TIMES */}
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

          <TouchableOpacity style={styles.addButton} onPress={() => setShowPicker(true)}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: PRIMARY_BLUE,
    marginBottom: 20,
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
  modeActive: {
    backgroundColor: PRIMARY_BLUE,
  },
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
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
  intervalButtonText: {
    color: WHITE,
    fontWeight: "700",
  },
  intervalValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "600",
  },
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
  addButtonText: {
    color: WHITE,
    fontWeight: "700",
  },
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
