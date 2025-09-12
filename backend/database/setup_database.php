<?php
$host = 'localhost';
$username = 'root';  // default MySQL username
$password = '';      // default MySQL password
$database = 'epic_gadget_store';

try {
    // Connect to MySQL
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS $database";
    $conn->exec($sql);
    echo "Database created successfully or already exists\n";
    
    // Select the database
    $conn->exec("USE $database");
    
    // Read and execute the schema.sql file
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    
    // Split the SQL file into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    // Execute each statement
    foreach($statements as $statement) {
        if (!empty($statement)) {
            $conn->exec($statement);
            echo "Executed: " . substr($statement, 0, 50) . "...\n";
        }
    }
    
    echo "Database schema created successfully\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
}
?> 