package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// rotateChar rotates a character by a given number of positions
func rotateChar(r rune, rotation int) rune {
	return r + rune(rotation)
}

// encrypt encrypts the input text using the given key and rotation
func encrypt(text, key string, rotation int) string {
	encryptedText := []rune{}
	keyRunes := []rune(key)
	for i, r := range text {
		keyChar := keyRunes[i%len(keyRunes)]
		encryptedChar := rotateChar(r^keyChar, rotation)
		encryptedText = append(encryptedText, encryptedChar)
	}
	return string(encryptedText)
}

// decrypt decrypts the input text using the given key and rotation
func decrypt(text, key string, rotation int) string {
	decryptedText := []rune{}
	keyRunes := []rune(key)
	for i, r := range text {
		keyChar := keyRunes[i%len(keyRunes)]
		decryptedChar := rotateChar(r, -rotation) ^ keyChar
		decryptedText = append(decryptedText, decryptedChar)
	}
	return string(decryptedText)
}

// processFile reads, processes, and writes the output file
func processFile(operation, inputFilePath, outputFilePath, key string, rotation int) error {
	content, err := os.ReadFile(inputFilePath)
	if err != nil {
		return err
	}

	var result string
	if operation == "encrypt" {
		result = encrypt(string(content), key, rotation)
	} else if operation == "decrypt" {
		result = decrypt(string(content), key, rotation)
	} else {
		return fmt.Errorf("invalid operation: %s", operation)
	}

	err = os.WriteFile(outputFilePath, []byte(result), 0644)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	operation := flag.String("operation", "", "Operation to perform: encrypt or decrypt")
	inputFilePath := flag.String("s", "", "Path to the input file")
	outputFilePath := flag.String("o", "", "Path to the output file")
	keyWithRotation := flag.String("k", "", "Encryption key and rotation (e.g., key_5)")

	flag.Parse()

	if *operation == "" || *inputFilePath == "" || *outputFilePath == "" || *keyWithRotation == "" {
		fmt.Println("All flags -operation, -s, -o, and -k are required.")
		flag.Usage()
		os.Exit(1)
	}

	parts := strings.SplitN(*keyWithRotation, "_", 2)
	if len(parts) != 2 {
		fmt.Println("Key and rotation should be in the format key_rotation (e.g., key_5).")
		os.Exit(1)
	}

	key := parts[0]
	rotation, err := strconv.Atoi(parts[1])
	if err != nil {
		fmt.Println("Invalid rotation value.")
		os.Exit(1)
	}

	err = processFile(*operation, *inputFilePath, *outputFilePath, key, rotation)
	if err != nil {
		fmt.Printf("Error processing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Operation completed successfully.")
}
