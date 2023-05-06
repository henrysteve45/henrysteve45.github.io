// Current route or stop ID
function updateInput(input) {
  input = input.toString().toUpperCase();
  let valid;
  if (input.length <= 3) {
    valid = isValidInput(input, inputType.ROUTE);
  } else {
    valid = isValidInput(input, inputType.STOP_ID);
  }
  if (valid) {
    localStorage.setItem(`input`, input);
    window.location.href = "/buses.html";
  } else {
    createToast(`"${input}" is not a valid input.`, toastType.ERROR);
  }
}

function findInput() {
  return localStorage.getItem('input');
}