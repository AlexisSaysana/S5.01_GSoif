import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Platform // Importé pour gérer le Web
} from 'react-native';
import {
  ChevronLeft,
  Moon,
  MapPin,
  Trash2,
  Download,
  FileText,
  ShieldAlert,
  Scale,
  ChevronRight,
  Check
} from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { fonts } from '../styles/fonts';
import { PRIMARY_BLUE } from '../styles/baseStyles';

export default function SettingsScreen({ navigation, onLogout, userEmail }) {
  const { isDarkMode, toggleTheme, colors, unit, changeUnit } = useContext(ThemeContext);

  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const isGuest = userEmail === null;

  const unitOptions = ['mL', 'cL', 'L', 'oz'];

  // --- LOGOUT RÉPARÉ ---
  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      // Sur Web, Alert.alert ne fonctionne pas toujours bien pour bloquer l'action
      const confirmLogout = window.confirm("Voulez-vous vraiment vous déconnecter ?");
      if (confirmLogout) {
        onLogout();
      }
    } else {
      // Sur Mobile
      Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter ?",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Déconnexion", style: "destructive", onPress: onLogout }
        ]
      );
    }
  };

  const handleDeleteHistory = () => {
    const confirmMsg = "Êtes-vous sûr ? Cette action est irréversible.";
    if (Platform.OS === 'web' && !window.confirm(confirmMsg)) return;

    Alert.alert(
      "Supprimer l'historique",
      confirmMsg,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `https://s5-01-gsoif.onrender.com/historique/user/${userEmail}`,
                { method: "DELETE" }
              );
              if (response.ok) {
                navigation.navigate('Main', { screen: 'Profil', params: { refresh: Date.now() } });
                Alert.alert("Succès", "Historique supprimé");
              }
            } catch (error) {
              console.log('Erreur:', error);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    const dangerMsg = "Action définitive. Toutes vos données seront effacées.";
    if (Platform.OS === 'web' && !window.confirm(dangerMsg)) return;

    Alert.alert(
      "Supprimer le compte",
      dangerMsg,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`https://s5-01-gsoif.onrender.com/utilisateurs/${userEmail}`, {
                method: "DELETE"
              });
              if (response.ok) {
                onLogout();
                navigation.navigate("Login");
              }
            } catch (error) {
              Alert.alert("Erreur", "Problème de connexion");
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, iconColor, label, subLabel, action, isDestructive, valueDisplay }) => (
    <TouchableOpacity style={styles.row} onPress={action} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: isDestructive ? colors.dangerBg : colors.iconBg }]}>
        <Icon size={22} color={isDestructive ? colors.dangerText : iconColor} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.label, { color: isDestructive ? colors.dangerText : colors.text }]}>{label}</Text>
        {subLabel && <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{subLabel}</Text>}
      </View>
      {valueDisplay && (
        <Text style={{ marginRight: 10, color: colors.textSecondary, fontFamily: fonts.inter }}>{valueDisplay}</Text>
      )}
      {!isDestructive && <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Général</Text>
          <SettingRow
            icon={Scale}
            iconColor={colors.primary}
            label="Unités de mesure"
            subLabel="Pour les boissons"
            valueDisplay={unit}
            action={() => setShowUnitModal(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
              <Moon size={22} color="#5C6BC0" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>Mode sombre</Text>
            </View>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#5C6BC0" }}
              thumbColor={"#FFF"}
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Confidentialité</Text>
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#004D40' : '#E0F7FA' }]}>
              <MapPin size={22} color="#00BCD4" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>Géolocalisation</Text>
            </View>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#00BCD4" }}
              thumbColor={"#FFF"}
              onValueChange={() => setIsLocationEnabled(prev => !prev)}
              value={isLocationEnabled}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon={Trash2}
            iconColor="#FF9800"
            label="Effacer l'historique"
            action={handleDeleteHistory}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
          <SettingRow icon={FileText} iconColor="#607D8B" label="Conditions" action={() => navigation.navigate('Terms')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow icon={ShieldAlert} iconColor="#607D8B" label="Confidentialité" action={() => navigation.navigate('Privacy')} />
        </View>

        {!isGuest && (
          <>
            <TouchableOpacity
              style={[styles.dangerButton, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBg }]}
              onPress={handleDeleteAccount}
            >
              <Text style={[styles.dangerButtonText, { color: colors.dangerText }]}>Supprimer mon compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#FF4747' }]}
              onPress={handleLogoutPress}
            >
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>GSoif v1.0.2</Text>
      </ScrollView>

      {/* MODAL UNITÉS */}
      <Modal visible={showUnitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir une unité</Text>
            {unitOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOption, { borderBottomColor: colors.border, backgroundColor: unit === opt ? (isDarkMode ? '#333' : '#F0F8FF') : 'transparent' }]}
                onPress={() => { changeUnit(opt); setShowUnitModal(false); }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{opt}</Text>
                {unit === opt && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowUnitModal(false)}>
              <Text style={{ color: colors.textSecondary }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: PRIMARY_BLUE, height: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 40, zIndex: 10 },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20 },
  sectionContainer: { borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textWrapper: { flex: 1, justifyContent: 'center' },
  label: { fontFamily: fonts.inter, fontSize: 16, fontWeight: '500' },
  subLabel: { fontFamily: fonts.inter, fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 10, marginLeft: 55 },
  dangerButton: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  dangerButtonText: { fontFamily: fonts.inter, fontWeight: '700', fontSize: 16 },
  logoutButton: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  logoutButtonText: { fontFamily: fonts.inter, fontWeight: '700', fontSize: 16, color: 'white' },
  versionText: { textAlign: 'center', fontFamily: fonts.inter, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', borderRadius: 20, padding: 20 },
  modalTitle: { fontFamily: fonts.bricolageGrotesque, fontSize: 20, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 16, fontFamily: fonts.inter },
  modalCloseButton: { marginTop: 15, alignItems: 'center', padding: 10 }
});