let map;
let autocomplete;
let infowindow;
let markers = []; // Массив для хранения маркеров
let geocoder;
let places;

function initMap() {
    let dubai = new google.maps.LatLng(25.276987, 55.296249);
    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
        center: dubai,
        zoom: 13,
        disableDefaultUI: true,
    });
    // Создаем поле автодополнения и позволяем поиск по разным типам мест
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: [], // Позволяет любой тип мест
            componentRestrictions: {country: 'AE'}
        }
    );

    autocomplete.bindTo('bounds', map);
    map.addListener('click', (e) => {
        clearMarkers();
        addMarkerByGeocode(e.latLng.lat(), e.latLng.lng());
    });

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        let place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Место не найдено: '" + place.name + "'");
            return;
        }
        clearMarkers(); // Удаляем все старые маркеры
        // Если место найдено, отображаем его на карте
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        addMarker(place);
    });
}


function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

async function addMarkerByGeocode(lat, lng) {
    const geocode = await geocoder.geocode({location: {lat, lng}});
    const result = geocode.results[0];
    document.getElementById('autocomplete').value = result.formatted_address;
    addMarker(
        {
            geometry: {location: {lat, lng}},
            name: result.address_components[1].long_name
        }
    )
}

function addMarker(place) {
    let marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location,

    });
    google.maps.event.addListener(marker, 'click', function () {
        if (place.place_id) {
            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Place ID: ' + place.place_id + '<br>' +
                place.formatted_address + '</div>');
            infowindow.open(map, this);
        }
    });
    markers.push(marker); // Добавляем маркер в массив
}

