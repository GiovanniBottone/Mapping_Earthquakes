// Add console.log to check to see if our code is working.
console.log("working");

// Create the first tile layer for the background of the map
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the second tile layer for the background of the map
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the third tile layer for the background of the map
let light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the map object with center, zoom level & default layers.
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

// Create a base layer that holds all three maps.
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets,
  "Light": light
};

// Add a 2nd layer group for tectonic plate data.
let totalEarthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let majorEarthquakes = new L.LayerGroup();


// Add a reference to the tectonic plates group to the overlays object.
let overlays = {
  "Earthquakes": totalEarthquakes,
  "Tectonic_Plates": tectonicPlates,
  "Major_Earthquakes": majorEarthquakes
};


// Add a control to the map which allows users to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

  // This function returns the style data for each earthquake plotted on the map.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Create a function to determine the color of markers based on magnitude of each earthquake.
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#d4ee00";
    }
    if (magnitude > 4) {
      return "#ea2c2c";
    }
    if (magnitude > 3) {
      return "#ea822c";
    }
    if (magnitude > 2) {
      return "#ee9c00";
    }
    if (magnitude > 1) {
      return "#eecc00";
    }
    return "#98ee00";
  }

  // Create a function that determines the radius for each earthquake marker based on magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Create a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    	// This will turn each feature into a Circle Marker on the map.
    	pointToLayer: function(feature, latlng) {
      		console.log(data);
      		return L.circleMarker(latlng);
        },
      // Then, set the style for each Circle Marker using the styleInfo function.
      L.geoJson(data, {
        style: styleInfo,
        onEachFeature: function(feature, layer) {
          console.log(feature);
        }
      }).addTo(tectonicPlates);
    });
    tectonicPlates.addTo(map);
  });

     // Next, create a pop-up display for each Circle Marker that displays the magnitude & location of each earthquake after the marker is created and styled.
     onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(totalEarthquakes);

  // Next, add the earthquake layer to the map.
  totalEarthquakes.addTo(map);

  // Retrieve the major earthquake GeoJSON data greater than 4.5 magnitude for the past 7 days
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {

  // Use the same style as the earthquake data
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  
  // Next, change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#922a31";
    }
    if (magnitude >4) {
      return "#ffa500";
    }
    if (magnitude <4) {
      return "#ffff00"
    }
  }
  
  // Use the getRadius function that determines the radius of the earthquake marker based on its magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }
  
  // Create a GeoJSON layer with retrieved data which adds a circle to the map.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },

    // Style info for each Circle Marker
    style: styleInfo,

    // Create a Circle Marker popup to display magnitute and location of the earthquakes
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // Add the major earthquakes layer group variable to the map
  }).addTo(majorEarthquakes);

  // Add the major earthquakes layer to the map
  majorEarthquakes.addTo(map);

  });  

  // Create a legend control object.
let legend = L.control({
  position: "bottomright"
});

// Next, add every detail for the legend
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

  const magnitudes = [0, 1, 2, 3, 4, 5];
  const colors = [
    "#98ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c",
    "#d4ee00"
  ];

// Loop through intervals to create a colored square & label for each interval.
  for (var i = 0; i < magnitudes.length; i++) {
    console.log(colors[i]);
    div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Last, add legend to the map.
  legend.addTo(map);
