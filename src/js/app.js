// Import CSS

import '../scss/styles.scss';

// Import Google Maps Loader

import { Loader } from '@googlemaps/js-api-loader';

// Primary Configuration for Google Maps API and Current Location Storage

const config = {
  apiKey: 'AIzaSyDQikLBYGnnSeoRauJQDQDPme9r_1DunbM',
  loaderVersion: 'weekly',
  location: {
    latitude: null,
    longitude: null,
  },
};

// Load Initial Map

const initializeMap = () => {
  const googleMap = document.getElementById('map');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      config.location.longitude = position.coords.longitude;
      config.location.latitude = position.coords.latitude;
    });

    const initialMapLoader = new Loader({
      apiKey: config.apiKey,
      version: config.version,
    });

    initialMapLoader.load()
      .then(() => {
        const map = new google.maps.Map(googleMap, {
          center: {
            lat: config.location.latitude,
            lng: config.location.longitude,
          },
          zoom: 10,
        });
        const marker = new google.maps.Marker({
          position: {
            lat: config.location.latitude,
            lng: config.location.longitude,
          },
          map,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: '<div>Current Location</div>',
        });
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
  }
};

// Places Search

const getPlaces = (e) => {
  e.preventDefault();
  const query = document.querySelector('#query');
  const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query.value}&inputtype=textquery&fields=geometry,formatted_address,name,opening_hours&locationbias=circle:1000@${config.location.latitude},${config.location.longitude}&key=${config.apiKey}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const places = document.querySelector('#places');
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
      const newMapLoader = new Loader({
        apiKey: config.apiKey,
        version: config.version,
      });

      const googleMap = document.getElementById('map');
      googleMap.innerHTML = '';

      newMapLoader.load().then(() => {
        const map = new google.maps.Map(googleMap, {
          center: {
            lat: config.location.latitude,
            lng: config.location.longitude,
          },
          zoom: 10,
        });
        const currentLocation = new google.maps.Marker({
          position: {
            lat: config.location.latitude,
            lng: config.location.longitude,
          },
          map,
          title: 'Current Location',
        });
        const infoWindow = new google.maps.InfoWindow({
          content: '<div>Current Location</div>',
        });
        currentLocation.addListener('click', () => {
          infoWindow.open(map, currentLocation);
        });
        data.candidates.forEach((item) => {
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
      });
    });
};

const submitBtn = document.querySelector('#submit');

// Returns restaurants based on query

submitBtn.addEventListener('click', getPlaces);

// Loads Initial Map on page load

window.addEventListener('load', initializeMap);
