import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    image_url: "",
    category_id: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error("Başlık zorunludur!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    setLoading(true);
    try {
      await axios.post(`${API_URL}/products`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("İlan eklendi!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Ekleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          ← Geri
        </button>

        <h2 className="form-title">Yeni İlan Ver</h2>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Başlık *</label>
            <input
              type="text"
              placeholder="Ürün başlığı"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Fiyat (0 = Bağış)</label>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              placeholder="Ürün açıklaması"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Resim URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="1">Ders Kitapları</option>
              <option value="2">Elektronik</option>
              <option value="3">Mobilya</option>
              <option value="4">Kırtasiye</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
          </button>
        </form>
      </div>
    </div>
  );
}