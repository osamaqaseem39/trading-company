<?php
// Simple test endpoint to verify server is working
header('Access-Control-Allow-Origin: https://wingzimpex.osamaqaseem.online');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Return server info
echo json_encode([
    'status' => 'success',
    'message' => 'Server is working',
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'file_uploads' => ini_get('file_uploads') ? 'enabled' : 'disabled'
]);
?>
