import React, { useContext, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { showLocation } from "react-native-map-link";
import { fonts } from '../styles/fonts';
import { Settings, User, UserPen, MapPin, Trash2 } from 'lucide-react-native'; // Ajout de Trash2
import { ThemeContext } from '../context/ThemeContext';

export default function ProfileScreen({ navigation, route, onLogout }) {
  const { colors, name, email } = useContext(ThemeContext);
  // Détection du mode invité : si pas de name/email ou si userId absent
  const isGuest = !name || !email || name === 'Invité' || email === '';
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // Nettoyage de l'historique invité (3 jours max)
  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@fountainHistory');
      let arr = saved ? JSON.parse(saved) : [];
      if (isGuest) {
        const now = Date.now();
        arr = arr.filter(item => item.timestamp && (now - item.timestamp < 3 * 24 * 60 * 60 * 1000));
        await AsyncStorage.setItem('@fountainHistory', JSON.stringify(arr));
      }
      setHistory(arr);
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const redoItinerary = (item) => {
    showLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.name,
      appsWhiteList: ['google-maps', 'apple-maps', 'waze']
    });
  };

  // --- NOUVELLE FONCTION : SUPPRIMER UN ÉLÉMENT ---
  const deleteHistoryItem = async (indexToDelete) => {
    try {
      // 1. Créer la nouvelle liste sans l'élément
      const newHistory = history.filter((_, index) => index !== indexToDelete);

      // 2. Mettre à jour l'état local pour un retour visuel immédiat
      setHistory(newHistory);

      // 3. Sauvegarder la nouvelle liste dans le téléphone
      await AsyncStorage.setItem('@fountainHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.log('Error deleting item:', error);
      Alert.alert("Erreur", "Impossible de supprimer cet élément.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.primary }] }>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate('Setting')}
        >
          <Settings color="white" size={30} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          <View style={[styles.circlePlaceholder, { borderColor: colors.primary }]}>
             <User size={100} color={colors.primary} />
          </View>
          {isGuest ? (
            <>
              <Text style={[styles.percentage, { color: colors.text }]}>Invité</Text>
              <TouchableOpacity style={styles.accountLink} onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Créer un compte</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Affichage sécurisé : infos utilisateur */}
              <Text style={[styles.percentage, { color: colors.text }]}>{name || "Utilisateur"}</Text>
              <Text style={[styles.subText, { color: colors.textSecondary }]}>{email}</Text>
              <TouchableOpacity
                style={styles.accountLink}
                onPress={() => navigation.getParent()?.navigate('MonCompte')}
              >
                <UserPen color={colors.textSecondary} size={20} />
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>Paramètres et préférences du compte</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Points d'eau utilisés récemment
          </Text>
        </View>

        {history.length > 0 ? (
          history.map((item, index) => (
            <View key={index} style={[styles.historyItem, { backgroundColor: colors.surface }]}>
              {/* Zone cliquable pour l'itinéraire */}
              <TouchableOpacity
                style={styles.itemMainArea}
                onPress={() => redoItinerary(item)}
                activeOpacity={0.6}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.locationName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.locationCity, { color: colors.textSecondary }]}>
                    {item.location} • {new Date(item.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* BOUTON SUPPRIMER */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteHistoryItem(index)}
              >
                <Trash2 size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun itinéraire enregistré.
            </Text>
          </View>
        )}

        {/* BOUTON DECONNEXION */}
        {!isGuest && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  settingsButton: { position: 'absolute', right: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20 },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  circlePlaceholder: { width: 140, height: 140, borderRadius: 70, borderWidth: 5, justifyContent: 'center', alignItems: 'center' },
  percentage: { fontSize: 28, fontWeight: 'bold', marginTop: 15, fontFamily: fonts.bricolageGrotesque },
  subText: { marginTop: 5, fontFamily: fonts.inter, fontSize: 16 },
  accountLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, padding: 10 },
  linkText: { textDecorationLine: 'underline', fontFamily: fonts.inter },
  divider: { width: '100%', height: 1, marginVertical: 30 },
  sectionHeader: { width: '100%', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: fonts.bricolageGrotesque },

  // Styles de la liste modifiés pour le bouton delete
  historyItem: {
    flexDirection: 'row', width: '100%',
    borderRadius: 20, marginBottom: 12, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    overflow: 'hidden'
  },
  itemMainArea: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTextContainer: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: '600', fontFamily: fonts.inter },
  locationCity: { fontSize: 12, fontFamily: fonts.inter, marginTop: 2 },

  deleteButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)'
  },

  emptyContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 14, fontFamily: fonts.inter, textAlign: 'center' },
  logoutButton: {
    backgroundColor: '#FF4747',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 30,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.inter,
  }
});