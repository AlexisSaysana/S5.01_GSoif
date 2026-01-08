import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { Settings, Droplet } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import ProgressCircle from '../components/ProgressCircle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import QuickAddButton from '../components/QuickAddButton';
import Select from '../components/Select';

export default function ProfileScreen({ navigation }) {
  const { colors, isDarkMode, unit, dailyGoal } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const options = ['Ajouter', 'Retirer']
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [margin, setMargin] = useState(0);
  const isAddMode = selectedOption === options[0];
  const canRemove = completed > 0;
  const actionColor = isAddMode ? colors.primary : colors.dangerText; 
  const sign = isAddMode ? '+' : '-';
  const buttonOpacity = (!isAddMode && !canRemove) ? 0.5 : 1

  const progression = (dailyGoal && dailyGoal > 0) ? completed / dailyGoal : 0;

  useEffect(() => {
    loadHistory();
    loadDailyValues();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@fountainHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const loadDailyValues = async () => {
    try {
      const savedCompleted = await AsyncStorage.getItem('@dailyCompleted');
      if (savedCompleted) setCompleted(parseInt(savedCompleted, 10));
    } catch (e) {
      console.log('Error loading daily values', e);
    }
  };

  const displayForUnit = (valueMl) => {
    if (unit === 'L') return `${(valueMl/1000).toFixed(1)} L`;
    if (unit === 'cL') return `${Math.round(valueMl/10)} cL`;
    if (unit === 'oz') return `${(valueMl/29.5735).toFixed(1)} oz`;
    return `${valueMl} mL`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Votre progression</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => navigation.getParent()?.navigate('Setting')}
        >
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>

      {/* CONTENU PRINCIPAL */}
      <View style={styles.content}>
        
        {/* CERCLE DE PROGRESSION */}
        <View style={styles.progressSection}>
          <ProgressCircle
            size={180}
            strokeWidth={14}
            color={colors.primary}
            backgroundColor={colors.secondary}
            progress={progression > 1 ? 1 : progression}
          >
            <Droplet size={50} color={colors.primary} fill={colors.primary} />
            <Text style={[styles.percentage, { color: colors.text }]}>{Math.round(progression * 100)}%</Text>
          </ProgressCircle>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayForUnit(completed)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Consommé</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>{displayForUnit(dailyGoal)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Objectif</Text>
            </View>
          </View>
        </View>

        {/* ACTIONS RAPIDES */}
        <View style={[styles.actionSection, { backgroundColor: colors.surface }]}>
          <View style={styles.selectRow}>
            <Select
              options={options}
              value={selectedOption}
              onChange={setSelectedOption}
            />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
              une quantité d'eau
            </Text>
          </View>
          
          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>Raccourcis</Text>
          
          <View style={styles.quickButtonsRow}>
            {([100, 250, 500]).map((amt) => (
              <QuickAddButton
                style={{ opacity: buttonOpacity, backgroundColor: actionColor }}
                key={String(amt)}
                title={`${sign}${displayForUnit(amt).replace(' ', '')}`}
                onPress={async () => {
                  const delta = isAddMode ? amt : -amt;
                  const newVal = Math.max(0, completed + delta);
                  setCompleted(newVal);
                  await AsyncStorage.setItem('@dailyCompleted', String(newVal));
                }}
              />
            ))}
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>Quantité personnalisée</Text>

          <View style={styles.customInputRow}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="Entrez une quantité"
                keyboardType='numeric'
                value={customAmount}
                onChangeText={setCustomAmount}
                onSubmitEditing={() => {
                  let val = parseFloat(customAmount.replace(',', '.')) || 0;
                  let toAdd = 0;
                  if (unit === 'L') toAdd = Math.round(val * 1000);
                  else if (unit === 'cL') toAdd = Math.round(val * 10);
                  else if (unit === 'oz') toAdd = Math.round(val * 29.5735);
                  else toAdd = Math.round(val);
                  const delta = isAddMode ? toAdd : -toAdd;
                  const newVal = Math.max(0, completed + delta);
                  setCompleted(newVal);
                  AsyncStorage.setItem('@dailyCompleted', String(newVal));
                  setCustomAmount('');
                  Keyboard.dismiss();
                }}
              />
            </View>
            <TouchableOpacity 
              style={[styles.customButton, { backgroundColor: actionColor, opacity: buttonOpacity }]}
              onPress={async () => {
                let val = parseFloat(customAmount.replace(',', '.')) || 0;
                let toAdd = 0;
                if (unit === 'L') toAdd = Math.round(val * 1000);
                else if (unit === 'cL') toAdd = Math.round(val * 10);
                else if (unit === 'oz') toAdd = Math.round(val * 29.5735);
                else toAdd = Math.round(val);
                const delta = isAddMode ? toAdd : -toAdd;
                const newVal = Math.max(0, completed + delta);
                setCompleted(newVal);
                await AsyncStorage.setItem('@dailyCompleted', String(newVal));
                setCustomAmount('');
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.customButtonText}>{unit}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: PRIMARY_BLUE, 
    height: 120, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 40
  },
  settingsButton: { position: 'absolute', right: 20, paddingTop: 40 },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontFamily: fonts.bricolageGrotesque, 
    fontWeight: '700' 
  },
  content: { 
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 40,
  },
  progressSection: {
    alignItems: 'center',
    gap: 25,
  },
  percentage: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    fontFamily: fonts.bricolageGrotesque,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bricolageGrotesque,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: fonts.inter,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 15,
  },
  actionSection: {
    borderRadius: 25,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: fonts.inter,
  },
  sectionDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.inter,
    marginTop: 4,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customButton: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.inter,
  },
  unitBox: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.inter,
  },
});
