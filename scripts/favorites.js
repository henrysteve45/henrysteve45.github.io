const inputType = {
  ROUTE: 'ROUTE',
  STOP_ID: 'STOP_ID',
};

function isValidInput(stopId, type) {
  let regex = '';
  if (type === inputType.ROUTE) {
    regex = /^[A-Za-z0-9]{2,3}$/;
  } else if (type === inputType.STOP_ID) {
    regex = /^\d{7}$/;
  } else {
    throw new Error(`${type} is not a valid input type.`);
  }
  return regex.test(stopId);
}

function doesStopIdExist(stopId) {
  // Retrieve existing stops from localStorage
  const existingStops = JSON.parse(localStorage.getItem('favoriteStops')) || [];
  
  // Check if any of the stops have the given stopId
  const stopExists = existingStops.some(stop => stop.stopId === stopId);
  
  // Return true if the stop exists, false otherwise
  return stopExists;
}

function getNextRank() {
  existingStops = findAllStops();
  if (existingStops.length > 0) {
    let lowestRank = existingStops.reduce(function(prev, current) {
      return (prev.rank > current.rank) ? prev : current
    });
    return lowestRank.rank + 1;
  } else {
    return 0;
  }
}

function reorderStops(existingStops) {
  return existingStops.sort((a, b) => a.rank - b.rank);
}

function createStop(stopId, stopName) {
  // validate input
  if (doesStopIdExist(stopId)) {
    throw new Error(`${stopId} already exists in the localStorage.`);
  }
  if (!isValidInput(stopId, inputType.STOP_ID)) {
    throw new Error(`${stopId} is an invalid stopId. Please match the expression /^\\d{7}$/ (exactly 7 digit integer).`);
  }
  const existingStops = findAllStops();
  
  // Create a new stop object
  const newStop = {
    rank: getNextRank(),
    stopId: stopId,
    stopName: stopName
  };
  existingStops.push(newStop);
  
  // Save the updated array of stops back to localStorage
  localStorage.setItem('favoriteStops', JSON.stringify(existingStops));
  return findOneStop(stopId);
}

function findAllStops() {
  const existingStops = JSON.parse(localStorage.getItem('favoriteStops')) || [];
  return existingStops;
}

function findOneStop(stopId) {
  if (!doesStopIdExist(stopId)) {
    return null;
  }
  const existingStops = JSON.parse(localStorage.getItem('favoriteStops')) || [];
  
  // Find the stop with the given stopId
  const foundStop = existingStops.find(stop => stop.stopId === stopId);
  
  // Return the found stop, or null if not found
  return foundStop || null;
}

function updateAllStops(updatedStops) {
  // Save the updated array of stops back to localStorage
  localStorage.setItem('favoriteStops', JSON.stringify(updatedStops));
  return findAllStops();
}

function removeStop(stopId) {
  if (!doesStopIdExist(stopId)) {
    throw new Error(`${stopId} does not exist in the localStorage.`);
  }
  // Retrieve existing stops from localStorage
  const existingStops = findAllStops();
  
  // Find the stop with the given stopId
  const foundStopIndex = existingStops.findIndex(stop => stop.stopId === stopId);
  
  // If the stop is found, remove it from the array of stops
  if (foundStopIndex !== -1) {
    existingStops.splice(foundStopIndex, 1);
    
    // Save the updated array of stops back to localStorage
    localStorage.setItem('favoriteStops', JSON.stringify(existingStops));
    return true;
  }
}

function removeAllStops() {
  localStorage.removeItem('favoriteStops');
  createToast('All favorites removed.', toastType.SUCCESS);
  return true;
}

// Initialize favorites
function initFavorites() {
  // Favorites container
  const favoritesContainer = document.querySelector('.favorites-container');
  let favoriteStops = findAllStops();
  let favoriteObjectsInOrder = favoriteStops.map((stop, index) => ({ rank: index, stopId: stop.stopId, stopName: stop.stopName }));
  
  // Drag and drop list items
  dragula(
    [favoritesContainer], {
      // Grip
      moves: function (el, container, handle) {
        return handle.classList.contains('grip');
      },
    }).on('drag', function() {
      // Set pointer-events to none on all list items to prevent clicks
      favoriteObjectsInOrder.forEach(stop => {
        document.getElementById(stop.stopId).style.pointerEvents = 'none';
      });
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';

    }).on('dragend', function() {
      // Update favorites list structure after a drop
      favoriteObjectsInOrder = Array.from(favoritesContainer.querySelectorAll('.favorite-list-item'))
      .map((item, index) => ({
        rank: index,
        stopId: parseInt(item.id),
        stopName: item.querySelector('.stop-name').textContent
      }));
      updateAllStops(favoriteObjectsInOrder);
      // Set pointer-events to auto on all list items
      favoriteObjectsInOrder.forEach(stop => {
        document.getElementById(stop.stopId).style.pointerEvents = 'auto';
      });
      // Enable scrolling on body
      document.body.style.overflow = 'auto';
    });
    
  // Add favorites list to HTML
  if (favoriteStops.length > 0) {
    favoriteStops.forEach(stop => {
      const favoriteHTML = generateFavoriteHTML(stop);
      favoritesContainer.insertAdjacentHTML('beforeend', favoriteHTML);
    });
  } else {
    favoritesContainer.insertAdjacentHTML('beforeend', `
    <span id="title-subtext">No favorite bus stops.</span>
    `);
  }
}
  
// Favorite list item HTML
function generateFavoriteHTML(stop) {
  return `
  <div class="favorite-list-item" id="${stop.stopId}">
  <div class="grip"></div>
  <a class="stop-info" onclick="updateInput(${stop.stopId});">
  <div class="stop-name">${stop.stopName}</div>
  <div class="stop-id"><small>${stop.stopId}</small></div>
  </a>
  <div class="remove-button" onclick="removeStop(${stop.stopId}); location.reload();"><i class="fa-solid fa-trash"></i></div>
  </div>
  `;
}