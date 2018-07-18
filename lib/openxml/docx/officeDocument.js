"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.OfficeDocument = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _part = require("../part");

var _part2 = _interopRequireDefault(_part);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OfficeDocument = exports.OfficeDocument = function (_Part) {
	_inherits(OfficeDocument, _Part);

	function OfficeDocument() {
		_classCallCheck(this, OfficeDocument);

		return _possibleConstructorReturn(this, (OfficeDocument.__proto__ || Object.getPrototypeOf(OfficeDocument)).apply(this, arguments));
	}

	_createClass(OfficeDocument, [{
		key: "_init",
		value: function _init() {
			var _this2 = this;

			_get(OfficeDocument.prototype.__proto__ || Object.getPrototypeOf(OfficeDocument.prototype), "_init", this).call(this);
			var supported = "styles,numbering,theme,settings".split(",");
			this.rels("Relationship[Target$=\".xml\"]").each(function (i, rel) {
				var $ = _this2.rels(rel);
				var type = $.attr("Type").split("/").pop();
				if (supported.indexOf(type) != -1) {
					var target = $.attr("Target");
					Object.defineProperty(_this2, type, {
						get: function get() {
							return this.getRelObject(target);
						}
					});
				}
			});
		}
	}, {
		key: "render",
		value: function render(createElement) {
			var identify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OfficeDocument.identify;

			if (this.styles) this.renderNode(this.styles("w\\:styles").get(0), createElement, identify);
			if (this.numbering) this.renderNode(this.numbering("w\\:numbering").get(0), createElement, identify);
			return this.renderNode(this.content("w\\:document").get(0), createElement, identify);
		}
	}, {
		key: "parse",
		value: function parse(domHandler) {
			var identify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : officeDocument.identify;

			var doc = {};
			var createElement = domHandler.createElement.bind(domHandler);
			function _identify() {
				var model = identify.apply(undefined, arguments);
				if (model && (typeof model === "undefined" ? "undefined" : _typeof(model)) == "object") {
					domHandler.emit.apply(domHandler, ["*", model].concat(Array.prototype.slice.call(arguments)));
					domHandler.emit.apply(domHandler, [model.type, model].concat(Array.prototype.slice.call(arguments)));
					if (domHandler["on" + model.type]) domHandler["on" + model.type].apply(domHandler, [model].concat(Array.prototype.slice.call(arguments)));
				}
				return model;
			}

			if (this.styles) doc.styles = this.renderNode(this.styles("w\\:styles").get(0), createElement, _identify);
			if (this.numbering) doc.numbering = this.renderNode(this.numbering("w\\:numbering").get(0), createElement, _identify);
			doc.document = this.renderNode(this.content("w\\:document").get(0), createElement, _identify);
			return doc;
		}
	}], [{
		key: "identify",
		value: function identify(wXml, officeDocument) {
			var tag = wXml.name.split(":").pop();
			if (identities[tag]) return identities[tag].apply(identities, arguments);

			return tag;
		}
	}]);

	return OfficeDocument;
}(_part2.default);

exports.default = OfficeDocument;


var identities = {
	document: function document(wXml, officeDocument) {
		var $ = officeDocument.content;
		var current = null;
		var children = $("w\\:sectPr").each(function (i, sect) {
			var end = $(sect).closest('w\\:body>*');
			sect.content = end.prevUntil(current).toArray().reverse();
			if (!end.is(sect)) sect.content.push(end.get(0));
			current = end;
		}).toArray();
		return { type: "document", children: children };
	},
	sectPr: function sectPr(wXml, officeDocument) {
		var hf = function hf(type) {
			return wXml.children.filter(function (a) {
				return a.name == "w:" + type + "Reference";
			}).reduce(function (headers, a) {
				headers.set(a.attribs["w:type"], officeDocument.getRel(a.attribs["r:id"]));
				return headers;
			}, new Map());
		};

		return {
			type: "section",
			children: wXml.content,
			headers: hf("header"),
			footers: hf("footer"),
			hasTitlePage: !!wXml.children.find(function (a) {
				return a.name == "w:titlePg";
			})
		};
	},
	p: function p(wXml, officeDocument) {
		var $ = officeDocument.content(wXml);
		var type = "p";

		var identity = { type: type, pr: wXml.children.find(function (_ref) {
				var name = _ref.name;
				return name == "w:pPr";
			}), children: wXml.children.filter(function (_ref2) {
				var name = _ref2.name;
				return name != "w:pPr";
			}) };

		var pPr = $.find("w\\:pPr");
		if (pPr.length) {
			var styleId = pPr.find("w\\:pStyle").attr("w:val");

			var numPr = pPr.find("w\\:numPr>w\\:numId");
			if (!numPr.length && styleId) {
				numPr = officeDocument.styles("w\\:style[w\\:styleId=\"" + styleId + "\"] w\\:numPr>w\\:numId");
			}

			if (numPr.length) {
				identity.type = "list";
				identity.numId = numPr.find("w\\:numId").attr("w:val");
				identity.level = numPr.find("w\\:ilvl").attr("w:val");
			} else {
				var outlineLvl = pPr.find("w\\:outlineLvl").attr("w:val");
				if (!outlineLvl && styleId) outlineLvl = officeDocument.styles("w\\:style[w\\:styleId=\"" + styleId + "\"] w\\:outlineLvl").attr("w:val");

				if (outlineLvl) {
					identity.type = "heading";
					identity.level = parseInt(outlineLvl) + 1;
				}
			}
		}

		return identity;
	},
	r: function r(wXml) {
		return { type: "r", pr: wXml.children.find(function (_ref3) {
				var name = _ref3.name;
				return name == "w:rPr";
			}), children: wXml.children.filter(function (_ref4) {
				var name = _ref4.name;
				return name != "w:rPr";
			}) };
	},
	fldChar: function fldChar(wXml) {
		return wXml.attribs["w:fldCharType"];
	},
	inline: function inline(wXml, officeDocument) {
		var $ = officeDocument.content(wXml);
		return { type: "drawing.inline", children: $.find('a\\:graphic>a\\:graphicData').children().toArray() };
	},
	anchor: function anchor(wXml, officeDocument) {
		var $ = officeDocument.content(wXml);
		var graphicData = $.find('a\\:graphic>a\\:graphicData');
		var type = graphicData.attr("uri").split("/").pop();
		var children = graphicData.children().toArray();
		if (type == "wordprocessingGroup") children = children[0].children.filter(function (a) {
			return a.name.split(":")[0] != "wpg";
		});

		return { type: "drawing.anchor", children: children };
	},
	pic: function pic(wXml, officeDocument) {
		var blip = officeDocument.content(wXml).find("a\\:blip");
		var rid = blip.attr('r:embed') || blip.attr('r:link');
		return _extends({ type: "picture" }, officeDocument.getRel(rid));
	},
	wsp: function wsp(wXml, officeDocument) {
		return { type: "shape", children: officeDocument.content(wXml).find(">wps\\:txbx>w\\:txbxContent").children().toArray() };
	},
	Fallback: function Fallback() {
		return null;
	},
	sdt: function sdt(wXml, officeDocument) {
		var $ = officeDocument.content(wXml);
		var pr = $.find('>w\\:sdtPr');
		var content = $.find('>w\\:sdtContent');
		var children = content.children().toArray();

		var elBinding = pr.find('w\\:dataBinding').get(0);
		if (elBinding) {
			//properties
			var path = elBinding.attribs['w:xpath'],
			    d = path.split(/[\/\:\[]/),
			    name = (d.pop(), d.pop());
			var value = content.text();

			return { type: "property", name: name, value: value, children: children };
		} else {
			//controls
			var prChildren = pr.get(0).children;
			var elType = prChildren[prChildren.length - 1];
			var _name = elType.name.split(":").pop();
			var type = "text,picture,docPartList,comboBox,dropDownList,date,checkbox,repeatingSection,repeatingSectionItem".split(",").find(function (a) {
				return a == _name;
			});
			var model = { children: children };
			if (type) {
				model.type = "control." + type;
			} else {
				//container
				if (content.find("w\\:p,w\\:tbl,w\\:tr,w\\:tc").length) {
					model.type = "block";
				} else {
					model.type = "inline";
				}
			}

			$ = officeDocument.content;
			switch (model.type) {
				case "control.dropDownList":
				case "control.comboBox":
					{
						var selected = $(content).text();
						model.options = $(elType).find("w\\:listItem").map(function (i, li) {
							return {
								displayText: li.attribs["w:displayText"],
								value: li.attribs["w:value"]
							};
						}).get();
						model.value = (model.options.find(function (a) {
							return a.displayText == selected;
						}) || {}).value;
						break;
					}
				case "control.checkbox":
					{
						var ns = elType.name.split(":")[0];
						model.checked = $(elType).find(ns + "\\:checked").attr(ns + ":val") == "1";
						break;
					}
				case "control.text":
					if (content.find('w\\:r [w\\:val~=Placeholder]').length == 0) model.value = content.text();
					break;
				case "control.date":
					model.value = new Date($(elType).attr("w:fullDate"));
					model.format = $(elType).find("w\\:dateFormat").attr("w:val");
					model.locale = $(elType).find("w\\:lid").attr("w:val");
					break;
			}
			return model;
		}
	},
	hyperlink: function hyperlink(wXml, officeDocument) {
		var url = officeDocument.getRel(wXml.attribs["r:id"]);
		return { type: "hyperlink", url: url };
	},
	tbl: function tbl(wXml) {
		return wXml.children.reduce(function (state, node) {
			switch (node.name) {
				case "w:tblPr":
					state.pr = node;
					break;
				case "w:tblGrid":
					state.cols = node.children;
					break;
				default:
					state.children.push(node);
			}
			return state;
		}, { type: "tbl", children: [], pr: null, cols: [] });
	},
	tr: function tr(wXml) {
		return wXml.children.reduce(function (state, node) {
			switch (node.name) {
				case "w:trPr":
					state.pr = node;
					state.isHeader = !!node.children.find(function (a) {
						return a.name == "w:tblHeader";
					});
					break;
				default:
					state.children.push(node);
			}
			return state;
		}, { type: "tr", children: [], pr: null });
	},
	tc: function tc(wXml) {
		return wXml.children.reduce(function (state, node) {
			switch (node.name) {
				case "w:tcPr":
					state.pr = node;
					break;
				default:
					state.children.push(node);
			}
			return state;
		}, { type: "tc", children: [], pr: null });
	},
	altChunk: function altChunk(wXml, officeDocument) {
		var rId = wXml.attribs['r:id'];
		var data = officeDocument.getRel(rId);

		var partName = officeDocument.folder + officeDocument.rels("[Id=" + rId + "]").attr("Target");
		var contentType = officeDocument.doc.contentTypes("Override[PartName='" + partName + "']").attr("ContentType");
		return { type: "chunk", data: data, contentType: contentType };
	},
	docDefaults: function docDefaults(wXml) {
		return { type: "style" };
	},
	style: function style(wXml) {
		return { type: "style", id: wXml.attribs['w:styleId'] };
	},
	abstractNum: function abstractNum(wXml) {
		return { type: "abstractNum", id: wXml.attribs["w:abstractNumId"] };
	},
	num: function num(wXml) {
		return { type: "num", id: wXml.attribs["w:numId"], abstractNum: wXml.children.find(function (a) {
				return a.name == "w:abstractNumId";
			}).attribs["w:val"] };
	},
	latentStyles: function latentStyles() {
		return null;
	},
	object: function object(wXml, officeDocument) {
		var ole = officeDocument.content(wXml).find("o\\:OLEObject");
		var type = ole.attr("ProgID");
		var embed = ole.attr("Type") === "Embed";
		var rId = ole.attr("r:id");
		return { type: "object", embed: embed, prog: type, data: officeDocument.getRelOleObject(rId) };
	}
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vcGVueG1sL2RvY3gvb2ZmaWNlRG9jdW1lbnQuanMiXSwibmFtZXMiOlsiT2ZmaWNlRG9jdW1lbnQiLCJzdXBwb3J0ZWQiLCJzcGxpdCIsInJlbHMiLCJlYWNoIiwiaSIsInJlbCIsIiQiLCJ0eXBlIiwiYXR0ciIsInBvcCIsImluZGV4T2YiLCJ0YXJnZXQiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsImdldFJlbE9iamVjdCIsImNyZWF0ZUVsZW1lbnQiLCJpZGVudGlmeSIsInN0eWxlcyIsInJlbmRlck5vZGUiLCJudW1iZXJpbmciLCJjb250ZW50IiwiZG9tSGFuZGxlciIsIm9mZmljZURvY3VtZW50IiwiZG9jIiwiYmluZCIsIl9pZGVudGlmeSIsIm1vZGVsIiwiYXJndW1lbnRzIiwiZW1pdCIsImRvY3VtZW50Iiwid1htbCIsInRhZyIsIm5hbWUiLCJpZGVudGl0aWVzIiwiUGFydCIsImN1cnJlbnQiLCJjaGlsZHJlbiIsInNlY3QiLCJlbmQiLCJjbG9zZXN0IiwicHJldlVudGlsIiwidG9BcnJheSIsInJldmVyc2UiLCJpcyIsInB1c2giLCJzZWN0UHIiLCJoZiIsImZpbHRlciIsImEiLCJyZWR1Y2UiLCJoZWFkZXJzIiwic2V0IiwiYXR0cmlicyIsImdldFJlbCIsIk1hcCIsImZvb3RlcnMiLCJoYXNUaXRsZVBhZ2UiLCJmaW5kIiwicCIsImlkZW50aXR5IiwicHIiLCJwUHIiLCJsZW5ndGgiLCJzdHlsZUlkIiwibnVtUHIiLCJudW1JZCIsImxldmVsIiwib3V0bGluZUx2bCIsInBhcnNlSW50IiwiciIsImZsZENoYXIiLCJpbmxpbmUiLCJhbmNob3IiLCJncmFwaGljRGF0YSIsInBpYyIsImJsaXAiLCJyaWQiLCJ3c3AiLCJGYWxsYmFjayIsInNkdCIsImVsQmluZGluZyIsInBhdGgiLCJkIiwidmFsdWUiLCJ0ZXh0IiwicHJDaGlsZHJlbiIsImVsVHlwZSIsInNlbGVjdGVkIiwib3B0aW9ucyIsIm1hcCIsImxpIiwiZGlzcGxheVRleHQiLCJucyIsImNoZWNrZWQiLCJEYXRlIiwiZm9ybWF0IiwibG9jYWxlIiwiaHlwZXJsaW5rIiwidXJsIiwidGJsIiwic3RhdGUiLCJub2RlIiwiY29scyIsInRyIiwiaXNIZWFkZXIiLCJ0YyIsImFsdENodW5rIiwicklkIiwiZGF0YSIsInBhcnROYW1lIiwiZm9sZGVyIiwiY29udGVudFR5cGUiLCJjb250ZW50VHlwZXMiLCJkb2NEZWZhdWx0cyIsInN0eWxlIiwiaWQiLCJhYnN0cmFjdE51bSIsIm51bSIsImxhdGVudFN0eWxlcyIsIm9iamVjdCIsIm9sZSIsImVtYmVkIiwicHJvZyIsImdldFJlbE9sZU9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7OztJQUVhQSxjLFdBQUFBLGM7Ozs7Ozs7Ozs7OzBCQUNMO0FBQUE7O0FBQ047QUFDQSxPQUFNQyxZQUFVLGtDQUFrQ0MsS0FBbEMsQ0FBd0MsR0FBeEMsQ0FBaEI7QUFDQSxRQUFLQyxJQUFMLG1DQUEwQ0MsSUFBMUMsQ0FBK0MsVUFBQ0MsQ0FBRCxFQUFHQyxHQUFILEVBQVM7QUFDdkQsUUFBSUMsSUFBRSxPQUFLSixJQUFMLENBQVVHLEdBQVYsQ0FBTjtBQUNBLFFBQUlFLE9BQUtELEVBQUVFLElBQUYsQ0FBTyxNQUFQLEVBQWVQLEtBQWYsQ0FBcUIsR0FBckIsRUFBMEJRLEdBQTFCLEVBQVQ7QUFDQSxRQUFHVCxVQUFVVSxPQUFWLENBQWtCSCxJQUFsQixLQUF5QixDQUFDLENBQTdCLEVBQStCO0FBQzlCLFNBQUlJLFNBQU9MLEVBQUVFLElBQUYsQ0FBTyxRQUFQLENBQVg7QUFDQUksWUFBT0MsY0FBUCxDQUFzQixNQUF0QixFQUEyQk4sSUFBM0IsRUFBZ0M7QUFDL0JPLFNBRCtCLGlCQUMxQjtBQUNKLGNBQU8sS0FBS0MsWUFBTCxDQUFrQkosTUFBbEIsQ0FBUDtBQUNBO0FBSDhCLE1BQWhDO0FBS0E7QUFDRCxJQVhEO0FBWUE7Ozt5QkFFTUssYSxFQUFnRDtBQUFBLE9B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QTJOWnZGLElBM05ZLEVBMk5QO0FBQ1IsU0FBTyxFQUFDeEIsTUFBSyxLQUFOLEVBQVk2RyxJQUFHckYsS0FBS3NCLE9BQUwsQ0FBYSxTQUFiLENBQWYsRUFBdUNnRSxhQUFZdEYsS0FBS00sUUFBTCxDQUFjcUIsSUFBZCxDQUFtQjtBQUFBLFdBQUdULEVBQUVoQixJQUFGLElBQVEsaUJBQVg7QUFBQSxJQUFuQixFQUFpRG9CLE9BQWpELENBQXlELE9BQXpELENBQW5ELEVBQVA7QUFDQSxFQTdOZTtBQThOaEJrRSxhQTlOZ0IsMEJBOE5GO0FBQ2IsU0FBTyxJQUFQO0FBQ0EsRUFoT2U7QUFpT2hCQyxPQWpPZ0Isa0JBaU9UekYsSUFqT1MsRUFpT0pSLGNBak9JLEVBaU9XO0FBQzFCLE1BQUlrRyxNQUFJbEcsZUFBZUYsT0FBZixDQUF1QlUsSUFBdkIsRUFBNkIyQixJQUE3QixDQUFrQyxlQUFsQyxDQUFSO0FBQ0EsTUFBSW5ELE9BQUtrSCxJQUFJakgsSUFBSixDQUFTLFFBQVQsQ0FBVDtBQUNBLE1BQUlrSCxRQUFNRCxJQUFJakgsSUFBSixDQUFTLE1BQVQsTUFBbUIsT0FBN0I7QUFDQSxNQUFJb0csTUFBSWEsSUFBSWpILElBQUosQ0FBUyxNQUFULENBQVI7QUFDQSxTQUFPLEVBQUNELE1BQUssUUFBTixFQUFlbUgsWUFBZixFQUFzQkMsTUFBTXBILElBQTVCLEVBQWtDc0csTUFBS3RGLGVBQWVxRyxlQUFmLENBQStCaEIsR0FBL0IsQ0FBdkMsRUFBUDtBQUNBO0FBdk9lLENBQWpCIiwiZmlsZSI6Im9mZmljZURvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhcnQgZnJvbSBcIi4uL3BhcnRcIlxyXG5cclxuZXhwb3J0IGNsYXNzIE9mZmljZURvY3VtZW50IGV4dGVuZHMgUGFydHtcclxuXHRfaW5pdCgpe1xyXG5cdFx0c3VwZXIuX2luaXQoKVxyXG5cdFx0Y29uc3Qgc3VwcG9ydGVkPVwic3R5bGVzLG51bWJlcmluZyx0aGVtZSxzZXR0aW5nc1wiLnNwbGl0KFwiLFwiKVxyXG5cdFx0dGhpcy5yZWxzKGBSZWxhdGlvbnNoaXBbVGFyZ2V0JD1cIi54bWxcIl1gKS5lYWNoKChpLHJlbCk9PntcclxuXHRcdFx0bGV0ICQ9dGhpcy5yZWxzKHJlbClcclxuXHRcdFx0bGV0IHR5cGU9JC5hdHRyKFwiVHlwZVwiKS5zcGxpdChcIi9cIikucG9wKClcclxuXHRcdFx0aWYoc3VwcG9ydGVkLmluZGV4T2YodHlwZSkhPS0xKXtcclxuXHRcdFx0XHRsZXQgdGFyZ2V0PSQuYXR0cihcIlRhcmdldFwiKVxyXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLHR5cGUse1xyXG5cdFx0XHRcdFx0Z2V0KCl7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFJlbE9iamVjdCh0YXJnZXQpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHJlbmRlcihjcmVhdGVFbGVtZW50LCBpZGVudGlmeT1PZmZpY2VEb2N1bWVudC5pZGVudGlmeSl7XHJcblx0XHRpZih0aGlzLnN0eWxlcylcclxuXHRcdFx0dGhpcy5yZW5kZXJOb2RlKHRoaXMuc3R5bGVzKFwid1xcXFw6c3R5bGVzXCIpLmdldCgwKSxjcmVhdGVFbGVtZW50LGlkZW50aWZ5KVxyXG5cdFx0aWYodGhpcy5udW1iZXJpbmcpXHJcblx0XHRcdHRoaXMucmVuZGVyTm9kZSh0aGlzLm51bWJlcmluZyhcIndcXFxcOm51bWJlcmluZ1wiKS5nZXQoMCksY3JlYXRlRWxlbWVudCxpZGVudGlmeSlcclxuXHRcdHJldHVybiB0aGlzLnJlbmRlck5vZGUodGhpcy5jb250ZW50KFwid1xcXFw6ZG9jdW1lbnRcIikuZ2V0KDApLGNyZWF0ZUVsZW1lbnQsIGlkZW50aWZ5KVxyXG5cdH1cclxuXHJcblx0cGFyc2UoZG9tSGFuZGxlcixpZGVudGlmeT1vZmZpY2VEb2N1bWVudC5pZGVudGlmeSl7XHJcblx0XHRjb25zdCBkb2M9e31cclxuXHRcdGNvbnN0IGNyZWF0ZUVsZW1lbnQ9ZG9tSGFuZGxlci5jcmVhdGVFbGVtZW50LmJpbmQoZG9tSGFuZGxlcilcclxuXHRcdGZ1bmN0aW9uIF9pZGVudGlmeSgpe1xyXG5cdFx0XHRsZXQgbW9kZWw9aWRlbnRpZnkoLi4uYXJndW1lbnRzKVxyXG5cdFx0XHRpZihtb2RlbCAmJiB0eXBlb2YobW9kZWwpPT1cIm9iamVjdFwiKXtcclxuXHRcdFx0XHRkb21IYW5kbGVyLmVtaXQoXCIqXCIsbW9kZWwsLi4uYXJndW1lbnRzKVxyXG5cdFx0XHRcdGRvbUhhbmRsZXIuZW1pdChtb2RlbC50eXBlLCBtb2RlbCwuLi5hcmd1bWVudHMpXHJcblx0XHRcdFx0aWYoZG9tSGFuZGxlcltgb24ke21vZGVsLnR5cGV9YF0pXHJcblx0XHRcdFx0XHRkb21IYW5kbGVyW2BvbiR7bW9kZWwudHlwZX1gXShtb2RlbCwuLi5hcmd1bWVudHMpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG1vZGVsXHJcblx0XHR9XHJcblxyXG5cdFx0aWYodGhpcy5zdHlsZXMpXHJcblx0XHRcdGRvYy5zdHlsZXM9dGhpcy5yZW5kZXJOb2RlKHRoaXMuc3R5bGVzKFwid1xcXFw6c3R5bGVzXCIpLmdldCgwKSxjcmVhdGVFbGVtZW50LF9pZGVudGlmeSlcclxuXHRcdGlmKHRoaXMubnVtYmVyaW5nKVxyXG5cdFx0XHRkb2MubnVtYmVyaW5nPXRoaXMucmVuZGVyTm9kZSh0aGlzLm51bWJlcmluZyhcIndcXFxcOm51bWJlcmluZ1wiKS5nZXQoMCksY3JlYXRlRWxlbWVudCxfaWRlbnRpZnkpXHJcblx0XHRkb2MuZG9jdW1lbnQ9dGhpcy5yZW5kZXJOb2RlKHRoaXMuY29udGVudChcIndcXFxcOmRvY3VtZW50XCIpLmdldCgwKSxjcmVhdGVFbGVtZW50LF9pZGVudGlmeSlcclxuXHRcdHJldHVybiBkb2NcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpZGVudGlmeSh3WG1sLCBvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRjb25zdCB0YWc9d1htbC5uYW1lLnNwbGl0KFwiOlwiKS5wb3AoKVxyXG5cdFx0aWYoaWRlbnRpdGllc1t0YWddKVxyXG5cdFx0XHRyZXR1cm4gaWRlbnRpdGllc1t0YWddKC4uLmFyZ3VtZW50cylcclxuXHJcblx0XHRyZXR1cm4gdGFnXHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBPZmZpY2VEb2N1bWVudFxyXG5cclxuY29uc3QgaWRlbnRpdGllcz17XHJcblx0ZG9jdW1lbnQod1htbCxvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRsZXQgJD1vZmZpY2VEb2N1bWVudC5jb250ZW50XHJcblx0XHRsZXQgY3VycmVudD1udWxsXHJcblx0XHRsZXQgY2hpbGRyZW49JChcIndcXFxcOnNlY3RQclwiKS5lYWNoKChpLHNlY3QpPT57XHJcblx0XHRcdGxldCBlbmQ9JChzZWN0KS5jbG9zZXN0KCd3XFxcXDpib2R5PionKVxyXG5cdFx0XHRzZWN0LmNvbnRlbnQ9ZW5kLnByZXZVbnRpbChjdXJyZW50KS50b0FycmF5KCkucmV2ZXJzZSgpXHJcblx0XHRcdGlmKCFlbmQuaXMoc2VjdCkpXHJcblx0XHRcdFx0c2VjdC5jb250ZW50LnB1c2goZW5kLmdldCgwKSlcclxuXHRcdFx0Y3VycmVudD1lbmRcclxuXHRcdH0pLnRvQXJyYXkoKVxyXG5cdFx0cmV0dXJuIHt0eXBlOlwiZG9jdW1lbnRcIiwgY2hpbGRyZW59XHJcblx0fSxcclxuXHRzZWN0UHIod1htbCxvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRjb25zdCBoZj10eXBlPT53WG1sLmNoaWxkcmVuLmZpbHRlcihhPT5hLm5hbWU9PWB3OiR7dHlwZX1SZWZlcmVuY2VgKS5yZWR1Y2UoKGhlYWRlcnMsYSk9PntcclxuXHRcdFx0XHRoZWFkZXJzLnNldChhLmF0dHJpYnNbXCJ3OnR5cGVcIl0sb2ZmaWNlRG9jdW1lbnQuZ2V0UmVsKGEuYXR0cmlic1tcInI6aWRcIl0pKVxyXG5cdFx0XHRcdHJldHVybiBoZWFkZXJzXHJcblx0XHRcdH0sbmV3IE1hcCgpKVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHR5cGU6XCJzZWN0aW9uXCIsXHJcblx0XHRcdGNoaWxkcmVuOndYbWwuY29udGVudCxcclxuXHRcdFx0aGVhZGVyczpoZihcImhlYWRlclwiKSxcclxuXHRcdFx0Zm9vdGVyczpoZihcImZvb3RlclwiKSxcclxuXHRcdFx0aGFzVGl0bGVQYWdlOiAhIXdYbWwuY2hpbGRyZW4uZmluZChhPT5hLm5hbWU9PVwidzp0aXRsZVBnXCIpXHJcblx0XHR9XHJcblx0fSxcclxuXHRwKHdYbWwsb2ZmaWNlRG9jdW1lbnQpe1xyXG5cdFx0bGV0ICQ9b2ZmaWNlRG9jdW1lbnQuY29udGVudCh3WG1sKVxyXG5cdFx0bGV0IHR5cGU9XCJwXCJcclxuXHJcblx0XHRsZXQgaWRlbnRpdHk9e3R5cGUscHI6d1htbC5jaGlsZHJlbi5maW5kKCh7bmFtZX0pPT5uYW1lPT1cInc6cFByXCIpLGNoaWxkcmVuOndYbWwuY2hpbGRyZW4uZmlsdGVyKCh7bmFtZX0pPT5uYW1lIT1cInc6cFByXCIpfVxyXG5cclxuXHRcdGxldCBwUHI9JC5maW5kKFwid1xcXFw6cFByXCIpXHJcblx0XHRpZihwUHIubGVuZ3RoKXtcclxuXHRcdFx0bGV0IHN0eWxlSWQ9cFByLmZpbmQoXCJ3XFxcXDpwU3R5bGVcIikuYXR0cihcInc6dmFsXCIpXHJcblxyXG5cdFx0XHRsZXQgbnVtUHI9cFByLmZpbmQoXCJ3XFxcXDpudW1Qcj53XFxcXDpudW1JZFwiKVxyXG5cdFx0XHRpZighbnVtUHIubGVuZ3RoICYmIHN0eWxlSWQpe1xyXG5cdFx0XHRcdG51bVByPW9mZmljZURvY3VtZW50LnN0eWxlcyhgd1xcXFw6c3R5bGVbd1xcXFw6c3R5bGVJZD1cIiR7c3R5bGVJZH1cIl0gd1xcXFw6bnVtUHI+d1xcXFw6bnVtSWRgKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihudW1Qci5sZW5ndGgpe1xyXG5cdFx0XHRcdGlkZW50aXR5LnR5cGU9XCJsaXN0XCJcclxuXHRcdFx0XHRpZGVudGl0eS5udW1JZD1udW1Qci5maW5kKFwid1xcXFw6bnVtSWRcIikuYXR0cihcInc6dmFsXCIpXHJcblx0XHRcdFx0aWRlbnRpdHkubGV2ZWw9bnVtUHIuZmluZChcIndcXFxcOmlsdmxcIikuYXR0cihcInc6dmFsXCIpXHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGxldCBvdXRsaW5lTHZsPXBQci5maW5kKFwid1xcXFw6b3V0bGluZUx2bFwiKS5hdHRyKFwidzp2YWxcIilcclxuXHRcdFx0XHRpZighb3V0bGluZUx2bCAmJiBzdHlsZUlkKVxyXG5cdFx0XHRcdFx0b3V0bGluZUx2bD1vZmZpY2VEb2N1bWVudC5zdHlsZXMoYHdcXFxcOnN0eWxlW3dcXFxcOnN0eWxlSWQ9XCIke3N0eWxlSWR9XCJdIHdcXFxcOm91dGxpbmVMdmxgKS5hdHRyKFwidzp2YWxcIilcclxuXHJcblx0XHRcdFx0aWYob3V0bGluZUx2bCl7XHJcblx0XHRcdFx0XHRpZGVudGl0eS50eXBlPVwiaGVhZGluZ1wiXHJcblx0XHRcdFx0XHRpZGVudGl0eS5sZXZlbD1wYXJzZUludChvdXRsaW5lTHZsKSsxXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGlkZW50aXR5XHJcblx0fSxcclxuXHRyKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwiclwiLCBwcjogd1htbC5jaGlsZHJlbi5maW5kKCh7bmFtZX0pPT5uYW1lPT1cInc6clByXCIpLCBjaGlsZHJlbjogd1htbC5jaGlsZHJlbi5maWx0ZXIoKHtuYW1lfSk9Pm5hbWUhPVwidzpyUHJcIil9XHJcblx0fSxcclxuXHRmbGRDaGFyKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHdYbWwuYXR0cmlic1tcInc6ZmxkQ2hhclR5cGVcIl1cclxuXHR9LFxyXG5cclxuXHRpbmxpbmUod1htbCxvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRsZXQgJD1vZmZpY2VEb2N1bWVudC5jb250ZW50KHdYbWwpXHJcblx0XHRyZXR1cm4ge3R5cGU6YGRyYXdpbmcuaW5saW5lYCwgY2hpbGRyZW46JC5maW5kKCdhXFxcXDpncmFwaGljPmFcXFxcOmdyYXBoaWNEYXRhJykuY2hpbGRyZW4oKS50b0FycmF5KCl9XHJcblx0fSxcclxuXHRhbmNob3Iod1htbCwgb2ZmaWNlRG9jdW1lbnQpe1xyXG5cdFx0bGV0ICQ9b2ZmaWNlRG9jdW1lbnQuY29udGVudCh3WG1sKVxyXG5cdFx0bGV0IGdyYXBoaWNEYXRhPSQuZmluZCgnYVxcXFw6Z3JhcGhpYz5hXFxcXDpncmFwaGljRGF0YScpXHJcblx0XHRsZXQgdHlwZT1ncmFwaGljRGF0YS5hdHRyKFwidXJpXCIpLnNwbGl0KFwiL1wiKS5wb3AoKVxyXG5cdFx0bGV0IGNoaWxkcmVuPWdyYXBoaWNEYXRhLmNoaWxkcmVuKCkudG9BcnJheSgpXHJcblx0XHRpZih0eXBlPT1cIndvcmRwcm9jZXNzaW5nR3JvdXBcIilcclxuXHRcdFx0Y2hpbGRyZW49Y2hpbGRyZW5bMF0uY2hpbGRyZW4uZmlsdGVyKGE9PmEubmFtZS5zcGxpdChcIjpcIilbMF0hPVwid3BnXCIpXHJcblxyXG5cdFx0cmV0dXJuIHt0eXBlOlwiZHJhd2luZy5hbmNob3JcIixjaGlsZHJlbn1cclxuXHR9LFxyXG5cdHBpYyh3WG1sLCBvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRsZXQgYmxpcD1vZmZpY2VEb2N1bWVudC5jb250ZW50KHdYbWwpLmZpbmQoXCJhXFxcXDpibGlwXCIpXHJcblx0XHRsZXQgcmlkPWJsaXAuYXR0cigncjplbWJlZCcpfHxibGlwLmF0dHIoJ3I6bGluaycpXHJcblx0XHRyZXR1cm4ge3R5cGU6XCJwaWN0dXJlXCIsLi4ub2ZmaWNlRG9jdW1lbnQuZ2V0UmVsKHJpZCl9XHJcblx0fSxcclxuXHR3c3Aod1htbCwgb2ZmaWNlRG9jdW1lbnQpe1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwic2hhcGVcIiwgY2hpbGRyZW46b2ZmaWNlRG9jdW1lbnQuY29udGVudCh3WG1sKS5maW5kKFwiPndwc1xcXFw6dHhieD53XFxcXDp0eGJ4Q29udGVudFwiKS5jaGlsZHJlbigpLnRvQXJyYXkoKX1cclxuXHR9LFxyXG5cdEZhbGxiYWNrKCl7XHJcblx0XHRyZXR1cm4gbnVsbFxyXG5cdH0sXHJcblx0c2R0KHdYbWwsb2ZmaWNlRG9jdW1lbnQpe1xyXG5cdFx0bGV0ICQ9b2ZmaWNlRG9jdW1lbnQuY29udGVudCh3WG1sKVxyXG5cdFx0bGV0IHByPSQuZmluZCgnPndcXFxcOnNkdFByJylcclxuXHRcdGxldCBjb250ZW50PSQuZmluZCgnPndcXFxcOnNkdENvbnRlbnQnKVxyXG5cdFx0bGV0IGNoaWxkcmVuPWNvbnRlbnQuY2hpbGRyZW4oKS50b0FycmF5KClcclxuXHJcblx0XHRsZXQgZWxCaW5kaW5nPXByLmZpbmQoJ3dcXFxcOmRhdGFCaW5kaW5nJykuZ2V0KDApXHJcblx0XHRpZihlbEJpbmRpbmcpey8vcHJvcGVydGllc1xyXG5cdFx0XHRsZXQgcGF0aD1lbEJpbmRpbmcuYXR0cmlic1sndzp4cGF0aCddLFxyXG5cdFx0XHRcdGQ9cGF0aC5zcGxpdCgvW1xcL1xcOlxcW10vKSxcclxuXHRcdFx0XHRuYW1lPShkLnBvcCgpLGQucG9wKCkpO1xyXG5cdFx0XHRsZXQgdmFsdWU9Y29udGVudC50ZXh0KClcclxuXHJcblx0XHRcdHJldHVybiB7dHlwZTpcInByb3BlcnR5XCIsIG5hbWUsIHZhbHVlLCBjaGlsZHJlbn1cclxuXHRcdH1lbHNley8vY29udHJvbHNcclxuXHRcdFx0bGV0IHByQ2hpbGRyZW49cHIuZ2V0KDApLmNoaWxkcmVuXHJcblx0XHRcdGxldCBlbFR5cGU9cHJDaGlsZHJlbltwckNoaWxkcmVuLmxlbmd0aC0xXVxyXG5cdFx0XHRsZXQgbmFtZT1lbFR5cGUubmFtZS5zcGxpdChcIjpcIikucG9wKClcclxuXHRcdFx0bGV0IHR5cGU9XCJ0ZXh0LHBpY3R1cmUsZG9jUGFydExpc3QsY29tYm9Cb3gsZHJvcERvd25MaXN0LGRhdGUsY2hlY2tib3gscmVwZWF0aW5nU2VjdGlvbixyZXBlYXRpbmdTZWN0aW9uSXRlbVwiLnNwbGl0KFwiLFwiKVxyXG5cdFx0XHRcdC5maW5kKGE9PmE9PW5hbWUpXHJcblx0XHRcdGxldCBtb2RlbD17Y2hpbGRyZW59XHJcblx0XHRcdGlmKHR5cGUpe1xyXG5cdFx0XHRcdG1vZGVsLnR5cGU9YGNvbnRyb2wuJHt0eXBlfWBcclxuXHRcdFx0fWVsc2V7Ly9jb250YWluZXJcclxuXHRcdFx0XHRpZihjb250ZW50LmZpbmQoXCJ3XFxcXDpwLHdcXFxcOnRibCx3XFxcXDp0cix3XFxcXDp0Y1wiKS5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0bW9kZWwudHlwZT1cImJsb2NrXCJcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdG1vZGVsLnR5cGU9XCJpbmxpbmVcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0JD1vZmZpY2VEb2N1bWVudC5jb250ZW50XHJcblx0XHRcdHN3aXRjaChtb2RlbC50eXBlKXtcclxuXHRcdFx0XHRjYXNlIFwiY29udHJvbC5kcm9wRG93bkxpc3RcIjpcdFxyXG5cdFx0XHRcdGNhc2UgXCJjb250cm9sLmNvbWJvQm94XCI6e1xyXG5cdFx0XHRcdFx0bGV0IHNlbGVjdGVkPSQoY29udGVudCkudGV4dCgpXHJcblx0XHRcdFx0XHRtb2RlbC5vcHRpb25zPSQoZWxUeXBlKVxyXG5cdFx0XHRcdFx0XHQuZmluZChcIndcXFxcOmxpc3RJdGVtXCIpXHJcblx0XHRcdFx0XHRcdC5tYXAoKGksbGkpPT57XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRpc3BsYXlUZXh0OiBsaS5hdHRyaWJzW1widzpkaXNwbGF5VGV4dFwiXSxcclxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBsaS5hdHRyaWJzW1widzp2YWx1ZVwiXVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0LmdldCgpXHJcblx0XHRcdFx0XHRtb2RlbC52YWx1ZT0obW9kZWwub3B0aW9ucy5maW5kKGE9PmEuZGlzcGxheVRleHQ9PXNlbGVjdGVkKXx8e30pLnZhbHVlXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlIFwiY29udHJvbC5jaGVja2JveFwiOntcclxuXHRcdFx0XHRcdGxldCBucz1lbFR5cGUubmFtZS5zcGxpdChcIjpcIilbMF1cclxuXHRcdFx0XHRcdG1vZGVsLmNoZWNrZWQ9JChlbFR5cGUpLmZpbmQoYCR7bnN9XFxcXDpjaGVja2VkYCkuYXR0cihgJHtuc306dmFsYCk9PVwiMVwiXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlIFwiY29udHJvbC50ZXh0XCI6XHJcblx0XHRcdFx0XHRpZihjb250ZW50LmZpbmQoJ3dcXFxcOnIgW3dcXFxcOnZhbH49UGxhY2Vob2xkZXJdJykubGVuZ3RoPT0wKVxyXG5cdFx0XHRcdFx0XHRtb2RlbC52YWx1ZT1jb250ZW50LnRleHQoKVxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHRjYXNlIFwiY29udHJvbC5kYXRlXCI6XHJcblx0XHRcdFx0XHRtb2RlbC52YWx1ZT1uZXcgRGF0ZSgkKGVsVHlwZSkuYXR0cihcInc6ZnVsbERhdGVcIikpXHJcblx0XHRcdFx0XHRtb2RlbC5mb3JtYXQ9JChlbFR5cGUpLmZpbmQoXCJ3XFxcXDpkYXRlRm9ybWF0XCIpLmF0dHIoXCJ3OnZhbFwiKVxyXG5cdFx0XHRcdFx0bW9kZWwubG9jYWxlPSQoZWxUeXBlKS5maW5kKFwid1xcXFw6bGlkXCIpLmF0dHIoXCJ3OnZhbFwiKVxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbW9kZWxcclxuXHRcdH1cclxuXHR9LFxyXG5cdGh5cGVybGluayh3WG1sLG9mZmljZURvY3VtZW50KXtcclxuXHRcdGxldCB1cmw9b2ZmaWNlRG9jdW1lbnQuZ2V0UmVsKHdYbWwuYXR0cmlic1tcInI6aWRcIl0pXHJcblx0XHRyZXR1cm4ge3R5cGU6XCJoeXBlcmxpbmtcIiwgdXJsfVxyXG5cdH0sXHJcblx0dGJsKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHdYbWwuY2hpbGRyZW4ucmVkdWNlKChzdGF0ZSxub2RlKT0+e1xyXG5cdFx0XHRzd2l0Y2gobm9kZS5uYW1lKXtcclxuXHRcdFx0Y2FzZSBcInc6dGJsUHJcIjpcclxuXHRcdFx0XHRzdGF0ZS5wcj1ub2RlXHJcblx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJ3OnRibEdyaWRcIjpcclxuXHRcdFx0XHRzdGF0ZS5jb2xzPW5vZGUuY2hpbGRyZW5cclxuXHRcdFx0YnJlYWtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRzdGF0ZS5jaGlsZHJlbi5wdXNoKG5vZGUpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHN0YXRlXHJcblx0XHR9LHt0eXBlOlwidGJsXCIsY2hpbGRyZW46W10scHI6bnVsbCxjb2xzOltdfSlcclxuXHR9LFxyXG5cdHRyKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHdYbWwuY2hpbGRyZW4ucmVkdWNlKChzdGF0ZSxub2RlKT0+e1xyXG5cdFx0XHRzd2l0Y2gobm9kZS5uYW1lKXtcclxuXHRcdFx0Y2FzZSBcInc6dHJQclwiOlxyXG5cdFx0XHRcdHN0YXRlLnByPW5vZGVcclxuXHRcdFx0XHRzdGF0ZS5pc0hlYWRlcj0hIW5vZGUuY2hpbGRyZW4uZmluZChhPT5hLm5hbWU9PVwidzp0YmxIZWFkZXJcIilcclxuXHRcdFx0YnJlYWtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRzdGF0ZS5jaGlsZHJlbi5wdXNoKG5vZGUpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHN0YXRlXHJcblx0XHR9LHt0eXBlOlwidHJcIixjaGlsZHJlbjpbXSxwcjpudWxsfSlcclxuXHR9LFxyXG5cdHRjKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHdYbWwuY2hpbGRyZW4ucmVkdWNlKChzdGF0ZSxub2RlKT0+e1xyXG5cdFx0XHRzd2l0Y2gobm9kZS5uYW1lKXtcclxuXHRcdFx0Y2FzZSBcInc6dGNQclwiOlxyXG5cdFx0XHRcdHN0YXRlLnByPW5vZGVcclxuXHRcdFx0YnJlYWtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRzdGF0ZS5jaGlsZHJlbi5wdXNoKG5vZGUpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHN0YXRlXHJcblx0XHR9LHt0eXBlOlwidGNcIixjaGlsZHJlbjpbXSxwcjpudWxsfSlcclxuXHR9LFxyXG5cdGFsdENodW5rKHdYbWwsIG9mZmljZURvY3VtZW50KXtcclxuXHRcdGxldCBySWQ9d1htbC5hdHRyaWJzWydyOmlkJ11cclxuXHRcdGxldCBkYXRhPW9mZmljZURvY3VtZW50LmdldFJlbChySWQpXHJcblxyXG5cdFx0bGV0IHBhcnROYW1lPW9mZmljZURvY3VtZW50LmZvbGRlcitvZmZpY2VEb2N1bWVudC5yZWxzKGBbSWQ9JHtySWR9XWApLmF0dHIoXCJUYXJnZXRcIilcclxuXHRcdGxldCBjb250ZW50VHlwZT1vZmZpY2VEb2N1bWVudC5kb2MuY29udGVudFR5cGVzKGBPdmVycmlkZVtQYXJ0TmFtZT0nJHtwYXJ0TmFtZX0nXWApLmF0dHIoXCJDb250ZW50VHlwZVwiKVxyXG5cdFx0cmV0dXJuIHt0eXBlOlwiY2h1bmtcIiwgZGF0YSwgY29udGVudFR5cGV9XHJcblx0fSxcclxuXHRkb2NEZWZhdWx0cyh3WG1sKXtcclxuXHRcdHJldHVybiB7dHlwZTpcInN0eWxlXCJ9XHJcblx0fSxcclxuXHRzdHlsZSh3WG1sKXtcclxuXHRcdHJldHVybiB7dHlwZTpcInN0eWxlXCIsIGlkOndYbWwuYXR0cmlic1sndzpzdHlsZUlkJ119XHJcblx0fSxcclxuXHRhYnN0cmFjdE51bSh3WG1sKXtcclxuXHRcdHJldHVybiB7dHlwZTpcImFic3RyYWN0TnVtXCIsaWQ6d1htbC5hdHRyaWJzW1widzphYnN0cmFjdE51bUlkXCJdfVxyXG5cdH0sXHJcblx0bnVtKHdYbWwpe1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwibnVtXCIsaWQ6d1htbC5hdHRyaWJzW1widzpudW1JZFwiXSxhYnN0cmFjdE51bTp3WG1sLmNoaWxkcmVuLmZpbmQoYT0+YS5uYW1lPT1cInc6YWJzdHJhY3ROdW1JZFwiKS5hdHRyaWJzW1widzp2YWxcIl19XHJcblx0fSxcclxuXHRsYXRlbnRTdHlsZXMoKXtcclxuXHRcdHJldHVybiBudWxsXHJcblx0fSxcclxuXHRvYmplY3Qod1htbCxvZmZpY2VEb2N1bWVudCl7XHJcblx0XHRsZXQgb2xlPW9mZmljZURvY3VtZW50LmNvbnRlbnQod1htbCkuZmluZChcIm9cXFxcOk9MRU9iamVjdFwiKVxyXG5cdFx0bGV0IHR5cGU9b2xlLmF0dHIoXCJQcm9nSURcIilcclxuXHRcdGxldCBlbWJlZD1vbGUuYXR0cihcIlR5cGVcIik9PT1cIkVtYmVkXCJcclxuXHRcdGxldCBySWQ9b2xlLmF0dHIoXCJyOmlkXCIpXHJcblx0XHRyZXR1cm4ge3R5cGU6XCJvYmplY3RcIixlbWJlZCwgcHJvZzogdHlwZSwgZGF0YTpvZmZpY2VEb2N1bWVudC5nZXRSZWxPbGVPYmplY3QocklkKX1cclxuXHR9XHJcbn1cclxuIl19