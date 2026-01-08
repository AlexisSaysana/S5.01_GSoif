import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  KeyboardAvoidingView, Platform, TextInput, Modal,
  LayoutAnimation, UIManager
} from 'react-native';
import { ChevronLeft, User, Mail, Lock, Droplet, Bell, X } from 'lucide-react-native';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import CustomButton from '../components/CustomButton';

const BASE_URL = "https://s5-01-gsoif.onrender.com";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MonCompteScreen({ navigation, route }) {
  const { userEmail } = route.params || {};

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  const [userId, setUserId] = useState(null);

  const [dailyGoal, setDailyGoal] = useState("2000");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const togglePasswordMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsChangingPassword(!isChangingPassword);
    if (isChangingPassword) {
      setOldPassword("");
      setNewPassword("");
    }
  };

  // ----------------------------
  // 🔒 SI PAS CONNECTÉ
  // ----------------------------
  if (!userEmail) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="white" size={30} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon compte</Text>
        </View>

        <View style={styles.content}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 20 }}>
            Vous n'êtes pas connecté.
          </Text>

          <CustomButton title="Se connecter" onPress={() => navigation.navigate("Login")} />
          <CustomButton title="Créer un compte" onPress={() => navigation.navigate("Signup")} />
        </View>
      </View>
    );
  }

  // ----------------------------
  // 🔄 CHARGEMENT DES DONNÉES
  // ----------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const encodedEmail = encodeURIComponent(userEmail);
        const res = await fetch(`${BASE_URL}/utilisateurs/${encodedEmail}`);
        const raw = await res.text();

        let data;
        try {
          data = JSON.parse(raw);
        } catch (e) {
          console.log("❌ Impossible de parser JSON :", e);
          return;
        }

        setPrenom(data.prenom);
        setNom(data.nom);
        setEmail(data.email);
        setUserId(data.id_utilisateur);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger vos informations");
      }
    };

    loadUser();
  }, []);

  // ----------------------------
  // 💾 MISE À JOUR INFOS
  // ----------------------------
  const handleUpdate = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);

      const res = await fetch(`${BASE_URL}/utilisateurs/${encodedEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, email })
      });

      const raw = await res.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        return;
      }

      if (!res.ok) {
        return Alert.alert("Erreur", data.error || "Impossible de mettre à jour");
      }

      Alert.alert("Succès", "Informations mises à jour !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier les informations");
    }
  };

  // ----------------------------
  // 💾 MISE À JOUR MOT DE PASSE
  // ----------------------------
  const handlePasswordUpdate = async () => {
    try {
      const encodedEmail = encodeURIComponent(userEmail);

      const res = await fetch(`${BASE_URL}/utilisateurs/${encodedEmail}/motdepasse`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const raw = await res.text();
      console.log("🔵 RAW RESPONSE MDP :", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.log("❌ Impossible de parser JSON :", e);
        return;
      }

      if (!res.ok) {
        return Alert.alert("Erreur", data.error);
      }

      Alert.alert("Succès", "Mot de passe mis à jour !");
      togglePasswordMode();

    } catch (error) {
      console.log("❌ ERREUR MDP :", error);
      Alert.alert("Erreur", "Impossible de modifier le mot de passe");
    }
  };

  // ----------------------------
  // 🎨 UI EXACTE
  // ----------------------------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon compte</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>

          {/* INFORMATIONS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mes informations</Text>

            {/* Prénom */}
            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <User size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={prenom}
                  onChangeText={setPrenom}
                />
              </View>
            </View>

            {/* Nom */}
            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <User size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={nom}
                  onChangeText={setNom}
                />
              </View>
            </View>

            {/* Email */}
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
                />
              </View>
            </View>
          </View>

          {/* SÉCURITÉ */}
          <View style={styles.sectionContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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
                  <Text style={[styles.input, {fontSize: 20}]}>••••••••</Text>
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
                    />
                  </View>
                </View>

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
                    />
                  </View>
                </View>

                <CustomButton title="Modifier le mot de passe" onPress={handlePasswordUpdate} />
              </View>
            )}
          </View>

          {/* HYDRATATION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hydratation & Préférences</Text>

            {/* Objectif */}
            <View style={styles.inputGroup}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F7FA' }]}>
                <Droplet size={20} color="#00BCD4" />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Objectif quotidien (ml)</Text>
                <View style={styles.goalRow}>
                  <Text style={styles.input}>{dailyGoal} mL</Text>
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

            {/* BOUTON NOTIFICATIONS */}
            <View style={styles.inputGroup}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Bell size={20} color="#FF9800" />
              </View>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => navigation.navigate("Notifications", { userId })}
              >
                <Text style={styles.label}>Notifications</Text>
                <Text style={[styles.input, { color: PRIMARY_BLUE, fontWeight: "600" }]}>
                  Gérer les notifications →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODALE OBJECTIF */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier l'objectif</Text>
            <Text style={styles.modalSubtitle}>Entre 1500 et 4000 mL</Text>

            <TextInput
              style={styles.modalInput}
              value={tempGoal}
              onChangeText={setTempGoal}
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
                onPress={() => {
                  const val = parseInt(tempGoal);
                  if (isNaN(val) || val < 1500 || val > 4000) {
                    Alert.alert("Erreur", "L'objectif doit être entre 1500 et 4000 mL");
                    return;
                  }
                  setDailyGoal(tempGoal);
                  setShowGoalModal(false);
                }}
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
    paddingTop: 40
  },
  backButton: { position: 'absolute', left: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontFamily: fonts.bricolageGrotesque, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 50 },

  sectionContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2
  },
  sectionTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  inputWrapper: { flex: 1 },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  input: { fontSize: 16, color: '#333', fontWeight: '500' },

  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modifierButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modifierText: { color: PRIMARY_BLUE, fontWeight: '600', fontSize: 12 },

  saveButton: {
    backgroundColor: PRIMARY_BLUE,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 350
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20
  },
  modalInput: {
    fontSize: 16,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_BLUE,
    paddingVertical: 10,
    marginBottom: 25
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700'
  }
});
