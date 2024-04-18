const toastType = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  WARNING: "WARNING",
  INFO: "INFO",
};

// Init
let currentInput = findInput();

// Add data
if (currentInput) {
  document.getElementById(`user-input-field`).value = currentInput;
}

// Update WMATA API Key
// Sets the WMATA API key in browser local storage
function updateWmataApiKey(key) {
  if (!/^[a-zA-Z0-9]{1,64}$/.test(key)) {
    createToast(`Invalid WMATA API key. Please use a valid alphanumeric key of up to 64 characters.`, toastType.ERROR);
    return;
  }
  localStorage.setItem("wmataApiKey", key);
  createToast(`WMATA API key updated to ${key}`, toastType.SUCCESS);
}

function getWmataApiKey() {
  return localStorage.getItem("wmataApiKey");
}

// Toast
function createToast(message, type) {
  const container = document.getElementById("toast-container");

  // Create a new toast element and add it to the container
  const toast = document.createElement("div");
  toast.classList.add("toast");

  // Add the appropriate class for the toast type
  switch (type) {
    case type = toastType.SUCCESS:
      toast.classList.add("success");
      break;
    case type = toastType.ERROR:
      toast.classList.add("error");
      break;
    case type = toastType.WARNING:
      toast.classList.add("warning");
      break;
    case type = toastType.INFO:
      toast.classList.add("info");
      break;
    default:
      toast.classList.add("info");
      break;
  }
  toast.textContent = message;
  container.appendChild(toast);

  // Show the toast message for 3 seconds and then remove it
  setTimeout(() => {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 3000);
  }, 0);
}
