<?php
/**
 * API per recuperare gli alimenti dal database
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';

$conn = getDBConnection();

// Recupera tutti gli alimenti ordinati per categoria e nome
$sql = "SELECT id, nome, calorie, proteine, carboidrati, grassi, fibre, zuccheri, categoria
        FROM alimenti
        ORDER BY categoria, nome";

$result = $conn->query($sql);

$alimenti = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $alimenti[] = [
            'id' => (int)$row['id'],
            'nome' => $row['nome'],
            'calorie' => (float)$row['calorie'],
            'proteine' => (float)$row['proteine'],
            'carboidrati' => (float)$row['carboidrati'],
            'grassi' => (float)$row['grassi'],
            'fibre' => (float)$row['fibre'],
            'zuccheri' => (float)$row['zuccheri'],
            'categoria' => $row['categoria']
        ];
    }
}

closeDBConnection($conn);

echo json_encode([
    'success' => true,
    'data' => $alimenti
]);
