<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { chatMessages } from '../Chat/store.js';
  import Chat from '../Chat/Chat.svelte';
  import getIconOptions from './icons.js';

  export let socket;
  
  let mapElement;
  let map;
  let homeIcon, restaurantIcon, deliveryIcon;

  socket.onmessage = ({ data }) => {
    data = JSON.parse(data);
    mapState[data.type][0](data.payload);
  };

  let mapState = {
    'RESTAURANTS': [updateRest, {}],
    'DESTINATIONS': [updateDest, {}],
    'USERS': [updateUsers, {}],
    'DELIVERIES': [updateDel, {}],
    'POSITION': [updatePos, {}],
    'CHAT': [updateChat, {}],
    'MESSAGE': [updateMsg, {}],
    'ORDER': [updateOr, {}],
    'DELIVERY_STATUS': [updateDelStatus, {}],
  };

  function updateDel(payload) {
    const deliveries = mapState['DELIVERIES'][1];
    payload.forEach(d => {
      if (!(d.id in deliveries)) {
        deliveries[d.id] = d;
        const restaurants = mapState['RESTAURANTS'][1];
        const destinations = mapState['DESTINATIONS'][1];

        if (restaurants && destinations) {
          const restaurant = restaurants[d.restaurant_id];
          const destination = destinations[d.destination_id];
          // console.log(restaurant, destination);

          if (restaurant && destination) {
            let resPosition = [restaurant.position.lat, restaurant.position.long];
            let destPosition = [destination.position.lat, destination.position.long];
            const polyline = L.polyline([resPosition, destPosition], {color: 'cyan'});
            polyline.addTo(map);
          }
        }
      }
    });
  }

  function updatePos(payload) {
    const deliveries = mapState.DELIVERIES[1];  // Se obtiene la lista de deliveries
    if (deliveries) {  // Si es que hay deliveries definidos
      let delivery = deliveries[payload.delivery_id];  // Checkear si existe el delivery
      if (delivery) {  // Checkear si existe el delivery
        delivery.position = payload.position;
        if (!delivery.marker) {
          let marker = L.marker([delivery.position.lat, delivery.position.long], {icon: deliveryIcon});
          marker.addTo(map);
          delivery.marker = marker;
        } else {
          delivery.marker.setLatLng([delivery.position.lat, delivery.position.long]);
        }
      }
    }
  }

  function updateDelStatus(payload) {
    const deliveries = mapState['DELIVERIES'][1];

    if (deliveries) {  // Checkear que hayan deliveries
      let delivery = deliveries[payload.delivery_id];
      if (delivery) {  // Check si existe el delivery
        delivery.status = payload.status;
        if (delivery.status === 'DELIVERED' && delivery.marker) {
          // Remove marker from map
          map.removeLayer(delivery.marker);
          // Remove marker reference from delivery object
          delivery.marker = null;
        }
        if (delivery.marker) {
          delivery.marker.bindTooltip(delivery.status);
        }
      }
    }
  }

  function updateChat(payload) {
    console.log(payload);
    chatMessages.update(messages => [...messages, payload]);
  }

  function updateMsg(payload) {
    // console.log(payload);
    return
  }

  function updateOr(payload) {
    // console.log(payload);
    return
  }

  function updateUsers(payload) {
    // console.log(payload);
    return
  }

  function updateRest(payload) {
    const restaurants = mapState['RESTAURANTS'][1];
    payload.forEach(r => {
      if (!(r.id in restaurants)) {
        restaurants[r.id] = r;
        let marker = L.marker([r.position.lat, r.position.long], {icon: restaurantIcon});
        marker.bindTooltip(r.name).addTo(map);
        r.marker = marker;
      }
    });
  }

  function updateDest(payload) {
    const destinations = mapState['DESTINATIONS'][1];
    payload.forEach(d => {
      if (!(d.id in destinations)) {
        destinations[d.id] = d;
        let marker = L.marker([d.position.lat, d.position.long], {icon: homeIcon});
        marker.bindTooltip(d.name).addTo(map);
        d.marker = marker;
      }
    });
  }

  onMount(async () => {
      if( browser ) {
          const leaflet = await import('leaflet');

          map = leaflet.map(mapElement).setView([-33.43, -70.63], 12);

          leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          homeIcon = new L.Icon(getIconOptions("https://cdn-icons-png.flaticon.com/512/1835/1835281.png"));
          restaurantIcon = new L.Icon(getIconOptions("https://cdn-icons-png.flaticon.com/512/948/948036.png"));
          deliveryIcon = new L.Icon(getIconOptions("https://cdn-icons-png.flaticon.com/512/2830/2830305.png"));
      }
  });

  onDestroy(async () => {
    if(map) {
      map.remove();
    }
  });
</script>

<main>
  <div class="map">
    <div class="leaflet-map-container" id="mapContainer" bind:this={mapElement} />
  </div>
  <div>
    <Chat {socket} />
  </div>
</main>


<style>
  @import 'leaflet/dist/leaflet.css';

  /* Use flexbox to create a two-column layout with the map and chat */
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .map {
    /* Set the map container to take up all available space in the first column */
    flex: 1;
    /* Set a minimum height to ensure the map is visible even if there is no content */
    min-height: 0;
    /* Set dimensions for the map container */
    height: 600px;
    width: 800px;
    /* Set the map container to be relative positioned */
    position: relative;

    border: 2px solid #000;
    border-radius: 10px;
    overflow: hidden;

    margin-right: 20px;
  }

  .leaflet-map-container {
    /* Set the map container to take up all available space */
    height: 100%;
    width: 100%;
    /* Set the map container to be absolute positioned */
    position: absolute;
    top: 0;
    left: 0;
  }
</style>