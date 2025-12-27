import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ChevronLeft } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
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
                source={require('../assets/bottle_icon.png')} // Assure-toi d'avoir cette icône
                style={styles.bottleIcon} 
             />
          </View>
          <Text style={styles.percentage}>20%</Text>
          <Text style={styles.subText}>Vous avez bu 400ml sur 2000 !</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Historique des points d’eau</Text>

        {/* LISTE HISTORIQUE */}
        <View style={styles.historyItem}>
          <View style={styles.blueDot} />
          <View>
            <Text style={styles.locationName}>Parc Nelson Mandela</Text>
            <Text style={styles.locationCity}>Paris 17ème Arr.</Text>
          </View>
        </View>

        <View style={styles.historyItem}>
          <View style={styles.blueDot} />
          <View>
            <Text style={styles.locationName}>Parc Sainte-Périne</Text>
            <Text style={styles.locationCity}>Paris 16ème Arr.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
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
  subText: { color: '#666', marginTop: 5, fontFamily: fonts.inter },
  divider: { width: '100%', height: 1, backgroundColor: '#EEE', marginVertical: 30 },
  sectionTitle: { alignSelf: 'flex-start', fontSize: 18, fontWeight: '700', marginBottom: 20, fontFamily: fonts.bricolageGrotesque },
  historyItem: { 
    flexDirection: 'row', width: '100%', backgroundColor: 'white', padding: 15, 
    borderRadius: 20, marginBottom: 15, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  blueDot: { width: 15, height: 15, borderRadius: 10, backgroundColor: '#64B5F6', marginRight: 15 },
  locationName: { fontSize: 16, fontWeight: '600', fontFamily: fonts.inter },
  locationCity: { fontSize: 12, color: '#999', fontFamily: fonts.inter }
});
