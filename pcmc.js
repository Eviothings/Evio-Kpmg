
var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;
var maha = ol.proj.fromLonLat([73.864671, 18.517077]);


var classSeries;
var classColors;
//color start from
var colorFrom = 'b5d0ff';
//color end to
var colorTo= '00338d';


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
        center: maha,
        maxZoom: 2,
        minZoom: 1.7,
        zoom: 2
    }),
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: false,
});



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
    var radius = 5 + 20 * (0.001);

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
        radius = 0.002 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
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
    title: 'Hospitalized',
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
    title: 'Hospitalized',
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
    title: 'Recovered',
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
    title: 'Recovered',
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
    title: 'Deceased',
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
    title: 'Deceased',
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
    title: 'Confirmed',
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
    title: 'Confirmed ',
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
        color: 'rgba(255, 255, 255, 0.7)'
    }),
    stroke: new ol.style.Stroke({
        color: '#808080',
        width: 2
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#808080',
            width: 3
        })
    })
});



var labelStyle = new ol.style.Style({
    geometry: function (feature) {
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
        color: 'rgba(255, 255, 255, 0.7)'
    }),
    stroke: new ol.style.Stroke({
        color: '#afb6bb',
        width: 1
    })
});

var style = [countryStyle, labelStyle];

var PCMC_Ward = new ol.layer.Vector({
    title: 'PMC Region',
    visible: true,
    source: new ol.source.Vector({
        url: 'Data/pune/Pune Ward Boundary.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        labelStyle.getText().setText(feature.get('Ward'));
        return style;
    }
});


var CCC_Ward_mapping = new ol.layer.Vector({
    title: 'CCC Ward mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/Pune Ward Boundary.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#ebb93e'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });

        var S2 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#80b8e9'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S3 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#e9658f'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S4 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#98bc76'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S5 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#7637a0'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var NOA = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(255,0,0)'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });


        if (feature.get('CCC_Color_') == "1") {
            return [S1];
        } else if (feature.get('CCC_Color_') == "2") {
            return [S2];
        }
        else if (feature.get('CCC_Color_') == "3") {
            return [S3];
        }
        else if (feature.get('CCC_Color_') == "4") {
            return [S4];
        }
        else if (feature.get('CCC_Color_') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});


var DCHC_Ward_mapping = new ol.layer.Vector({
    title: 'DCHC Ward mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/Pune Ward Boundary.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#ebb93e'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });

        var S2 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#80b8e9'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S3 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#e9658f'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S4 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#98bc76'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S5 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#7637a0'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var NOA = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(255,0,0)'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });


        if (feature.get('DCHC_Color') == "1") {
            return [S1];
        } else if (feature.get('DCHC_Color') == "2") {
            return [S2];
        }
        else if (feature.get('DCHC_Color') == "3") {
            return [S3];
        }
        else if (feature.get('DCHC_Color') == "4") {
            return [S4];
        }
        else if (feature.get('DCHC_Color') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});

var DHC_Ward_mapping = new ol.layer.Vector({
    title: 'DHC Ward mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/Pune Ward Boundary.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#ebb93e'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });

        var S2 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#80b8e9'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S3 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#e9658f'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S4 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#98bc76'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var S5 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#7637a0'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });
        var NOA = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(255,0,0)'
            }),
            stroke: new ol.style.Stroke({
                color: '#808080'
            })
        });


        if (feature.get('DHC_Color') == "1") {
            return [S1];
        } else if (feature.get('DHC_Color') == "2") {
            return [S2];
        }
        else if (feature.get('DHC_Color') == "3") {
            return [S3];
        }
        else if (feature.get('DHC_Color') == "4") {
            return [S4];
        }
        else if (feature.get('DHC_Color') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});



var ccc_point_style = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: 'rgb(255,255,0)' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0)', width: 2
        })
    })
})

var CCC_Point = new ol.layer.Vector({
    title: 'CCC',
    visible: true,
    source: new ol.source.Vector({
        url: 'Data/pune/CCC.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: ccc_point_style
});


var dchc_point_style = new ol.style.Style({
    image: new ol.style.RegularShape({
        points: 3,
        radius: 10,
        angle: 0,
        fill: new ol.style.Fill({ color: 'rgb(255,0,0)' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0)', width: 2
        })
    })
})

var DCHC_Point = new ol.layer.Vector({
    title: 'DCHC',
    visible: true,
    source: new ol.source.Vector({
        url: 'Data/pune/DCHC.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: dchc_point_style
});


var dhc_point_style = new ol.style.Style({
    image: new ol.style.RegularShape({
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0,
        fill: new ol.style.Fill({ color: 'rgb(0,255,0)' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0)', width: 2
        })
    })
})

var DHC_Point = new ol.layer.Vector({
    title: 'DHC',
    visible: true,
    source: new ol.source.Vector({
        url: 'Data/pune/DHC.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: dhc_point_style
});

var CCC_Faility_Mapping = new ol.layer.Vector({
    title: 'CCC faility mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/CCC.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#ebb93e' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });

        var S2 = new ol.style.Style({

            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#80b8e9' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S3 = new ol.style.Style({

            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#e9658f' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S4 = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#98bc76' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S5 = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#7637a0' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var NOA = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: 'rgb(255,0,0)' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });


        if (feature.get('Color_Code') == "1") {
            return [S1];
        } else if (feature.get('Color_Code') == "2") {
            return [S2];
        }
        else if (feature.get('Color_Code') == "3") {
            return [S3];
        }
        else if (feature.get('Color_Code') == "4") {
            return [S4];
        }
        else if (feature.get('Color_Code') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});

var DCHC_Faility_Mapping = new ol.layer.Vector({
    title: 'DCHC faility mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/DCHC.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: '#ebb93e' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });

        var S2 = new ol.style.Style({

            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: '#80b8e9' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S3 = new ol.style.Style({

            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: '#e9658f' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S4 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: '#98bc76' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S5 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: '#7637a0' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var NOA = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 3,
                radius: 10,
                angle: 0,
                fill: new ol.style.Fill({ color: 'rgb(255,0,0)' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });


        if (feature.get('Color_Code') == "1") {
            return [S1];
        } else if (feature.get('Color_Code') == "2") {
            return [S2];
        }
        else if (feature.get('Color_Code') == "3") {
            return [S3];
        }
        else if (feature.get('Color_Code') == "4") {
            return [S4];
        }
        else if (feature.get('Color_Code') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});


var DHC_Faility_Mapping = new ol.layer.Vector({
    title: 'DHC faility mapping',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/DHC.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        var S1 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: '#ebb93e' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });

        var S2 = new ol.style.Style({

            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: '#80b8e9' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S3 = new ol.style.Style({

            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: '#e9658f' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S4 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: '#98bc76' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var S5 = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: '#7637a0' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });
        var NOA = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0,
                fill: new ol.style.Fill({ color: 'rgb(255,0,0)' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0)', width: 2
                })
            })
        });


        if (feature.get('Color_Code') == "1") {
            return [S1];
        } else if (feature.get('Color_Code') == "2") {
            return [S2];
        }
        else if (feature.get('Color_Code') == "3") {
            return [S3];
        }
        else if (feature.get('Color_Code') == "4") {
            return [S4];
        }
        else if (feature.get('Color_Code') == "5") {
            return [S5];
        }
        else {
            return [NOA];
        }



    }
});



var pcmc_doctor_style = new ol.style.Style({
    image: new ol.style.Icon(({
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1,
        src: 'Data/PCMC_Doc_Transparent.png'
    }))
});


var pune_containment_Buffer_zone_style = new ol.style.Style({
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
        fill: new ol.style.Fill({ color: 'purple' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 255, 255)', width: 2
        })
    })
})


var pune_containment_zone = new ol.layer.Vector({
    title: 'PMC Containment Zone',
    visible: true,
    source: new ol.source.Vector({
        ratio: 0,
        params: { 'LAYERS': 'show:0' },
        url: 'Data/pune/Containment_Zones_Point.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: function (feature) {
        return myStyle;
    }
});


var pune_containment_Buffer_zone = new ol.layer.Vector({
    title: 'PMC containment Buffer zone',
    visible: true,
    source: new ol.source.Vector({
        ratio: 0,
        params: { 'LAYERS': 'show:0' },
        url: 'Data/pune/Containment_Zones_Buffer.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: function (feature) {
        return pune_containment_Buffer_zone_style;
    }
});


var pune_containment_Road = new ol.layer.Vector({
    title: 'PMC containment zone road',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/Containment_Zones_Road.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        })
    })
});


var pune_Road = new ol.layer.Vector({
    title: 'PMC Road',
    visible: false,
    source: new ol.source.Vector({
        url: 'Data/pune/PMC Road.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
        })
    })
});


var pcmc_doctor = new ol.layer.Vector({
    title: 'Doctor Details',
    visible: true,
    source: new ol.source.Vector({
        ratio: 0,
        params: { 'LAYERS': 'show:0' },
        url: 'Data/PCMC Doctors.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: pcmc_doctor_style
});





var pcmcbloodbank = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: 'red' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 255, 0)', width: 4
        })
    })
})

var pcmc_hos = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: 'blue' }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0)', width: 4
        })
    })
})
var pcmc_med_col = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: 'orange' }),
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
        params: { 'LAYERS': 'show:0' },
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
        params: { 'LAYERS': 'show:0' },
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
        params: { 'LAYERS': 'show:0' },
        url: 'Data/pune/Medical_Colleges.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: pcmc_med_col
});


var AerialWithLabels = new ol.layer.Tile({
    title: 'AerialWithLabels (Bing)',
    visible: true,
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
            fold: 'open',
            layers: [
                new ol.layer.Tile({
                    title: 'OSM',
                    visible: false,
                    source: new ol.source.OSM(),
                }), AerialWithLabels, PCMC_Ward, CCC_Point, DCHC_Point, DHC_Point]
        }),
        new ol.layer.Group({
            title: 'Medical Facility Mapping',
            visible: false,
            fold: 'close',
            layers: [DHC_Ward_mapping, DHC_Faility_Mapping, DCHC_Ward_mapping, DCHC_Faility_Mapping, CCC_Ward_mapping, CCC_Faility_Mapping]
        }),
        new ol.layer.Group({
            title: 'PMC Containment Zone',
            fold: 'close',
            layers: [pune_containment_Buffer_zone, pune_containment_zone]
        }),

        new ol.layer.Group({
            title: 'PMC Road',
            fold: 'close',
            layers: [pune_containment_Road, pune_Road]
        })

    ],

    target: 'map',
    view: new ol.View({
        center: maha,
        zoom: 11
    })
});


function wardCases() {
    var wardConfCases = new Array();
    PCMC_Ward.getSource().getFeatures().forEach(function (feat) {
        wardConfCases.push(feat.get("Corona_Pat"))
    });
    console.info("wardConfCases", wardConfCases);
    getAndSetClassesFromDataConf(wardConfCases, 8, "method_CJ");
    PCMC_Ward.setStyle(setStyle);
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
    var colors_x = chroma.scale([colorFrom, colorTo]).colors(numclasses)

    serie.setColors(colors_x);
    classSeries = serie;
    classColors = colors_x;
}


function setStyle(feat, res) {
    var currVal = parseFloat(feat.get("Corona_Pat"));
    var bounds = classSeries.bounds;
    var numRanges = new Array();
    for (var i = 0; i < bounds.length - 1; i++) {
        numRanges.push({
            min: parseFloat(bounds[i]),
            max: parseFloat(bounds[i + 1])
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
                color: hexToRgbA(classColors[classIndex], 0.7)
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
            geometry: function (feature) {
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

function getMethod() {
    var elem = document.getElementById("methodselector");
    var val = elem.options[elem.selectedIndex].value;
    return val;
}
function getClassNum() {
    var elem = document.getElementById("classcount");
    return parseInt(elem.value);
}

function hexToRgbA(hex, opacity) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
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
    polyObj.sort(function (a, b) {
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

closer.onclick = function () {
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

map.on('click', function (evt) {
    var obj = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return [feature, layer];
        });


    if (obj) {
        console.info("layer is", obj[1]);
        var feature = obj[0];
        var layer = obj[1];
        if (layer == DCHC_Point) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();

            var content = '<h5> DCHC: </br>' + feature.get('Name_Cente') + '</h5>';
            content += '<h6> Catagory: ' + feature.get('Pvt_Govt') + '</h6>';
            content += '<h6> Capacity: ' + feature.get('Capacity') + '</h6>';
            content += '<h6> ICU: ' + feature.get('ICU') + '</h6>';
            content += '<h6> DR Name: ' + feature.get('Dr_Incharg') + '</h6>';
            content += '<h6> Contact No: ' + feature.get('Mob_No') + '</h6>';

            content_element.innerHTML = content;
            overlay.setPosition(coord);

        }


        else if (layer == DHC_Point) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();

            var content = '<h5> DHC: </br>' + feature.get('Name_Cente') + '</h5>';
            content += '<h6> Catagory: ' + feature.get('Pvt_Govt') + '</h6>';
            content += '<h6> Capacity: ' + feature.get('Capacity') + '</h6>';
            content += '<h6> ICU: ' + feature.get('ICU') + '</h6>';
            content += '<h6> DR Name: ' + feature.get('Dr_Incharg') + '</h6>';
            content += '<h6> Contact No: ' + feature.get('Mob_No') + '</h6>';

            content_element.innerHTML = content;
            overlay.setPosition(coord);

        }


        else if (layer == CCC_Point) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();

            var content = '<h5> CCC: </br>' + feature.get('Name_Cente') + '</h5>';
            content += '<h6> Catagory: ' + feature.get('Pvt_Govt') + '</h6>';
            content += '<h6> Capacity: ' + feature.get('Capacity') + '</h6>';
            content += '<h6> ICU: ' + feature.get('ICU') + '</h6>';
            content += '<h6> DR Name: ' + feature.get('Dr_Incharg') + '</h6>';
            content += '<h6> Contact No: ' + feature.get('Mob_No') + '</h6>';

            content_element.innerHTML = content;
            overlay.setPosition(coord);

        }


        else if (layer == pcmc_med_collages) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();

            var content = '<h5>' + feature.get('College_Na') + '</h5></br>';
            content += '<h6>' + feature.get('Address') + '</h6></br>';

            content_element.innerHTML = content;
            overlay.setPosition(coord);

        }
    }







});




map.on('pointermove', function (e) {
    if (e.dragging) return;

    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);

    map.getTarget().style.cursor = hit ? 'pointer' : '';
});





