import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Uyarı", "Email ve şifre alanlarını doldurun.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password
      });

      console.log("✅ LOGIN BAŞARILI! Backend'den gelen veri:", response.data);

      await AsyncStorage.setItem('token', response.data.token);

      if (response.data.userId || response.data.user_id) {
        const userId = response.data.userId || response.data.user_id;
        await AsyncStorage.setItem('userId', String(userId));
        console.log("💾 Kaydedilen User ID:", userId);
      } else {
        try {
          const base64Url = response.data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          console.log("🔓 Token içeriği:", decoded);
          
          if (decoded.id || decoded.userId || decoded.user_id) {
            const userId = decoded.id || decoded.userId || decoded.user_id;
            await AsyncStorage.setItem('userId', String(userId));
            console.log("💾 Token'dan çıkarılan User ID:", userId);
          } else {
            console.warn("⚠️ Token'da userId bulunamadı!");
          }
        } catch (e) {
          console.warn("⚠️ Token decode edilemedi:", e);
        }
      }

      Alert.alert("Başarılı", "Giriş yapıldı! 🎉");
      navigation.replace('Home');

    } catch (error) {
      console.log("❌ LOGIN HATASI:", error);
      
      if (error.response) {
        console.log("Server Cevabı:", error.response.data);
        Alert.alert("Hata", error.response.data.message || "Giriş başarısız.");
      } else if (error.request) {
        console.log("Sunucuya Ulaşılamadı");
        Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamıyor. IP adresini kontrol et: " + API_URL);
      } else {
        console.log("Hata Mesajı:", error.message);
        Alert.alert("Hata", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 EcoCampus</Text>
      <Text style={styles.subtitle}>Sürdürülebilir Kampüs Hayatı</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email (ali@kgu.edu.tr)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')} 
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>
          Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')} 
        style={styles.guestLink}
      >
        <Text style={styles.guestText}>Giriş Yapmadan Devam Et</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#ecf0f1' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    textAlign: 'center', 
    color: '#27ae60' 
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30
  },
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#ddd',
    fontSize: 16
  },
  button: { 
    backgroundColor: '#27ae60', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    elevation: 2
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6'
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: '#2c3e50',
    fontSize: 14
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#e67e22'
  },
  guestLink: {
    marginTop: 15,
    alignItems: 'center'
  },
  guestText: {
    color: '#3498db',
    fontSize: 14
  }
});