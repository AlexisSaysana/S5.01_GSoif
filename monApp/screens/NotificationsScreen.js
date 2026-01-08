import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Plus, Trash2, ChevronLeft, Bell } from "lucide-react-native";
import { PRIMARY_BLUE, WHITE } from "../styles/baseStyles";
import * as Notifications from "expo-notifications";
import { fonts } from "../styles/fonts";
import { ThemeContext } from "../context/ThemeContext";


const BASE_URL = "https://s5-01-gsoif.onrender.com";

// -----------------------------------------------------
// Vérification permissions système
// -----------------------------------------------------
async function checkSystemNotificationStatus() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== "granted") {
    alert(
      "Les notifications sont désactivées pour cette application.\n\n" +
        "Active-les dans : Paramètres > Notifications."
    );
    return false;
  }
  return true;
}

// -----------------------------------------------------
// Notification via JavaScript (fallback)
// -----------------------------------------------------
const scheduleNotificationJS = async (hour, minute, message) => {
  const now = new Date();
  const target = new Date();

  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(0);
  target.setMilliseconds(0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();

  setTimeout(async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hydratation 💧",
        body: message,
        sound: "default",
        channelId: "default",
      },
      trigger: null,
    });
  }, diffMs);
};

// -----------------------------------------------------
// Notification Android (si autorisée)
// -----------------------------------------------------
const scheduleNotificationAndroid = async (hour, minute, message) => {
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
    trigger: { date: target },
  });
};

// -----------------------------------------------------
// Écran principal
// -----------------------------------------------------
export default function NotificationsScreen({ route, navigation }) {
  const { colors } = useContext(ThemeContext);
  const userId = route?.params?.userId;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fixedTimes, setFixedTimes] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Charger les horaires
  useEffect(() => {
  const loadPreferences = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notification/preferences/${userId}`);
      const data = await res.json();

      console.log("📌 Réponse API :", data);

      // Si l'API renvoie un tableau → on prend la dernière entrée
      const lastEntry = Array.isArray(data) ? data[data.length - 1] : data;

      if (lastEntry && lastEntry.fixed_times && lastEntry.fixed_times.length > 0) {
        setFixedTimes(lastEntry.fixed_times);
      } else {
        // Aucun horaire → valeurs par défaut
        setFixedTimes([
          { hour: 10, minute: 0 },
          { hour: 12, minute: 0 },
          { hour: 15, minute: 0 },
          { hour: 17, minute: 0 },
        ]);
      }

    } catch (err) {
      console.error("❌ Erreur loadPreferences :", err);

      // Valeurs par défaut si erreur
      setFixedTimes([
        { hour: 10, minute: 0 },
        { hour: 12, minute: 0 },
        { hour: 15, minute: 0 },
        { hour: 17, minute: 0 },
      ]);
    }
  };

  loadPreferences();
}, []);



  // Créer le canal Android
  useEffect(() => {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }, []);

  // Message aléatoire
  const fetchMessage = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notification/random/${userId}`);
      const data = await res.json();
      return data.message || "Pense à boire un verre d'eau 💧";
    } catch (err) {
      return "Hydrate-toi 💧";
    }
  };

  // Ajouter un horaire
  const addFixedTime = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;

    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();

    setFixedTimes((prev) => [...prev, { hour, minute }]);
  };

  // Enregistrer
  const saveNotifications = async () => {
    const allowed = await checkSystemNotificationStatus();
    if (!allowed) return;

    const settings = await Notifications.getPermissionsAsync();
    const message = await fetchMessage();

    const payload = {
      fixedTimes,
      enabled: notificationsEnabled,
    };

    try {
      await fetch(`${BASE_URL}/notification/preferences/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      return alert("Erreur de connexion au serveur");
    }

    const androidBlocked = settings.android.interruptionFilter !== 0;

    for (const t of fixedTimes) {
      if (androidBlocked) {
        await scheduleNotificationJS(t.hour, t.minute, message);
      } else {
        await scheduleNotificationAndroid(t.hour, t.minute, message);
      }
    }

    alert("Préférences enregistrées !");
    navigation.goBack();
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    // On utilise SafeAreaView pour éviter l'encoche et la barre du bas
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* HEADER RÉVISÉ */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <ChevronLeft size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollPadding} // Ajout de padding interne
            >
              {/* SECTION SWITCH */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres</Text>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Activer les notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: "#DDD", true: colors.primary }}
                    thumbColor={WHITE}
                  />
                </View>
              </View>

              {notificationsEnabled && (
                <>
                  {/* SECTION HORAIRES */}
                  <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Horaires programmés</Text>
                    {fixedTimes.map((t, index) => (
                      <View key={index}>
                        <View style={styles.timeRow}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 20 }}>🕒</Text>
                            <Text style={[styles.timeText, { color: colors.text }]}>
                              {t.hour.toString().padStart(2, "0")}:{t.minute.toString().padStart(2, "0")}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => setFixedTimes(prev => prev.filter((_, i) => i !== index))}>
                            <Trash2 size={22} color="#E53935" />
                          </TouchableOpacity>
                        </View>
                        {index < fixedTimes.length - 1 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                      </View>
                    ))}

                    <TouchableOpacity style={[styles.addTimeButton, { backgroundColor: colors.primary }]} onPress={() => setShowPicker(true)}>
                      <Plus size={20} color={WHITE} />
                      <Text style={styles.addTimeText}>Ajouter une heure</Text>
                    </TouchableOpacity>
                  </View>

                  {/* BOUTON ENREGISTRER */}
                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={saveNotifications}>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            {showPicker && (
              <DateTimePicker value={tempDate} mode="time" is24Hour={true} display="spinner" onChange={addFixedTime} />
            )}
          </View>
        </SafeAreaView>
      );
    }

// -----------------------------------------------------
// Styles
// -----------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
      backgroundColor: PRIMARY_BLUE // Le haut de l'écran sera bleu
    },
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA" // Le reste sera gris clair
    },
  header: {
      backgroundColor: PRIMARY_BLUE,
      height: 120,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 40
    },

    backButton: { position: 'absolute', left: 20, paddingTop: 40 },


  headerIcon: {
    position: "absolute",
    left: 60,

  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "700",
  },

  content: {
      flex: 1,
  },
  scrollPadding: {
      padding: 20,
      paddingBottom: 100,
  },
  sectionContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },

  sectionTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    fontSize: 16,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "600",
    color: "#333",
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  timeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: fonts.bricolageGrotesque,
  },

  separator: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },

  addTimeButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  addTimeText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fonts.bricolageGrotesque,
  },

  manageButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EEF6FF",
  },

  manageText: {
    color: PRIMARY_BLUE,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fonts.bricolageGrotesque,
  },

  saveButton: {
    backgroundColor: PRIMARY_BLUE,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  saveButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.bricolageGrotesque,
  },
});
