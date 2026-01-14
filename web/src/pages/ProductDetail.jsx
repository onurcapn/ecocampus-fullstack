import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    setCurrentUserId(userId);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      toast.error("Ürün bulunamadı");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!isLoggedIn) {
      toast.error("❌ İlan silmek için giriş yapmalısınız!");
      return;
    }

    if (!window.confirm("Bu ilanı silmek istediğinden emin misin?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("İlan silindi!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Silme başarısız.");
    }
  };

  const handleEdit = () => {
    if (!isLoggedIn) {
      toast.error("❌ İlan düzenlemek için giriş yapmalısınız!");
      return;
    }

    navigate(`/edit/${id}`, { state: { product } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Ürün bulunamadı</p>
        <button onClick={() => navigate("/dashboard")}>Geri Dön</button>
      </div>
    );
  }

  const isOwner = isLoggedIn && currentUserId && String(currentUserId) === String(product.user_id);

  return (
    <div className="detail-container">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Geri
      </button>

      <div className="detail-content">
        <div className="detail-image">
          <img 
            src={product.image_url || "https://via.placeholder.com/600"} 
            alt={product.title} 
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{product.title}</h1>
          
          <div className="detail-price">
            {product.price == 0 ? "BAĞIŞ" : `${product.price} TL`}
          </div>

          {product.description && (
            <div className="detail-section">
              <h3>Açıklama</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.username && (
            <div className="detail-section">
              <h3>Satıcı</h3>
              <p className="seller-name">@{product.username}</p>
            </div>
          )}

          {product.category && (
            <div className="detail-section">
              <h3>Kategori</h3>
              <p className="category-badge">{product.category}</p>
            </div>
          )}

          {product.created_at && (
            <div className="detail-section">
              <p className="detail-date">
                İlan Tarihi: {new Date(product.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          )}

          {isOwner && (
            <div className="detail-actions">
              <button onClick={handleEdit} className="btn-edit-large">
                ✏️ Düzenle
              </button>
              <button onClick={handleDelete} className="btn-delete-large">
                🗑️ Sil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}