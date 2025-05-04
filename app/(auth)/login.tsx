import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const database = useSQLiteContext();

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      const user = await database.getFirstAsync<any>(
        'SELECT * FROM user WHERE email = ? AND password = ?;',
        [email, password]
      );

      if (user) {
        // Set the user in AuthContext
        setUser({
          id: user.id,
          email: user.email,
        });

        // Router.replace will prevent going back to login
        router.replace('/');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        'An error occurred during login. Please try again.'
      );
    }
  };

  const { user } = useAuth();

  // If user is not authenticated, redirect to login
  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
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
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/signup')}
        style={{ marginTop: 15 }}
      >
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
