<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
$name = preg_replace('/[^A-Za-z0-9_]/', '', $_GET['name'] ?? '');
if (!$name || strlen($name) > 16) { http_response_code(400); echo json_encode(['error'=>'Invalid or missing Java username']); exit; }
$url = 'https://api.minecraftservices.com/minecraft/profile/lookup/name/' . rawurlencode($name);
$data = false; $status = 502;
if (function_exists('curl_init')) {
  $ch = curl_init($url);
  curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_HTTPHEADER=>['Accept: application/json','User-Agent: AetherCraft-Template/1.1']]);
  $data = curl_exec($ch); $status = curl_getinfo($ch,CURLINFO_HTTP_CODE) ?: 502; curl_close($ch);
} else {
  $ctx=stream_context_create(['http'=>['timeout'=>10,'ignore_errors'=>true,'header'=>"Accept: application/json
User-Agent: AetherCraft-Template/1.1
"]]);
  $data=@file_get_contents($url,false,$ctx);
  if(isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/',$http_response_header[0],$m))$status=(int)$m[1];
}
if($data===false){http_response_code(502);echo json_encode(['error'=>'The hosting server could not contact Minecraft profile services']);exit;}
http_response_code($status);echo $data;
