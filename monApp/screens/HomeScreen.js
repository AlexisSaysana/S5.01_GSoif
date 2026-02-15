import React, { useContext, useEffect, useState, useCallback } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
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
export default function HomeScreen({ navigation, userId, userEmail, userName }) {
  const { colors, isDarkMode, unit } = useContext(ThemeContext);

  // Objectif IA (en mL)
  const [dailyGoal, setDailyGoal] = useState(2000);

  // Progression & historique
  const [completed, setCompleted] = useState(0);
  const [weeklyData, setWeeklyData] = useState({});
  const [hasGoalBeenReachedToday, setHasGoalBeenReachedToday] = useState(false);

  // UI
  const [margin, setMargin] = useState(0);
  const [customAmount, setCustomAmount] = useState("");

  // Ajouter / Retirer
  const options = ["Ajouter", "Retirer"];
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const isAddMode = selectedOption === "Ajouter";
  const actionColor = isAddMode ? colors.primary : colors.dangerText;
  const sign = isAddMode ? "+" : "-";

  const progression = dailyGoal > 0 ? completed / dailyGoal : 0;

  console.log("ID userId reçu dans HomeScreen :", userId);

 // --- CHARGER OBJECTIF IA + PROGRESSION + HISTORIQUE ---
 const initData = useCallback(async () => {
   console.log("🔄 initData() lancé…");
   
   const today = new Date().toISOString().slice(0, 10);
   
   // MODE INVITÉ : Charger depuis AsyncStorage local
   if (!userId) {
     console.log("⚠️ Mode invité : chargement local");
     try {
       const localCompleted = await AsyncStorage.getItem('local_completed');
       const localGoal = await AsyncStorage.getItem('local_dailyGoal');
       const localWeekly = await AsyncStorage.getItem('local_weeklyData');
       
       if (localCompleted) setCompleted(parseInt(localCompleted));
       if (localGoal) setDailyGoal(parseInt(localGoal));
       if (localWeekly) setWeeklyData(JSON.parse(localWeekly));
     } catch (e) {
       console.log("❌ Erreur chargement local:", e);
     }
     return;
   }

   // MODE CONNECTÉ : Charger depuis le backend
   try {
     // 🔒 Récupérer le token JWT
     const token = await AsyncStorage.getItem('authToken');
     const headers = {
       'Content-Type': 'application/json',
     };
     
     if (token) {
       headers['Authorization'] = `Bearer ${token}`;
     }

     // -------------------------
     // 1) Objectif IA
     // -------------------------
     console.log("➡️ Fetch profil :", `${BASE_URL}/profile/${userId}`);
     const resProfile = await fetch(`${BASE_URL}/profile/${userId}`, { headers });
     const profile = await resProfile.json();
     console.log("📥 Profil reçu :", profile);

     if (profile?.objectif_ia) {
       setDailyGoal(profile.objectif_ia);
     }

     // -------------------------
     // 2) Progression du jour
     // -------------------------
     console.log("➡️ Fetch today :", `${BASE_URL}/hydration/today/${userId}`);
     const resToday = await fetch(`${BASE_URL}/hydration/today/${userId}`, { headers });
     const todayData = await resToday.json();
     console.log("📥 Today reçu :", todayData);

     setCompleted(todayData.amount_ml || 0);
     setHasGoalBeenReachedToday(!!todayData.goal_reached);

     // -------------------------
     // 3) Historique complet
     // -------------------------
     console.log("➡️ Fetch history :", `${BASE_URL}/hydration/history/${userId}`);
     const resHistory = await fetch(`${BASE_URL}/hydration/history/${userId}`, { headers });
     const historyData = await resHistory.json();
     console.log("📥 Historique reçu :", historyData);

     // Transformer l’historique pour le weekly
     const historyObj = {};

     historyData.forEach((entry) => {
       // Convertir la date UTC → locale (yyyy-mm-dd)
       const localDate = new Date(entry.date);
       const yyyyMMdd = localDate.toISOString().split("T")[0];

       historyObj[yyyyMMdd] = entry.amount_ml;
     });

     console.log("📊 WeeklyData construit :", historyObj);

     setWeeklyData(historyObj);

   } catch (e) {
     console.log("❌ Erreur initData :", e);
   }
 }, [userId]);


  // Au premier montage
  useEffect(() => {
    initData();
  }, [initData]);

  // À chaque fois que l'écran redevient actif
  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen redevient actif > rafraîchissement");
      initData();
    }, [initData])
  );

  // --- OBJECTIF ATTEINT ---
  const handleGoalReached = async () => {
    if (!userId) return;

    console.log("➡️ Envoi goal_reached pour :", userId);

    try {
      const res = await fetch(`${BASE_URL}/hydration/goal-reached`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      });

      console.log("⬅️ Réponse goal_reached :", res.status);

      setHasGoalBeenReachedToday(true);
    } catch (e) {
      console.log("❌ Erreur goal_reached :", e);
    }
  };


  // --- MISE À JOUR PROGRESSION ---
  const updateWaterProgress = async (amountMl) => {
    const delta = isAddMode ? amountMl : -amountMl;
    const today = new Date().toISOString().slice(0, 10);
    
    // MODE INVITÉ : Gestion locale uniquement
    if (!userId) {
      console.log("⚠️ Mode invité : mise à jour locale");
      try {
        const newVal = Math.max(0, completed + delta);
        setCompleted(newVal);
        
        // Mettre à jour le mini calendrier
        const updatedWeekly = { ...weeklyData, [today]: newVal };
        setWeeklyData(updatedWeekly);
        
        // Sauvegarder localement
        await AsyncStorage.setItem('local_completed', newVal.toString());
        await AsyncStorage.setItem('local_weeklyData', JSON.stringify(updatedWeekly));
        
        // Objectif atteint ?
        if (newVal >= dailyGoal && dailyGoal > 0 && !hasGoalBeenReachedToday) {
          console.log("🏆 Objectif atteint (mode local)");
          setHasGoalBeenReachedToday(true);
        }
      } catch (e) {
        console.log("❌ Erreur maj locale:", e);
      }
      return;
    }

    // MODE CONNECTÉ : Synchronisation avec backend
    console.log("➡️ Envoi au backend :", {
      id_utilisateur: userId,
      amount_ml: delta,
    });

    try {
      // 🔒 Récupérer le token JWT
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 1) Envoi au backend
      const resAdd = await fetch(`${BASE_URL}/hydration/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_utilisateur: Number(userId),
          amount_ml: Number(delta),
        }),
      });

      console.log("⬅️ Réponse /hydration/add :", resAdd.status);
      
      // Vérifier si erreur d'authentification
      if (resAdd.status === 401 || resAdd.status === 403) {
        const error = await resAdd.json();
        console.log("❌ Erreur auth:", error);
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      // 2) Recharger la progression du jour
      const resToday = await fetch(`${BASE_URL}/hydration/today/${userId}`, { headers });
      const todayData = await resToday.json();

      console.log("📥 Données du jour reçues :", todayData);

      const newVal = todayData.amount_ml || 0;
      setCompleted(newVal);

      // 3) Mise à jour mini calendrier
      const today = new Date().toISOString().slice(0, 10);
      setWeeklyData((prev) => ({
        ...prev,
        [today]: newVal,
      }));


      // 4) Objectif atteint ?
      if (newVal >= dailyGoal && dailyGoal > 0 && !hasGoalBeenReachedToday) {
        console.log("🏆 Objectif atteint, envoi au backend…");
        await handleGoalReached();
      }
    } catch (e) {
      console.log("❌ Erreur updateWaterProgress :", e);
    }
  };


  // --- AFFICHAGE SELON UNITÉ ---
  const displayForUnit = (valueMl) => {
    if (valueMl === undefined || valueMl === null)
      return `0 ${unit || "mL"}`;
    if (unit === "L") return `${(valueMl / 1000).toFixed(1)} L`;
    if (unit === "cL") return `${Math.round(valueMl / 10)} cL`;
    if (unit === "oz") return `${(valueMl / 29.5735).toFixed(1)} oz`;
    return `${valueMl} mL`;
  };

  // --- SUBMIT QUANTITÉ PERSONNALISÉE ---
  const handleCustomSubmit = () => {
    let val = parseFloat(customAmount.replace(",", ".")) || 0;
    let toAddMl = 0;

    if (unit === "L") toAddMl = Math.round(val * 1000);
    else if (unit === "cL") toAddMl = Math.round(val * 10);
    else if (unit === "oz") toAddMl = Math.round(val * 29.5735);
    else toAddMl = Math.round(val);

    updateWaterProgress(toAddMl);
    setCustomAmount("");
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Votre progression</Text>
        <TouchableOpacity
          testID="settings-button"
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate("Setting")}
        >
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>

      {/* CONTENU */}
      <ScrollView
        contentContainerStyle={[styles.content, { marginTop: margin }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PROGRESSION */}
        <View style={styles.progressContainer}>
          <ProgressCircle
            size={210}
            strokeWidth={12}
            color={colors.primary}
            backgroundColor={colors.secondary}
            progress={progression > 1 ? 1 : progression}
          >
            <Image
              source={
                isDarkMode
                  ? require("../assets/bottle_icon_white.png")
                  : require("../assets/bottle_icon.png")
              }
              style={styles.bottleIcon}
            />
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progression * 100)}%
            </Text>
          </ProgressCircle>

          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            {`Bu : ${displayForUnit(completed)} / ${displayForUnit(dailyGoal)}`}
          </Text>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />

        {/* ACTIONS */}
        <View style={styles.actionSection}>
          <View style={styles.selectRow}>
            <Select
              options={options}
              value={selectedOption}
              onChange={setSelectedOption}
            />
            <Text style={{ color: colors.textSecondary }}>
              une quantité d'eau
            </Text>
          </View>

          <View style={styles.quickAddRow}>
            {[100, 250, 500].map((amt) => (
              <QuickAddButton
                key={String(amt)}
                title={`${sign}${displayForUnit(amt)}`}
                style={{
                  opacity: !isAddMode && completed <= 0 ? 0.5 : 1,
                  backgroundColor: actionColor,
                }}
                onPress={() => updateWaterProgress(amt)}
              />
            ))}
          </View>

          <View style={styles.inputRow}>
            <CustomInput
              placeholder="Quantité"
              width={220}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              onFocus={() =>
                setMargin(Platform.OS === "ios" ? -150 : 0)
              }
              onBlur={() => setMargin(0)}
              onSubmitEditing={handleCustomSubmit}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {unit}
            </Text>
          </View>

          <View
            style={{
              width: "100%",
              paddingHorizontal: 20,
              marginTop: 10,
            }}
          >
            <CustomButton
              title={selectedOption}
              backgroundColor={actionColor}
              onPress={handleCustomSubmit}
              style={{ paddingVertical: 12 }}
            />
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />

        {/* CALENDRIER */}
        <WeeklyCalendar
          weeklyData={weeklyData}
          dailyGoal={dailyGoal}
          colors={colors}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 80
        : 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 40,
    zIndex: 10,
  },
  settingsButton: {
    position: "absolute",
    right: 20,
    top:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 20
        : 45,
    zIndex: 11,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 110
        : 140,
    alignItems: "center",
  },
  progressContainer: { marginTop: 20, alignItems: "center" },
  bottleIcon: {
    width: 60,
    height: 80,
    resizeMode: "contain",
  },
  percentage: {
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: fonts.bricolageGrotesque,
  },
  subText: {
    marginTop: 12,
    fontFamily: fonts.inter,
    fontSize: 16,
  },
  divider: {
    width: "90%",
    height: 1,
    marginVertical: 25,
  },
  actionSection: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickAddRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    fontFamily: fonts.bricolageGrotesque,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  dayColumn: { alignItems: "center", flex: 1 },
  barBackground: {
    width: 14,
    height: 60,
    borderRadius: 7,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 7 },
  dayLabel: {
    fontSize: 11,
    marginTop: 8,
    fontFamily: fonts.inter,
  },
});
