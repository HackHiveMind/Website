<?php
$host = 'localhost';
$username = 'root';  // default MySQL username
$password = '';      // default MySQL password
$database = 'epic_gadget_store';

try {
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully to MySQL server\n";
    
    // Try to create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS $database";
    $conn->exec($sql);
    echo "Database created successfully or already exists\n";
    
    // Select the database
    $conn->exec("USE $database");
    echo "Database selected successfully\n";
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
}
?> 