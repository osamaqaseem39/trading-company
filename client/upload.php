<?php
// Allow CORS from your frontend domain (replace * with your domain for security)
$allowed_origins = [
    'https://wingzimpex.osamaqaseem.online',
    'https://osamaqaseem.online',
    'https://admin.wingzimpex.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://wingzimpex.osamaqaseem.online');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug logging (remove in production)
error_log('Upload request received: ' . $_SERVER['REQUEST_METHOD'] . ' from ' . ($_SERVER['HTTP_ORIGIN'] ?? 'unknown') . ' to ' . ($_SERVER['HTTP_HOST'] ?? 'unknown'));

$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB

if(isset($_FILES['file'])){
    $file = $_FILES['file'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Upload error: ' . $file['error']]);
        exit();
    }
    
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
        // Determine the correct base URL based on the request
        $base_url = 'https://wingzimpex.osamaqaseem.online';
        if (strpos($_SERVER['HTTP_HOST'] ?? '', 'osamaqaseem.online') !== false) {
            $base_url = 'https://osamaqaseem.online';
        }
        echo json_encode(['url' => $base_url . '/uploads/' . $uniqueName]);
    } else {
        http_response_code(500);
        $error_details = [
            'error' => 'Failed to upload file. Check server permissions.',
            'target' => $target,
            'upload_dir_exists' => file_exists($upload_dir),
            'upload_dir_writable' => is_writable($upload_dir),
            'temp_file_exists' => file_exists($file['tmp_name']),
            'temp_file_readable' => is_readable($file['tmp_name'])
        ];
        echo json_encode($error_details);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
}
?>