<?php
/**
 * API per aggiungere un nuovo alimento al database
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';

// Verifica che la richiesta sia POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Metodo non consentito'
    ]);
    exit;
}

// Recupera i dati JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validazione dati
if (empty($data['nome']) || empty($data['categoria'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Nome e categoria sono obbligatori'
    ]);
    exit;
}

// Validazione valori nutrizionali
$calorie = floatval($data['calorie'] ?? 0);
$proteine = floatval($data['proteine'] ?? 0);
$carboidrati = floatval($data['carboidrati'] ?? 0);
$grassi = floatval($data['grassi'] ?? 0);
$fibre = floatval($data['fibre'] ?? 0);
$zuccheri = floatval($data['zuccheri'] ?? 0);

if ($calorie < 0 || $proteine < 0 || $carboidrati < 0 || $grassi < 0 || $fibre < 0 || $zuccheri < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'I valori nutrizionali devono essere positivi'
    ]);
    exit;
}

$conn = getDBConnection();

// Prepara la query con prepared statement per prevenire SQL injection
$stmt = $conn->prepare("INSERT INTO alimenti (nome, calorie, proteine, carboidrati, grassi, fibre, zuccheri, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

$nome = trim($data['nome']);
$categoria = trim($data['categoria']);

$stmt->bind_param("sdddddds", $nome, $calorie, $proteine, $carboidrati, $grassi, $fibre, $zuccheri, $categoria);

if ($stmt->execute()) {
    $newId = $conn->insert_id;

    echo json_encode([
        'success' => true,
        'message' => 'Alimento aggiunto con successo',
        'data' => [
            'id' => $newId,
            'nome' => $nome,
            'calorie' => $calorie,
            'proteine' => $proteine,
            'carboidrati' => $carboidrati,
            'grassi' => $grassi,
            'fibre' => $fibre,
            'zuccheri' => $zuccheri,
            'categoria' => $categoria
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Errore durante il salvataggio: ' . $stmt->error
    ]);
}

$stmt->close();
closeDBConnection($conn);
