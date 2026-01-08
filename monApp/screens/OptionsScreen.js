import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ThemeContext } from '../context/ThemeContext';

// Ajout de "colors" dans les props de l'item pour qu'il puisse changer de style
const OptionItem = ({ title, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.item, { borderBottomColor: colors.border }]}
    onPress={onPress}
  >
    <Text style={[styles.itemText, { color: colors.text }]}>{title}</Text>
    <ChevronRight color={colors.textSecondary || '#999'} size={20} />
  </TouchableOpacity>
);

export default function OptionsScreen({ navigation, userEmail, userId, onLogout }) {
  // --- ERREUR CORRIGÉE ICI ---
  // Il faut extraire 'colors' du ThemeContext via useContext
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary || PRIMARY_BLUE }]}>
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
          colors={colors}
          onPress={() => navigation.navigate("MonCompte", { userEmail })}
        />

        <OptionItem
          title="Notifications"
          colors={colors}
          onPress={() => navigation.navigate("Notifications", { userId, userEmail })}
        />

        <OptionItem title="Historique" colors={colors} onPress={() => {}} />
        <OptionItem title="Paramètres" colors={colors} onPress={() => {}} />
        <OptionItem title="Points d’eau enregistrés" colors={colors} onPress={() => {}} />

        {/* BOUTON DECONNEXION */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.danger || '#FF4747' }]}
            onPress={onLogout}
          >
            {/* Correction : color: 'white' car le fond du bouton est rouge */}
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40
  },
  backButton: { position: 'absolute', left: 20, top: 55 },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: '700'
  },
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
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.inter,
  }
});