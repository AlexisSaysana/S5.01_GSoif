import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Settings } from "lucide-react-native";
import { fonts } from "../styles/fonts";
import { ThemeContext } from "../context/ThemeContext";
import ProgressCircle from "../components/ProgressCircle";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import QuickAddButton from "../components/QuickAddButton";
import Select from "../components/Select";

const BASE_URL = "https://s5-01-gsoif.onrender.com";

// --- MINI CALENDRIER ---
const WeeklyCalendar = ({ weeklyData, dailyGoal, colors }) => {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const today = new Date();

  return (
    <View style={styles.calendarContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Activité de la semaine
      </Text>
      <View style={styles.daysRow}>
        {[...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - (6 - i));
          const dateStr = date.toISOString().slice(0, 10);
          const amount = weeklyData[dateStr] || 0;

          const isToday = i === 6;
          const fillHeight =
            dailyGoal > 0 ? Math.min((amount / dailyGoal) * 60, 60) : 0;

          return (
            <View key={i} style={styles.dayColumn}>
              <View
                style={[
                  styles.barBackground,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      height: fillHeight,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? colors.primary : colors.textSecondary,
                    fontWeight: isToday ? "700" : "400",
                  },
                ]}
              >
                {days[date.getDay()]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// --- HOME SCREEN ---
export default function HomeScreen({ navigation, userId }) {
  const { colors, isDarkMode, unit, token, logout } = useContext(ThemeContext);

  const [dailyGoal, setDailyGoal] = useState(2000);
  const [completed, setCompleted] = useState(0);
  const [weeklyData, setWeeklyData] = useState({});
  const [hasGoalReachedToday, setHasGoalReachedToday] = useState(false);
  const [margin, setMargin] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState("Ajouter");

  const options = ["Ajouter", "Retirer"];
  const isAddMode = selectedOption === "Ajouter";
  const actionColor = isAddMode ? colors.primary : colors.dangerText;
  const sign = isAddMode ? "+" : "-";
  const progression = dailyGoal > 0 ? completed / dailyGoal : 0;

  // --- HELPER POUR HEADERS ---
  // On remet Bearer par défaut car c'est la norme standard
  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  // --- CHARGEMENT ---
  const initData = useCallback(async () => {
    if (!userId || !token) return;

    try {
      const headers = getHeaders();

      const resProfile = await fetch(`${BASE_URL}/profile/${userId}`, { headers });
      if (resProfile.status === 403) {
          console.log("🛑 Session expirée sur Profile");
          await logout();
          return;
      }
      const profile = await resProfile.json();
      if (profile?.objectif_ia) setDailyGoal(profile.objectif_ia);

      const resToday = await fetch(`${BASE_URL}/hydration/today/${userId}`, { headers });
      const todayData = await resToday.json();
      setCompleted(todayData.amount_ml || 0);
      setHasGoalReachedToday(!!todayData.goal_reached);

      const resHistory = await fetch(`${BASE_URL}/hydration/history/${userId}`, { headers });
      const historyData = await resHistory.json();
      const historyObj = {};
      if (Array.isArray(historyData)) {
        historyData.forEach((entry) => {
          const dateStr = new Date(entry.date).toISOString().split("T")[0];
          historyObj[dateStr] = entry.amount_ml;
        });
      }
      setWeeklyData(historyObj);

    } catch (e) {
      console.log("❌ Erreur initData :", e);
    }
  }, [userId, token, getHeaders, logout]);

  useFocusEffect(
    useCallback(() => {
      initData();
    }, [initData])
  );

  const handleGoalReached = async () => {
    if (!userId || !token) return;
    try {
      await fetch(`${BASE_URL}/hydration/goal-reached`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ id_utilisateur: userId }),
      });
      setHasGoalReachedToday(true);
    } catch (e) {
      console.log("❌ Erreur goal_reached :", e);
    }
  };

  const updateWaterProgress = async (amountMl) => {
    if (!userId || !token) return;

    const delta = isAddMode ? amountMl : -amountMl;
    const headers = getHeaders();

    try {
      const resAdd = await fetch(`${BASE_URL}/hydration/add`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          id_utilisateur: Number(userId),
          amount_ml: Number(delta),
        }),
      });

      if (!resAdd.ok) {
        const errorDetail = await resAdd.text();
        console.log(`❌ Erreur ${resAdd.status}:`, errorDetail);

        // Si 403, on force la déconnexion car le token est mort
        if (resAdd.status === 403) {
            alert("Votre session a expiré. Veuillez vous reconnecter.");
            await logout();
            return;
        }
        throw new Error("Erreur lors de l'ajout");
      }

      const resToday = await fetch(`${BASE_URL}/hydration/today/${userId}`, { headers });
      const todayData = await resToday.json();
      const newVal = todayData.amount_ml || 0;
      setCompleted(newVal);

      const todayStr = new Date().toISOString().slice(0, 10);
      setWeeklyData(prev => ({ ...prev, [todayStr]: newVal }));

      if (newVal >= dailyGoal && !hasGoalReachedToday) {
        await handleGoalReached();
      }
    } catch (e) {
      console.log("❌ updateWaterProgress :", e.message);
    }
  };

  // --- Reste du rendu UI identique ---
  const displayForUnit = (valueMl) => {
    if (unit === "L") return `${(valueMl / 1000).toFixed(1)} L`;
    if (unit === "cL") return `${Math.round(valueMl / 10)} cL`;
    return `${valueMl} mL`;
  };

  const handleCustomSubmit = () => {
    let val = parseFloat(customAmount.replace(",", ".")) || 0;
    let toAddMl = unit === "L" ? val * 1000 : unit === "cL" ? val * 10 : val;
    updateWaterProgress(Math.round(toAddMl));
    setCustomAmount("");
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>GSoif</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Setting")}>
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { marginTop: margin }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.progressContainer}>
          <ProgressCircle size={210} strokeWidth={12} color={colors.primary} backgroundColor={colors.secondary} progress={progression > 1 ? 1 : progression}>
            <Image source={isDarkMode ? require("../assets/bottle_icon_white.png") : require("../assets/bottle_icon.png")} style={styles.bottleIcon} />
            <Text style={[styles.percentage, { color: colors.text }]}>{Math.round(progression * 100)}%</Text>
          </ProgressCircle>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            {`Bu : ${displayForUnit(completed)} / ${displayForUnit(dailyGoal)}`}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.actionSection}>
          <View style={styles.selectRow}>
            <Select options={options} value={selectedOption} onChange={setSelectedOption} />
            <Text style={{ color: colors.textSecondary }}>une quantité d'eau</Text>
          </View>
          <View style={styles.quickAddRow}>
            {[100, 250, 500].map((amt) => (
              <QuickAddButton key={amt} title={`${sign}${displayForUnit(amt)}`} style={{ backgroundColor: actionColor }} onPress={() => updateWaterProgress(amt)} />
            ))}
          </View>
          <View style={styles.inputRow}>
            <CustomInput placeholder="Quantité" width={150} keyboardType="numeric" value={customAmount} onChangeText={setCustomAmount}
                onFocus={() => setMargin(Platform.OS === "ios" ? -150 : 0)} onBlur={() => setMargin(0)} onSubmitEditing={handleCustomSubmit} />
            <Text style={{ color: colors.text, fontWeight: "bold" }}>{unit}</Text>
          </View>
          <View style={{ width: "90%" }}>
            <CustomButton title={selectedOption} backgroundColor={actionColor} onPress={handleCustomSubmit} />
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <WeeklyCalendar weeklyData={weeklyData} dailyGoal={dailyGoal} colors={colors} />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: Platform.OS === "android" ? StatusBar.currentHeight + 80 : 120, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40, zIndex: 10 },
  settingsButton: { position: "absolute", right: 20, top: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 45 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "900", fontFamily: fonts.bricolageGrotesque },
  content: { padding: 20, alignItems: "center" },
  progressContainer: { marginTop: 20, alignItems: "center" },
  bottleIcon: { width: 60, height: 80, resizeMode: "contain" },
  percentage: { fontSize: 44, fontWeight: "900" },
  subText: { marginTop: 12, fontSize: 16 },
  divider: { width: "90%", height: 1, marginVertical: 30 },
  actionSection: { width: "100%", alignItems: "center", gap: 15 },
  selectRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  quickAddRow: { flexDirection: "row", gap: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  calendarContainer: { width: "100%", paddingHorizontal: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  daysRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80 },
  dayColumn: { alignItems: "center", flex: 1 },
  barBackground: { width: 16, height: 60, borderRadius: 8, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 8 },
  dayLabel: { fontSize: 12, marginTop: 10 },
});