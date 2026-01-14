import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email ve şifre gerekli");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password,
      });

      console.log("✅ LOGIN BAŞARILI:", response.data);

      localStorage.setItem("token", response.data.token);
      
      if (response.data.userId || response.data.user_id) {
        localStorage.setItem("userId", String(response.data.userId || response.data.user_id));
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
          const userId = decoded.id || decoded.userId || decoded.user_id;
          if (userId) {
            localStorage.setItem("userId", String(userId));
          }
        } catch (e) {
          console.warn("Token decode edilemedi:", e);
        }
      }

      toast.success("Giriş Başarılı! 🎉");
      navigate("/dashboard");
    } catch (error) {
      console.log("❌ LOGIN HATASI:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Giriş başarısız!");
      } else if (error.request) {
        toast.error("Sunucuya ulaşılamıyor!");
      } else {
        toast.error("Bir hata oluştu!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    toast.info("Misafir olarak devam ediyorsunuz - İlan ekleyemez/düzenleyemezsiniz");
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>🌿 EcoCampus</h2>
        <p className="subtitle">Sürdürülebilir Kampüs Hayatı</p>
        
        <input
          type="email"
          placeholder="Email Adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div className="link-container">
          <span>Hesabın yok mu? </span>
          <Link to="/register">Kayıt Ol</Link>
        </div>

        <button 
          type="button" 
          className="guest-btn" 
          onClick={handleGuestAccess}
        >
          Giriş Yapmadan Devam Et
        </button>
      </form>
    </div>
  );
}