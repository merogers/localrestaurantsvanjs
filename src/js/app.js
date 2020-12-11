// Import CSS

import '../scss/styles.scss';

// Import Google Maps JavaScript API

import { Loader } from '@googlemaps/js-api-loader';

// Current location storage

const location = {
  latitude: 0,
  longitude: 0,
};

// Loads Google Map with initial location and optional parameter for additional place markers

const loadMap = (placeMarkers) => {
  const googleMap = document.getElementById('map');
  googleMap.innerHTML = '';
  if (navigator.geolocation) {
    const loader = new Loader({
      apiKey: process.env.API_KEY,
      version: 'weekly',
    });
    loader.load()
      .then(() => {
        const map = new google.maps.Map(googleMap, {
          center: {
            lat: location.latitude,
            lng: location.longitude,
          },
          zoom: 10,
        });
        const initialMarker = new google.maps.Marker({
          position: {
            lat: location.latitude,
            lng: location.longitude,
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
      });
  } else {
    googleMap.innerHTML = '<div class="message error">Unable to load map. Please enable location services in your browser.</div>';
  }
};

// Fetch current location and load into Google Map;

const initializeMap = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      location.longitude = position.coords.longitude;
      location.latitude = position.coords.latitude;
    });
    loadMap();
  }
};

// Get places based on search query, display on screen and load into Google Map

const getPlaces = (e) => {
  const query = document.getElementById('query');
  const places = document.getElementById('places');

  const place = document.createElement('li');

  const messages = document.getElementById('messages');

  const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query.value}&inputtype=textquery&fields=geometry,formatted_address,name,opening_hours&locationbias=circle:1000@${location.latitude},${location.longitude}&key=${process.env.API_KEY}`;

  e.preventDefault();

  // Clear query, places and any messages before generating new places

  messages.innerHTML = '';
  places.innerHTML = '';

  // Check if user typed anything in

  if (query.value.length < 1) {
    messages.innerHTML = '<div class="message error">No place specified. Please type in a place to search</div>';
    return;
  }

  // Clear query value

  query.value = '';

  // Generates loading message

  const googleMap = document.getElementById('map');
  googleMap.innerHTML = '<div class="message status">Loading...</div>';

  fetch(placesUrl)
    .then((res) => res.json())
    .then((data) => {
      loadMap(data.candidates);
      if (data.candidates.length >= 1) {
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

          place.innerHTML = `
            <h3>${name}</h3>
            <div>${formatted_address}</div>
            <br>
            <div>Open Now: ${openNow}</div>
          `;
          places.appendChild(place);
        });
        let resultString;
        if (data.candidates.length > 1) {
          resultString = 'results';
        } else {
          resultString = 'result';
        }
        messages.innerHTML = `<div class='message success'>Successfully returned ${data.candidates.length} ${resultString}.</div>`;
        setTimeout(() => {
          messages.innerHTML = '';
        }, 2000);
      } else {
        messages.innerHTML = '<div class="message error">Sorry, no restaurants found. Please try again.</div>';
        setTimeout(() => {
          messages.innerHTML = '';
        }, 2000);
      }
    })
    .catch(() => {
      googleMap.innerHTML = '<div class="message error">Error retrieving places. Please try again.</div>';
    });
};

// Add initializeMap to global scope

window.initializeMap = initializeMap;

// Returns restaurants based on query

const submitBtn = document.getElementById('submit');

submitBtn.addEventListener('click', getPlaces);

// Loads Initial Map on page load

window.addEventListener('load', initializeMap);
