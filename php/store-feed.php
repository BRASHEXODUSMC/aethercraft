<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/../data/store-events.json';
if (!is_file($file)) { echo '[]'; exit; }
readfile($file);
