import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    setIsLoggedIn(!!token);
    setCurrentUserId(userId);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      toast.error("Ürünler yüklenemedi");
    }
  };

  const handleDelete = async (id, productUserId) => {
    if (!isLoggedIn) {
      toast.error("❌ İlan silmek için giriş yapmalısınız!");
      return;
    }

    if (currentUserId !== String(productUserId)) {
      toast.error("⛔ Bu ilanı silemezsin - senin değil!");
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
      fetchProducts();
    } catch (error) {
      toast.error("Silme başarısız.");
    }
  };

  const handleEdit = (product) => {
    if (!isLoggedIn) {
      toast.error("❌ İlan düzenlemek için giriş yapmalısınız!");
      return;
    }

    if (currentUserId !== String(product.user_id)) {
      toast.error("⛔ Bu ilanı düzenleyemezsin - senin değil!");
      return;
    }
    
    navigate(`/edit/${product.id}`, { state: { product } });
  };

  const handleAddProduct = () => {
    if (!isLoggedIn) {
      toast.error("❌ İlan eklemek için giriş yapmalısınız!");
      navigate("/");
      return;
    }
    navigate("/add");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.info("Çıkış yapıldı");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🌿 EcoCampus</h1>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button onClick={handleAddProduct} className="add-btn">
                + Yeni İlan
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Çıkış Yap
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/")} className="login-btn">
              Giriş Yap
            </button>
          )}
        </div>
      </header>

      {!isLoggedIn && (
        <div className="guest-banner">
          ℹ️ Misafir modundasınız - İlan eklemek, düzenlemek veya silmek için giriş yapın
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <p>📭 Henüz ilan yok</p>
          </div>
        ) : (
          products.map((product) => {
            const isOwner = isLoggedIn && currentUserId && String(currentUserId) === String(product.user_id);
            
            return (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-image">
                  <img 
                    src={product.image_url || "https://via.placeholder.com/300"} 
                    alt={product.title} 
                  />
                </div>
                
                <div className="product-content">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-price">
                    {product.price == 0 ? "BAĞIŞ" : `${product.price} TL`}
                  </p>
                  
                  {product.username && (
                    <p className="product-seller">@{product.username}</p>
                  )}
                  
                  {product.category && (
                    <span className="product-category">{product.category}</span>
                  )}
                  
                  {isOwner && (
                    <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="btn-edit"
                      >
                        ✏️ Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.user_id)}
                        className="btn-delete"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}