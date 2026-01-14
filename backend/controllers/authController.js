const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const register = async (req, res) => {
  try {
    console.log("📝 KAYIT İSTEĞİ GELDİ (Web/Mobil):", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log("❌ EKSİK BİLGİ GÖNDERİLDİ");
      return res.status(400).json({ message: "Eksik bilgi" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: "Geçersiz email formatı" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalı" });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      console.log("❌ BU EMAIL ZATEN KAYITLI:", email);
      return res.status(409).json({ message: "Bu email zaten kayıtlı" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await userModel.createUser(username, email, hashedPassword);
    
    console.log("✅ KULLANICI BAŞARIYLA OLUŞTURULDU:", newUser);
    
    res.status(201).json({ 
      message: "Kayıt başarılı", 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
      } 
    });

  } catch (error) {
    console.error("🔥 KAYIT HATASI (Detay):", error);
    res.status(500).json({
      message: "Kayıt sırasında hata oluştu",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    console.log("🔑 GİRİŞ İSTEĞİ GELDİ:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve şifre gerekli" });
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      console.log("❌ KULLANICI BULUNAMADI:", email);
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ HATALI ŞİFRE:", email);
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } 
    );

    console.log("✅ GİRİŞ BAŞARILI, TOKEN VERİLDİ. User ID:", user.id);
    
    res.json({ 
      token,
      userId: user.id, 
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("🔥 GİRİŞ HATASI:", error);
    res.status(500).json({ 
      message: "Giriş hatası", 
      error: error.message 
    });
  }
};

module.exports = { register, login };