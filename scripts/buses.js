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

// wmata
async function getWmataData(input) {
  // Get WMATA secret value
  const wmataSecret = getWmataApiKey();
  console.log(wmataSecret);

  // Input validation
  const inputValid = input.match(/^(\d{7}|[A-Z0-9]{2,3})$/i)
  if (!inputValid) {
      const msg = JSON.stringify({Message: 'Failed input validation', Type: 'Error'});
      return JSON.parse(msg), '400';
  }

  let requestType;
  if (input.length <= 3) {
      // Requesting list of stops for given route
      requestType = 'RouteDetails';
  } else if (input.length == 7) {
      // Requesting bus predictions for given stop id
      requestType = 'Predictions';
  }
  console.log(`Request type: ${requestType}`);
  // Requesting predictions or route details?
  let params;
  let service = 'NextBusService';
  if (requestType == 'Predictions') {
      params = new URLSearchParams({
          'StopID': input,
      });
  } else {
      service = 'Bus'
      params = new URLSearchParams({
          'RouteId': input,
      });
  }

  // Get data from WMATA
  const headers = new Headers();
  headers.set('api_key', wmataSecret);
  headers.set('Host', 'api.wmata.com');
  const response = await fetch(`https://api.wmata.com/${service}.svc/json/j${requestType}?${params.toString()}`, {
    method: 'GET',
    headers: headers,
  })
  .then(res => {
    return res.json();
  })
  .then(data => data)
  .catch(err => {
    console.log(err);
  });
  console.log('Wmata response: ', response);
  if (response['statusCode'] != 200) {
      const msg = JSON.stringify({Message: response['message'], Type: 'Error'});
      createToast(response['message'], toastType.ERROR);
      return JSON.parse(msg), '400';
  }
  response['Type'] = requestType;
  return response;
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
    response = await getWmataData(input);
    console.log('response: ', response);
  } catch (error) {
    console.log(error);
    createToast(`Request failed. ${error}`, toastType.ERROR);
    loading = false;
    document.getElementById('load-overlay').remove();
    return false;
  }
const response_json = await getWmataData(input);
console.log('response_json: ', response_json);

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
  console.log(response_json);
  // Direction 0
  if (response_json.Direction0 !== null) {
    var routeStopList = document.createElement('ul');
    routeStopList.classList.add('route-stop-list');
    document.getElementById('time-table-body').appendChild(routeStopList);
    
    var dir0 = document.createElement('li');
    dir0.classList.add('direction');
    routeStopList.appendChild(dir0);
    
    var dir0Chevron = document.createElement('i');
    dir0Chevron.classList.add('fas', 'fa-chevron-right');
    dir0Chevron.setAttribute('aria-hidden', 'true');
    dir0.appendChild(dir0Chevron);
    
    var dir0Text = document.createTextNode(response_json.Direction0.TripHeadsign);
    dir0.appendChild(dir0Text);
    
    var dir0Stops = document.createElement('ul');
    dir0Stops.classList.add('stop-list', 'nested');
    dir0Stops.setAttribute('id', 'dir0-stops');
    routeStopList.appendChild(dir0Stops);
    
    if (response_json.Direction0.Stops.length !== 0) {
      for (var i = 0; i < response_json.Direction0.Stops.length; i++) {
        var stop = document.createElement('li');
        stop.classList.add('stop-list-item');
        let stopId = response_json.Direction0.Stops[i].StopID;
        stop.addEventListener('click', function() {
          updateInput(stopId);
        });
        dir0Stops.appendChild(stop);
        
        var routeLine = document.createElement('div');
        routeLine.classList.add('route-line');
        stop.appendChild(routeLine);
        
        var line = document.createElement('div');
        line.classList.add('line');
        routeLine.appendChild(line);
        
        var circle = document.createElement('div');
        circle.classList.add('circle');
        routeLine.appendChild(circle);
        
        var stopText = document.createElement('div');
        stopText.classList.add('stop-name');
        stopText.textContent = response_json.Direction0.Stops[i].Name; // Use .Name to get the stop name
        stop.appendChild(stopText); // append stopText instead of dir1Text
      }
    } else {
      var errorMsg = document.createElement('p');
      errorMsg.classList.add('error-msg');
      var errorMsgText = document.createTextNode('No stop information available. Please try again later.');
      errorMsg.appendChild(errorMsgText);
      dir0Stops.appendChild(errorMsg);
    }
  } else {
    var errorMsg = document.createElement('p');
    errorMsg.classList.add('error-msg');
    var errorMsgText = document.createTextNode('No stop information for first direction.');
    errorMsg.appendChild(errorMsgText);
    document.getElementById('time-table-body').appendChild(errorMsg);
  }
  // Direction 1
  if (response_json.Direction1 !== null) {
    var routeStopList = document.createElement('ul');
    routeStopList.classList.add('route-stop-list');
    document.getElementById('time-table-body').appendChild(routeStopList);
    
    var dir1 = document.createElement('li');
    dir1.classList.add('direction');
    routeStopList.appendChild(dir1);
    
    var dir1Chevron = document.createElement('i');
    dir1Chevron.classList.add('fas', 'fa-chevron-right');
    dir1Chevron.setAttribute('aria-hidden', 'true');
    dir1.appendChild(dir1Chevron);
    
    var dir1Text = document.createTextNode(response_json.Direction1.TripHeadsign);
    dir1.appendChild(dir1Text);
    
    var dir1Stops = document.createElement('ul');
    dir1Stops.classList.add('stop-list', 'nested');
    dir1Stops.setAttribute('id', 'dir1-stops');
    routeStopList.appendChild(dir1Stops);
    
    if (response_json.Direction1.Stops.length !== 0) {
      for (var i = 0; i < response_json.Direction1.Stops.length; i++) {
        var stop = document.createElement('li');
        stop.classList.add('stop-list-item');
        let stopId = response_json.Direction1.Stops[i].StopID;
        stop.addEventListener('click', function() {
          updateInput(stopId);
        });
        dir1Stops.appendChild(stop);        
        
        var routeLine = document.createElement('div');
        routeLine.classList.add('route-line');
        stop.appendChild(routeLine);
        
        var line = document.createElement('div');
        line.classList.add('line');
        routeLine.appendChild(line);
        
        var circle = document.createElement('div');
        circle.classList.add('circle');
        routeLine.appendChild(circle);

        var stopText = document.createElement('div');
        stopText.classList.add('stop-name');
        stopText.textContent = response_json.Direction1.Stops[i].Name; // Use .Name to get the stop name
        stop.appendChild(stopText); // append stopText instead of dir1Text
      }
    } else {
      var errorMsg = document.createElement('p');
      errorMsg.classList.add('error-msg');
      var errorMsgText = document.createTextNode('No stop information available. Please try again later.');
      errorMsg.appendChild(errorMsgText);
      dir1Stops.appendChild(errorMsg);
    }
  } else {
    var errorMsg = document.createElement('p');
    errorMsg.classList.add('error-msg');
    var errorMsgText = document.createTextNode('No stop information for second direction.');
    errorMsg.appendChild(errorMsgText);
    document.getElementById('time-table-body').appendChild(errorMsg);
  }

  // Stop list toggle functionality
  // Get all direction elements
  const directions = document.querySelectorAll('.direction');
  
  // Add click event listener to each direction element
  directions.forEach(direction => {
    direction.addEventListener('click', () => {
      // Get the nested stop list element for this direction
      const stopList = direction.nextElementSibling;
      
      // Toggle the 'open' class on the nested stop list element
      stopList.classList.toggle('open');
      
      // Toggle the chevron icon to indicate open/close state
      const chevron = direction.querySelector('i');
      chevron.classList.toggle('fa-chevron-right');
      chevron.classList.toggle('fa-chevron-down');
    });
  });
} else {
  document.getElementById('title-text').innerHTML = response_json.Message;
}
}
