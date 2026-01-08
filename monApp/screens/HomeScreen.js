import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, StatusBar,
  TouchableOpacity, Keyboard, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fonts } from '../styles/fonts';
import { Settings } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import ProgressCircle from '../components/ProgressCircle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import QuickAddButton from '../components/QuickAddButton';
import Select from '../components/Select';

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
                <View style={[styles.barFill, { height: fillHeight, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.dayLabel, { color: isToday ? colors.primary : colors.textSecondary, fontWeight: isToday ? '700' : '400' }]}>
                {days[date.getDay()]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// --- COMPOSANT HOME SCREEN ---
export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode, unit, dailyGoal } = useContext(ThemeContext);
  const [completed, setCompleted] = useState(0);
  const [weeklyData, setWeeklyData] = useState({});
  const [customAmount, setCustomAmount] = useState('');
  const [margin, setMargin] = useState(0);
  const [hasGoalBeenReachedToday, setHasGoalBeenReachedToday] = useState(false);

  const options = ['Ajouter', 'Retirer'];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const isAddMode = selectedOption === options[0];
  const canRemove = completed > 0;
  const actionColor = isAddMode ? colors.primary : colors.dangerText;
  const sign = isAddMode ? '+' : '-';
  const progression = (dailyGoal && dailyGoal > 0) ? completed / dailyGoal : 0;

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = await AsyncStorage.getItem('@dailyCompletedDate');

    // Récupérer si l'objectif a déjà été compté aujourd'hui
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
  };

  // LOGIQUE DE MISE À JOUR DES QUÊTES D'HYDRATATION
  const updateHydrationQuest = async () => {
    const today = new Date().toISOString().slice(0, 10);

    // On ne compte qu'une fois par jour maximum
    if (!hasGoalBeenReachedToday) {
      try {
        const savedStats = await AsyncStorage.getItem('@user_stats');
        let stats = savedStats ? JSON.parse(savedStats) : { clickCount: 0, hydrationCount: 0 };

        stats.hydrationCount = (stats.hydrationCount || 0) + 1;

        await AsyncStorage.setItem('@user_stats', JSON.stringify(stats));
        await AsyncStorage.setItem('@goalReached_' + today, 'true');
        setHasGoalBeenReachedToday(true);
        console.log("Objectif hydratation enregistré dans les stats !");
      } catch (e) {
        console.error("Erreur stats hydratation:", e);
      }
    }
  };

  const updateWaterProgress = async (amountMl) => {
    const delta = isAddMode ? amountMl : -amountMl;
    const newVal = Math.max(0, completed + delta);
    const today = new Date().toISOString().slice(0, 10);

    setCompleted(newVal);

    // Si on vient d'atteindre ou dépasser l'objectif
    if (newVal >= dailyGoal && dailyGoal > 0) {
      updateHydrationQuest();
    }

    const newWeekly = { ...weeklyData, [today]: newVal };
    setWeeklyData(newWeekly);
    await AsyncStorage.setItem('@dailyCompleted', String(newVal));
    await AsyncStorage.setItem('@weeklyHistory', JSON.stringify(newWeekly));
  };

  const displayForUnit = (valueMl) => {
    if (unit === 'L') return `${(valueMl/1000).toFixed(1)} L`;
    if (unit === 'cL') return `${Math.round(valueMl/10)} cL`;
    if (unit === 'oz') return `${(valueMl/29.5735).toFixed(1)} oz`;
    return `${valueMl} mL`;
  };

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

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Votre progression</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate('Setting')}
        >
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { marginTop: margin }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressContainer}>
          <ProgressCircle
            size={210}
            strokeWidth={12}
            color={colors.primary}
            backgroundColor={colors.secondary}
            progress={progression > 1 ? 1 : progression}
          >
            <Image
              source={isDarkMode ? require('../assets/bottle_icon_white.png') : require('../assets/bottle_icon.png')}
              style={styles.bottleIcon}
            />
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
              <QuickAddButton
                style={{ opacity: (selectedOption === 'Retirer' && completed <= 0) ? 0.5 : 1, backgroundColor: actionColor }}
                key={String(amt)}
                title={`${sign + displayForUnit(amt).replace(' ', '')}`}
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
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{unit}</Text>
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
    alignItems: 'center'
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, fontFamily: fonts.bricolageGrotesque },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  dayColumn: { alignItems: 'center', flex: 1 },
  barBackground: { width: 14, height: 60, borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 7 },
  dayLabel: { fontSize: 11, marginTop: 8, fontFamily: fonts.inter }
});