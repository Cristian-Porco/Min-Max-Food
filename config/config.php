<?php
/**
 * Configurazione Database
 * Modifica questi parametri secondo la tua configurazione MySQL
 */

define('DB_HOST', 'localhost:3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'piano_alimentare');

/**
 * Connessione al database
 */
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if ($conn->connect_error) {
            throw new Exception("Connessione fallita: " . $conn->connect_error);
        }

        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        die("Errore di connessione al database: " . $e->getMessage());
    }
}

/**
 * Chiudi connessione database
 */
function closeDBConnection($conn) {
    if ($conn) {
        $conn->close();
    }
}
