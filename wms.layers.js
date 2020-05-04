var scaleType = 'scalebar';
var control;
var maha = ol.proj.fromLonLat([78.2787984, 18.7615761]);
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





var layerOSM = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base',
    visible:false,
    source: new ol.source.OSM(),
    
});


var Road = new ol.layer.Tile({
    title: 'Road (Bing)',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'Road'
    })
});
var RoadOnDemand = new ol.layer.Tile({
    title: 'RoadOnDemand (Bing)',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'RoadOnDemand'
    })
});
var Aerial = new ol.layer.Tile({
    title: 'Aerial (Bing)',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'Aerial'
    })
});
var AerialWithLabels = new ol.layer.Tile({
    title: 'AerialWithLabels (Bing)',
    type: 'base',
    visible: true,
    source: new ol.source.BingMaps({
        key: 'ArMwcis2TGCT6zVWlZwbGBhkv2rF0IZ94AcvJi9aQNpGWsoLHmQ60TT2dQbE1Dyj',
        imagerySet: 'AerialWithLabels'
    })
});



var Mah_district = new ol.layer.Image({
    title: 'Maharashtra District',
    visible:true,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'MH_Districts',
            transparent: true
        }
    })
}); 

var Dist_Conf_Polygon = new ol.layer.Image({
    title: 'District wise confirmed cases',
    visible: false,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'MH_Districts,Dist_Conf_Polygon',
            transparent: true
        }
    })
});

var City_Conf_Point = new ol.layer.Image({
    title: 'City wise confirmed cases',
    visible: false,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'City_Conf_Point',
            transparent: true
        }
    })
}); 

var City_Hospi_Point = new ol.layer.Image({
    title: 'City wise Hospitalized Cases',
    visible: false,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'City_Hospi_Point',
            transparent: true
        }
    })
}); 

var City_Recov_Point = new ol.layer.Image({
    title: 'City wise recovered cases ',
    visible: false,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'City_Recov_Point',
            transparent: true
        }
    })
}); 

var City_Deces_Point = new ol.layer.Image({
    title: 'City wise Deceased cases',
    visible: false,
    source: new ol.source.ImageWMS({
        url: 'http://eviothings.in/cgi-bin/mapserv?map=%2Fvar%2Fwww%2Fhtml%2Fmapserverdemo%2Fcovid%2Fmaharashtra.map',
        params: {
            'LAYERS': 'City_Deces_Point',
            transparent: true
        }
    })
}); 


var map = new ol.Map({
    controls: ol.control.defaults({ attribution: false }),
    layers: [
        new ol.layer.Group({
            title: 'Base maps',
            fold: 'close',
            layers: [
                layerOSM,Road, RoadOnDemand, Aerial,AerialWithLabels
            ]
        }),
        new ol.layer.Group({
            title: 'WMS',
            fold: 'close',
            layers: [
                Mah_district, Dist_Conf_Polygon , City_Conf_Point , City_Hospi_Point , City_Recov_Point , City_Deces_Point,
            ]
        })
    ],

    target: 'map',
    renderer: 'canvas',
    view: new ol.View({
        projection: 'EPSG:4326',
        center: [76, 19],
        zoom: 6
    })
});



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
        projection: 'EPSG:4326',
        center: [76,20],
        maxZoom: 2,
        minZoom: 1.7,
        zoom: 2
    }),
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: false,
});


var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Legende',
    groupSelectStyle: 'children'
});
map.addControl(layerSwitcher);

map.addControl(scaleControl());

map.addControl(overviewMapControl);


var fullscreen = new ol.control.FullScreen();
map.addControl(fullscreen);	