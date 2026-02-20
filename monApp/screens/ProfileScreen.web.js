import React, { useContext, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  Platform, TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { showLocation } from "react-native-map-link";
import { fonts } from '../styles/fonts';
import { Settings, User, UserPen, MapPin, Trash2, Trophy } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { QUESTS } from '../utils/questsData'; // Import centralisé depuis ton dossier utils

export default function ProfileScreen({ navigation, userEmail, onLogout, route }) {
  const { colors, name, email } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const isGuest = userEmail === null;

  // Se déclenche à chaque fois que l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        loadHistory();
        loadBadges();
      } else {
        setHistory([]);
        setUnlockedBadges([]);
      }
    }, [route?.params?.refresh])
    );


  // Charger les badges débloqués en comparant les stats avec la liste QUESTS
  const loadBadges = async () => {
    try {
      const response = await fetch(`https://s5-01-gsoif.onrender.com/badges/${userEmail}`);
      const badgeData = await response.json();

      if (!Array.isArray(badgeData)) {
        console.log("Réponse inattendue de /badges:", badgeData);
        setUnlockedBadges([]);
        return;
      }

      const unlocked = QUESTS.filter(quest =>
        badgeData.some(b => b.badge_id === quest.id.toString())
      );

      setUnlockedBadges(unlocked);
    } catch (e) {
      console.log("Erreur chargement badges:", e);
      setUnlockedBadges([]);
    }
  };





  const loadHistory = async () => {
    try {
      const response = await fetch(`https://s5-01-gsoif.onrender.com/historique/${userEmail}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.log("Erreur chargement historique:", error);
    }
  };


  // Afficher la description du badge lors d'un clic
  const showBadgeDetail = (badge) => {
    Alert.alert(
      badge.title,
      `${badge.description}\n\nObjectif : ${badge.goal} ${badge.type === 'click' ? 'itinéraires' : 'jours complétés'}`,
      [{ text: "Super !", style: "default" }]
    );
  };

  const redoItinerary = (item) => {
    showLocation({
      latitude: item.coords[0],
      longitude: item.coords[1],
      title: item.name,
      appsWhiteList: ['google-maps', 'apple-maps', 'waze']
    });
  };

  const deleteHistoryItem = async (id) => {
    try {
      await fetch(`https://s5-01-gsoif.onrender.com/historique/item/${id}`, {
        method: "DELETE"
      });

      // Mise à jour locale immédiate
      setHistory(prev => prev.filter(item => item.id !== id));

    } catch (error) {
      console.log("Erreur suppression item:", error);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Mon profil</Text>
      <View
        style={{display: 'flex', flexDirection: 'row', gap: 120 }}
      >
      <View
        style={{width: 360, gap: 30}}
      >
        {/* SECTION INFO UTILISATEUR */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarCircle, { borderColor: colors.primary }]}>
            <User size={80} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {isGuest ? "Invité" : name || "Utilisateur"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {isGuest ? "Mode invité activé" : email}
          </Text>

          <TouchableOpacity
            style={styles.editLink}
            onPress={isGuest ? onLogout : () => navigation.getParent()?.navigate('MonCompte')}
          >
            <UserPen color={colors.textSecondary} size={18} />
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {isGuest ? "Se connecter" : "Paramètres du compte"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.dividerHorizontal, { backgroundColor: colors.border }]} />

        {/* SECTION MES BADGES */}
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Trophy size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes Badges ({unlockedBadges.length})</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Quêtes')}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Défis</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
          {unlockedBadges.length > 0 ? (
            unlockedBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                activeOpacity={0.7}
                onPress={() => showBadgeDetail(badge)} // Clic sur le badge pour la description
                style={[styles.badgeCard, { backgroundColor: colors.surface }]}
              >
                <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { marginLeft: 0, color: colors.textSecondary }]}>Continue tes quêtes pour débloquer des badges !</Text>
          )}
        </ScrollView>
        </View>
        <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />
        {/* SECTION HISTORIQUE */}
        <View
          style={{width: 360}}
        >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center' }]}>Historique récent</Text>
        </View>

        {history.length > 0 ? (
          history.map((item, index) => (
            <View key={index} style={[styles.historyCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity style={styles.historyMain} onPress={() => redoItinerary(item)}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.histName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.histDate, { color: colors.textSecondary }]}>{item.location}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteHistoryItem(item.id)}>
                <Trash2 size={18} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>Aucun itinéraire enregistré.</Text>
        )}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "700",
    marginBottom: 40,
    alignSelf: 'center'
  },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 110 : 140, alignItems: 'center' },
  profileSection: { alignItems: 'center', marginTop: 10 },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 26, fontWeight: '800', marginTop: 15, fontFamily: fonts.bricolageGrotesque },
  userEmail: { fontSize: 15, fontFamily: fonts.inter, opacity: 0.7 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15 },
  linkText: { textDecorationLine: 'underline', fontSize: 13, fontFamily: fonts.inter },
 dividerHorizontal: {
    width: "90%",
    height: 1,
    marginVertical: 25,
  },
  dividerVertical: {
    height: "90%",
    width: 1,
    marginHorizontal: 25,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: fonts.bricolageGrotesque },
  badgeScroll: { paddingRight: 20, gap: 12 },
  badgeCard: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  historyCard: { flexDirection: 'row', borderRadius: 20, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowOpacity: 0.05 },
  historyMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  histName: { fontSize: 15, fontWeight: '600', fontFamily: fonts.inter },
  histDate: { fontSize: 12, opacity: 0.6 },
  deleteBtn: { padding: 15, borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.05)', justifyContent: 'center' },
  emptyText: { textAlign: 'center', fontFamily: fonts.inter, fontSize: 14, opacity: 0.5 }
});