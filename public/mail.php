<?php
// PHP Mailer Script for cPanel Hosting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

if (empty($_POST['name']) && empty($_POST['email'])) die();

if ($_POST)
{
    // Set response code - 200 OK
    http_response_code(200);
    
    $subject = $_POST['type'] === 'proposal' ? "New Proposal: " . $_POST['name'] : "New Contact: " . $_POST['name'];
    $to = "prince@mutanttechnologies.com";
    $from = $_POST['email'];

    // Message Composition
    $msg = "Name: " . $_POST['name'] . "\n";
    $msg .= "Email: " . $_POST['email'] . "\n";
    if (isset($_POST['service'])) $msg .= "Service: " . $_POST['service'] . "\n";
    $msg .= "Message: \n" . $_POST['message'];

    // Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=iso-8859-1\r\n";
    $headers .= "From: Mutant Website <noreply@mutanttechnologies.com>\r\n";
    $headers .= "Reply-To: " . $from . "\r\n";

    // Send
    mail($to, $subject, $msg, $headers);

    echo json_encode(array(
        "sent" => true
    ));
} else {
    // Tell user about error
    echo json_encode(["sent" => false, "message" => "Something went wrong"]);
}
?>
