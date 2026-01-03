import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Plus, Trash2 } from "lucide-react-native";
import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import * as Notifications from "expo-notifications";

const BASE_URL = "https://s5-01-gsoif.onrender.com";


// -----------------------------------------------------
// Fonction : programmer une notification à une heure précise
// -----------------------------------------------------
const scheduleNotificationAtTime = async (hour, minute, message) => {
  const now = new Date();
  const target = new Date(now);

  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(0);
  target.setMilliseconds(0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hydratation 💧",
      body: message,
      sound: "default",
      channelId: "default",
    },
    trigger: {
      date: target,
    },
  });

  console.log("🔔 Notification programmée pour :", target.toString());
};


// -----------------------------------------------------
// Écran principal
// -----------------------------------------------------
export default function NotificationsScreen({ userId, navigation }) {
  const [fixedTimes, setFixedTimes] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
  const loadPreferences = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notification/preferences/${userId}`);
      const data = await res.json();

      if (data.fixed_times) {
        setFixedTimes(data.fixed_times);
        console.log("📌 Horaires chargés :", data.fixed_times);
      }
    } catch (err) {
      console.error("❌ Erreur loadPreferences :", err);
    }
  };

  loadPreferences();
}, []);



  // -----------------------------------------------------
  // Récupération message backend
  // -----------------------------------------------------
  const fetchMessage = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notification/random/${userId}`);
      const data = await res.json();
      return data.message || "Pense à boire un verre d'eau 💧";
    } catch (err) {
      console.error("❌ Erreur fetchMessage :", err);
      return "Hydrate-toi 💧";
    }
  };


  // -----------------------------------------------------
  // Ajout d'un horaire fixe
  // -----------------------------------------------------
  const addFixedTime = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;

    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();

    setFixedTimes((prev) => [...prev, { hour, minute }]);
  };


  // -----------------------------------------------------
  // Enregistrement des préférences
  // -----------------------------------------------------
  const saveNotifications = async () => {
    const message = await fetchMessage();

    const payload = {
      fixedTimes,
    };

    try {
      const res = await fetch(`${BASE_URL}/notification/preferences/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Réponse backend :", data);

      if (!res.ok || !data.saved) {
        return alert("Erreur lors de l'enregistrement des préférences");
      }

      console.log("✅ Préférences enregistrées en base !");
    } catch (err) {
      console.error("❌ Erreur FETCH :", err);
      return alert("Erreur de connexion au serveur");
    }

    for (const t of fixedTimes) {
      await scheduleNotificationAtTime(t.hour, t.minute, message);
    }

    alert("Notifications programmées !");
    navigation.navigate("MonCompte");
  };


  // -----------------------------------------------------
  // TEST CANAL + 10s
  // -----------------------------------------------------
  const testChannel10s = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TEST PERSISTANT",
        body: "Notification dans 10 secondes ✔",
        sound: "default",
        channelId: "default",
      },
      trigger: {
        date: new Date(Date.now() + 10000),
      },
    });

    console.log("🟣 Notification test programmée");
  };


  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

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

      <TouchableOpacity style={styles.saveButton} onPress={saveNotifications}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: "#DDD", marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.saveButtonText, { color: "#333" }]}>Retour</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: "purple", marginTop: 20 }]}
        onPress={testChannel10s}
      >
        <Text style={styles.saveButtonText}>Test Canal + 10s</Text>
      </TouchableOpacity>

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


// -----------------------------------------------------
// Styles
// -----------------------------------------------------
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
