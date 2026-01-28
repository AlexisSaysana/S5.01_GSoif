import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { fonts } from "../styles/fonts";
import { Settings } from "lucide-react-native";

import {
  ChevronRight,
  Calendar,
  User,
  Ruler,
  Weight,
  Check,
} from "lucide-react-native";

const BASE_URL = "https://s5-01-gsoif.onrender.com";

export default function ProfilIAScreen({ route, userId, navigation }) {
  const { colors, isDarkMode } = useContext(ThemeContext);

  const id_utilisateur = route?.params?.userId || userId;
  console.log("🟦 ID UTILISATEUR FRONT :", id_utilisateur);

  const [age, setAge] = useState(null);
  const [sexe, setSexe] = useState(null);
  const [taille, setTaille] = useState("");
  const [poids, setPoids] = useState("");
  const [objectif, setObjectif] = useState(null);
  const [explication, setExplication] = useState("");
  const [conseil, setConseil] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("idle");

  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showSexeModal, setShowSexeModal] = useState(false);
  const [showTailleModal, setShowTailleModal] = useState(false);
  const [showPoidsModal, setShowPoidsModal] = useState(false);

  const ages = Array.from({ length: 83 }, (_, i) => i + 18);
  const tailles = Array.from({ length: 81 }, (_, i) => i + 140);
  const poidsList = Array.from({ length: 121 }, (_, i) => i + 40);
  const [nbNotif, setNbNotif] = useState(null);
  const [mlParNotif, setMlParNotif] = useState(null);
  const [horaires, setHoraires] = useState([]);
  const [recommandation, setRecommandation] = useState("");

  function generateAdvice(temp, age, poids) {
    let text = "";

    if (temp < 12) text += "💡 Comme il fait froid aujourd’hui, votre corps perd moins d’eau. ";
    if (temp > 25) text += "💡 La chaleur augmente votre besoin hydrique. ";
    if (poids > 80) text += "💡 Votre poids indique un besoin hydrique légèrement supérieur. ";
    if (age > 50) text += "💡 Avec l’âge, l’hydratation devient encore plus importante. ";

    return text || "💡 Votre objectif a été calculé selon vos données personnelles.";
  }

  useEffect(() => {
    if (!id_utilisateur) return;

    axios
      .get(`${BASE_URL}/profile/${id_utilisateur}`)
      .then((res) => {
        if (res.data) {
          setAge(res.data.age || null);
          setSexe(res.data.sexe || null);
          setTaille(res.data.taille?.toString() || "");
          setPoids(res.data.poids?.toString() || "");
          setObjectif(res.data.objectif || null);
        }
      })
      .catch(() => Alert.alert("Erreur", "Impossible de charger votre profil"));
  }, []);

  const handleSaveAndCalculate = async () => {
    try {
      setStep("loading");
      setIsLoading(true);

      await axios.post(`${BASE_URL}/profile/update`, {
        id_utilisateur,
        age: Number(age),
        sexe,
        taille: Number(taille),
        poids: Number(poids),
      });

      const res = await axios.post(`${BASE_URL}/profile/calculate`, {
        id_utilisateur,
      });

      const temp = res.data.temperature_max;

      setNbNotif(res.data.nbNotif);
      setMlParNotif(res.data.mlParNotif);
      setHoraires(res.data.horaires);
      setRecommandation(res.data.recommandation);


      setTimeout(() => {
        setConseil(generateAdvice(temp, age, poids));
        setStep("advice");
      }, 1500); // apparition du conseil

      setTimeout(() => {
        setObjectif(res.data.objectif);
        setExplication(res.data.explication);
        setStep("result");
        setIsLoading(false);
      }, 6000); // résultat après 3 secondes de conseil


    } catch (error) {
      setIsLoading(false);
      Alert.alert("Erreur", "Impossible d’enregistrer ou de calculer l’objectif");
    }
  };

  const ProfilRow = ({ icon: Icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
        <Icon size={22} color={colors.primary} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          {value || "Non défini"}
        </Text>
      </View>

      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>IA</Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate("Setting")}
        >
          <Settings size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informations personnelles
          </Text>

          <ProfilRow
            icon={Calendar}
            label="Âge"
            value={age ? `${age} ans` : null}
            onPress={() => setShowAgeModal(true)}
          />

          <ProfilRow
            icon={User}
            label="Sexe"
            value={sexe}
            onPress={() => setShowSexeModal(true)}
          />

          <ProfilRow
            icon={Ruler}
            label="Taille"
            value={taille ? `${taille} cm` : null}
            onPress={() => setShowTailleModal(true)}
          />

          <ProfilRow
            icon={Weight}
            label="Poids"
            value={poids ? `${poids} kg` : null}
            onPress={() => setShowPoidsModal(true)}
          />
        </View>
        {step === "loading" && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Je prends en compte votre âge, votre morphologie et la météo actuelle…
            </Text>
          </View>
        )}


        {/* BOUTON BLEU STYLE "SUPPRIMER MON COMPTE" */}
        {step !== "loading" && (
          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: colors.primary +"99",
                borderColor: colors.primary,
                marginTop: 30,
                marginBottom: 40,
              },
            ]}
            onPress={handleSaveAndCalculate}
          >
            <Text
              style={[
                styles.dangerButtonText,
                { color: "white" }
              ]}
            >
              Enregistrer et calculer
            </Text>
          </TouchableOpacity>
        )}

        {step === "advice" && (
          <View style={styles.adviceBox}>
            <Text style={[styles.adviceText, { color: colors.textSecondary }]}>
              {conseil}
            </Text>
          </View>
        )}

        {step === "result" && (
          <View style={[styles.resultBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              Objectif : {objectif} L
            </Text>

            <Text style={[styles.iaConclusion, { color: colors.text }]}>
              Après analyse de vos données et des conditions météo, votre objectif optimal est de {objectif} L.
            </Text>

            <Text style={[styles.resultExplain, { color: colors.textSecondary }]}>
              {explication}
            </Text>
          </View>
        )}
        {recommandation !== "" && (
          <View style={[styles.adviceBox, { marginTop: 10 }]}>
            <Text style={[styles.adviceText, { color: colors.textSecondary }]}>
              {recommandation}
            </Text>
          </View>
        )}
        {horaires.length > 0 && (
          <View style={[styles.resultBox, { backgroundColor: colors.surface, marginTop: 10 }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              Horaires générés par l’IA
            </Text>

            {horaires.map((h, index) => (
              <Text key={index} style={[styles.resultExplain, { color: colors.textSecondary }]}>
                • {h}
              </Text>
            ))}
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate("Notifications")}
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 12,
            backgroundColor: colors.primary + "33",
            borderWidth: 1,
            borderColor: colors.primary
          }}
        >
          <Text style={{ color: colors.primary, textAlign: "center", fontWeight: "700" }}>
            Modifier les horaires
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {renderModal("Choisir votre âge", ages, age, setAge, showAgeModal, setShowAgeModal, colors, isDarkMode)}
      {renderModal("Choisir votre sexe", ["homme", "femme"], sexe, setSexe, showSexeModal, setShowSexeModal, colors, isDarkMode)}
      {renderModal("Choisir votre taille", tailles, taille, setTaille, showTailleModal, setShowTailleModal, colors, isDarkMode)}
      {renderModal("Choisir votre poids", poidsList, poids, setPoids, showPoidsModal, setShowPoidsModal, colors, isDarkMode)}
    </View>
  );
}

function renderModal(title, list, value, setter, visible, setVisible, colors, isDarkMode) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: colors.surface }]}>
          <Text style={[modalStyles.title, { color: colors.text }]}>{title}</Text>

          <ScrollView style={{ maxHeight: 300 }}>
            {list.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  modalStyles.option,
                  {
                    backgroundColor:
                      value == item ? (isDarkMode ? "#333" : "#F0F8FF") : "transparent",
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setter(item);
                  setVisible(false);
                }}
              >
                <Text style={[modalStyles.optionText, { color: colors.text }]}>
                  {item}
                </Text>
                {value == item && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text style={{ color: colors.textSecondary }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? StatusBar.currentHeight + 80 : 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    zIndex: 10,
  },

  settingsButton: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 45,
  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bricolageGrotesque,
    fontWeight: "700",
  },

  content: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 110 : 140,
  },

  sectionContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },

  sectionTitle: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  textWrapper: { flex: 1 },

  label: {
    fontFamily: fonts.inter,
    fontSize: 16,
    fontWeight: "500",
  },

  subLabel: {
    fontFamily: fonts.inter,
    fontSize: 13,
    marginTop: 2,
  },

  dangerButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
  },

  dangerButtonText: {
    fontFamily: fonts.inter,
    fontWeight: "700",
    fontSize: 16,
  },

  adviceBox: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 15,
  },

  adviceText: {
    fontSize: 14,
    fontFamily: fonts.inter,
  },

  resultBox: {
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: fonts.inter,
  },

  iaConclusion: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: fonts.inter,
    fontWeight: "600",
  },

  resultExplain: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.inter,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontFamily: fonts.bricolageGrotesque,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.inter,
  },
  closeButton: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
  },
});
