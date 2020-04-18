
var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;
var maha = ol.proj.fromLonLat([78.2787984,18.7615761]);
var MP = ol.proj.fromLonLat([73.9278374,23.9085453]);



var overviewMapControl = new ol.control.OverviewMap({
  // see in overviewmap-custom.html to see the custom CSS used
  className: 'ol-overviewmap ol-custom-overviewmap',
  layers: [
	new ol.layer.Vector({
	source: new ol.source.Vector({
    url: 'Data/India.geojson',
    format: new ol.format.GeoJSON()
  })
})
  ],
  
    view: new ol.View({
		center:maha,
		maxZoom: 2,
    minZoom: 1.7,
    zoom: 2
  }),
  collapseLabel: '\u00BB',
  label: '\u00AB',
  collapsed: false,
});


var classSeries;
var classColors;
//color start from
var colorFrom ='FFFFFF';
//color end to
var colorTo = 'BDC3C7';


//color start from
var colorFromConf ='b5d0ff';
//color end to
var colorToConf = '00338d';


var defaultStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.3)'
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 255, 0, 1)',
    width: 1
  }),
  text: new ol.style.Text({
    font: '12px Calibri,sans-serif',
    fill: new ol.style.Fill({
      color: '#000'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 3
    })
  })
});





//earcthqu clust

var earthquakeFill = new ol.style.Fill({
  color: 'rgba(255, 153, 0, 0.8)'
});
var earthquakeStroke = new ol.style.Stroke({
  color: 'rgba(255, 204, 0, 0.2)',
  width: 1
});
var textFill = new ol.style.Fill({
  color: '#fff'
});
var textStroke = new ol.style.Stroke({
  color: '#000',
  width: 3
});
var invisibleFill = new ol.style.Fill({
  color: 'rgba(255, 255, 255, 0.01)'
});

function createEarthquakeStyle(feature) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it
  // from the Placemark's name instead.
  var magnitude = 5.5;
  var radius = 5 + 20*(0.001);

  return new ol.style.Style({
    geometry: feature.getGeometry(),
    image: new ol.style.RegularShape({
      radius1: radius,
      radius2: 2,
      points: 10,
      angle: Math.PI,
      fill: earthquakeFill,
      stroke: earthquakeStroke
    })
  });
}

var maxFeatureCount;
function calculateClusterInfo(resolution) {
  maxFeatureCount = 0;
  var features = vectorConfDist.getSource().getFeatures();
  var feature, radius;
  for (var i = features.length - 1; i >= 0; --i) {
    feature = features[i];
    var originalFeatures = feature.get('features');
    var extent = ol.extent.createEmpty();
    for (var j = 0, jj = originalFeatures.length; j < jj; ++j) {
      ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
    }
    maxFeatureCount = Math.max(maxFeatureCount, jj);
    radius = 0.002*(ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
        resolution;
    feature.set('radius', radius);
  }
}

var currentResolution;
function styleFunctionHos(feature, resolution) {
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  var style;
  var size = feature.get('features').length;
  if (size >= 1) {
	  
	var zoom = map.getView().getZoom();
	var font_size = 20;
    style = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: [234, 170, 0, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
        })
      }),
      text: new ol.style.Text({
		font: font_size + 'px Calibri,sans-serif',
        text: size.toString(),
        fill: textFill
      })
    })];
  } 
  return style;
}



function styleFunctionRec(feature, resolution) {
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  var style;
  var size = feature.get('features').length;
  if (size >= 1) {
    style = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: [67, 176, 42, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
        })
      }),
      text: new ol.style.Text({
		  font: 20 + 'px Calibri,sans-serif',
        text: size.toString(),
        fill: textFill
      })
    })];
  }
  return style;
}


function styleFunctionDece(feature, resolution) {
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  var style;
  var size = feature.get('features').length;
  if (size >= 1) {
    style = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: [255, 0, 0, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
        })
      }),
      text: new ol.style.Text({
		  font: 20 + 'px Calibri,sans-serif',
        text: size.toString(),
        fill: textFill
      })
    })];
  } else {
    var originalFeature = feature.get('features')[0];
    style = [createEarthquakeStyle(originalFeature)];
  }
  return style;
}

function selectStyleFunction(feature, resolution) {
  var styles = [new ol.style.Style({
    image: new ol.style.Circle({
      radius: feature.get('radius'),
      fill: invisibleFill
    })
  })];
  var originalFeatures = feature.get('features');
  var originalFeature;
  for (var i = originalFeatures.length - 1; i >= 0; --i) {
    originalFeature = originalFeatures[i];
    styles.push(createEarthquakeStyle(originalFeature));
  }
  return styles;
}

var vectorHosCity = new ol.layer.Vector({
	title:'Hospitalized',
	visible: false,
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/City_COVID_19_Hospitalized_Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionHos
});

var vectorHosDist = new ol.layer.Vector({
	title:'Hospitalized',
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/District COVID 19 Hospitalized Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionHos
});


var vectorRecoDist = new ol.layer.Vector({
	title:'Recovered',
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/District COVID 19 Recovered Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionRec
});
var vectorRecoCity = new ol.layer.Vector({
	title:'Recovered',
	visible: false,
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/City COVID 19 Recovered Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionRec
});

var vectorDeceDist = new ol.layer.Vector({
	title:'Deceased',
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/District COVID 19 Deceased Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionDece
});


var vectorDeceCity = new ol.layer.Vector({
	title:'Deceased',
	visible: false,
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/City COVID 19 Deceased Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionDece
});

function styleFunctionConf(feature, resolution) {
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  var style;
  var size = feature.get('features').length;
  if (size >= 1) {
    style = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: [0, 51, 141, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
        })
      }),
      text: new ol.style.Text({
		  font: 20 + 'px Calibri,sans-serif',
        text: size.toString(),
        fill: textFill
      })
    })];
  } else {
    var originalFeature = feature.get('features')[0];
    style = [createEarthquakeStyle(originalFeature)];
  }
  return style;
}

var vectorConfDist = new ol.layer.Vector({
	title:'Confirmed',
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/District COVID 19 Confirmed Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionConf
});
var vectorConfCity = new ol.layer.Vector({
	title:'Confirmed ',
	visible: false,
  source: new ol.source.Cluster({
    distance: 40,
    source: new ol.source.Vector({
      url: 'Data/kml/City COVID 19 Confirmed Cases.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    })
  }),
  style: styleFunctionConf
});






var labelStyle = new ol.style.Style({
        geometry: function(feature) {
          var geometry = feature.getGeometry();
          if (geometry.getType() == 'MultiPolygon') {
            var polygons = geometry.getPolygons();
            var widest = 0;
            for (var i = 0, ii = polygons.length; i < ii; ++i) {
              var polygon = polygons[i];
              var width = ol.extent.getWidth(polygon.getExtent());
              if (width > widest) {
                widest = width;
                geometry = polygon;
              }
            }
          }
          return geometry;
        },
        text: new ol.style.Text({
          font: '14px Calibri,sans-serif',
          overflow: true,
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });

      var countryStyle = new ol.style.Style({
        fill: new ol.style.Fill({
          color: '#fff'
        }),
        stroke: new ol.style.Stroke({
          color: '#afb6bb',
          width: 1
        })
      });

var style = [countryStyle, labelStyle];


function scaleControl() {
  if (scaleType === 'scalebar') {
    control = new ol.control.ScaleLine({
      units: 'metric'
    });
    return control;
  }
  control = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: scaleBarSteps,
    text: scaleBarText,
    minWidth: 140
  });
  return control;
}


var vectorLayer = new ol.layer.Vector({
	title: 'Maharashtra District wise Population',
	visible: false,
  source: new ol.source.Vector({
    url: 'Data/Dist_Population.geojson',
    format: new ol.format.GeoJSON()
  }),
        style: function(feature) {
          labelStyle.getText().setText(feature.get('DISTRICT'));
          return style;
        }
});
var DistConfCases = new ol.layer.Vector({
	title: 'District wise cases',
  source: new ol.source.Vector({
    url: 'Data/District_COVID_19_Confirmed_Cases.geojson',
    format: new ol.format.GeoJSON()
  }),
          style: function(feature) {
          labelStyle.getText().setText(feature.get('DISTRICT'));
          return style;
        }
});

var Government_Laboratories = new ol.style.Style({
  image: new ol.style.Icon( ({
    anchor: [0.3, 12],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
    src: 'Data/govLabs.png'
  }))
});

var Government_COVID_19_Hospitals = new ol.style.Style({
  image: new ol.style.Icon( ({
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
    src: 'Data/Government_COVID_19_Hospitals.png'
  }))
});


var Private_Laboratories = new ol.style.Style({
  image: new ol.style.Icon( ({
	  
    anchor: [0.3, 12],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
    src: 'Data/Private_Laboratories.png'
  }))
});



var pvt_labs = new ol.layer.Vector({
title: 'Private Laboratories',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/Private_Laboratories.geojson',
format: new ol.format.GeoJSON(),
}),
style: Private_Laboratories
});


var gov_hospital = new ol.layer.Vector({
title: 'Government COVID19 Hospitals',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/Government_COVID_19_Hospitals.geojson',
format: new ol.format.GeoJSON(),
}),
style: Government_COVID_19_Hospitals
});

var pcmc_doctor_style = new ol.style.Style({
  image: new ol.style.Icon( ({
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
    src: 'Data/PCMC_Doc_Transparent.png'
  }))
});

      var mumbai_containment_Buffer_zone_style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0,0.4)'
        }),
        stroke: new ol.style.Stroke({
          color: '#00338d',
          width: 2
        })
      });


   var myStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: 'purple'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 255, 255)', width: 2
        })
      })
    })

   var pcmcbloodbank = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({color: 'red'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 255, 0)', width: 4
        })
      })
    })



var pcmc_bloodbank = new ol.layer.Vector({
title: 'PCMC Blood Bank Details',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/PCMC_Blood_Bank.geojson',
format: new ol.format.GeoJSON(),
}),
style: pcmcbloodbank
});


var mumbai_containment_zone = new ol.layer.Vector({
title: 'Mumbai Containment Zone',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/Mumbai_Containment_Zone.geojson',
format: new ol.format.GeoJSON(),
}),
          style: function(feature) {
          return myStyle;
        }
});







var mumbai_containment_Buffer_zone = new ol.layer.Vector({
title: 'mumbai containment Buffer zone',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/Mumbai_Containment_Zone_Buffer.geojson',
format: new ol.format.GeoJSON(),
}),
          style: function(feature) {
          return mumbai_containment_Buffer_zone_style;
        }
});

var pcmc_doctor = new ol.layer.Vector({
title: 'Pune Doctor Details',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/PCMC Doctors.geojson',
format: new ol.format.GeoJSON(),
}),
style: pcmc_doctor_style
});










var gov_labs =  new ol.layer.Vector({
        title: 'Government Laboratories',
		visible: false,
        source: new ol.source.Vector({
        ratio: 1,
        params: {'LAYERS': 'show:0'},    
		url: 'Data/Government_Laboratories.geojson',
		format: new ol.format.GeoJSON(),
    }),
	style: Government_Laboratories
})

    var Road = new ol.layer.Tile({
      title: 'Road (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'Road'
      })
    });


    var Road = new ol.layer.Tile({
      title: 'Road (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'Road'
      })
    });    
	var RoadOnDemand = new ol.layer.Tile({
      title: 'RoadOnDemand (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'RoadOnDemand'
      })
    });    
	var Aerial = new ol.layer.Tile({
      title: 'Aerial (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'Aerial'
      })
    });    
	var AerialWithLabels = new ol.layer.Tile({
      title: 'AerialWithLabels (Bing)',
	  visible:true,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'AerialWithLabels'
      })
    });
	
		var collinsBart = new ol.layer.Tile({
      title: 'collinsBart (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'collinsBart'
      })
    });
	
		var ordnanceSurvey = new ol.layer.Tile({
      title: 'ordnanceSurvey (Bing)',
	  visible:false,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'ordnanceSurvey'
      })
    });







var map = new ol.Map({
	controls: ol.control.defaults({ attribution: false }),
  layers: [
			new ol.layer.Group({
                title: 'Base maps',
				type: 'base',
				fold: 'close',
                layers: [
						new ol.layer.Tile({
                        title: 'OSM',
                        visible: false,
                        source: new ol.source.OSM(),
                    }),Aerial,AerialWithLabels,RoadOnDemand,Road, vectorLayer,DistConfCases]
			}),
				new ol.layer.Group({
                // A layer must have a title to appear in the layerswitcher
                title: 'Containment Zone',
                // Adding a 'fold' property set to either 'open' or 'close' makes the group layer
                // collapsible
                fold: 'close',
                layers: [mumbai_containment_Buffer_zone,mumbai_containment_zone]
            }),

            new ol.layer.Group({
                        // A layer must have a title to appear in the layerswitcher
                        title: 'City Wise Covid 19 Cases',
                        fold: 'close',
                        layers: [vectorConfCity,vectorHosCity,vectorRecoCity,vectorDeceCity
                        ]
            }),

            new ol.layer.Group({
                // A layer must have a title to appear in the layerswitcher
                title: 'Covid 19 Medical Facility',
                // Adding a 'fold' property set to either 'open' or 'close' makes the group layer
                // collapsible
                fold: 'close',
                layers: [gov_labs,gov_hospital,pvt_labs,pcmc_bloodbank,pcmc_doctor]
            })
			],
	
  target: 'map',
  view: new ol.View({
	center: maha,
    zoom: 6
  })
});


function popData(){
var countryPopVals = new Array();
vectorLayer.getSource().getFeatures().forEach(function(feat) {
countryPopVals.push(feat.get("To_Pop"))
});
console.info("countryPopVals",countryPopVals);
getAndSetClassesFromData(countryPopVals, 6, "method_CJ");
vectorLayer.setStyle(setStyle);
}


function distCases(){
var countryPopVals = new Array();
DistConfCases.getSource().getFeatures().forEach(function(feat) {
countryPopVals.push(feat.get("Conf_Cases"))
});
console.info("countryPopVals",countryPopVals);
getAndSetClassesFromDataConf(countryPopVals, 8, "method_CJ");
DistConfCases.setStyle(setStyleConf);
}



function getAndSetClassesFromData(data, numclasses, method) {
  var serie = new geostats(data);
  var legenLabel = ""; 
  if (method === "method_EI") {
    serie.getClassEqInterval(numclasses);
    methodLabel = "Equal Interval";
  } else if (method === "method_Q") {
    serie.getClassQuantile(numclasses);
    methodLabel = "Quantile";
  } else if (method === "method_SD") {
    serie.getClassStdDeviation(numclasses);
    methodLabel = "Standard Deviation ";
  } else if (method === "method_AP") {
    serie.getClassArithmeticProgression(numclasses);
    methodLabel = "Arithmetic Progression";
  } else if (method === "method_GP") {
    serie.getClassGeometricProgression(numclasses);
    methodLabel = "Geometric Progression ";
  } else if (method === "method_CJ") {
    serie.getClassJenks(numclasses);
    methodLabel = "Class Jenks";
  } else {
  alert("error: no such method.")
  }
 var colors_x = chroma.scale([colorFrom, colorTo]).colors(numclasses)

serie.setColors(colors_x);
classSeries = serie;
classColors = colors_x; 
}

function getAndSetClassesFromDataConf(data, numclasses, method) {
  var serie = new geostats(data);
  var legenLabel = ""; 
  if (method === "method_EI") {
    serie.getClassEqInterval(numclasses);
    methodLabel = "Equal Interval";
  } else if (method === "method_Q") {
    serie.getClassQuantile(numclasses);
    methodLabel = "Quantile";
  } else if (method === "method_SD") {
    serie.getClassStdDeviation(numclasses);
    methodLabel = "Standard Deviation ";
  } else if (method === "method_AP") {
    serie.getClassArithmeticProgression(numclasses);
    methodLabel = "Arithmetic Progression";
  } else if (method === "method_GP") {
    serie.getClassGeometricProgression(numclasses);
    methodLabel = "Geometric Progression ";
  } else if (method === "method_CJ") {
    serie.getClassJenks(numclasses);
    methodLabel = "Class Jenks";
  } else {
  alert("error: no such method.")
  }
 var colors_x = chroma.scale([colorFromConf, colorToConf]).colors(numclasses)

serie.setColors(colors_x);
classSeries = serie;
classColors = colors_x; 
}



function setStyle(feat,res) {
  var currVal = parseFloat(feat.get("To_Pop")); 
  var bounds = classSeries.bounds;
  var numRanges = new Array();
  for (var i = 0; i < bounds.length-1; i++) { 
  numRanges.push({
      min: parseFloat(bounds[i]),
      max: parseFloat(bounds[i+1])
    });  
  }  
  var classIndex = verifyClassFromVal(numRanges, currVal);
  var polyStyleConfig = {
    stroke: new ol.style.Stroke({
      color: 'rgb(255, 0, 0)',
      width: 1
    })
  };

  var textStyleConfig = {};
  if (classIndex !== -1) {
    polyStyleConfig = {
      stroke: new ol.style.Stroke({
        color: 'RGB(175,182,187)',
        width: 1
      }),
      fill: new ol.style.Stroke({
        color: hexToRgbA(classColors[classIndex],0.7)
      })
    };
    textStyleConfig = {
      text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: "#000000"
        }),
        stroke: new ol.style.Stroke({
          color: "#FFFFFF",
          width: 2
        })
      }),
      geometry: function(feature) {
        var retPoint;
        if (feature.getGeometry().getType() === 'MultiPolygon') {
          retPoint = getMaxPoly(feature.getGeometry().getPolygons()).getInteriorPoint();
        } else if (feature.getGeometry().getType() === 'Polygon') {
          retPoint = feature.getGeometry().getInteriorPoint();
        }
        
        return retPoint;
      }
    }
  };

  var textStyle = new ol.style.Style(textStyleConfig);
  var style = new ol.style.Style(polyStyleConfig);
  return [style, textStyle];
}



function setStyleConf(feat,res) {
  var currVal = parseFloat(feat.get("Conf_Cases")); 
  var bounds = classSeries.bounds;
  var numRanges = new Array();
  for (var i = 0; i < bounds.length-1; i++) { 
  numRanges.push({
      min: parseFloat(bounds[i]),
      max: parseFloat(bounds[i+1])
    });  
  }  
  var classIndex = verifyClassFromVal(numRanges, currVal);
  var polyStyleConfig = {
    stroke: new ol.style.Stroke({
      color: 'rgb(35, 165, 235)',
      width: 1
    })
  };

  var textStyleConfig = {};
  if (classIndex !== -1) {
    polyStyleConfig = {
      stroke: new ol.style.Stroke({
        color: 'RGB(175,182,187)',
        width: 1
      }),
      fill: new ol.style.Stroke({
        color: hexToRgbA(classColors[classIndex],0.7)
      })
    };
    textStyleConfig = {
      text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: "#000000"
        }),
        stroke: new ol.style.Stroke({
          color: "#FFFFFF",
          width: 2
        })
      }),
      geometry: function(feature) {
        var retPoint;
        if (feature.getGeometry().getType() === 'MultiPolygon') {
          retPoint = getMaxPoly(feature.getGeometry().getPolygons()).getInteriorPoint();
        } else if (feature.getGeometry().getType() === 'Polygon') {
          retPoint = feature.getGeometry().getInteriorPoint();
        }
        
        return retPoint;
      }
    }
  };

  var textStyle = new ol.style.Style(textStyleConfig);
  var style = new ol.style.Style(polyStyleConfig);
  return [style, textStyle];
}



function verifyClassFromVal(rangevals, val) {
  var retIndex = -1;
  for (var i = 0; i < rangevals.length; i++) {
    if (val >= rangevals[i].min && val <= rangevals[i].max) {
      retIndex = i;
    }
  }
  return retIndex;
}

function getMethod(){
var elem = document.getElementById("methodselector");
var val = elem.options[elem.selectedIndex].value;
return val;
}
function getClassNum(){
var elem = document.getElementById("classcount");
return parseInt(elem.value);
}

function hexToRgbA(hex,opacity) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ','+opacity+')';
  }
  throw new Error('Bad Hex');
}

function getMaxPoly(polys) {
  var polyObj = [];
  //now need to find which one is the greater and so label only this
  for (var b = 0; b < polys.length; b++) {
    polyObj.push({
      poly: polys[b],
      area: polys[b].getArea()
    });
  }
  polyObj.sort(function(a, b) {
    return a.area - b.area
  });

  return polyObj[polyObj.length - 1].poly;
}

function wordWrap(str, maxWidth) {
    var newLineStr = "\n"; done = false; res = '';
    do {                    
        found = false;
        // Inserts new line at first whitespace of the line
        for (i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

        if (str.length < maxWidth)
            done = true;
    } while (!done);

    return res;
}

function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
};

var highlightStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 1
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255,0,0,0.1)'
  }),
  text: new ol.style.Text({
    font: '12px Calibri,sans-serif',
    fill: new ol.style.Fill({
      color: '#000'
    }),
    stroke: new ol.style.Stroke({
      color: '#f00',
      width: 3
    })
  })
});


var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector(),
  map: map,
  style: function(feature) {
    highlightStyle.getText().setText(feature.get('DISTRICT'));
    return highlightStyle;
  }
});

var highlight;
var displayFeatureInfo = function(pixel) {

  var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  });

  var info = document.getElementById('');
  if (feature) {
    info.innerHTML = feature.get('DISTRICT') + ': ' + feature.get('To_Pop');
  } else {
    info.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }

};


	map.addControl(scaleControl());
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Legende',
        groupSelectStyle: 'children'
    });
    map.addControl(layerSwitcher);
	map.addControl(overviewMapControl);
	
 
	var fullscreen = new ol.control.FullScreen();
	map.addControl(fullscreen);	
	

var distfeature = vectorConfDist.getSource().getFeatures();
  
var container = document.getElementById('popup');
var content_element = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
   
   
   
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};


var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [0, -10]
});
map.addOverlay(overlay);

map.on('click', function(evt){
    var obj = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return [feature,layer];
      });

	
	    if (obj) {
        console.info("layer is",obj[1]);
        var feature =obj[0];
        var layer= obj[1];
        if(layer == pvt_labs){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('Name') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        }  
		
		
		else if(layer == gov_hospital){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('District') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
		content += '<h6>' + feature.get('Contact_No') + '</h6>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        }  
		
		
		else if(layer == gov_labs){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('DISTRICT') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        } 



else if(layer == pcmc_doctor){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
            var content = '<h5>' + feature.get('Name') + '</h5></br>';
        content += '<h6>' + feature.get('Match_addr') + '</h6></br>';
		content += '<h6>' + feature.get('USER_Mobil') + '</h6></br>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        }  	


		else if(layer == pcmc_bloodbank){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('Name_of_Bl') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
		content += '<h6>' + feature.get('Contact_No') + '</h6></br>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        }  
		 		
	
    }
	
	
	
	
	
	
	
});




map.on('pointermove', function(e) {
    if (e.dragging) return;
       
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});





