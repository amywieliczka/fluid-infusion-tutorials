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
			source: "santa cruz, ca",
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
			georefDatum: "${datum}",
			georefUncertainty: "${uncertainty}",
			georefUncertaintyUnits: "${uncertaintyUnits}",
			georefProtocol: "${protocol}",
			georefRemarks: "${remarks}",
			georefBtn: {
				decorators: [{
					type: "jQuery",
					func: "click",
					args: (
					    function() { 
					        georefjs.googleGeoref(that.model.source, function(val) {
					            that.applier.requestChange("latitude", val[0].decimalLatitude);
					            that.applier.requestChange("longitude", val[0].decimalLongitude);
					            that.applier.requestChange("uncertainty", val[0].coordinateUncertaintyInMeters);
					            that.applier.requestChange("remarks", val[0].georeferenceRemarks);
					            that.refreshView();
					            $(that.options.selectors.georefLatitude).css({"background": "#fffbbb"});
					            $(that.options.selectors.georefLongitude).css({"background": "#fffbbb"});
					            $(that.options.selectors.georefUncertainty).css({"background": "#fffbbb"});
					            $(that.options.selectors.georefRemarks).css({"background": "#fffbbb"});
					        });
					    }
					)
				}]
			}
		};
	}
	
    cspace.georeference.finalInit = function (that) {};
		
})(jQuery, fluid_1_4);