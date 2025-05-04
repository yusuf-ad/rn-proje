import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const database = useSQLiteContext();

  const handleSignup = async () => {
    // Basic validation
    if (!confirmPassword || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const result = await database.runAsync(
        'INSERT INTO user (email, password) VALUES (?, ?)',
        [email, password]
      );

      const userId = result.lastInsertRowId;

      // setCurrentUser({
      //   id: userId,
      //   goal: 2400,
      //   lastLoginTime: new Date().toISOString(),
      // });

      router.navigate('/');
    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert(
        'Signup Failed',
        'Could not create account. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Confirm Password"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={{ marginTop: 15 }}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#7c3aed',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#7c3aed',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#000',
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
  },
  linkText: {
    color: '#7c3aed',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
