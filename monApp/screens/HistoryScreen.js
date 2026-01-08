import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@fountainHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.log('Erreur lecture historique', e);
    }
  };

  const deleteHistory = () => {
    Alert.alert(
      'Supprimer l\'historique',
      'Êtes-vous sûr de vouloir supprimer tout l\'historique ?',
      [
        { text: 'Annuler', onPress: () => {} },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@fountainHistory');
              setHistory([]);
              Alert.alert('Succès', 'Historique supprimé');
            } catch (e) {
              console.log('Erreur suppression historique', e);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER BLUE */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Aucun point d'eau dans l'historique
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Points d'eau visités
            </Text>
            {history.map((item, index) => (
              <View key={index} style={[styles.historyItem, { backgroundColor: colors.surface }]}>
                <View style={styles.blueDot} />
                <View style={styles.itemContent}>
                  <Text style={[styles.locationName, { color: colors.text }]}>
                    {item.name || 'Point d\'eau'}
                  </Text>
                  <Text style={[styles.locationCity, { color: colors.textSecondary }]}>
                    {item.location || 'Paris'}
                  </Text>
                  {item.date && (
                    <Text style={[styles.locationDate, { color: colors.textSecondary }]}>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* BOUTON SUPPRIMER L'HISTORIQUE */}
      {history.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={deleteHistory}
          >
            <Trash2 size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.deleteButtonText}>Supprimer l'historique</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 40,
  },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: fonts.bricolageGrotesque,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.inter,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    width: '100%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  blueDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#64B5F6',
    marginRight: 15,
    marginTop: 3,
  },
  itemContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.inter,
    marginBottom: 4,
  },
  locationCity: {
    fontSize: 12,
    fontFamily: fonts.inter,
    marginBottom: 4,
  },
  locationDate: {
    fontSize: 11,
    fontFamily: fonts.inter,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  deleteButton: {
    backgroundColor: '#FF4747',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#FF4747',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.inter,
  },
});
