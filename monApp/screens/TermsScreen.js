import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { fonts } from '../styles/fonts';

export default function TermsScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          Dernière mise à jour : 8 janvier 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptation des conditions</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          En utilisant l'application GSoif ("l'Application"), vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description du service</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          GSoif est une application mobile qui vous permet de :
          {'\n'}• Suivre votre consommation d'eau quotidienne
          {'\n'}• Définir et atteindre vos objectifs d'hydratation
          {'\n'}• Localiser des points d'eau potable à proximité
          {'\n'}• Recevoir des rappels de boire de l'eau
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Compte utilisateur</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Utilisation acceptable</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Vous vous engagez à :
          {'\n'}• Fournir des informations exactes lors de votre inscription
          {'\n'}• Ne pas utiliser l'Application à des fins illégales
          {'\n'}• Ne pas tenter de perturber le fonctionnement de l'Application
          {'\n'}• Respecter les droits d'auteur et de propriété intellectuelle
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Contenu utilisateur</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Les données que vous enregistrez dans l'Application (historique d'hydratation, préférences) vous appartiennent. Nous ne les utilisons que pour fournir et améliorer nos services.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Géolocalisation</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          L'utilisation de la fonctionnalité de localisation des points d'eau nécessite votre consentement explicite. Vous pouvez désactiver cette fonctionnalité à tout moment dans les paramètres de votre appareil.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation de responsabilité</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          L'Application est fournie "en l'état". Nous ne garantissons pas que l'Application sera exempte d'erreurs ou disponible en permanence. Les informations fournies par l'Application sont à titre informatif uniquement et ne constituent pas un avis médical.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Modifications des conditions</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication dans l'Application. Votre utilisation continue de l'Application après publication constitue votre acceptation des nouvelles conditions.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Résiliation</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'Application. Nous nous réservons le droit de suspendre ou résilier votre accès en cas de violation de ces conditions.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Pour toute question concernant ces conditions, veuillez nous contacter à :
          {'\n'}Email : support@gsoif.app
        </Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
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
    paddingBottom: 40,
  },
  date: {
    fontSize: 13,
    fontFamily: fonts.inter,
    marginBottom: 25,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bricolageGrotesque,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.inter,
    marginBottom: 10,
  },
});
