import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER BLUE */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PROGRESS CIRCLE (Simulé ici) */}
        <View style={styles.progressContainer}>
          <View style={styles.circlePlaceholder}>
             <Image 
                source={isDarkMode ? require('../assets/bottle_icon_white.png') : require('../assets/bottle_icon.png')}
                style={styles.bottleIcon} 
             />
          </View>
          <Text style={[styles.percentage, { color: colors.text }]}>20%</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>Vous avez bu 400ml sur 2000 !</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique des points d'eau</Text>

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
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20, alignItems: 'center' },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  circlePlaceholder: { 
    width: 150, height: 150, borderRadius: 75, 
    borderWidth: 10, borderColor: '#E0F2F1', // Gris clair
    borderTopColor: '#00BCD4', // Cyan pour le progrès
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
