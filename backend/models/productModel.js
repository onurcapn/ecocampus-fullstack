const pool = require("../config/db");

const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT 
      products.*, 
      users.username, 
      categories.name AS category
    FROM products
    JOIN users ON products.user_id = users.id
    JOIN categories ON products.category_id = categories.id
    ORDER BY products.id DESC
  `);
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query(`
    SELECT 
      products.*, 
      users.username,
      users.email,
      categories.name AS category
    FROM products
    JOIN users ON products.user_id = users.id
    JOIN categories ON products.category_id = categories.id
    WHERE products.id = $1
  `, [id]);
  
  return result.rows[0]; 
};

const createProduct = async (title, price, description, image_url, user_id, category_id) => {
  const result = await pool.query(
    `INSERT INTO products (title, price, description, image_url, user_id, category_id) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [title, price, description, image_url, user_id, category_id]
  );
  return result.rows[0];
};

const updateProduct = async (id, title, price, description, image_url, category_id, user_id) => {
  const result = await pool.query(
    `UPDATE products 
     SET title = $1, price = $2, description = $3, image_url = $4, category_id = $5 
     WHERE id = $6 AND user_id = $7 
     RETURNING *`,
    [title, price, description, image_url, category_id, id, user_id]
  );

  return result.rows[0] || null;
};

const deleteProduct = async (id, user_id) => {
  const result = await pool.query(
    `DELETE FROM products 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, user_id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllProducts,
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct
};