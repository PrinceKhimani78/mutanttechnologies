<?php
/**
 * GitHub Actions Webhook Trigger
 * 
 * This webhook triggers a GitHub Actions workflow to rebuild and deploy the site.
 * Place this file on your cPanel server (e.g., /public_html/api/deploy-webhook.php)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Security: Check secret token
$secret = 'mutant-deploy-secret-2024'; // Change this to a secure random string
$headers = getallheaders();
$providedSecret = isset($headers['X-Deploy-Secret']) ? $headers['X-Deploy-Secret'] : '';

if ($providedSecret !== $secret) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// GitHub repository details
$owner = 'PrinceKhimani78';
$repo = 'mutanttechnologies';
$workflow_id = 'deploy.yml'; // Your workflow file name
$ref = 'main'; // Branch to deploy

// GitHub Personal Access Token (you'll need to create this)
$github_token = 'YOUR_GITHUB_TOKEN_HERE'; // Replace with actual token

// Trigger GitHub Actions workflow
$url = "https://api.github.com/repos/{$owner}/{$repo}/actions/workflows/{$workflow_id}/dispatches";

$data = json_encode([
    'ref' => $ref
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.github+json',
    'Authorization: Bearer ' . $github_token,
    'X-GitHub-Api-Version: 2022-11-28',
    'User-Agent: Mutant-Deploy-Webhook',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 204) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Deployment triggered successfully',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to trigger deployment',
        'github_response' => $response,
        'http_code' => $httpCode
    ]);
}
?>
