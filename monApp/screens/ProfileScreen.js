import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { Settings, User, UserPen, UserPenIcon } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { colors, isDarkMode, unit, dailyGoal, name, email } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(0);

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
      {/* HEADER BLUE */}
      <View style={[styles.header, { backgroundColor: colors.primary }] }>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity 
                          style={styles.settingsButton} 
                          onPress={() => navigation.getParent()?.navigate('Setting')}
                        >
                          <Settings color="white" size={30} />
                        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PROGRESS CIRCLE */}
        <View style={styles.progressContainer}>
          <View style={[styles.circlePlaceholder, { borderColor: colors.primary }]}>
             <User size={140} color={colors.primary} />
          </View>
          <Text style={[styles.percentage, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>{email}</Text>
          <TouchableOpacity style={
            {
              borderBottomColor: colors.border,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5, 
              marginTop: 15,
            }}
            onPress={() => navigation.getParent()?.navigate('Account')}
          >  
            <UserPen color={colors.textSecondary} size={20} />
            <Text style={[{ color: colors.textSecondary, textDecorationLine: 'underline' }]}>Paramètres et préferences du compte</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Points d'eau utilisés récemment</Text>

        {/* LISTE HISTORIQUE */}
        {history.length > 0 ? (
          history.map((item, index) => (
            <View key={index} style={[styles.historyItem, { backgroundColor: colors.surface }]}>
              <View style={styles.blueDot} />
              <View>
                <Text style={[styles.locationName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.locationCity, { color: colors.textSecondary }]}>{item.location}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun historique pour le moment</Text>
        )}
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
    paddingTop: 40
  },
  settingsButton: { position: 'absolute', right: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20, alignItems: 'center' },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  circlePlaceholder: { 
    width: 150, height: 150, borderRadius: 75, 
    borderWidth: 10, borderColor: PRIMARY_BLUE, // Gris clair
    justifyContent: 'center', alignItems: 'center' 
  },
  bottleIcon: { width: 60, height: 80, resizeMode: 'contain' },
  percentage: { fontSize: 32, fontWeight: 'bold', marginTop: 15, fontFamily: fonts.bricolageGrotesque },
  subText: { marginTop: 5, fontFamily: fonts.inter },
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
