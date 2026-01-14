import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });

      toast.success("Kayıt Başarılı! Giriş yapabilirsin.");
      navigate("/");
    } catch (error) {
      toast.error("Kayıt başarısız. Bilgileri kontrol et.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleRegister} className="login-form">
        <h2>EcoCampus Kayıt</h2>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit" style={{ backgroundColor: "#e67e22" }}>Kayıt Ol</button>
        
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <span>Zaten hesabın var mı? </span>
          <Link to="/" style={{ color: "#3498db", textDecoration: "none", fontWeight: "bold" }}>Giriş Yap</Link>
        </div>
      </form>
    </div>
  );
}