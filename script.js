let map;
let marker;
let geocoder;
let autocomplete;
let infowindow;
let markers = [];

function initialize() {
    const addressInput = document.getElementById('addressInput');
    const blackout = document.querySelector('.blackout');
    addressInput.addEventListener('focus', () => blackout.classList.add('blackout--enabled'))
    addressInput.addEventListener('blur', () => blackout.classList.remove('blackout--enabled'))
    let dubai = new google.maps.LatLng(25.276987, 55.296249);
    let mapOptions = {
        center: dubai,
        zoom: 13,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
    };

    infowindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    const tempEmptyImg = document.createElement("img");
    marker = new google.maps.marker.AdvancedMarkerView({
        map: map,
        position: dubai,
        title: 'Drag me!',
        content: tempEmptyImg,
    });


    google.maps.event.addListener(map, 'center_changed', function () {

        window.setTimeout(function () {
            let center = map.getCenter();
            marker.position = center;
        }, 0);
    });
    google.maps.event.addListener(map, 'dragend', function () {
        geocodePosition(marker.position);
    });
    geocodePosition(dubai);
    autocomplete = new google.maps.places.Autocomplete(
        addressInput,
        {
            types: [], // Позволяет любой тип мест
            componentRestrictions: {country: 'AE'}
        }
    );
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function () {
        blackout.classList.remove('blackout--enabled')
        infowindow.close();
        let place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Место не найдено: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

    });
}


// Try HTML5 geolocation
if (navigator.geolocation) {
    console.log(1)
    navigator.geolocation.getCurrentPosition(function (position) {
        let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        marker.position = pos;
        // marker = new google.maps.Marker({
        //     map: map,
        //     position: pos,
        //     title: 'Drag me!'
        // });

        // Добавляем слушатель событий для перемещения маркера с картой.
        google.maps.event.addListener(map, 'center_changed', function () {
            let center = map.getCenter();
            marker.position = center;
        });

        map.setCenter(pos);

        // Добавляем слушатель событий после окончания перемещения маркера для получения адреса
        google.maps.event.addListener(map, 'dragend', function () {
            geocodePosition(marker.position);
        });

        // Получаем адрес начальной позиции
        geocodePosition(pos);

    }, function () {
        marker.position = google.maps.LatLng(25.276987, 55.296249);
    });
} else {
    marker.position = google.maps.LatLng(25.276987, 55.296249);
}


function geocodePosition(pos) {
    geocoder.geocode({
        latLng: pos
    }, function (responses) {
        if (responses && responses.length > 0) {
            addressInput.value = responses[0].formatted_address;
        } else {
            addressInput.value = 'Cannot determine address at this location.';
        }
    });
}


function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        let content = 'Error: The Geolocation service failed.';
    } else {
        let content = 'Error: Your browser doesn\'t support geolocation.';
    }

    let options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };

    map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
