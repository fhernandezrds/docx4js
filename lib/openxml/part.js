"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ole = require("./ole");

var OLE = _interopRequireWildcard(_ole);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Part = function () {
	function Part(name, doc) {
		_classCallCheck(this, Part);

		this.name = name;
		this.doc = doc;

		var folder = "";
		var relName = "_rels/" + name + ".rels";
		var i = name.lastIndexOf('/');

		if (i !== -1) {
			folder = name.substring(0, i + 1);
			relName = folder + "_rels/" + name.substring(i + 1) + ".rels";
		}

		if (doc.parts[relName]) {
			this.folder = folder;
			this.relName = relName;
			Object.defineProperty(this, "rels", {
				get: function get() {
					return this.doc.getObjectPart(this.relName);
				}
			});
		}
		this._init();
	}

	_createClass(Part, [{
		key: "_init",
		value: function _init() {
			Object.defineProperty(this, "content", {
				get: function get() {
					return this.doc.getObjectPart(this.name);
				}
			});
		}
	}, {
		key: "getRelTarget",
		value: function getRelTarget(type) {
			return this.rels("[Type$=\"" + type + "\"]").attr("Target");
		}
	}, {
		key: "getRelObject",
		value: function getRelObject(target) {
			return this.doc.getObjectPart(this.folder + target);
		}
	}, {
		key: "getRel",
		value: function getRel(id) {
			var rel = this.rels("Relationship[Id=\"" + id + "\"]");
			var target = rel.attr("Target");
			if (rel.attr("TargetMode") === 'External') return { url: target };

			switch (rel.attr("Type").split("/").pop()) {
				case 'image':
					var url = this.doc.getDataPartAsUrl(this.folder + target, "image/*");
					var crc32 = this.doc.getPartCrc32(this.folder + target);
					return { url: url, crc32: crc32 };
				default:
					if (target.endsWith(".xml")) return this.getRelObject(target);else return this.doc.getPart(this.folder + target);
			}
		}
	}, {
		key: "_nextrId",
		value: function _nextrId() {
			return Math.max.apply(Math, _toConsumableArray(this.rels('Relationship').toArray().map(function (a) {
				return parseInt(a.attribs.Id.substring(3));
			}))) + 1;
		}
	}, {
		key: "addImage",
		value: function addImage(data) {
			var type = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
			var id = "rId" + this._nextrId();

			var targetName = "media/image" + (Math.max.apply(Math, _toConsumableArray(this.rels("Relationship[Type$='image']").toArray().map(function (t) {
				return parseInt(t.attribs.target.match(/\d+/)[0] || "0");
			}))) + 1) + ".jpg";

			var partName = "" + this.folder + targetName;
			this.doc.raw.file(partName, data);
			this.doc.parts[partName] = this.doc.raw.file(partName);

			this.rels("Relationships").append("<Relationship Id=\"" + id + "\" Type=\"" + type + "\" Target=\"" + partName + "\"/>");

			return id;
		}
	}, {
		key: "addExternalImage",
		value: function addExternalImage(url) {
			var type = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

			var id = "rId" + this._nextrId();

			this.rels("Relationships").append("<Relationship Id=\"" + id + "\" Type=\"" + type + "\" TargetMode=\"External\" Target=\"" + url + "\"/>");

			return id;
		}
	}, {
		key: "addChunk",
		value: function addChunk(data, relationshipType, contentType, ext) {
			relationshipType = relationshipType || "http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk";
			contentType = contentType || this.doc.constructor.mime;
			ext = ext || this.doc.constructor.ext;

			var id = this._nextrId();
			var rId = "rId" + id;
			var targetName = "chunk/chunk" + id + "." + ext;
			var partName = "" + this.folder + targetName;
			this.doc.raw.file(partName, data);
			this.doc.parts[partName] = this.doc.raw.file(partName);

			this.rels("Relationships").append("<Relationship Id=\"" + rId + "\" Type=\"" + relationshipType + "\" Target=\"" + targetName + "\"/>");

			this.doc.contentTypes.append("<Override PartName=\"/" + partName + "\" ContentType=\"" + contentType + "\"/>");

			return rId;
		}
	}, {
		key: "getRelOleObject",
		value: function getRelOleObject(rid) {
			var rel = this.rels("Relationship[Id=" + rid + "]");
			var type = rel.attr("Type");
			var targetName = rel.attr("Target");
			var data = this.doc.getDataPart("" + this.folder + targetName);
			switch (type.split("/").pop()) {
				case "oleObject":
					return OLE.parse(data);
				default:
					return data;
			}
		}
	}, {
		key: "removeRel",
		value: function removeRel(id) {
			var rel = this.rels("Relationship[Id=\"" + id + "\"]");
			if (rel.attr("TargetMode") !== "External") {
				var partName = this.folder + rel.attr("Target");
				this.doc.contentTypes.find("[PartName='/" + partName + "']").remove();
				this.doc.raw.remove(partName);
				delete this.doc.parts[partName];
			}
			rel.remove();
		}
	}, {
		key: "renderNode",
		value: function renderNode(node) {
			var _this = this;

			var createElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (type, props, children) {
				type, props, children;
			};
			var identify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (node) {
				return node.name.split(":").pop();
			};
			var tagName = node.name,
			    children = node.children,
			    id = node.id,
			    parent = node.parent;

			if (node.type == "text") {
				if (parent.name == "w:t") {
					return node.data;
				}
				return null;
			}

			var type = tagName;
			var props = {};

			if (identify) {
				var model = identify(node, this);
				if (!model) return null;

				if (typeof model == "string") {
					type = model;
				} else {
					var content = void 0;
					var _model = model;
					type = _model.type;
					content = _model.children;
					props = _objectWithoutProperties(_model, ["type", "children"]);

					if (content !== undefined) children = content;
				}
			}
			props.key = id;
			props.node = node;
			props.type = type;

			var childElements = [];
			if (children && children.length) {
				childElements = children.map(function (a) {
					return a ? _this.renderNode(a, createElement, identify) : null;
				}).filter(function (a) {
					return !!a;
				});
			}

			return createElement(type, props, childElements);
		}
	}]);

	return Part;
}();

exports.default = Part;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVueG1sL3BhcnQuanMiXSwibmFtZXMiOlsiT0xFIiwiUGFydCIsIm5hbWUiLCJkb2MiLCJmb2xkZXIiLCJyZWxOYW1lIiwiaSIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwicGFydHMiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsImdldE9iamVjdFBhcnQiLCJfaW5pdCIsInR5cGUiLCJyZWxzIiwiYXR0ciIsInRhcmdldCIsImlkIiwicmVsIiwidXJsIiwic3BsaXQiLCJwb3AiLCJnZXREYXRhUGFydEFzVXJsIiwiY3JjMzIiLCJnZXRQYXJ0Q3JjMzIiLCJlbmRzV2l0aCIsImdldFJlbE9iamVjdCIsImdldFBhcnQiLCJNYXRoIiwibWF4IiwidG9BcnJheSIsIm1hcCIsInBhcnNlSW50IiwiYSIsImF0dHJpYnMiLCJJZCIsImRhdGEiLCJfbmV4dHJJZCIsInRhcmdldE5hbWUiLCJ0IiwibWF0Y2giLCJwYXJ0TmFtZSIsInJhdyIsImZpbGUiLCJhcHBlbmQiLCJyZWxhdGlvbnNoaXBUeXBlIiwiY29udGVudFR5cGUiLCJleHQiLCJjb25zdHJ1Y3RvciIsIm1pbWUiLCJySWQiLCJjb250ZW50VHlwZXMiLCJyaWQiLCJnZXREYXRhUGFydCIsInBhcnNlIiwiZmluZCIsInJlbW92ZSIsIm5vZGUiLCJjcmVhdGVFbGVtZW50IiwicHJvcHMiLCJjaGlsZHJlbiIsImlkZW50aWZ5IiwidGFnTmFtZSIsInBhcmVudCIsIm1vZGVsIiwiY29udGVudCIsInVuZGVmaW5lZCIsImtleSIsImNoaWxkRWxlbWVudHMiLCJsZW5ndGgiLCJyZW5kZXJOb2RlIiwiZmlsdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztJQUFZQSxHOzs7Ozs7Ozs7O0lBRVNDLEk7QUFDcEIsZUFBWUMsSUFBWixFQUFpQkMsR0FBakIsRUFBcUI7QUFBQTs7QUFDcEIsT0FBS0QsSUFBTCxHQUFVQSxJQUFWO0FBQ0EsT0FBS0MsR0FBTCxHQUFTQSxH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SUgsUUFBTSxFQUFWOztBQUVBLE9BQUdFLFFBQUgsRUFBWTtBQUNYLFFBQUlHLFFBQU1ILFNBQVNKLElBQVQsRUFBYyxJQUFkLENBQVY7QUFDQSxRQUFHLENBQUNPLEtBQUosRUFDQyxPQUFPLElBQVA7O0FBRUQsUUFBRyxPQUFPQSxLQUFQLElBQWUsUUFBbEIsRUFBMkI7QUFDMUJuRCxZQUFLbUQsS0FBTDtBQUNBLEtBRkQsTUFFSztBQUNKLFNBQUlDLGdCQUFKO0FBREksa0JBRWdDRCxLQUZoQztBQUVGbkQsU0FGRSxVQUVGQSxJQUZFO0FBRWFvRCxZQUZiLFVBRUlMLFFBRko7QUFFeUJELFVBRnpCOztBQUdKLFNBQUdNLFlBQVVDLFNBQWIsRUFDQ04sV0FBU0ssT0FBVDtBQUNEO0FBQ0Q7QUFDRE4sU0FBTVEsR0FBTixHQUFVbEQsRUFBVjtBQUNBMEMsU0FBTUYsSUFBTixHQUFXQSxJQUFYO0FBQ0FFLFNBQU05QyxJQUFOLEdBQVdBLElBQVg7O0FBRUEsT0FBSXVELGdCQUFjLEVBQWxCO0FBQ0EsT0FBR1IsWUFBWUEsU0FBU1MsTUFBeEIsRUFBK0I7QUFDOUJELG9CQUFjUixTQUFTN0IsR0FBVCxDQUFhO0FBQUEsWUFBR0UsSUFBSSxNQUFLcUMsVUFBTCxDQUFnQnJDLENBQWhCLEVBQWtCeUIsYUFBbEIsRUFBZ0NHLFFBQWhDLENBQUosR0FBZ0QsSUFBbkQ7QUFBQSxLQUFiLEVBQ1pVLE1BRFksQ0FDTDtBQUFBLFlBQUcsQ0FBQyxDQUFDdEMsQ0FBTDtBQUFBLEtBREssQ0FBZDtBQUVBOztBQUVELFVBQU95QixjQUNMN0MsSUFESyxFQUVMOEMsS0FGSyxFQUdMUyxhQUhLLENBQVA7QUFLQTs7Ozs7O2tCQXJMbUJyRSxJIiwiZmlsZSI6InBhcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBPTEUgZnJvbSBcIi4vb2xlXCJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFydHtcblx0Y29uc3RydWN0b3IobmFtZSxkb2Mpe1xuXHRcdHRoaXMubmFtZT1uYW1lXG5cdFx0dGhpcy5kb2M9ZG9jXG5cblx0XHRsZXQgZm9sZGVyPVwiXCJcblx0XHRsZXQgcmVsTmFtZT1cIl9yZWxzL1wiK25hbWUrXCIucmVsc1wiXG5cdFx0bGV0IGk9bmFtZS5sYXN0SW5kZXhPZignLycpXG5cblx0XHRpZihpIT09LTEpe1xuXHRcdFx0Zm9sZGVyPW5hbWUuc3Vic3RyaW5nKDAsaSsxKVxuXHRcdFx0cmVsTmFtZT1mb2xkZXIrXCJfcmVscy9cIituYW1lLnN1YnN0cmluZyhpKzEpK1wiLnJlbHNcIjtcblx0XHR9XG5cblx0XHRpZihkb2MucGFydHNbcmVsTmFtZV0pe1xuXHRcdFx0dGhpcy5mb2xkZXI9Zm9sZGVyXG5cdFx0XHR0aGlzLnJlbE5hbWU9cmVsTmFtZVxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJyZWxzXCIse1xuXHRcdFx0XHRnZXQoKXtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MuZ2V0T2JqZWN0UGFydCh0aGlzLnJlbE5hbWUpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHRcdHRoaXMuX2luaXQoKVxuXHR9XG5cblx0X2luaXQoKXtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcImNvbnRlbnRcIix7XG5cdFx0XHRnZXQoKXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jLmdldE9iamVjdFBhcnQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRnZXRSZWxUYXJnZXQodHlwZSl7XG5cdFx0cmV0dXJuIHRoaXMucmVscyhgW1R5cGUkPVwiJHt0eXBlfVwiXWApLmF0dHIoXCJUYXJnZXRcIilcblx0fVxuXG5cdGdldFJlbE9iamVjdCh0YXJnZXQpe1xuXHRcdHJldHVybiB0aGlzLmRvYy5nZXRPYmplY3RQYXJ0KHRoaXMuZm9sZGVyK3RhcmdldClcblx0fVxuXG5cdGdldFJlbChpZCl7XG5cdFx0dmFyIHJlbD10aGlzLnJlbHMoYFJlbGF0aW9uc2hpcFtJZD1cIiR7aWR9XCJdYClcblx0XHR2YXIgdGFyZ2V0PXJlbC5hdHRyKFwiVGFyZ2V0XCIpXG5cdFx0aWYocmVsLmF0dHIoXCJUYXJnZXRNb2RlXCIpPT09J0V4dGVybmFsJylcblx0XHRcdHJldHVybiB7dXJsOnRhcmdldH1cblxuXHRcdHN3aXRjaChyZWwuYXR0cihcIlR5cGVcIikuc3BsaXQoXCIvXCIpLnBvcCgpKXtcblx0XHRjYXNlICdpbWFnZSc6XG5cdFx0XHRsZXQgdXJsPXRoaXMuZG9jLmdldERhdGFQYXJ0QXNVcmwodGhpcy5mb2xkZXIrdGFyZ2V0LCBcImltYWdlLypcIilcblx0XHRcdGxldCBjcmMzMj10aGlzLmRvYy5nZXRQYXJ0Q3JjMzIodGhpcy5mb2xkZXIrdGFyZ2V0KVxuXHRcdFx0cmV0dXJuIHt1cmwsY3JjMzJ9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlmKHRhcmdldC5lbmRzV2l0aChcIi54bWxcIikpXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFJlbE9iamVjdCh0YXJnZXQpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiB0aGlzLmRvYy5nZXRQYXJ0KHRoaXMuZm9sZGVyK3RhcmdldClcblx0XHR9XG5cdH1cblxuXHRfbmV4dHJJZCgpe1xuXHRcdHJldHVybiBNYXRoLm1heCguLi50aGlzLnJlbHMoJ1JlbGF0aW9uc2hpcCcpLnRvQXJyYXkoKS5tYXAoYT0+cGFyc2VJbnQoYS5hdHRyaWJzLklkLnN1YnN0cmluZygzKSkpKSsxXG5cdH1cblxuXHRhZGRJbWFnZShkYXRhKXtcblx0XHRjb25zdCB0eXBlPVwiaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL29mZmljZURvY3VtZW50LzIwMDYvcmVsYXRpb25zaGlwcy9pbWFnZVwiXG5cdFx0bGV0IGlkPWBySWQke3RoaXMuX25leHRySWQoKX1gXG5cblx0XHRsZXQgdGFyZ2V0TmFtZT1cIm1lZGlhL2ltYWdlXCIrKE1hdGgubWF4KC4uLnRoaXMucmVscyhcIlJlbGF0aW9uc2hpcFtUeXBlJD0naW1hZ2UnXVwiKS50b0FycmF5KCkubWFwKHQ9Pntcblx0XHRcdHJldHVybiBwYXJzZUludCh0LmF0dHJpYnMudGFyZ2V0Lm1hdGNoKC9cXGQrLylbMF18fFwiMFwiKVxuXHRcdH0pKSsxKStcIi5qcGdcIjtcblxuXHRcdGxldCBwYXJ0TmFtZT1gJHt0aGlzLmZvbGRlcn0ke3RhcmdldE5hbWV9YFxuXHRcdHRoaXMuZG9jLnJhdy5maWxlKHBhcnROYW1lLCBkYXRhKVxuXHRcdHRoaXMuZG9jLnBhcnRzW3BhcnROYW1lXT10aGlzLmRvYy5yYXcuZmlsZShwYXJ0TmFtZSlcblxuXHRcdHRoaXMucmVscyhcIlJlbGF0aW9uc2hpcHNcIilcblx0XHRcdC5hcHBlbmQoYDxSZWxhdGlvbnNoaXAgSWQ9XCIke2lkfVwiIFR5cGU9XCIke3R5cGV9XCIgVGFyZ2V0PVwiJHtwYXJ0TmFtZX1cIi8+YClcblxuXHRcdHJldHVybiBpZFxuXHR9XG5cblx0YWRkRXh0ZXJuYWxJbWFnZSh1cmwpe1xuXHRcdGNvbnN0IHR5cGU9XCJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvb2ZmaWNlRG9jdW1lbnQvMjAwNi9yZWxhdGlvbnNoaXBzL2ltYWdlXCJcblxuXHRcdGxldCBpZD1gcklkJHt0aGlzLl9uZXh0cklkKCl9YFxuXG5cdFx0dGhpcy5yZWxzKFwiUmVsYXRpb25zaGlwc1wiKVxuXHRcdFx0LmFwcGVuZChgPFJlbGF0aW9uc2hpcCBJZD1cIiR7aWR9XCIgVHlwZT1cIiR7dHlwZX1cIiBUYXJnZXRNb2RlPVwiRXh0ZXJuYWxcIiBUYXJnZXQ9XCIke3VybH1cIi8+YClcblxuXHRcdHJldHVybiBpZFxuXHR9XG5cblx0YWRkQ2h1bmsoZGF0YSwgcmVsYXRpb25zaGlwVHlwZSwgY29udGVudFR5cGUsIGV4dCl7XG5cdFx0cmVsYXRpb25zaGlwVHlwZT1yZWxhdGlvbnNoaXBUeXBlfHxcImh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvYUZDaHVua1wiXG5cdFx0Y29udGVudFR5cGU9Y29udGVudFR5cGV8fHRoaXMuZG9jLmNvbnN0cnVjdG9yLm1pbWVcblx0XHRleHQ9ZXh0fHx0aGlzLmRvYy5jb25zdHJ1Y3Rvci5leHRcblxuXHRcdGxldCBpZD10aGlzLl9uZXh0cklkKClcblx0XHRsZXQgcklkPWBySWQke2lkfWBcblx0XHRsZXQgdGFyZ2V0TmFtZT1gY2h1bmsvY2h1bmske2lkfS4ke2V4dH1gXG5cdFx0bGV0IHBhcnROYW1lPWAke3RoaXMuZm9sZGVyfSR7dGFyZ2V0TmFtZX1gXG5cdFx0dGhpcy5kb2MucmF3LmZpbGUocGFydE5hbWUsIGRhdGEpXG5cdFx0dGhpcy5kb2MucGFydHNbcGFydE5hbWVdPXRoaXMuZG9jLnJhdy5maWxlKHBhcnROYW1lKVxuXG5cdFx0dGhpcy5yZWxzKFwiUmVsYXRpb25zaGlwc1wiKVxuXHRcdFx0LmFwcGVuZChgPFJlbGF0aW9uc2hpcCBJZD1cIiR7cklkfVwiIFR5cGU9XCIke3JlbGF0aW9uc2hpcFR5cGV9XCIgVGFyZ2V0PVwiJHt0YXJnZXROYW1lfVwiLz5gKVxuXG5cdFx0dGhpcy5kb2MuY29udGVudFR5cGVzXG5cdFx0XHQuYXBwZW5kKGA8T3ZlcnJpZGUgUGFydE5hbWU9XCIvJHtwYXJ0TmFtZX1cIiBDb250ZW50VHlwZT1cIiR7Y29udGVudFR5cGV9XCIvPmApXG5cblx0XHRyZXR1cm4gcklkXG5cdH1cblx0XG5cdGdldFJlbE9sZU9iamVjdChyaWQpe1xuXHRcdGxldCByZWw9dGhpcy5yZWxzKGBSZWxhdGlvbnNoaXBbSWQ9JHtyaWR9XWApXG5cdFx0bGV0IHR5cGU9cmVsLmF0dHIoXCJUeXBlXCIpXG5cdFx0bGV0IHRhcmdldE5hbWU9cmVsLmF0dHIoXCJUYXJnZXRcIilcblx0XHRsZXQgZGF0YT10aGlzLmRvYy5nZXREYXRhUGFydChgJHt0aGlzLmZvbGRlcn0ke3RhcmdldE5hbWV9YClcblx0XHRzd2l0Y2godHlwZS5zcGxpdChcIi9cIikucG9wKCkpe1xuXHRcdFx0Y2FzZSBcIm9sZU9iamVjdFwiOlxuXHRcdFx0XHRyZXR1cm4gT0xFLnBhcnNlKGRhdGEpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZGF0YVxuXHRcdH1cblx0XHRcblx0fVxuXHRcblx0cmVtb3ZlUmVsKGlkKXtcblx0XHRsZXQgcmVsPXRoaXMucmVscyhgUmVsYXRpb25zaGlwW0lkPVwiJHtpZH1cIl1gKVxuXHRcdGlmKHJlbC5hdHRyKFwiVGFyZ2V0TW9kZVwiKSE9PVwiRXh0ZXJuYWxcIil7XG5cdFx0XHRsZXQgcGFydE5hbWU9dGhpcy5mb2xkZXIrcmVsLmF0dHIoXCJUYXJnZXRcIilcblx0XHRcdHRoaXMuZG9jLmNvbnRlbnRUeXBlcy5maW5kKGBbUGFydE5hbWU9Jy8ke3BhcnROYW1lfSddYCkucmVtb3ZlKClcblx0XHRcdHRoaXMuZG9jLnJhdy5yZW1vdmUocGFydE5hbWUpXG5cdFx0XHRkZWxldGUgdGhpcy5kb2MucGFydHNbcGFydE5hbWVdXG5cdFx0fVxuXHRcdHJlbC5yZW1vdmUoKVxuXHR9XG5cblx0cmVuZGVyTm9kZShub2RlLCBjcmVhdGVFbGVtZW50PSh0eXBlLHByb3BzLGNoaWxkcmVuKT0+e3R5cGUscHJvcHMsY2hpbGRyZW59LGlkZW50aWZ5PW5vZGU9Pm5vZGUubmFtZS5zcGxpdChcIjpcIikucG9wKCkpe1xuXHRcdGxldCB7bmFtZTp0YWdOYW1lLCBjaGlsZHJlbixpZCwgcGFyZW50fT1ub2RlXG5cdFx0aWYobm9kZS50eXBlPT1cInRleHRcIil7XG5cdFx0XHRpZihwYXJlbnQubmFtZT09XCJ3OnRcIil7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGFcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0bGV0IHR5cGU9dGFnTmFtZVxuXHRcdGxldCBwcm9wcz17fVxuXG5cdFx0aWYoaWRlbnRpZnkpe1xuXHRcdFx0bGV0IG1vZGVsPWlkZW50aWZ5KG5vZGUsdGhpcylcblx0XHRcdGlmKCFtb2RlbClcblx0XHRcdFx0cmV0dXJuIG51bGxcblxuXHRcdFx0aWYodHlwZW9mKG1vZGVsKT09XCJzdHJpbmdcIil7XG5cdFx0XHRcdHR5cGU9bW9kZWxcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRsZXQgY29udGVudDtcblx0XHRcdFx0KHt0eXBlLCBjaGlsZHJlbjpjb250ZW50LCAuLi5wcm9wc309bW9kZWwpO1xuXHRcdFx0XHRpZihjb250ZW50IT09dW5kZWZpbmVkKVxuXHRcdFx0XHRcdGNoaWxkcmVuPWNvbnRlbnRcblx0XHRcdH1cblx0XHR9XG5cdFx0cHJvcHMua2V5PWlkXG5cdFx0cHJvcHMubm9kZT1ub2RlXG5cdFx0cHJvcHMudHlwZT10eXBlXG5cblx0XHRsZXQgY2hpbGRFbGVtZW50cz1bXVxuXHRcdGlmKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCl7XG5cdFx0XHRjaGlsZEVsZW1lbnRzPWNoaWxkcmVuLm1hcChhPT5hID8gdGhpcy5yZW5kZXJOb2RlKGEsY3JlYXRlRWxlbWVudCxpZGVudGlmeSkgOiBudWxsKVxuXHRcdFx0XHQuZmlsdGVyKGE9PiEhYSlcblx0XHR9XG5cblx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudChcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0cHJvcHMsXG5cdFx0XHRcdGNoaWxkRWxlbWVudHNcblx0XHRcdClcblx0fVxufVxuIl19