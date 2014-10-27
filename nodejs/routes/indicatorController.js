var cache = require('memory-cache');
var mongodb = require('../data/mongodb');
var indicator = require('../data/indicator');
var async = require('../lib/async');
var IndicatorSchema = indicator.Indicator;

exports.searchIndicator = function(req, res) {
	var query = require('url').parse(req.url, true).query;
	var indicatorResultJSON = {};
	if (query.query != null) {
		var input = query.query;
		var keys = input.split(' ');
		var dimensions = [];
		var results = [];
		var callbackFuncArray = [];
		keys.forEach(function(key, index) {
			if (key.length > 0) {
				var callbackFunc = function(callback) {
					IndicatorSchema.find({
						indicator_text : {
							$regex : key,
							$options : 'i'
						}
					}, function(err, doc) {
						if (err)
							console.log('Exception: ' + err);
						console.log(key + ':' + doc.length);
						doc.forEach(function(item, index) {
							var tempJson = {
								"uniqueName" : item.indicator_key,
								"text" : item.indicator_text + ' - ' + item.data_source,
								"dimensionStr" : genDimStr(item.dimension)
							};
							results.push(tempJson);
						});
						// match dimension value
						// if (doc.length === 0 && key.length > 2) {
						// var dims = cache.get('dimensions');
						// dims.forEach(function(d) {
						// if ((d.dimension_value +
						// '').toLowerCase().indexOf(key.toLowerCase()) > -1) {
						// dimensions.push(d);
						// }
						// });
						// }
						callback();
					});
				}
				callbackFuncArray.push(callbackFunc);
			}
		});
		async.parallel(callbackFuncArray, function() {
			console.log('matched results count: ' + results.length);
			// console.log('matched dimension value count: ' +
			// dimensions.length);
			// results.forEach(function(r) {
			// dimensions.forEach(function(d) {
			// if (r.dimensionStr.indexOf(d.dimension_key) > -1) {
			// r.text = d.dimension_value + ' - ' + r.text;
			// r.uniqueName = r.uniqueName + '///' + d.dimension_key + '///' +
			// d.dimension_value;
			// results.push(r);
			// }
			// });
			// });
			indicatorResultJSON = {
				"indicators" : results
			};
			// console.log(indicatorResultJSON);
			res.send(indicatorResultJSON);
		});
	} else {
		indicatorResultJSON = {
			"indicators" : []
		};
		res.send(indicatorResultJSON);
	}
};

var genDimStr = function(dimensionArray) {
	var dimensionStr = '';
	dimensionArray.forEach(function(d) {
		dimensionStr += d.dimension_key;
	});
	return dimensionStr;
}
