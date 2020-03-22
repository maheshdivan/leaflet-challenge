
var queryUrl =
  "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

d3.json(queryUrl, function(earthquakeData) {
  createFeatures(earthquakeData.features);
});

function markerSize(magnitude) {
  return magnitude * 30000;
};

function getColor(m) {

  var color = ['lightgreen','yellowgreen','gold','orange','tomato'];

  if (m> 4){
    return color[4]
  }
  else if(m > 3){
    return color[3]
  }
  else if(m > 2) {
    return color[2]
  }
  else if (m> 1){
    return color[1]
  }
  else{
    return color[0]
  }
};

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData,{
    // Give each feature a popup describing with information pertinent to it
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > Magnitude: "+ feature.properties.mag + 
      "</h3><h3>Location: " + feature.properties.place);
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .7,
        color: 'grey',
        weight: .5
      })
    }    
  });

  createMap(earthquakes);
}; 

function createMap(earthquakes){

var plates = new L.LayerGroup();
d3.json("PB2002_boundaries.json", function (data){
  
    L.geoJSON(data,
      {
        color: 'orange',
        weight: 2
      })
      .addTo(plates);
})



// Define variables for our base layers
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});


// Create a baseMaps object
var baseMaps = {
  "Satellite": satellite,
  "Grayscale": grayscale,
  "Outdoors": outdoors,

};

// Create an overlay object
var overlayMaps = {
  "Fault Lines": plates,
  "Earth Quakes": earthquakes
};

// Define a map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [satellite, earthquakes, plates]
});

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div','info legend'),
        magnitudes = [0,1,2,3,4],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
    // loop through our density intervals and generate a label for each interval
    for (var i=0; i < magnitudes.length; i++){
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);

}