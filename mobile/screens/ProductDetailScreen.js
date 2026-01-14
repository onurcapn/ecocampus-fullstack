import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    console.log("🔍 DETAY SAYFASI AÇILDI, Product ID:", productId);
    checkLoginStatus();
    fetchProductDetail();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setCurrentUserId(userId);
    console.log("👤 Giriş durumu - Token:", !!token, "User ID:", userId);
  };

  const fetchProductDetail = async () => {
    try {
      console.log("🚀 İstek gönderiliyor:", `${API_URL}/products/${productId}`);
      const response = await axios.get(`${API_URL}/products/${productId}`);
      console.log("✅ DETAY GELDİ:", response.data);
      setProduct(response.data);
    } catch (error) {
      console.log("❌ DETAY ÇEKME HATASI:", error);
      
      if (error.response) {
        console.log("Server Cevabı:", error.response.data);
        Alert.alert("Hata", error.response.data.message || "Ürün detayı yüklenemedi.");
      } else if (error.request) {
        console.log("Sunucuya ulaşılamadı");
        Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamıyor. IP adresini kontrol et.");
      } else {
        console.log("Hata:", error.message);
        Alert.alert("Hata", "Bir hata oluştu: " + error.message);
      }
      
      navigation.goBack();
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    if (!token || !storedUserId) {
      Alert.alert("Hata", "Önce giriş yapmalısınız.");
      return;
    }

    if (!product.user_id) {
      Alert.alert("Sistem Hatası", "Bu ürünün sahibi bilgisi yok.");
      return;
    }

    if (storedUserId.toString() !== product.user_id.toString()) {
      Alert.alert("⛔ Yetkisiz İşlem", "Bu ilanı düzenleyemezsin çünkü senin değil!");
      return;
    }

    navigation.navigate('AddProduct', { product });
  };

  const handleDelete = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    if (!token || !storedUserId) {
      Alert.alert("Hata", "Önce giriş yapmalısınız.");
      return;
    }

    if (!product.user_id) {
      Alert.alert("Sistem Hatası", "Bu ürünün sahibi bilgisi yok.");
      return;
    }

    if (storedUserId.toString() !== product.user_id.toString()) {
      Alert.alert("⛔ Yetkisiz İşlem", "Bu ilanı silemezsin çünkü senin değil!");
      return;
    }

    Alert.alert(
      "Silme Onayı",
      "Bu ilanı silmek istediğinden emin misin?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert("Başarılı", "İlan silindi!");
              navigation.goBack();
            } catch (error) {
              console.log("Silme hatası:", error);
              if (error.response && error.response.status === 403) {
                Alert.alert("Yetkisiz İşlem", "Sadece kendi ilanını silebilirsin!");
              } else {
                Alert.alert("Hata", "Silme işlemi başarısız.");
              }
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ürün bulunamadı</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = currentUserId && product.user_id && 
                  currentUserId.toString() === product.user_id.toString();

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: product.image_url || 'https://via.placeholder.com/400' }} 
        style={styles.image} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {product.price == 0 ? "BAĞIŞ" : `${product.price} TL`}
          </Text>
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {product.username && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Satıcı</Text>
            <Text style={styles.username}>@{product.username}</Text>
          </View>
        )}

        {product.category && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}

        {product.created_at && (
          <View style={styles.section}>
            <Text style={styles.dateText}>
              İlan Tarihi: {new Date(product.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        )}

        {isLoggedIn && isOwner && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.buttonText}>✏️ Düzenle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#ecf0f1'
  },
  content: {
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  priceContainer: {
    backgroundColor: '#e8f8f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24
  },
  username: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600'
  },
  categoryText: {
    fontSize: 16,
    color: '#9b59b6',
    fontWeight: '600'
  },
  dateText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});