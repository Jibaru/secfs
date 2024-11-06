function toggleEncryptionInputs() {
  const encryptionType = document.querySelector(
    'input[name="encryptionType"]:checked'
  ).value;
  const customInputs = document.getElementById("customEncryptionInputs");
  const aesInputs = document.getElementById("aesEncryptionInputs");

  if (encryptionType === "aes") {
    customInputs.style.display = "none";
    aesInputs.style.display = "block";
  } else {
    customInputs.style.display = "block";
    aesInputs.style.display = "none";
  }
}

function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    callback(event.target.result);
  };
  reader.readAsText(file);
}

function rotateChar(char, rotation) {
  return String.fromCharCode(char.charCodeAt(0) + rotation);
}

function encrypt(text, key, rotation) {
  let encryptedText = "";
  for (let i = 0; i < text.length; i++) {
    const keyChar = key[i % key.length];
    const encryptedChar = rotateChar(
      String.fromCharCode(text.charCodeAt(i) ^ keyChar.charCodeAt(0)),
      rotation
    );
    encryptedText += encryptedChar;
  }
  return encryptedText;
}

function decrypt(text, key, rotation) {
  let decryptedText = "";
  for (let i = 0; i < text.length; i++) {
    const keyChar = key[i % key.length];
    const decryptedChar = String.fromCharCode(
      rotateChar(text[i], -rotation).charCodeAt(0) ^ keyChar.charCodeAt(0)
    );
    decryptedText += decryptedChar;
  }
  return decryptedText;
}

async function encryptAES(plaintext, secretKey) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return btoa(
    String.fromCharCode(...new Uint8Array(iv), ...new Uint8Array(encrypted))
  );
}

async function decryptAES(ciphertext, secretKey) {
  const enc = new TextEncoder();
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encryptedData = data.slice(12);

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );
  return new TextDecoder().decode(decrypted);
}

function processFile() {
  const fileInput = document.getElementById("fileInput");
  const operation = document.querySelector(
    'input[name="operation"]:checked'
  ).value;
  const encryptionType = document.querySelector(
    'input[name="encryptionType"]:checked'
  ).value;
  const output = document.getElementById("output");

  if (!fileInput.files.length) {
    alert("Select a file.");
    return;
  }

  readFile(fileInput.files[0], async function (content) {
    let result = "";

    if (encryptionType === "aes") {
      const aesKey = document.getElementById("aesKey").value;
      if (aesKey === "") {
        alert("Add a secret key for AES.");
        return;
      }
      if (operation === "encrypt") {
        result = await encryptAES(content, aesKey);
      } else if (operation === "decrypt") {
        try {
          result = await decryptAES(content, aesKey);
        } catch (e) {
          alert("Decryption failed. Check the secret key.");
          return;
        }
      }
    } else {
      const key = document.getElementById("key").value;
      const rotation = parseInt(document.getElementById("rotation").value, 0);
      if (key === "") {
        alert("Add a key.");
        return;
      }
      if (operation === "encrypt") {
        result = encrypt(content, key, rotation);
      } else if (operation === "decrypt") {
        result = decrypt(content, key, rotation);
      }
    }
    output.value = result;
  });
}

function downloadFile() {
  const output = document.getElementById("output").value;
  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultado.txt";
  a.click();
  URL.revokeObjectURL(url);
}
