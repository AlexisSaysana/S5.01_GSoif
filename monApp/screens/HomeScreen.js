import React, { useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import ProgressCircle from '../components/ProgressCircle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import QuickAddButton from '../components/QuickAddButton';

export default function ProfileScreen() {
  const { colors, isDarkMode, unit, dailyGoal } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
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
      <View style={[styles.header, { backgroundColor: colors.primary }] }>
        <Text style={styles.headerTitle}>Votre progression</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <ProgressCircle
            size={210}
            strokeWidth={12}
            color={colors.primary}
            backgroundColor={colors.iconBg}
            progress={progression > 1 ? 1 : progression}
          >
            <Image 
              source={isDarkMode ? require('../assets/bottle_icon_white.png') : require('../assets/bottle_icon.png')}
              style={styles.bottleIcon} 
            />
            <Text style={[styles.percentage, { color: colors.text }]}>{Math.round(progression * 100)}%</Text>
          </ProgressCircle>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>{`Vous avez bu ${displayForUnit(completed)} sur ${displayForUnit(dailyGoal)} aujourd'hui !`}</Text>          
        </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View
            style={
              {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                  width: '100%',
                  paddingHorizontal: 20,
                  gap: 12,
              }
            }
        >
          <Text style={{ color: colors.textSecondary, marginBottom: 10, }}>
            Ajoutez votre consommation d'eau
          </Text>  
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              {([100, 250, 500]).map((amt) => (
                <QuickAddButton
                  key={String(amt)}
                  title={`${displayForUnit(amt).replace(' ', '')}`}
                  onPress={async () => {
                    const newVal = completed + amt; // amt is in mL
                    setCompleted(newVal);
                    await AsyncStorage.setItem('@dailyCompleted', String(newVal));
                  }}
                />
              ))}
            </View>
          <View style={
          {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              marginTop: 8,
          }
        }>
          <View
            style={
              {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                  gap: 8,
              }
            }
          >
            <View
              style={
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }
              }
            >
              <Text
                style={
                  {
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: '700',
                  }
                }
              >
                +
              </Text>
            </View>
            <CustomInput
              placeholder="Quantité"
              width={160}
                keyboardType='numeric'
                value={customAmount}
                onChangeText={setCustomAmount}
                onSubmitEditing={() => Keyboard.dismiss()}
            />
              <TouchableOpacity
                onPress={async () => {
                  // Convert customAmount (assumed in current unit) to mL
                  let val = parseFloat(customAmount.replace(',', '.')) || 0;
                  let toAdd = 0;
                  if (unit === 'L') toAdd = Math.round(val * 1000);
                  else if (unit === 'cL') toAdd = Math.round(val * 10);
                  else if (unit === 'oz') toAdd = Math.round(val * 29.5735);
                  else toAdd = Math.round(val);
                  const newVal = completed + toAdd;
                  setCompleted(newVal);
                  await AsyncStorage.setItem('@dailyCompleted', String(newVal));
                  setCustomAmount('');
                  Keyboard.dismiss();
                }}
                style={{ marginLeft: 6, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>OK</Text>
              </TouchableOpacity>
          <View
              style={
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }
              }
            >
              <Text
                style={
                  {
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }
                }
              >
                {unit}
              </Text>
            </View>
          </View>
        </View>
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <CustomButton
              title={'Ajouter'}
              onPress={async () => {
                await AsyncStorage.setItem('@dailyCompleted', String(completed));
              }}
              style={{ paddingVertical: 12 }}
            />
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 36
  },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20, alignItems: 'center' },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  circlePlaceholder: { 
    width: 140, height: 140, borderRadius: 70, 
    borderWidth: 8, 
    justifyContent: 'center', alignItems: 'center' 
  },
  bottleIcon: { width: 60, height: 80, resizeMode: 'contain' },
  percentage: { fontSize: 40, fontWeight: 'bold', fontFamily: fonts.bricolageGrotesque },
  subText: { marginTop: 12, fontFamily: fonts.inter },
  divider: { width: '100%', height: 1, marginVertical: 30 },
  sectionTitle: { alignSelf: 'flex-start', fontSize: 18, fontWeight: '700', marginBottom: 20, fontFamily: fonts.bricolageGrotesque },
  historyItem: { 
    flexDirection: 'row', width: '100%', padding: 15, 
    borderRadius: 20, marginBottom: 15, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  blueDot: { width: 15, height: 15, borderRadius: 10, backgroundColor: '#64B5F6', marginRight: 15 },
  locationName: { fontSize: 16, fontWeight: '600', fontFamily: fonts.inter },
  locationCity: { fontSize: 12, fontFamily: fonts.inter },
  emptyText: { fontSize: 14, fontFamily: fonts.inter, marginTop: 10 }
});
