import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_BLUE, WHITE } from '../styles/baseStyles';
import { fonts } from '../styles/fonts';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import ProgressCircle from '../components/ProgressCircle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import QuickAddButton from '../components/QuickAddButton';

export default function ProfileScreen() {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);

  const [completed, setCompleted] = useState(400);
  const [target, setTarget] = useState(2000);
  const progression = completed / target

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@fountainHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER BLUE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Votre progression</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <ProgressCircle
            size={250}
            strokeWidth={15}
            color={'#2bcbed'}
            backgroundColor={'#c8e0e8'}
            progress={progression > 1 ? 1 : progression}
          >
            <Image 
              source={isDarkMode ? require('../assets/bottle_icon_white.png') : require('../assets/bottle_icon.png')}
              style={styles.bottleIcon} 
            />
            <Text style={[styles.percentage, { color: colors.text }]}>{Math.round(progression * 100)}%</Text>
          </ProgressCircle>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>Vous avez bu {completed}ml sur {target} aujourd'hui !</Text>          
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View
            style={
              {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: 300,
                gap: 10,
              }
            }
        >
          <Text style={{ color: colors.textSecondary, marginBottom: 10, }}>
            Ajoutez votre consommation d'eau
          </Text>  
          <View
            style={
              {
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
              }
            }
          >
            <QuickAddButton
              title={'+100mL'}
              onPress={() => setCompleted(completed + 100)}
            />
            <QuickAddButton
              title={'+250mL'}
              onPress={() => setCompleted(completed + 250)}
            />
            <QuickAddButton
              title={'+500mL'}
              onPress={() => setCompleted(completed + 500)}
            />
          </View>
          <View style={
          {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }
        }>
          <View
            style={
              {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }
            }
          >
            <View
              style={
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }
              }
            >
              <Text
                style={
                  {
                    color: '#000',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }
                }
              >
                +
              </Text>
            </View>
            <CustomInput
              placeholder="Quatité personnalisée"
              width={220}
              keyboardType='numeric'
            />
          <View
              style={
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }
              }
            >
              <Text
                style={
                  {
                    color: '#000',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }
                }
              >
                mL
              </Text>
            </View>
          </View>
        </View>
        <CustomButton
              title={'Ajouter'}
            />
        </View>
      </ScrollView>
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
  percentage: { fontSize: 40, fontWeight: 'bold', fontFamily: fonts.bricolageGrotesque },
  subText: { marginTop: 15, fontFamily: fonts.inter },
  divider: { width: '100%', height: 1, marginVertical: 30 },
  sectionTitle: { alignSelf: 'flex-start', fontSize: 18, fontWeight: '700', marginBottom: 20, fontFamily: fonts.bricolageGrotesque },
  historyItem: { 
    flexDirection: 'row', width: '100%', padding: 15, 
    borderRadius: 20, marginBottom: 15, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  blueDot: { width: 15, height: 15, borderRadius: 10, backgroundColor: '#64B5F6', marginRight: 15 },
  locationName: { fontSize: 16, fontWeight: '600', fontFamily: fonts.inter },
  locationCity: { fontSize: 12, fontFamily: fonts.inter },
  emptyText: { fontSize: 14, fontFamily: fonts.inter, marginTop: 10 }
});
