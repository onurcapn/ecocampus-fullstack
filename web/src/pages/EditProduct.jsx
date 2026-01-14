import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    image_url: "",
    category_id: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.product) {
      const p = location.state.product;
      setForm({
        title: p.title,
        price: String(p.price),
        description: p.description || "",
        image_url: p.image_url || "",
        category_id: p.category_id || 1
      });
    } else {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${id}`);
      const p = res.data;
      setForm({
        title: p.title,
        price: String(p.price),
        description: p.description || "",
        image_url: p.image_url || "",
        category_id: p.category_id || 1
      });
    } catch (error) {
      toast.error("Ürün bulunamadı");
      navigate("/dashboard");
    }
  };

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
      await axios.put(`${API_URL}/products/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("İlan güncellendi!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("⛔ Bu ilanı düzenleyemezsin - senin değil!");
      } else {
        toast.error("Güncelleme başarısız.");
      }
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

        <h2 className="form-title">İlanı Düzenle</h2>

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
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}