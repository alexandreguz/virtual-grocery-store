-- Drop existing tables if they exist
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with role
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    identity_number VARCHAR(20) UNIQUE,
    password VARCHAR(255),
    city VARCHAR(100),
    street VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    category_id INTEGER REFERENCES categories(category_id), 
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping cart
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items
CREATE TABLE cart_items (
    item_id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(cart_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    cart_id INTEGER REFERENCES carts(cart_id),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_city VARCHAR(100),
    delivery_street VARCHAR(255),
    delivery_date DATE,
    card_last_four VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (first_name, last_name, email, identity_number, password, city, street, role)
VALUES 
    ('Admin', 'User', 'admin@example.com', 'ADM123', 'hashed_password', 'New York', 'Broadway', 'admin'),
    ('John', 'Doe', 'john@example.com', 'USR456', 'hashed_password', 'Los Angeles', 'Main St', 'client');

INSERT INTO categories (category_name)
VALUES 
    ('Fruits'),
    ('Vegetables'),
    ('Dairy');
    ('Meat, Fish & Eggs'),
    ('Beverages');

INSERT INTO products (name, category, price, image, stock_quantity)
VALUES 
    ('Apple', 'Fruits', 0.50, 'apple.jpeg', 100),
    ('Banana', 'Fruits', 0.30, 'banana.jpg', 150),
    ('Carrot', 'Vegetables', 0.25, 'carrot.jpg', 200),
    ('Milk', 'Dairy', 2.99, 'milk.webp', 50);


SELECT * FROM products