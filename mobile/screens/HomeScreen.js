import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../config'; 

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    checkLoginStatus();
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setCurrentUserId(userId);
  };

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.log("Veri çekme hatası:", error);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  const handleEdit = async (item) => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    console.log("-----------------------------------------");
    console.log("👤 BENİM ID:", storedUserId);
    console.log("📦 ÜRÜN SAHİBİ ID:", item.user_id);
    console.log("-----------------------------------------");

    if (!token || !storedUserId) {
      Alert.alert("Hata", "Önce giriş yapmalısınız.");
      return;
    }

    if (!item.user_id) {
      Alert.alert("Sistem Hatası", "Bu ürünün kime ait olduğu verisi sunucudan gelmedi.");
      return;
    }

    if (storedUserId.toString() !== item.user_id.toString()) {
      Alert.alert("⛔ Yetkisiz İşlem", "Bu ilanı düzenleyemezsin çünkü senin değil!");
      return;
    }

    navigation.navigate('AddProduct', { product: item });
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Silme Onayı",
      "Bu ilanı silmek istediğinden emin misin?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              Alert.alert("Hata", "Önce giriş yapmalısınız.");
              return;
            }

            try {
              await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert("Başarılı", "İlan silindi!");
              fetchProducts();
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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>
          {item.price == 0 ? "BAĞIŞ" : `${item.price} TL`}
        </Text>
        
        {item.username && (
          <Text style={styles.username}>@{item.username}</Text>
        )}
        
        {isLoggedIn && currentUserId && item.user_id && 
         currentUserId.toString() === item.user_id.toString() && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }} 
              style={[styles.actionBtn, styles.editBtn]}>
              <Text style={styles.actionBtnText}>✏️ Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              style={[styles.actionBtn, styles.deleteBtn]}>
              <Text style={styles.actionBtnText}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🌿 EcoCampus</Text>
        {isLoggedIn && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz ilan yok 📭</Text>
          </View>
        }
      />

      {isLoggedIn && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f2f5' 
  },
  header: { 
    padding: 15, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#27ae60'
  },
  logoutBtn: { 
    backgroundColor: '#e74c3c', 
    paddingHorizontal: 15,
    paddingVertical: 8, 
    borderRadius: 8 
  },
  logoutText: {
    color: 'white',
    fontWeight: '600'
  },
  card: { 
    backgroundColor: 'white', 
    margin: 10, 
    borderRadius: 12, 
    overflow: 'hidden', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  image: { 
    width: '100%', 
    height: 180,
    backgroundColor: '#ecf0f1'
  },
  info: { 
    padding: 12 
  },
  title: { 
    fontSize: 17, 
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  price: { 
    fontSize: 18, 
    color: '#27ae60', 
    marginTop: 5, 
    fontWeight: 'bold' 
  },
  username: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 8,
    fontStyle: 'italic'
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8
  },
  actionBtn: { 
    flex: 1,
    padding: 10, 
    borderRadius: 8,
    alignItems: 'center'
  },
  editBtn: {
    backgroundColor: '#f39c12'
  },
  deleteBtn: {
    backgroundColor: '#e74c3c'
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13
  },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    backgroundColor: '#3498db', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  fabText: { 
    color: 'white', 
    fontSize: 32,
    fontWeight: '300'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6'
  }
});