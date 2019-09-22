DROP DATABASE IF EXISTS Bamazon;
CREATE database Bamazon;

USE Bamazon;

CREATE TABLE products
    (item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
        product_name VARCHAR(100) NULL,
        department_name VARCHAR(100) NULL,
        price DECIMAL(10, 2) NULL,
        quantity INT NULL,
        PRIMARY KEY(item_id) 
        );

INSERT INTO Products (product_name, department_name, price, quantity) 
VALUES 
("KitchenAid Mixer White", "Home, Garden & Tools", 193.70, 36),
("Presto Belgian Waffle Maker", "Home, Garden & Tools", 24.47, 54),
("iGloo Red Compact Ice Maker", "Home, Garden & Tools", 99.00, 7),
("Hasbro Pie Face Game", "Toys, Kids & Baby", 15.99, 25),
("Monopoly - The Classic Edition", "Toys, Kids & Baby", 21.97, 25),
("Gold Heart Locket Necklace", "Clothing, Shoes & Jewelry", 63.26, 17),
("Scarab Cuff Links", "Clothing, Shoes & Jewelry", 225.00, 4),
("Vita Coco Coconut Water", "Beauty, Health & Grocery", 225.00, 3116),
("Canon MG2920 Wireless Printer", "Electronics & Computers", 49.95, 47),
("Fitbit Wireless Wristband", "Electronics & Computers", 125.89, 24274);


