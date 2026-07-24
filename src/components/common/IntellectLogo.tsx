import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color } from '../../assets/colors/globalColor';

interface IntellectLogoProps {
  scale?: number;
}

export function IntellectLogo({ scale = 1 }: IntellectLogoProps) {
  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Top Red Star / Compass Icon above the 'i' */}
      <View style={styles.topIconWrapper}>
        <View style={styles.starIconContainer}>
          <Text style={styles.starIcon}>✦</Text>
        </View>
      </View>

      {/* Main Logo Text */}
      <View style={styles.logoTextRow}>
        <Text style={styles.logoText}>INTELLECT</Text>
      </View>

      {/* Subtitle / Tagline */}
      <Text style={styles.taglineText}>A Nihilent Company</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  topIconWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 4,
    marginBottom: -6,
  },
  starIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    color: color.accentRed,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: color.primaryGold,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'sans-serif-condensed',
  },
  taglineText: {
    color: color.primaryGold,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
});
