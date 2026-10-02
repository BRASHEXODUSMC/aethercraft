<?php
// Generic/Tebex-compatible starter receiver. Configure a strong secret in the URL.
header('Content-Type: application/json; charset=utf-8');
$expected = getenv('AETHERCRAFT_WEBHOOK_SECRET') ?: 'CHANGE_THIS_SECRET';
$provided = $_GET['secret'] ?? ($_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '');
if (!$expected || $expected === 'CHANGE_THIS_SECRET' || !hash_equals($expected, $provided)) {
  http_response_code(401); echo json_encode(['ok'=>false,'error'=>'Invalid webhook secret']); exit;
}
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Invalid JSON']); exit; }
// Common fields from Tebex and other stores. Adjust mapping for your provider's payload.
$subject = $payload['subject'] ?? $payload['event'] ?? '';
$data = $payload['data'] ?? $payload;
$player = $data['customer']['username'] ?? $data['username'] ?? $data['player'] ?? $data['ign'] ?? 'A player';
$product = $data['package']['name'] ?? $data['product']['name'] ?? $data['product'] ?? $data['item'] ?? 'a store item';
$total = $data['price'] ?? $data['amount'] ?? $data['total'] ?? 0;
$id = $data['transaction_id'] ?? $data['id'] ?? $payload['id'] ?? uniqid('store_', true);
$event = ['id'=>(string)$id,'player'=>(string)$player,'product'=>(string)$product,'total'=>(float)$total,'currency'=>(string)($data['currency'] ?? 'USD'),'createdAt'=>gmdate('c'),'source'=>(string)$subject];
$file = __DIR__ . '/../data/store-events.json';
$events = is_file($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($events)) $events=[];
$events[]=$event; $events=array_slice($events,-50);
if (file_put_contents($file,json_encode($events,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES),LOCK_EX)===false){http_response_code(500);echo json_encode(['ok'=>false,'error'=>'Make data/store-events.json writable']);exit;}
echo json_encode(['ok'=>true,'event'=>$event]);
