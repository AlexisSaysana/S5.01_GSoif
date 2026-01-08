import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { fonts } from '../styles/fonts';
import { Settings } from 'lucide-react-native'; // Ajouté pour l'icône
import { QUESTS } from '../utils/questsData';

export default function QuestsScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const [stats, setStats] = useState({ clickCount: 0, hydrationCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const savedStats = await AsyncStorage.getItem('@user_stats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      } catch (e) {
        console.error("Erreur chargement stats quêtes", e);
      }
    };
    loadStats();
  }, []);

  const showQuestDetail = (quest) => {
    Alert.alert(quest.title, quest.description);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER FIXE (Identique au Profil) */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Quêtes</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate('Setting')}
        >
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {QUESTS.map((quest) => {
          const currentProgress = quest.type === 'click' ? (stats.clickCount || 0) : (stats.hydrationCount || 0);
          const progressPercent = Math.min(currentProgress / quest.goal, 1);
          const isDone = progressPercent === 1;

          return (
            <TouchableOpacity
              key={quest.id}
              activeOpacity={0.8}
              onPress={() => showQuestDetail(quest)}
              style={[styles.card, {
                  backgroundColor: colors.surface,
                  borderColor: isDone ? '#4CAF50' : colors.border,
                  borderWidth: isDone ? 3 : 2
              }]}
            >
              <Text style={styles.icon}>{quest.icon}</Text>
              <View style={styles.info}>
                <Text style={[styles.questTitle, { color: colors.text }]}>{quest.title}</Text>

                <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
                  {quest.type === 'click' ? 'Objectif Itinéraire' : 'Objectif Hydratation'}
                </Text>

                <View style={styles.progressRow}>
                  <Text style={[styles.countText, { color: colors.textSecondary }]}>
                    {currentProgress} / {quest.goal}
                  </Text>
                  <Text style={[styles.percentText, { color: isDone ? '#4CAF50' : colors.primary }]}>
                    {Math.round(progressPercent * 100)}%
                  </Text>
                </View>

                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View style={[
                      styles.progressBarFill,
                      {
                          width: `${progressPercent * 100}%`,
                          backgroundColor: isDone ? '#4CAF50' : colors.primary
                      }
                  ]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // HEADER STYLE PROFIL
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
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  icon: { fontSize: 40, marginRight: 15 },
  info: { flex: 1 },
  questTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: '700'
  },
  typeLabel: {
    fontFamily: fonts.inter,
    fontSize: 11,
    marginBottom: 8,
    fontStyle: 'italic',
    opacity: 0.7
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  countText: { fontFamily: fonts.inter, fontSize: 12, fontWeight: '600' },
  percentText: { fontFamily: fonts.inter, fontSize: 12, fontWeight: '800' },
  progressBarBg: { height: 10, borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 10 },
});