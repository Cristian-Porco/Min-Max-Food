-- Database per Piano Alimentare
-- Crea il database
CREATE DATABASE IF NOT EXISTS piano_alimentare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE piano_alimentare;

-- Tabella alimenti
CREATE TABLE IF NOT EXISTS alimenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    calorie DECIMAL(6,2) NOT NULL COMMENT 'Calorie per 100g',
    proteine DECIMAL(6,2) NOT NULL COMMENT 'Proteine in grammi per 100g',
    carboidrati DECIMAL(6,2) NOT NULL COMMENT 'Carboidrati in grammi per 100g',
    grassi DECIMAL(6,2) NOT NULL COMMENT 'Grassi in grammi per 100g',
    fibre DECIMAL(6,2) DEFAULT 0 COMMENT 'Fibre in grammi per 100g',
    zuccheri DECIMAL(6,2) DEFAULT 0 COMMENT 'Zuccheri in grammi per 100g',
    categoria VARCHAR(50) DEFAULT NULL COMMENT 'Categoria alimento (es: cereali, carne, verdure)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Popolamento tabella con alimenti italiani comuni
INSERT INTO alimenti (nome, calorie, proteine, carboidrati, grassi, fibre, zuccheri, categoria) VALUES
-- Cereali e derivati
('Pane bianco', 265, 8.9, 49.0, 3.2, 3.5, 2.0, 'Cereali'),
('Pane integrale', 247, 7.5, 48.5, 2.0, 6.5, 3.0, 'Cereali'),
('Pasta di grano duro', 371, 13.0, 75.0, 1.5, 3.0, 3.0, 'Cereali'),
('Pasta integrale', 348, 13.4, 66.2, 2.5, 9.0, 2.8, 'Cereali'),
('Riso bianco', 365, 7.0, 80.0, 0.9, 1.3, 0.1, 'Cereali'),
('Riso integrale', 370, 7.9, 77.2, 2.9, 3.5, 0.9, 'Cereali'),
('Fette biscottate', 410, 11.3, 76.0, 6.0, 3.5, 4.0, 'Cereali'),
('Biscotti secchi', 416, 6.6, 84.8, 7.9, 2.0, 20.0, 'Cereali'),

-- Proteine animali - Carne
('Petto di pollo', 165, 31.0, 0, 3.6, 0, 0, 'Carne'),
('Petto di tacchino', 135, 30.0, 0.4, 1.0, 0, 0, 'Carne'),
('Manzo magro', 158, 26.0, 0, 6.0, 0, 0, 'Carne'),
('Vitello', 107, 20.0, 0, 2.7, 0, 0, 'Carne'),
('Maiale (lonza)', 143, 21.3, 0, 6.0, 0, 0, 'Carne'),

-- Proteine animali - Pesce
('Salmone', 208, 20.0, 0, 13.0, 0, 0, 'Pesce'),
('Tonno fresco', 144, 23.3, 0, 4.9, 0, 0, 'Pesce'),
('Merluzzo', 82, 17.8, 0, 0.7, 0, 0, 'Pesce'),
('Orata', 121, 20.7, 1.0, 3.8, 0, 0, 'Pesce'),
('Gamberetti', 106, 20.3, 1.5, 1.7, 0, 0, 'Pesce'),

-- Latticini
('Latte intero', 64, 3.3, 4.9, 3.6, 0, 4.9, 'Latticini'),
('Latte parzialmente scremato', 46, 3.5, 5.0, 1.5, 0, 5.0, 'Latticini'),
('Latte scremato', 36, 3.6, 5.3, 0.2, 0, 5.3, 'Latticini'),
('Yogurt greco 0%', 59, 10.3, 3.6, 0.4, 0, 3.6, 'Latticini'),
('Yogurt intero', 66, 3.5, 4.3, 3.9, 0, 4.3, 'Latticini'),
('Mozzarella', 280, 18.7, 2.2, 19.5, 0, 1.0, 'Latticini'),
('Parmigiano Reggiano', 392, 33.0, 3.7, 28.0, 0, 0.9, 'Latticini'),
('Ricotta vaccina', 146, 8.8, 3.0, 10.9, 0, 3.0, 'Latticini'),

-- Uova
('Uova di gallina', 143, 12.4, 0.7, 9.5, 0, 0.7, 'Uova'),

-- Legumi
('Ceci secchi', 364, 19.0, 61.0, 6.0, 17.4, 10.7, 'Legumi'),
('Fagioli borlotti', 335, 23.6, 47.7, 2.0, 17.3, 2.5, 'Legumi'),
('Lenticchie', 353, 25.8, 51.1, 1.0, 13.8, 2.0, 'Legumi'),
('Piselli secchi', 341, 21.7, 53.6, 2.0, 15.0, 8.0, 'Legumi'),

-- Frutta secca
('Mandorle', 579, 21.2, 21.7, 49.9, 12.5, 4.4, 'Frutta secca'),
('Noci', 654, 15.2, 13.7, 65.2, 6.7, 2.6, 'Frutta secca'),
('Nocciole', 628, 14.9, 16.7, 60.8, 9.7, 4.3, 'Frutta secca'),
('Arachidi', 567, 25.8, 16.1, 49.2, 8.5, 4.7, 'Frutta secca'),

-- Frutta fresca
('Mela', 52, 0.3, 13.8, 0.2, 2.4, 10.4, 'Frutta'),
('Banana', 89, 1.1, 22.8, 0.3, 2.6, 12.2, 'Frutta'),
('Arancia', 47, 0.9, 11.8, 0.1, 2.4, 9.4, 'Frutta'),
('Pera', 57, 0.4, 15.5, 0.1, 3.1, 9.8, 'Frutta'),
('Fragole', 32, 0.7, 7.7, 0.3, 2.0, 4.9, 'Frutta'),
('Kiwi', 61, 1.1, 14.7, 0.5, 3.0, 9.0, 'Frutta'),
('Avocado', 160, 2.0, 8.5, 14.7, 6.7, 0.7, 'Frutta'),

-- Verdure
('Pomodori', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 'Verdure'),
('Insalata (lattuga)', 15, 1.4, 2.9, 0.2, 1.3, 0.8, 'Verdure'),
('Spinaci', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 'Verdure'),
('Broccoli', 34, 2.8, 7.0, 0.4, 2.6, 1.7, 'Verdure'),
('Zucchine', 17, 1.2, 3.1, 0.3, 1.0, 2.5, 'Verdure'),
('Carote', 41, 0.9, 9.6, 0.2, 2.8, 4.7, 'Verdure'),
('Peperoni', 31, 1.0, 6.0, 0.3, 2.1, 4.2, 'Verdure'),

-- Condimenti
('Olio extravergine oliva', 884, 0, 0, 100.0, 0, 0, 'Condimenti'),
('Olio di semi', 900, 0, 0, 100.0, 0, 0, 'Condimenti');
