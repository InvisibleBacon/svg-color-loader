var SVGO = require("svgo");

function rgbToHex(r, g, b) {
	return "#" + toHex(r) + toHex(g) + toHex(b);
}

function toHex(value) {
	var hex = parseInt(value).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

module.exports = function(content) {
	this.cacheable && this.cacheable();
	var callback = this.async();

	var query = this.resourceQuery.substring(1).split("=");
	if (query[0] == "fill") {
		var color = rgbToHex.apply(this, query[1].split("|"));
		
		new SVGO({
			plugins: [
				{
					"ReFillColors": {
						type: "perItem",
						fn: function(item) {
							if (item.isElem(["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"]))
								item.addAttr({ name: "fill", value: color, prefix: "", local: "fill" });
						}
					}
				},
				{
					"ViewBoxToWidthHeight": {
						type: "perItem",
						fn: function(item) {
							//A lot of code here came from: https://github.com/svg/svgo/blob/master/plugins/removeViewBox.js
							var regViewBox = /^0\s0\s([\-+]?\d*\.?\d+([eE][\-+]?\d+)?)\s([\-+]?\d*\.?\d+([eE][\-+]?\d+)?)$/;
							if (item.isElem("svg") && item.hasAttr("viewBox")) {
								var match = item.attr("viewBox").value.match(regViewBox);
								if (match) {
									var width = match[1];
									var height = match[3];

									item.addAttr({ name: "width", value: width, prefix: "", local: "width" });
									item.addAttr({ name: "height", value: height, prefix: "", local: "height" });

									item.removeAttr("viewBox");
								}
							}
						}
					}
				}
			]
		}).optimize(content.toString(), function(result) {
			callback(null, "module.exports = " + JSON.stringify("data:image/svg+xml;base64," + new Buffer(result.data).toString("base64")));
		});
	}
}
module.exports.raw = true;
