import React, { useContext, useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';

import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';
import ProgressCircle from '../components/ProgressCircle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import QuickAddButton from '../components/QuickAddButton';
import Select from '../components/Select';

const BASE_URL = 'https://s5-01-gsoif.onrender.com';

// --- MINI CALENDRIER ---
const WeeklyCalendar = ({ weeklyData, dailyGoal, colors }) => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date();

  return (
    <View style={styles.calendarContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Activité de la semaine</Text>
      <View style={styles.daysRow}>
        {[...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - (6 - i));
          const dateStr = date.toISOString().slice(0, 10);

          const amount = weeklyData[dateStr] || 0;
          const isToday = i === 6;
          const fillHeight = dailyGoal > 0 ? Math.min((amount / dailyGoal) * 60, 60) : 0;

          return (
            <View key={i} style={styles.dayColumn}>
              <View style={[styles.barBackground, { backgroundColor: colors.secondary }]}>
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
                    fontWeight: isToday ? '700' : '400',
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

// --- HOME SCREEN FUSIONNÉ ---
export default function HomeScreen({ navigation, route, userId, userEmail, userName }) {
  const { colors, isDarkMode, unit } = useContext(ThemeContext);

  // Objectif IA (en mL)
  const [dailyGoal, setDailyGoal] = useState(2000);

  // Progression & historique
  const [completed, setCompleted] = useState(0);
  const [weeklyData, setWeeklyData] = useState({});
  const [hasGoalBeenReachedToday, setHasGoalBeenReachedToday] = useState(false);

  // UI
  const [margin, setMargin] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  // Ajouter / Retirer
  const options = ['Ajouter', 'Retirer'];
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const isAddMode = selectedOption === 'Ajouter';
  const actionColor = isAddMode ? colors.primary : colors.dangerText;
  const sign = isAddMode ? '+' : '-';

  const progression = dailyGoal > 0 ? completed / dailyGoal : 0;

  console.log('🆔 userId reçu dans HomeScreen :', userId);

  // --- CHARGER OBJECTIF IA + PROGRESSION LOCALE ---
  const initData = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // 1) Objectif IA depuis backend
      if (!userId) {
        console.log('❌ Aucun userId → impossible de charger le profil IA');
      } else {
        console.log('📡 Fetch profil :', `${BASE_URL}/profile/${userId}`);
        const res = await fetch(`${BASE_URL}/profile/${userId}`);
        const data = await res.json();
        console.log('📥 Profil reçu dans HomeScreen :', data);
        console.log('🎯 Objectif IA reçu :', data?.objectif_ia);

        if (data && data.objectif_ia) {
          setDailyGoal(data.objectif_ia);
          console.log('💧 Objectif IA appliqué :', data.objectif_ia);
        } else {
          setDailyGoal(2000);
          console.log('⚠️ Aucun objectif IA trouvé → fallback 2000 mL');
        }
      }

      // 2) Hydratation locale (AsyncStorage)
      const lastDate = await AsyncStorage.getItem('@dailyCompletedDate');
      const reachedToday = await AsyncStorage.getItem('@goalReached_' + today);
      setHasGoalBeenReachedToday(reachedToday === 'true');

      if (lastDate !== today) {
        await AsyncStorage.setItem('@dailyCompleted', '0');
        await AsyncStorage.setItem('@dailyCompletedDate', today);
      }

      const savedCompleted = await AsyncStorage.getItem('@dailyCompleted');
      if (savedCompleted) setCompleted(parseInt(savedCompleted, 10));

      const savedHistory = await AsyncStorage.getItem('@weeklyHistory');
      if (savedHistory) setWeeklyData(JSON.parse(savedHistory));
    } catch (e) {
      console.log('❌ Erreur initData HomeScreen :', e);
      // On garde dailyGoal actuel ou fallback
    }
  }, [userId]);

  // Au premier montage
  useEffect(() => {
    initData();
  }, [initData]);

  // À chaque fois que l’écran redevient actif
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 HomeScreen redevient actif → rafraîchissement');
      initData();
    }, [initData])
  );

  // --- QUÊTES HYDRATATION ---
  const updateHydrationQuest = async () => {
    const today = new Date().toISOString().slice(0, 10);

    if (!hasGoalBeenReachedToday) {
      try {
        const savedStats = await AsyncStorage.getItem('@user_stats');
        let stats = savedStats ? JSON.parse(savedStats) : { clickCount: 0, hydrationCount: 0 };

        stats.hydrationCount = (stats.hydrationCount || 0) + 1;

        await AsyncStorage.setItem('@user_stats', JSON.stringify(stats));
        await AsyncStorage.setItem('@goalReached_' + today, 'true');

        setHasGoalBeenReachedToday(true);
        console.log('✅ Objectif hydratation enregistré dans les stats !');
      } catch (e) {
        console.error('Erreur stats hydratation:', e);
      }
    }
  };

  // --- MISE À JOUR PROGRESSION ---
  const updateWaterProgress = async (amountMl) => {
    const delta = isAddMode ? amountMl : -amountMl;
    const newVal = Math.max(0, completed + delta);
    const today = new Date().toISOString().slice(0, 10);

    setCompleted(newVal);

    if (newVal >= dailyGoal && dailyGoal > 0) {
      updateHydrationQuest();
    }

    const newWeekly = { ...weeklyData, [today]: newVal };
    setWeeklyData(newWeekly);

    await AsyncStorage.setItem('@dailyCompleted', String(newVal));
    await AsyncStorage.setItem('@weeklyHistory', JSON.stringify(newWeekly));
  };

  // --- AFFICHAGE SELON UNITÉ ---
  const displayForUnit = (valueMl) => {
    if (!valueMl && valueMl !== 0) return `0 ${unit || 'mL'}`;

    if (unit === 'L') return `${(valueMl / 1000).toFixed(1)} L`;
    if (unit === 'cL') return `${Math.round(valueMl / 10)} cL`;
    if (unit === 'oz') return `${(valueMl / 29.5735).toFixed(1)} oz`;
    return `${valueMl} mL`;
  };

  // --- SUBMIT QUANTITÉ PERSONNALISÉE ---
  const handleCustomSubmit = () => {
    let val = parseFloat(customAmount.replace(',', '.')) || 0;
    let toAddMl = 0;

    if (unit === 'L') toAddMl = Math.round(val * 1000);
    else if (unit === 'cL') toAddMl = Math.round(val * 10);
    else if (unit === 'oz') toAddMl = Math.round(val * 29.5735);
    else toAddMl = Math.round(val);

    updateWaterProgress(toAddMl);
    setCustomAmount('');
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Votre progression</Text>

        <TouchableOpacity
          testID="settings-button"
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate('Setting')}
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
                  ? require('../assets/bottle_icon_white.png')
                  : require('../assets/bottle_icon.png')
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

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ACTIONS */}
        <View style={styles.actionSection}>
          <View style={styles.selectRow}>
            <Select options={options} value={selectedOption} onChange={setSelectedOption} />
            <Text style={{ color: colors.textSecondary }}>une quantité d'eau</Text>
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
              onFocus={() => setMargin(Platform.OS === 'ios' ? -150 : 0)}
              onBlur={() => setMargin(0)}
              onSubmitEditing={handleCustomSubmit}
            />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
              {unit}
            </Text>
          </View>

          <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 10 }}>
            <CustomButton
              title={selectedOption}
              backgroundColor={actionColor}
              onPress={handleCustomSubmit}
              style={{ paddingVertical: 12 }}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* CALENDRIER */}
        <WeeklyCalendar weeklyData={weeklyData} dailyGoal={dailyGoal} colors={colors} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? StatusBar.currentHeight + 80 : 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    zIndex: 10,
  },

  settingsButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 45,
    zIndex: 11,
  },

  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: '700',
  },

  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 110 : 140,
    alignItems: 'center',
  },

  progressContainer: { marginTop: 20, alignItems: 'center' },
  bottleIcon: { width: 60, height: 80, resizeMode: 'contain' },
  percentage: { fontSize: 40, fontWeight: 'bold', fontFamily: fonts.bricolageGrotesque },

  subText: { marginTop: 12, fontFamily: fonts.inter, fontSize: 16 },
  divider: { width: '90%', height: 1, marginVertical: 25 },

  actionSection: { width: '100%', alignItems: 'center', gap: 15 },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickAddRow: { flexDirection: 'row', gap: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  calendarContainer: { width: '100%', paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    fontFamily: fonts.bricolageGrotesque,
  },

  daysRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },

  dayColumn: { alignItems: 'center', flex: 1 },
  barBackground: { width: 14, height: 60, borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 7 },
  dayLabel: { fontSize: 11, marginTop: 8, fontFamily: fonts.inter },
});
