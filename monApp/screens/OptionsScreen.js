import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';

const OptionItem = ({ title, onPress, colors }) => (
  <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={onPress}>
    <Text style={[styles.itemText, { color: colors.text }]}>{title}</Text>
    <ChevronRight color={colors.textSecondary} size={20} />
  </TouchableOpacity>
);

export default function OptionsScreen({ navigation, userEmail, userId, onLogout }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Options</Text>
      </View>

      <ScrollView style={styles.content}>

        <OptionItem 
          title="Mon compte" 
          onPress={() => navigation.navigate("MonCompte", { userEmail })}
        />

        {/* 👉 NOUVELLE LIGNE NOTIFICATIONS */}
        <OptionItem 
          title="Notifications" 
          onPress={() => navigation.navigate("Notifications", { userId, userEmail })}
        />

        <OptionItem title="Historique" onPress={() => {}} />
        <OptionItem title="Paramètres" onPress={() => {}} />
        <OptionItem title="Points d’eau enregistrés" onPress={() => {}} />

        {/* BOUTON DECONNEXION */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogout}
          >
            <Text style={[styles.logoutText, { color: colors.dangerText }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: PRIMARY_BLUE, height: 120, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { flex: 1 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
    fontFamily: fonts.inter,
  },
  footer: {
    marginTop: 50,
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  logoutButton: {
    backgroundColor: '#FF4747',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#FF4747",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.inter,
  }
});
