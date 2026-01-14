import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function AddProductScreen({ navigation, route }) {
  const { product } = route.params || {}; 
  
  const [form, setForm] = useState({ 
    title: '', 
    price: '', 
    description: '', 
    image_url: '', 
    category_id: '1' 
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        price: String(product.price),
        description: product.description || '',
        image_url: product.image_url || '',
        category_id: String(product.category_id || '1')
      });
      navigation.setOptions({ title: 'İlanı Düzenle' });
    }
  }, [product]);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
        Alert.alert("Hata", "Lütfen giriş yapın.");
        navigation.replace('Login');
        return;
    }

    try {
      if (product) {
        console.log("Güncelleme isteği gönderiliyor...");
        
        await axios.put(`${API_URL}/products/${product.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Alert.alert("Başarılı", "İlan başarıyla güncellendi!");
      } else {
        await axios.post(`${API_URL}/products`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Alert.alert("Başarılı", "İlan başarıyla eklendi!");
      }
      
      navigation.goBack();

    } catch (error) {
      console.log("İşlem Hatası:", error);

      if (error.response && error.response.status === 404) {
          Alert.alert("Yetkisiz İşlem", "Sadece kendi ilanını düzenleyebilirsin!");
      } else {
          Alert.alert("Hata", "İşlem başarısız. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{product ? "İlanı Düzenle" : "Yeni İlan Ver"}</Text>
      
      <TextInput placeholder="Başlık" value={form.title} style={styles.input} onChangeText={(t) => setForm({...form, title: t})} />
      <TextInput placeholder="Fiyat" value={form.price} keyboardType="numeric" style={styles.input} onChangeText={(t) => setForm({...form, price: t})} />
      <TextInput placeholder="Açıklama" value={form.description} style={styles.input} onChangeText={(t) => setForm({...form, description: t})} />
      <TextInput placeholder="Resim URL" value={form.image_url} style={styles.input} onChangeText={(t) => setForm({...form, image_url: t})} />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{product ? "Güncelle" : "Yayınla"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: 'white', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#8e44ad', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});