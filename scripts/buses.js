let loading = false;
let thisInput = '';

// If ID present in URL after page load, show info. Else, load default into + favorites list
currentInput = findInput();
if (currentInput) {
  document.getElementById('user-input-field').value = currentInput;
  if (validateInput(currentInput)) {
    lookupInput(currentInput);
  } else {
    // TODO: Replace this alert with cool animation
    alert('Invalid input in URL. Please enter a stop ID or bus route.');
    window.location.href = `/buses.html`;
  }
} else {
  document.getElementById('title-text').innerHTML = 'Please enter a bus route or stop ID.';
  document.getElementById('title-subtext').innerHTML = 'e.g., 32, X9, or 1000425';
}

function getTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;
  let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
  return strTime;
}

// Add favorite
function add_remove_favorite(id, name) {
  let stopInfo;
  // Check if id is already a favorite
  try {
    stopInfo = findOneStop(id);
    // remove from favorites
    removeStop(id);
    window.location.reload();
  } catch (error) {
    // add to favorites
    createStop(id, name);
    window.location.reload();
  }
}

// Validate search bar input on submit
// function validateSearch() {
// 	let rawInput = document.getElementById('user-input-field').value;
// 	if (validateInput(rawInput)) {
// 		if (location.pathname === '/buses.html') {
// 			window.location.hash = rawInput;
// 			window.location.reload();
// 		} else {
// 			window.location.href = `buses.html#${rawInput}`;
// 		}
// 	} else {
// 		alert('Invalid input. Please enter a stop ID or bus route.');
// 	}
// }

// Validate user input
function validateInput(rawInput) {
  let input = rawInput.toUpperCase();
  const regex = new RegExp('^(\\d{7}|[A-Z0-9]{2,3})$');
  
  return regex.test(input);
}

// API call to get and apply WMATA data
async function lookupInput(input) {
  if (loading) {
    return false;
  }
  // Before
  loading = true;
  document.getElementById('time-table-body').innerHTML += '<div id="load-overlay"><div id="load-track"><div id="load-bar"></div></div></div>';
  
  // document.getElementById('user-input-field').disabled = true;
  // document.getElementById('searchbar-button').disabled = true;
  let response;
  try {
    response = await fetch('https://t4i9xvc6y9.execute-api.us-east-1.amazonaws.com/default/wmata', {
      method: 'POST',
      body: JSON.stringify({ "input": input })
    });
  } catch (error) {
    console.log(error);
    createToast(`Request failed. ${error}`, toastType.ERROR);
    loading = false;
    document.getElementById('load-overlay').remove();
    return false;
  }
  const response_json = await response.json();

// After
thisInput = input;
loading = false;
window.scrollTo(0, 0);
document.getElementById('load-overlay').remove();
document.getElementById('top-area-buttons-container').innerHTML = '';
document.getElementById('time-table-body').innerHTML = '';
document.getElementById('title-subtext').innerHTML = '';
document.getElementById('user-input-field').disabled = false;
// document.getElementById('searchbar-button').disabled = false;
// location.href = '#' + input;
document.getElementById('user-input-field').value = input;

// Stop ID handling
if (response_json.Type === 'Predictions') {
  // top-area contents
  document.getElementById('title-text').innerHTML = response_json.StopName
  document.getElementById('title-subtext').innerHTML = 'Last Updated: ' + getTime();
  if (!findOneStop(parseInt(thisInput))) {
    document.getElementById('top-area-buttons-container').innerHTML = '<button id="favorite-button" type="button" onclick="add_remove_favorite(' + thisInput + ', `' + response_json.StopName + '`);"><i class="fa fa-heart-o" aria-hidden="true"></i></button>';
  } else {
    document.getElementById('top-area-buttons-container').innerHTML = '<button id="remove-favorite-button" type="button" onclick="add_remove_favorite(' + thisInput + ');"><i class="fa fa-heart" aria-hidden="true"></i></button>';
  }
  document.getElementById('top-area-buttons-container').innerHTML += '<button id="refresh-button" type="button" onclick="lookupInput(thisInput);"><i class="fa fa-refresh" aria-hidden="true"></i></button>';
  if (response_json.Predictions.length > 0) {
    for (i = 0; i < response_json.Predictions.length; i++) {
      if (response_json.Predictions[i].Minutes == 0) {
        document.getElementById('time-table-body').innerHTML += '<div class="time-table-row"><div class="time-table-data-name"><a class="arrow" onclick="updateInput(\'' + response_json.Predictions[i].RouteID + '\')">' + response_json.Predictions[i].RouteID + '</a><small>' + response_json.Predictions[i].DirectionText + '</small></div><div class="time-table-data-bustime"><p>ARR<p></td></div>';
      } else {
        document.getElementById('time-table-body').innerHTML += '<div class="time-table-row"><div class="time-table-data-name"><a class="arrow" onclick="updateInput(\'' + response_json.Predictions[i].RouteID + '\')">' + response_json.Predictions[i].RouteID + '</a><small>' + response_json.Predictions[i].DirectionText + '</small></div><div class="time-table-data-bustime"><p>' + response_json.Predictions[i].Minutes + '</p><small>min</small></td></div>';
      }
    }
  } else {
    document.getElementById('time-table-body').innerHTML+='<div class="time-table-row"><p class="error-msg">No data available. Please check back later.</p></div>';
  }
  // Route ID handling
} else if (response_json.Type === 'RouteDetails') {
  document.getElementById('title-text').innerHTML = response_json.Name;
  document.getElementById('title-subtext').innerHTML = 'Scroll down and select a stop.'
  // Direction 0
  if (response_json.Direction0 !== null) {
    document.getElementById('time-table-body').innerHTML += '<ul id="stop-list"></ul>'
    document.getElementById('stop-list').innerHTML += '<li id="dir0-list"><span class="caret">&nbsp;' + response_json.Direction0.TripHeadsign + '</span></li>';
    document.getElementById('dir0-list').innerHTML += '<ul class="nested" id="dir0-stops"></ul>';
    if (response_json.Direction0.Stops.length != 0) {
      for (i = 0; i < response_json.Direction0.Stops.length; i++) {
        document.getElementById('dir0-stops').innerHTML += '<li onclick="updateInput(\'' + response_json.Direction0.Stops[i].StopID + '\');" class="stop-listing">' + response_json.Direction0.Stops[i].Name + '</li>';
      }
    } else {
      document.getElementById('time-table-body').innerHTML+='<p class="error-msg">No stop information available. Please try again later.</p>';
    }
  } else {
    document.getElementById('time-table-body').innerHTML+='<p class="error-msg">No stop information for first direction.</p>';
  }
  // Direction 1
  if (response_json.Direction1 !== null) {
    document.getElementById('stop-list').innerHTML += '<li id="dir1-list"><span class="caret">&nbsp;' + response_json.Direction1.TripHeadsign + '</span></li>';
    document.getElementById('dir1-list').innerHTML += '<ul class="nested" id="dir1-stops"></ul>';
    if (response_json.Direction1.Stops.length != 0) {
      for (i = 0; i < response_json.Direction1.Stops.length; i++) {
        document.getElementById('dir1-stops').innerHTML += '<li onclick="updateInput(\'' + response_json.Direction1.Stops[i].StopID + '\');" class="stop-listing">' + response_json.Direction1.Stops[i].Name + '</li>';
      }
    } else {
      document.getElementById('time-table-body').innerHTML+='<p class="error-msg">No stop information available. Please try again later.</p>';
    }
  } else {
    document.getElementById('time-table-body').innerHTML+='<p class="error-msg">No stop information for second direction.</p>';
  }
  // Stop list toggler
  var toggler = document.getElementsByClassName("caret");
  var i;
  
  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
} else {
  document.getElementById('title-text').innerHTML = response_json.Message;
}
}
