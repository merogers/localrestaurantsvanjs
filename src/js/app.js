// Import CSS

import '../scss/styles.scss';

// Primary configuration for Google Maps API and current location storage

const config = {
  apiKey: 'AIzaSyDQikLBYGnnSeoRauJQDQDPme9r_1DunbM',
  loaderVersion: 'weekly',
  location: {
    latitude: null,
    longitude: null,
  },
};

// Loads Google Map with initial location and optional parameter for additional place markers

const loadMap = (placeMarkers) => {
  const googleMap = document.getElementById('map');
  googleMap.innerHTML = '';
  if (config.location.latitude && config.location.longitude != null) {
    const map = new google.maps.Map(googleMap, {
      center: {
        lat: config.location.latitude,
        lng: config.location.longitude,
      },
      zoom: 10,
    });
    const initialMarker = new google.maps.Marker({
      position: {
        lat: config.location.latitude,
        lng: config.location.longitude,
      },
      map,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: '<div>Your Current Location</div>',
    });
    initialMarker.addListener('click', () => {
      infoWindow.open(map, initialMarker);
    });
    if (placeMarkers) {
      placeMarkers.forEach((item) => {
        const placeMarker = new google.maps.Marker({
          position: {
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
          },
          map,
          title: item.name,
        });
        placeMarker.setMap(map);
        const placeInfoWindow = new google.maps.InfoWindow({
          content: `<div><em>${item.name}</em><br>${item.formatted_address}</div>`,
        });
        placeMarker.addListener('click', () => {
          placeInfoWindow.open(map, placeMarker);
        });
      });
    }
  } else {
    googleMap.innerHTML = '<div class="error">Unable to load map. Please enable location services in your browser.</div>';
  }
};

// Fetch current location and load into Google Map;

const initializeMap = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      config.location.longitude = position.coords.longitude;
      config.location.latitude = position.coords.latitude;
    });
    loadMap();
  }
};

// Add initializeMap to global scope

window.initializeMap = initializeMap;

// Get places based on search query, display on screen and load into Google Map

const getPlaces = (e) => {
  const query = document.getElementById('query');
  const places = document.getElementById('places');
  const placesUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query.value}&inputtype=textquery&fields=geometry,formatted_address,name,opening_hours&locationbias=circle:1000@${config.location.latitude},${config.location.longitude}&key=${config.apiKey}`;

  e.preventDefault();

  fetch(placesUrl)
    .then((res) => res.json())
    .then((data) => {
      loadMap(data.candidates);

      data.candidates.forEach((item) => {
        const {
          name,
          formatted_address,
          opening_hours,
        } = item;
        let openNow;
        if (opening_hours.open_now && opening_hours.open_now != null) {
          openNow = 'Yes';
        } else {
          openNow = 'No';
        }
        const place = document.createElement('li');
        place.innerHTML = `
          <div>${name}</div>
          <div>${formatted_address}</div>
          <div>Open Now: ${openNow}</div>
        `;
        places.appendChild(place);
      });
    });
};

const submitBtn = document.getElementById('submit');

// Returns restaurants based on query

submitBtn.addEventListener('click', getPlaces);

// Loads Initial Map on page load

window.addEventListener('load', initializeMap);
