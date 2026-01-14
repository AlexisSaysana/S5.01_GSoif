import React, { useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react-native';

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const Select = ({ options, value, onChange }) => {
  const { colors } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.select, { borderColor: colors.textSecondary }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{color: colors.textSecondary}}>{value ?? 'Sélectionner'}</Text>
        <ChevronDown color={colors.textSecondary} size={20} />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open}>
        <TouchableOpacity
          testID="overlay"
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <Text>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  select: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdown: {
    backgroundColor: 'white',
    marginHorizontal: 40,
    borderRadius: 12,
    paddingVertical: 10,
  },
  option: {
    padding: 15,
  },
});

export default Select;
