
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseStyles, PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

export default function InviteScreen({ navigation, onLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load and filter guest history (last 3 days, max 72h)
  const loadHistory = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem('@fountainHistory');
      let items = saved ? JSON.parse(saved) : [];
      const now = Date.now();
      // Only keep entries from last 72h
      items = items.filter(item => now - (item.timestamp || 0) <= 72 * 3600 * 1000);
      // Only keep entries from last 3 unique days
      const days = {};
      const filtered = [];
      for (const item of items) {
        const day = new Date(item.timestamp).toISOString().slice(0, 10);
        if (!days[day]) {
          days[day] = true;
          filtered.push(item);
        }
        if (Object.keys(days).length >= 3) break;
      }
      setHistory(filtered);
      // Save back only filtered
      await AsyncStorage.setItem('@fountainHistory', JSON.stringify(filtered));
    } catch (e) {
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = async () => {
    if (!history || history.length === 0) return;
    await AsyncStorage.removeItem('@fountainHistory');
    setHistory([]);
    // Only show alert if there was something to clear
    Alert.alert('Historique effacé');
  };

  return (
    <View style={baseStyles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue en mode invité</Text>
        <Text style={styles.text}>
          Vous utilisez l'application sans compte. Pour sauvegarder vos données et accéder à toutes les fonctionnalités, créez un compte !
        </Text>
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}>Créer un compte</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Historique (3 derniers jours)</Text>
        {loading ? (
          <Text style={styles.text}>Chargement...</Text>
        ) : history.length === 0 ? (
          <Text style={styles.text}>Aucune fontaine visitée récemment.</Text>
        ) : (
          <ScrollView style={{ maxHeight: 180, width: '100%' }}>
            {history.map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyName}>{item.name}</Text>
                <Text style={styles.historyLoc}>{item.location}</Text>
                <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
          <Text style={styles.clearBtnText}>Effacer l'historique</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...baseStyles.card,
    marginTop: 40,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, fontFamily: fonts.bricolageGrotesque, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10, fontFamily: fonts.inter, textAlign: 'center' },
  text: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 10, fontFamily: fonts.inter },
  button: { backgroundColor: PRIMARY_BLUE, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, marginTop: 10 },
  buttonText: { color: WHITE, fontSize: 16, fontWeight: '700', fontFamily: fonts.inter },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20, width: '100%' },
  historyItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyName: { fontFamily: fonts.bricolageGrotesque, fontSize: 16, fontWeight: '700' },
  historyLoc: { fontFamily: fonts.inter, color: '#666', fontSize: 14 },
  historyDate: { fontFamily: fonts.inter, color: '#999', fontSize: 12 },
  clearBtn: { marginTop: 15, backgroundColor: '#eee', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'center' },
  clearBtnText: { color: '#333', fontFamily: fonts.inter, fontWeight: '600' },
});
