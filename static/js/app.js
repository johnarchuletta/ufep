var ViewModel = function() {
    this.map;
    this.markers = [];
    this.styles = [
        {
            "stylers": [
                {
                    "hue": "#ff1a00"
                },
                {
                    "invert_lightness": true
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 33
                },
                {
                    "gamma": 0.5
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#2D333C"
                }
            ]
        }
    ];
    this.positions = [
        {
            title: 'Tresor',
            position: {
                lat: 52.5106031,
                lng: 13.4197619
            },
            address: 'Köpenicker Str. 70, 10179',
            size: 'medium',
            price: 'average',
            info: 'info about tresor'
        },
        {
            title: 'Berghain / Panorama Bar',
            position: {
                lat: 52.5110897,
                lng: 13.4429457
            },
            address: 'Am Wriezener Bahnhof, 10243',
            size: 'large',
            price: 'expensive',
            info: 'info about berghain'
        },
        {
            title: 'Suicide Circus',
            position: {
                lat: 52.507272,
                lng: 13.4508531
            },
            address: 'Revaler Str. 99, 10245',
            size: 'large',
            price: 'average',
            info: 'info about suicide circus'
        },
        {
            title: '://about blank',
            position: {
                lat: 52.5025014,
                lng: 13.4663767
            },
            address: 'Markgrafendamm 24c, Berlin, 10245',
            size: 'medium',
            price: 'expensive',
            info: 'info about about blank'
        },
        {
            title: 'Arena Club',
            position: {
                lat: 52.4966473,
                lng: 13.4530078
            },
            address: 'Eichenstraße 4, 12435',
            size: 'small',
            price: 'free',
            info: 'info about arena club'
        },
        {
            title: 'VOID Club',
            position: {
                lat: 52.50749829999999,
                lng: 13.4759292
            },
            address: 'Wiesenweg 5, 10365',
            size: 'small',
            price: 'free',
            info: 'info about void club'
        }
    ];
    this.mapInitData = {
        center: { lat: 52.5067614, lng: 13.2846515 },
        zoom: 8,
        styles: this.styles,
        mapTypeControl: false
    };
    this.infoWindow = '';
    this.filters = ko.observable({
        size: '',
        price: ''
    });
    this.filteredPositions = ko.observableArray([]);

    ///////////////////////////////////////////////////////////////////////////////////////

    // Callback function for Google Maps API that initializes map to show default locations
    this.initMap = function() {
        this.filteredPositions(this.positions);

        this.map = new google.maps.Map(document.getElementById('map'), this.mapInitData);
        this.infoWindow = new google.maps.InfoWindow();

        // this.map.addListener('click', function() {
        //     try {
        //         this.infoWindow.setMarker = null;
        //     } catch(e) {
        //         console.log(e);
        //     }
        //     console.log('hmm');
        // })

        this.showMarkers(this.filteredPositions());

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Adds all locations to map and zooms to bounds
    this.showMarkers = function(positions) {

        // If there are no matching locations, zoom map to show entire city, otherwise zoom to bounds
        if(positions.length === 0) {

            this.map.setCenter(this.mapInitData.center);
            this.map.setZoom(12);

        } else {

            var self = this;

            // Create markers, add them to markers array and add event handlers to each
            this.filteredPositions().forEach(function(position, i) {

                (function() {
                    fetch('https://api.mixcloud.com/search/?type=cloudcast&q=live+at+' + position.title)
                    .then(function(res) {
                        return res.json();
                    })
                    .then(function(json) {
                        var info = '';
                        json.data.forEach(function(data) {
                            info = info + data.name + '<br>';
                        });
                        var marker = self.createMarker(
                            position.position,
                            position.title,
                            i,
                            (i+1).toString(),
                            info
                        );
                        
                        self.markers.push(marker);

                        marker.addListener('click', function() {
                            self.showInfoWindow(this);
                        });

                        self.zoomOnMarkers();
                    });
                })()
            });
                
            // Zoom map out if only one matching location, otherwise zoom to bounds
            if(positions.length === 1) {
                this.map.setCenter(positions[0].position);
                this.map.setZoom(15);
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.zoomOnMarkers = function() {
        var bounds = new google.maps.LatLngBounds();
        
                this.markers.forEach(function(marker) {
                    bounds.extend(marker.position)
                });
        
                this.map.fitBounds(bounds);
    }

    this.showInfoWindow = function(marker, info) {
        
        if(this.infoWindow.marker != marker) {
            this.infoWindow.marker = marker;
            this.infoWindow.setContent(marker.info.toString());
            this.infoWindow.open(this.map, marker);
            this.infoWindow.addListener(function() {
                this.infoWindow.setMarker = null;
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Creates and returns marker to calling function
    this.createMarker = function(position, title, id, label, info) {
        return new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: IDBCursor,
            map: this.map,
            label: label || '',
            info: info
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Filters through positions array and creates new markers for matching locations
    this.filterPositions = function() {

        // Clear all markers
        this.markers.forEach(function(marker) { marker.setMap(null) });

        this.markers = [];
        this.filteredPositions([]);

        // Create new filtered positions array based on new filters
        this.positions.forEach(function(obj, i) {

            if(this.filters().size === '' && this.filters().price === '') {
                this.filteredPositions.push(this.positions[i]);
            } else if(this.filters().size === '' && this.filters().price != '') {
                if(this.positions[i].price === this.filters().price) {
                    this.filteredPositions.push(this.positions[i]);
                }
            } else if(this.filters().size != '' && this.filters().price === '') {
                if(this.positions[i].size === this.filters().size) {
                    this.filteredPositions.push(this.positions[i]);
                }
            } else {
                if(this.positions[i].size === this.filters().size && this.positions[i].price === this.filters().price) {
                    this.filteredPositions.push(this.positions[i]);
                }
            }

        }, this);

        // Show locations that match filter criteria
        this.showMarkers(this.filteredPositions());

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Click event handler that triggers location filtering
    this.applyFilter = function(self, evt) {

        // Grab values from radio buttons and trigger filtering
        this.filters()[evt.srcElement.name] = evt.srcElement.value;
        this.filterPositions();
        return true;

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Initialize Google Maps API
    this.initMap();
};

//-------------------------------------------------------------------------------------

function startApp() {    
    ko.applyBindings(new ViewModel());
}