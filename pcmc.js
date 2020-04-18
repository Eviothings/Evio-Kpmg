
var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;
var maha = ol.proj.fromLonLat([73.794,18.635]);



var overviewMapControl = new ol.control.OverviewMap({
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
	visible: true,
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
      var style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#00338d',
          width: 2
        }),
        text: new ol.style.Text({
          font: '12px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#00338d',
            width: 3
          })
        })
      });


var PCMC_Ward = new ol.layer.Vector({
	title: 'PCMC Region',
	visible: true,
  source: new ol.source.Vector({
    url: 'Data/PCMC Ward Boundary.geojson',
    format: new ol.format.GeoJSON()
  }),
          style: function(feature) {
          return style;
        }
});







var pcmc_doctor_style = new ol.style.Style({
  image: new ol.style.Icon( ({
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
    src: 'Data/PCMC_Doc_Transparent.png'
  }))
});







var pcmc_doctor = new ol.layer.Vector({
title: 'Doctor Details',
visible: true,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/PCMC Doctors.geojson',
format: new ol.format.GeoJSON(),
}),
style: pcmc_doctor_style
});





   var pcmcbloodbank = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({color: 'red'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 255, 0)', width: 4
        })
      })
    })
	
	   var pcmc_hos = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({color: 'blue'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 0, 0)', width: 4
        })
      })
    })
	   var pcmc_med_col = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({color: 'orange'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0)', width: 4
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
	
	
	var pcmc_hospitals = new ol.layer.Vector({
title: 'PCMC Hospital Details',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/pune/Hospitals.geojson',
format: new ol.format.GeoJSON(),
}),
style: pcmc_hos
});


	var pcmc_med_collages = new ol.layer.Vector({
title: 'PCMC Medical Collages',
visible: false,
source: new ol.source.Vector({
ratio: 0,
params: {'LAYERS': 'show:0'},    
url: 'Data/pune/Medical_Colleges.geojson',
format: new ol.format.GeoJSON(),
}),
style: pcmc_med_col
});
	
	
	var AerialWithLabels = new ol.layer.Tile({
      title: 'AerialWithLabels (Bing)',
	  visible:true,
      source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'AerialWithLabels'
      })
    });



var map = new ol.Map({
	controls: ol.control.defaults({ attribution: false }),
  layers: [
			new ol.layer.Group({
                title: 'Base maps',
				type: 'base',
                layers: [
						new ol.layer.Tile({
                        title: 'OSM',
                        visible: false,
                        source: new ol.source.OSM(),
                    }),AerialWithLabels, PCMC_Ward]
			}),pcmc_bloodbank,pcmc_doctor,pcmc_hospitals,pcmc_med_collages
			
			],
	
  target: 'map',
  view: new ol.View({
	center: maha,
    zoom: 12
  })
});






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
        if(layer == pcmc_doctor){
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
		 
			
		else if(layer == pcmc_hospitals){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('Name_of_Ho') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
		content += '<h6>' + feature.get('Contact_No') + '</h6></br>';
        
        content_element.innerHTML = content;
        overlay.setPosition(coord);

        } 
		
		
		else if(layer == pcmc_med_collages){
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h5>' + feature.get('College_Na') + '</h5></br>';
        content += '<h6>' + feature.get('Address') + '</h6></br>';
        
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





