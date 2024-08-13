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

function processFile() {
  const fileInput = document.getElementById("fileInput");
  const operation = document.querySelector(
    'input[name="operation"]:checked'
  ).value;
  const key = document.getElementById("key").value;
  const rotation = parseInt(document.getElementById("rotation").value, 0);
  const output = document.getElementById("output");

  if (!fileInput.files.length) {
    alert("Select a file.");
    return;
  }

  if (key === "") {
    alert("Add a key.");
    return;
  }

  readFile(fileInput.files[0], function (content) {
    let result = "";
    if (operation === "encrypt") {
      result = encrypt(content, key, rotation);
    } else if (operation === "decrypt") {
      result = decrypt(content, key, rotation);
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
