import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  LayoutAnimation, 
  UIManager 
} from 'react-native';
import { ChevronLeft, User, Mail, Droplet, Bell, Lock, X } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AccountScreen({ navigation }) {
  const [name, setName] = useState("Alya Ayinde");
  const [email, setEmail] = useState("alyayinde@gmail.com");
  const [dailyGoal, setDailyGoal] = useState("2000"); 
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  
  const togglePasswordMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsChangingPassword(!isChangingPassword);
    if (isChangingPassword) {
      setOldPassword("");
      setNewPassword("");
    }
  };

  const handleSave = () => {
    navigation.goBack();
  };

  const handleGoalConfirm = () => {
    const val = parseInt(tempGoal);
    if (isNaN(val) || val < 1500 || val > 4000) {
      Alert.alert("Erreur", "L'objectif doit être entre 1500 et 4000 mL");
      return;
    }
    setDailyGoal(tempGoal);
    setShowGoalModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon compte</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* INFORMATIONS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mes informations</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <User size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Votre nom"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <Mail size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Adresse e-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>

          {/* SÉCURITÉ */}
          <View style={styles.sectionContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isChangingPassword ? 15 : 0}}>
              <Text style={styles.sectionTitle}>Sécurité</Text>
              {isChangingPassword && (
                <TouchableOpacity onPress={togglePasswordMode}>
                  <X size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {!isChangingPassword ? (
              <TouchableOpacity style={styles.inputGroup} onPress={togglePasswordMode}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Lock size={20} color="#E53935" />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5}}>
                    <Text style={[styles.input, {fontSize: 20, lineHeight: 22, marginTop: -2}]}>••••••••</Text>
                    <Text style={styles.editLink}>Modifier</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View>
                <View style={styles.inputGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                    <Lock size={20} color="#E53935" />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Ancien mot de passe</Text>
                    <TextInput
                      style={styles.input}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry
                      placeholder="Requis"
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                    <Lock size={20} color="#E53935" />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Nouveau mot de passe</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder="8 caractères min."
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* OBJECTIFS & PRÉFÉRENCES */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hydratation & Préférences</Text>

            {/* Objectif d'eau */}
            <View style={styles.inputGroup}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F7FA' }]}>
                <Droplet size={20} color="#00BCD4" />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Objectif quotidien (ml)</Text>
                <View style={styles.goalRow}>
                  <Text style={styles.goalValue}>{dailyGoal} mL</Text>
                  <TouchableOpacity
                    style={styles.modifierButton}
                    onPress={() => {
                      setTempGoal(dailyGoal);
                      setShowGoalModal(true);
                    }}
                  >
                    <Text style={styles.modifierText}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Switch Notifications */}
            <View style={styles.inputGroup}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Bell size={20} color="#FF9800" />
              </View>
              
              <View style={styles.inputWrapper}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View>
                        <Text style={styles.label}>Notifications</Text>
                        <Text style={styles.subLabel}>Rappels pour boire</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#E0E0E0", true: PRIMARY_BLUE }}
                        thumbColor={WHITE}
                        ios_backgroundColor="#E0E0E0"
                        onValueChange={() => setNotificationsEnabled(prev => !prev)}
                        value={notificationsEnabled}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Switch un peu plus petit
                    />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODALE */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier l'objectif</Text>
            <Text style={styles.modalSubtitle}>Entre 1500 et 4000 mL</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempGoal}
              onChangeText={setTempGoal}
              placeholder="ex: 2500"
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E0E0E0' }]}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: PRIMARY_BLUE }]}
                onPress={handleGoalConfirm}
              >
                <Text style={[styles.modalButtonText, { color: WHITE }]}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    backgroundColor: PRIMARY_BLUE, 
    height: 120, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 40,
    zIndex: 10
  },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontFamily: fonts.bricolageGrotesque, 
    fontWeight: '700' 
  },
  content: { padding: 20, paddingBottom: 50 },
  sectionContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  
  // --- CLÉ DU FIX ---
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start', // ALIGNEMENT EN HAUT
    paddingVertical: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF6FF', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 0, // S'assure qu'il est collé en haut
  },
  inputWrapper: {
    flex: 1,
    paddingTop: 0, // Le texte commence au même niveau que l'icône
    justifyContent: 'center',
    minHeight: 40, // Force la hauteur minimale à celle de l'icône
  },
  // ------------------

  label: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: '#888',
    marginBottom: 4, // Un peu plus d'espace sous le titre
  },
  subLabel: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: '#CCC',
  },
  input: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    padding: 0, 
  },
  editLink: {
    color: PRIMARY_BLUE, fontWeight: '600', fontSize: 14
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2, // Petit ajustement
  },
  modifierButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modifierText: {
    color: PRIMARY_BLUE,
    fontWeight: '600',
    fontSize: 12
  },
  goalValue: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  // Modale
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 350,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  modalInput: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_BLUE,
    paddingVertical: 10,
    marginBottom: 25,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: fonts.inter,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
    marginLeft: 55, 
  },
  saveButton: {
    backgroundColor: PRIMARY_BLUE,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: WHITE,
    fontFamily: fonts.inter,
    fontSize: 16,
    fontWeight: '700',
  }
});