<?php
// PHP Mailer Script for cPanel Hosting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['message'])) {
    http_response_code(400);
    echo json_encode(["sent" => false, "message" => "Name, Email, and Message are required."]);
    exit;
}

if ($_POST)
{
    $name = strip_tags(trim($_POST['name']));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $service = isset($_POST['service']) ? strip_tags(trim($_POST['service'])) : 'N/A';
    $message = strip_tags(trim($_POST['message']));
    $type = isset($_POST['type']) ? $_POST['type'] : 'contact';
    
    $subject = ($type === 'proposal') ? "New Proposal: $name" : "New Contact: $name";
    $to = "prince@mutanttechnologies.com";

    // Message Composition
    $msg = "Name: $name\n";
    $msg .= "Email: $email\n";
    $msg .= "Service: $service\n";
    $msg .= "Type: $type\n";
    $msg .= "Message: \n$message";

    // Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=utf-8\r\n";
    $headers .= "From: Mutant Website <noreply@mutanttechnologies.com>\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Send
    $mailSent = mail($to, $subject, $msg, $headers);

    if ($mailSent) {
        http_response_code(200);
        echo json_encode(array("sent" => true));
    } else {
        http_response_code(500);
        echo json_encode(array("sent" => false, "message" => "PHP mail() function failed to send."));
    }
} else {
    http_response_code(400);
    echo json_encode(["sent" => false, "message" => "Invalid request."]);
}
?>
