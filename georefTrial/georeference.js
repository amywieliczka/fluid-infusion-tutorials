/*
Copyright 2011 University of California, Berkeley; Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, window, cspace:true*/
"use strict";

var cspace = cspace || {};

(function ($, fluid) {   
    
    fluid.defaults("cspace.georeference", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
			georefBtn: ".csc-georefBtn",
            georefSrc: ".csc-georeferenceSrc",
			
			georefLatitude: ".csc-georefLatitude",
			georefLongitude: ".csc-georefLongitude",
			georefDatum: ".csc-georefDatum",
			georefUncertainty: ".csc-georefUncertainty",
			georefUncertaintyUnits: ".csc-georefUncertaintyUnits",
			georefProtocol: ".csc-georefProtocol",
            georefRemarks: ".csc-georefRemarks"
		},
		model: {
			source: "Troy",
			latitude: "",
			longitude: "",
			datum: "",
			uncertainty: "",
			uncertaintyUnits: "",
			protocol: "",
			remarks: ""
		},
		events: {
			onGeoRef: null,
		},
		produceTree: "cspace.georeference.produceTree",
		finalInitFunction: "cspace.georeference.finalInit",
		renderOnInit: true
	});
	
	cspace.georeference.produceTree = function (that) {
		return {
			georefSrc: "${source}",
			georefLatitude: "${latitude}",
			georefLongitude: "${longitude}",
			georefDatum: {
			    optionnames: ["Please select a value", "Not Recorded", "ADG66", "NAD27", "NAD83", "NAD83&WGS84", "WGS84"],
			    optionlist: ["", "Not Recorded", "ADG66", "NAD27", "NAD83", "NAD83&WGS84", "WGS84"],
			    selection: "${datum}"
			},
			georefUncertainty: "${uncertainty}",
			georefUncertaintyUnits: {
			    optionnames: ["Please select a value", "unknown", "feet", "kilometers", "meters", "miles"],
			    optionlist: ["", "unknown", "feet", "kilometers", "meters", "miles"],
			    selection: "${uncertaintyUnits}"
			},
			georefProtocol: {
			    optionnames: ["Please select a value", "Chapman, Wieczorek 2006, Guide to Best Practices for Georeferencing", "MaNIS/HerpNet/ORNIS Georeferencing Guidelines", "Georeferencing For Dummies", "BioGeomancer", "Google Maps GeoCoding Service API v3"],
			    optionlist: ["", "chapman-wieczorek-2006-guide-best-practices-georeferencing", "manis-herpnet-ornis-georeferencing-guidelines", "georeferencing-dummies", "biogeomancer", "Google Maps GeoCoding Service API v3"],
			    selection: "${protocol}"
			},
			georefRemarks: "${remarks}",
			georefBtn: {
				decorators: [{
					type: "jQuery",
					func: "click",
					args: (
					    function() { 
					        //calls georefjs - passing an anonymous callback func that takes an array of georef objects
					        georefjs.googleGeoref(that.model.source, function(georefs) { 
					            //anonymous func basically a wrapper for displayMap function in order to add additional 
					            //source context and function context (populateTargetFields) to the array of georef objects
					            //displayMap displays a map for the user to choose one georef object from, then calls
					            //populateTargetFields with the selected georef object as the parameter
					            displayMap(that.model.source, georefs, function (result) {
                                        that.applier.requestChange("latitude", result.decimalLatitude);
                                        that.applier.requestChange("longitude", result.decimalLongitude);
                                        that.applier.requestChange("datum", result.geodeticDatum);
                                        that.applier.requestChange("uncertainty", result.coordinateUncertaintyInMeters);
                                        that.applier.requestChange("uncertaintyUnits", "meters");
                                        that.applier.requestChange("protocol", result.georeferenceProtocol);                             
                                        that.applier.requestChange("remarks", result.georeferenceRemarks);
                                        that.refreshView();
                                        $(that.options.selectors.georefLatitude).css({"background": "#fffbbb"});
                                        $(that.options.selectors.georefLongitude).css({"background": "#fffbbb"});
                                        $(that.options.selectors.georefDatum).css({"background": "#fffbbb"});                                
                                        $(that.options.selectors.georefUncertainty).css({"background": "#fffbbb"});
                                        $(that.options.selectors.georefUncertaintyUnits).css({"background": "#fffbbb"});
                                        $(that.options.selectors.georefProtocol).css({"background": "#fffbbb"});
                                        $(that.options.selectors.georefRemarks).css({"background": "#fffbbb"});	    
                                });
					        });
					    }
                    )
                }]
			}
		};
	}
		
	var displayMap = function (source, georefs, callback) {
	    var location = new google.maps.LatLng(georefs[0].decimalLatitude, georefs[0].decimalLongitude);
        var bounds = new google.maps.LatLngBounds();
        var radius, contentString;
        var markers = [];
        var circles = [];
        
        function georefMarkerAssignment(marker, content) {
            var infowindow = new google.maps.InfoWindow({
                content: content
            });
            
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });
        }
        
        function georefBindSelectClick(id) {
            var infowindowId = ".csc-select-" + id;
            $(infowindowId).live('click', function(e) {
                callback(georefs[id]);
            });
        }
        
      	var map = new google.maps.Map($('.map')[0], {zoom: 4, center: location, mapTypeId: google.maps.MapTypeId.ROADMAP});
        
        for (i=0; i<georefs.length; i++) {
            location = new google.maps.LatLng(georefs[i].decimalLatitude, georefs[i].decimalLongitude);
            map.setCenter(location);
            
            radius = georefs[i].coordinateUncertaintyInMeters;
            contentString = source + '<br>' + georefs[i].print() + '<br>' + 
                '<a href="#" class="csc-select-' + i +'">Select This</a>';
                                                
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                title: source
            });
            
            georefMarkerAssignment(marker, contentString);

            georefBindSelectClick(i);
                                                
            var circle = new google.maps.Circle({
                map: map,
                radius: radius,
                fillColor: '#ff00dd',
                fillOpacity: 0.05,
                strokeOpacity: 0.5,
                strokeWidth: 1,
                strokeColor: '#ff00dd',
                clickable: false
            });
            
            circle.bindTo('center', marker, 'position');
            
            markers.push(marker);
            circles.push(circle);
            
            var b = circle.getBounds();
            bounds.extend(b.getNorthEast());
            bounds.extend(b.getSouthWest());
        }
        
        map.fitBounds(bounds);
        
	}
	
    cspace.georeference.finalInit = function (that) {};
		
})(jQuery, fluid_1_4);