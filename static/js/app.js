let ViewModel = function() {
    let self = this;
    this.asyncError = ko.observable(false);
    this.asyncErrorMsg = ko.observable('');
    this.focusedOnLocation = ko.observable(false);
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
    this.locations = [
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
            price: 'average',
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
    this.filteredLocations = ko.observableArray([]);

    ///////////////////////////////////////////////////////////////////////////////////////

    // Callback function for Google Maps API that initializes map to show default locations
    this.initMap = function() {

        this.map = new google.maps.Map(document.getElementById('map'), this.mapInitData);
        this.infoWindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(window, 'resize', function() {
            self.zoomOnVisibleMarkers();
          });

        this.filteredLocations(this.locations);
        this.createAllMarkers();

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Adds all locations to map and zooms to bounds
    this.createAllMarkers = function() {

        let self = this;

        // Create markers, add them to markers array and add event handlers to each
        this.locations.forEach(function(position, i) {

            (function() {
                fetch('https://api.mixcloud.com/search/?type=cloudcast&q=live+at+' + position.title)
                .then(function(res) {

                    if(res.status === 200) {

                        return res.json();

                    } else {

                        return {data: []};

                    }
                })
                .then(function(json) {

                    let info = '';
                    
                    if(json.data !== undefined) {

                        if(json.data.length > 0) {

                            info = '<h2>' + position.title + '</h2><br><h3>MixCloud recordings from this venue: </h3>';
                            json.data.forEach(function(data) {
                                info = info + '<a href="' + data.url + '" target="_blank"> ' + data.name + '</a><br>';
                            });
    
                        } else {
    
                            info = '<h2>' + position.title + '</h2><br><h3>No recordings found.</h3>';
    
                        }
    
                        let marker = self.createMarker(
                            position.position,
                            position.title,
                            i,
                            (i+1).toString(),
                            info
                        );
                        
                        self.markers.push(marker);
    
                        marker.addListener('click', function() {
                            self.showInfoWindow(this);
                            self.animateMarker(this);
                        });
    
                        self.zoomOnVisibleMarkers();
                        
                    }

                })
                .catch(function(error) {
                    self.asyncErrorMsg('MixCloud API Error: ' + error);
                })
            })()
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.animateMarker = function(marker) {

        self.markers.forEach(function(marker) {
            marker.setAnimation(null);
        });

        marker.setAnimation(google.maps.Animation.BOUNCE);

    };

    this.zoomOnVisibleMarkers = function() {
        
        let bounds = new google.maps.LatLngBounds();
        let visibleCount = 0;

        self.markers.forEach(function(marker, i) {

            if(marker.visible === true) {

                visibleCount += 1;
                bounds.extend(marker.position);

            }

        });

        self.map.fitBounds(bounds);

        if(visibleCount === 0) {

            self.map.setCenter(this.mapInitData.center);
            self.map.setZoom(10);

        } else if(visibleCount === 1) {

            self.map.setZoom(15);

        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.hideInfoWindow = function() {
        console.log('hmm');
        this.infoWindow.close();
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.showInfoWindow = function(marker) {
        
        if(this.infoWindow.marker != marker) {

            this.infoWindow.marker = marker;
            this.infoWindow.setContent(marker.info.toString());
            this.infoWindow.open(this.map, marker);

            this.infoWindow.addListener(function() {

                this.infoWindow.close();

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
            info: info,
            icon: 'static/img/marker.png'
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Filters through locations array and creates new markers for matching locations
    this.filterLocations = function() {

        this.filteredLocations([]);
        this.hideMarkers();

        // Create new filtered locations array based on new filters
        this.locations.forEach(function(obj, i) {

            if(this.filters().size === '' && this.filters().price === '') {
                this.filteredLocations.push(this.locations[i]);
            } else if(this.filters().size === '' && this.filters().price != '') {
                if(this.locations[i].price === this.filters().price) {
                    this.filteredLocations.push(this.locations[i]);
                }
            } else if(this.filters().size != '' && this.filters().price === '') {
                if(this.locations[i].size === this.filters().size) {
                    this.filteredLocations.push(this.locations[i]);
                }
            } else {
                if(this.locations[i].size === this.filters().size && this.locations[i].price === this.filters().price) {
                    this.filteredLocations.push(this.locations[i]);
                }
            }

        }, this);

        // Show locations that match filter criteria
        this.showMarkers();

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.showMarkers = function() {

        self.markers.forEach(function(marker, i) {

            self.filteredLocations().forEach(function(position) {

                if(position.title === marker.title) {

                    marker.setVisible(true);

                }

            })
        });

        self.zoomOnVisibleMarkers();

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    // Click event handler that triggers location filtering
    this.setFilter = function(self, evt) {

        // Grab values from radio buttons and trigger filtering
        this.filters()[evt.srcElement.name] = evt.srcElement.value;
        this.filterLocations();
        return true;

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.focusOnLocation = function() {

        // Show "Show All Locations" button
        self.focusedOnLocation(true);
        self.hideMarkers();

        let selectedLocation = null;

        // Create new filtered locations array based on new filters
        for(let i = 0; i < self.filteredLocations().length; i++)  {

            if(self.filteredLocations()[i].title === this.title) {

                selectedLocation = self.filteredLocations()[i];
                self.filteredLocations([]);
                self.filteredLocations.push(selectedLocation);
                i = self.locations.length;

            }

        };

        // Find marker that matches selected location
        self.markers.forEach(function(marker, i) {
            if(marker.title === selectedLocation.title) {
                self.showInfoWindow(self.markers[i]);
                self.animateMarker(self.markers[i]);
            }
        });

        // Show locations that match filter criteria
        self.showMarkers();

    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.showAllLocations = function() {

        this.focusedOnLocation(false);

        this.hideMarkers();

        this.filteredLocations(this.locations);
        this.stopAnimations();
        this.hideInfoWindow();
        this.showMarkers();
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    this.stopAnimations = function() {
        this.markers.forEach(function(marker) {
            marker.setAnimation(null);
        })
    }

    this.hideMarkers = function() {

        self.markers.forEach(function(marker) { marker.setVisible(false) });

    }

    // Initialize Google Maps API
    this.initMap();
};

//-------------------------------------------------------------------------------------

function startApp() {    
    ko.applyBindings(new ViewModel());
}

function googleMapsError() {
    let sidebar = document.querySelector('body');
    let errorMsg = document.createElement('div');
    errorMsg.style.position = 'fixed';
    errorMsg.style.top = '0';
    errorMsg.style.right = '0';
    errorMsg.style.bottom = '0';
    errorMsg.style.left = '0';
    errorMsg.style.zIndex = '99999';
    errorMsg.style.color = '#ff1744';
    errorMsg.style.background = '#1a1a1a';
    errorMsg.style.display = 'flex';
    errorMsg.style.justifyContent = 'center';
    errorMsg.style.alignItems = 'center';
    errorMsg.innerHTML = 'There was an error with Google Maps API.';
    sidebar.appendChild(errorMsg);
}