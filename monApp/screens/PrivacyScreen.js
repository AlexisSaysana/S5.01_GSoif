import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { fonts } from '../styles/fonts';

export default function PrivacyScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          Dernière mise à jour : 8 janvier 2026
        </Text>

        <Text style={[styles.intro, { color: colors.text }]}>
          Chez GSoif, nous prenons votre vie privée au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Responsable du traitement</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          GSoif est responsable du traitement de vos données personnelles.
          {'\n'}Contact : support@gsoif.app
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Données collectées</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous collectons les données suivantes :
          {'\n\n'}• Données de compte : prénom, nom, adresse e-mail, mot de passe (chiffré)
          {'\n'}• Données d'utilisation : historique de consommation d'eau, objectifs d'hydratation, préférences de notifications
          {'\n'}• Données de localisation : uniquement si vous activez la fonctionnalité de recherche de points d'eau (avec votre consentement explicite)
          {'\n'}• Données techniques : type d'appareil, version du système d'exploitation, identifiant unique de l'appareil
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Base légale du traitement</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous traitons vos données sur les bases légales suivantes :
          {'\n\n'}• Exécution du contrat : pour fournir les services de l'Application
          {'\n'}• Consentement : pour la géolocalisation et les notifications
          {'\n'}• Intérêt légitime : pour améliorer nos services et assurer la sécurité
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Utilisation des données</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Vos données sont utilisées pour :
          {'\n\n'}• Fournir et personnaliser les fonctionnalités de l'Application
          {'\n'}• Vous envoyer des rappels d'hydratation (avec votre consentement)
          {'\n'}• Améliorer nos services et développer de nouvelles fonctionnalités
          {'\n'}• Assurer la sécurité et prévenir les fraudes
          {'\n'}• Respecter nos obligations légales
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Partage des données</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement dans les cas suivants :
          {'\n\n'}• Fournisseurs de services : hébergement cloud, services d'analyse (avec des garanties de protection appropriées)
          {'\n'}• Obligations légales : si requis par la loi ou une autorité compétente
          {'\n'}• Protection des droits : pour protéger nos droits, notre propriété ou notre sécurité
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Conservation des données</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous conservons vos données personnelles aussi longtemps que votre compte est actif. Si vous supprimez votre compte, vos données sont effacées sous 30 jours, sauf obligation légale de conservation.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Vos droits (RGPD)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Conformément au RGPD, vous disposez des droits suivants :
          {'\n\n'}• Droit d'accès : obtenir une copie de vos données personnelles
          {'\n'}• Droit de rectification : corriger vos données inexactes
          {'\n'}• Droit à l'effacement : supprimer vos données ("droit à l'oubli")
          {'\n'}• Droit à la limitation : limiter le traitement de vos données
          {'\n'}• Droit à la portabilité : recevoir vos données dans un format structuré
          {'\n'}• Droit d'opposition : vous opposer au traitement de vos données
          {'\n'}• Droit de retirer votre consentement : à tout moment pour la géolocalisation et les notifications
          {'\n\n'}Pour exercer ces droits, contactez-nous à : support@gsoif.app
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Sécurité des données</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction :
          {'\n\n'}• Chiffrement des données sensibles (mot de passe)
          {'\n'}• Connexions sécurisées (HTTPS)
          {'\n'}• Accès limité aux données personnelles
          {'\n'}• Audits de sécurité réguliers
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Consentement pour la géolocalisation</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          L'utilisation de vos données de localisation nécessite votre consentement explicite. Vous pouvez :
          {'\n\n'}• Activer ou désactiver la géolocalisation à tout moment dans les paramètres
          {'\n'}• Nous collectons uniquement votre position lorsque vous utilisez la fonctionnalité de recherche de points d'eau
          {'\n'}• Nous ne stockons pas votre historique de localisation
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Cookies et technologies similaires</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Notre application utilise des technologies locales pour améliorer votre expérience (stockage local pour sauvegarder vos préférences). Aucun cookie de suivi publicitaire n'est utilisé.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Transferts internationaux</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Vos données peuvent être transférées et traitées dans des pays hors de l'Union Européenne. Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, certifications Privacy Shield).
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>12. Mineurs</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Notre application n'est pas destinée aux personnes de moins de 16 ans. Si nous découvrons que nous avons collecté des données d'un mineur sans consentement parental, nous les supprimerons immédiatement.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>13. Modifications de la politique</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Nous pouvons mettre à jour cette politique de temps en temps. Nous vous informerons de tout changement significatif par notification dans l'Application. La version la plus récente est toujours disponible dans les paramètres.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>14. Réclamations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Si vous estimez que vos droits n'ont pas été respectés, vous pouvez déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) ou de votre autorité de protection des données locale.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>15. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Pour toute question concernant cette politique ou l'exercice de vos droits :
          {'\n'}Email : support@gsoif.app
          {'\n'}Réponse sous 30 jours maximum
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
    marginBottom: 15,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.inter,
    marginBottom: 20,
    fontWeight: '500',
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
