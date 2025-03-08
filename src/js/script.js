const map = L.map('map').setView([51.505, -0.09], 13);

const tiles = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
   subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
   attribution: '© Gasparetti Matthew'
}).addTo(map);

let userLocation;
let routingControl;
let searchMarker;

if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(position => {
      userLocation = [position.coords.latitude, position.coords.longitude];
      map.setView(userLocation, 13);
      L.marker(userLocation).addTo(map);
   });
}

function performSearch() {
   const location = document.getElementById("search").value;
   fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
      .then(response => response.json())
      .then(data => {
         if (data.length > 0) {
            const destination = [data[0].lat, data[0].lon];

            // Ogni volta che cerco una nuova destinazione
            // rimuovo il segnalino della ricerca precedente
            if (searchMarker) {
               map.removeLayer(searchMarker);
            }
            searchMarker = L.marker(destination).addTo(map);

            if (userLocation) {
               if (routingControl) {
                  map.removeControl(routingControl);
               }
               routingControl = L.Routing.control({
                  waypoints: [
                     L.latLng(userLocation[0], userLocation[1]),
                     L.latLng(destination[0], destination[1])
                  ],
                  routeWhileDragging: true,
                  createMarker: () => null,
                  show: false // Non mi piacciono i testi returnati dall'api
               }).addTo(map);

               // In base alla distanza tra la posizione dell'utente
               // e quella di destinazione, gestisce lo zoom della mappa
               const bounds = L.latLngBounds([userLocation, destination]);
               map.fitBounds(bounds, {
                  padding: [50, 50]
               });
            } else {
               map.setView(destination, 13);
            }
         }
      });
}

document.getElementById("search").addEventListener("keypress", function (event) {
   if (event.key === "Enter") {
      performSearch();
   }
});