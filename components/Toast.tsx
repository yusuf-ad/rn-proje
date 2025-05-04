import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';

type ToastType = 'success' | 'error';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
}

export function Toast({ visible, message, type, onHide }: ToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity },
        type === 'success' ? styles.successBg : styles.errorBg,
      ]}>
      {type === 'success' ? (
        <CheckCircle2 size={24} color="#fff" />
      ) : (
        <AlertCircle size={24} color="#fff" />
      )}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successBg: {
    backgroundColor: '#059669',
  },
  errorBg: {
    backgroundColor: '#dc2626',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
});