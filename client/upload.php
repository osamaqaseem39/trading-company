<?php
// Allow CORS from your frontend domain (replace * with your domain for security)
header('Access-Control-Allow-Origin: https://admin.wingzimpex.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB

if(isset($_FILES['file'])){
    $file = $_FILES['file'];
    // Validate file type
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
        exit();
    }
    // Validate file size
    if ($file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['error' => 'File too large. Maximum allowed size is 5MB.']);
        exit();
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $uniqueName = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $upload_dir = 'uploads/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $target = $upload_dir . $uniqueName;
    if (move_uploaded_file($file['tmp_name'], $target)) {
        echo json_encode(['url' => 'https://admin.wingzimpex.com/uploads/' . $uniqueName]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload file']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
}
?>