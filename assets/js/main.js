// Author: Brian Lin
//

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJpb2FuIiwiYSI6ImNqaHZla2ticTB5Y28zcXAzb2F1eHNlZ2sifQ.xSx21-Ra58aPdvo4ZlWwVg';
var map1 = new mapboxgl.Map({
    container: 'map1',
    style: 'mapbox://styles/brioan/cjng2mnq611hd2tn0svawi1ji',
    center: [174.7633, -36.8485],
    zoom: 14
});


var overlayPolyData = document.getElementById('map-overlay-poly-data');
var popup = new mapboxgl.Popup({
    closeButton: false
});


// Mapbox map
map1.on('load', function () {
    // Insert the layer beneath any symbol layer.
    var layers = map1.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }



    map1.addSource('area', {
        type: 'geojson',
        data: 'https://services2.arcgis.com/JkPEgZJGxhSjYOo0/arcgis/rest/services/ParkingZone/FeatureServer/3/query?where=1%3D1&outFields=OBJECTID,ZONEID&outSR=4326&f=geojson'
    });

    map1.addLayer({
        'id': 'areaid',
        'type': 'fill',
        'source': 'area',
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#00adb5',
            'fill-opacity': ["case", ["boolean", ["feature-state", "hover"], false], 0.6, 0.5]
        }
    });

    map1.addSource('area2', {
        type: 'geojson',
        data: 'https://services2.arcgis.com/JkPEgZJGxhSjYOo0/arcgis/rest/services/ParkingService/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID,STREET,MACHINEID,MACHINEIDS,AREAID&outSR=4326&f=geojson'
    });

    map1.addLayer({
        "id": "parkingMeter",
        "type": "symbol",
        "source": "area2",
        "layout": {
            "icon-image": "car-15",
            "icon-allow-overlap": false,
            //"text-field": "{STREET}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
            //"icon-color": "ff9a00"
        }
    });

    /* map1.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })); */

    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    });
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map1));


    map1.addControl(new mapboxgl.NavigationControl());

    map1.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    var hoveredStateId = null;

    map1.on("mousemove", "areaid", function (e) {
        if (e.features.length > 0) {
            if (hoveredStateId) {
                map1.setFeatureState({
                    source: 'area',
                    id: hoveredStateId
                }, {
                    hover: false
                });
            }
            hoveredStateId = e.features[0].id;
            map1.setFeatureState({
                source: 'area',
                id: hoveredStateId
            }, {
                hover: true
            });
        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map1.on("mouseleave", "areaid", function () {
        if (hoveredStateId) {
            map1.setFeatureState({
                source: 'area',
                id: hoveredStateId
            }, {
                hover: false
            });
        }
        hoveredStateId = null;
    });
    

    map1.on('click', 'parkingMeter', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.STREET;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        } 

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map1);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map1.on('mouseenter', 'parkingMeter', function () {
        map1.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map1.on('mouseleave', 'parkingMeter', function () {
        map1.getCanvas().style.cursor = '';
    });
    //f38181




});