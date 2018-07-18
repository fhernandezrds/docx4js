"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jszip = require("jszip");

var _jszip2 = _interopRequireDefault(_jszip);

var _cheerio = require("cheerio");

var _cheerio2 = _interopRequireDefault(_cheerio);

var _htmlparser = require("htmlparser2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  document parser
 *
 *  @example
 *  Document.load(file)
 *  	.then(doc=>doc.parse())
 */
var ZipDocument = function () {
	function ZipDocument(parts, raw, props) {
		_classCallCheck(this, ZipDocument);

		this.parts = parts;
		this.raw = raw;
		this.props = props;
		this._shouldReleased = new Map();
	}

	_createClass(ZipDocument, [{
		key: "getPart",
		value: function getPart(name) {
			return this.parts[name];
		}
	}, {
		key: "getDataPart",
		value: function getDataPart(name) {
			var part = this.parts[name];
			var crc32 = part._data.crc32;
			var data = part.asUint8Array(); //unsafe call, part._data is changed
			data.crc32 = part._data.crc32 = crc32; //so keep crc32 on part._data for future
			return data;
		}
	}, {
		key: "getDataPartAsUrl",
		value: function getDataPartAsUrl(name) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "*/*";

			var part = this.parts[name];
			var crc32 = part._data.crc32;
			if (!this._shouldReleased.has(crc32)) {
				this._shouldReleased.set(crc32, URL.createObjectURL(new Blob([this.getDataPart(name)], { type: type })));
			}
			return this._shouldReleased.get(crc32);
		}
	}, {
		key: "getPartCrc32",
		value: function getPartCrc32(name) {
			var part = this.parts[name];
			var crc32 = part._data.crc32;
			return crc32;
		}
	}, {
		key: "release",
		value: function release() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this._shouldReleased[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2),
					    url = _step$value[1];

					window.URL.revokeObjectURL(url);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: "getObjectPart",
		value: function getObjectPart(name) {
			var part = this.parts[name];
			if (!part) return null;else if (part.cheerio) return part;else return this.parts[name] = this.constructor.parseXml(part.asText());
		}
	}, {
		key: "parse",
		value: function parse(domHandler) {}
	}, {
		key: "render",
		value: function render() {}
	}, {
		key: "serialize",
		value: function serialize() {
			var _this = this;

			var newDoc = new _jszip2.default();
			Object.keys(this.parts).forEach(function (path) {
				var part = _this.parts[path];
				if (part.cheerio) {
					newDoc.file(path, part.xml());
				} else {
					newDoc.file(path, part._data, part.options);
				}
			});
			return newDoc;
		}
	}, {
		key: "save",
		value: function save(file, options) {
			file = file || this.props.name || Date.now() + ".docx";

			var newDoc = this.serialize();

			if (typeof document != "undefined" && window.URL && window.URL.createObjectURL) {
				var data = newDoc.generate(_extends({}, options, { type: "blob", mimeType: this.constructor.mime }));
				var url = window.URL.createObjectURL(data);
				var link = document.createElement("a");
				document.body.appendChild(link);
				link.download = file;
				link.href = url;
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			} else {
				var _data = newDoc.generate(_extends({}, options, { type: "nodebuffer" }));
				return new Promise(function (resolve, reject) {
					return require("f" + "s").writeFile(file, _data, function (error) {
						error ? reject(error) : resolve(_data);
					});
				});
			}
		}
	}, {
		key: "clone",
		value: function clone() {
			var _this2 = this;

			var zip = new _jszip2.default();
			var props = props ? JSON.parse(JSON.stringify(this.props)) : props;
			var parts = Object.keys(this.parts).reduce(function (state, k) {
				var v = _this2.parts[k];
				if (v.cheerio) {
					state[k] = _this2.constructor.parseXml(v.xml());
				} else {
					zip.file(v.name, v._data, v.options);
					state[k] = zip.file(v.name);
				}
				return state;
			}, {});
			return new this.constructor(parts, zip, props);
		}

		/**
   *  a helper to load document file
  	 *  @param inputFile {File} - a html input file, or nodejs file
   *  @return {Promise}
   */

	}], [{
		key: "load",
		value: function load(inputFile) {
			var DocumentSelf = this;

			if (inputFile instanceof ZipDocument) return Promise.resolve(inputFile);

			return new Promise(function (resolve, reject) {
				function parse(data) {
					var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

					try {
						var raw = new _jszip2.default(data),
						    parts = {};
						raw.filter(function (path, file) {
							return parts[path] = file;
						});
						resolve(new DocumentSelf(parts, raw, props));
					} catch (error) {
						reject(error);
					}
				}

				if (typeof inputFile == 'string') {
					//file name
					require('fs').readFile(inputFile, function (error, data) {
						if (error) reject(error);else if (data) {
							parse(data, { name: inputFile.split(/[\/\\]/).pop().replace(/\.docx$/i, '') });
						}
					});
				} else if (inputFile instanceof Blob) {
					var reader = new FileReader();
					reader.onload = function (e) {
						parse(e.target.result, inputFile.name ? {
							name: inputFile.name.replace(/\.docx$/i, ''),
							lastModified: inputFile.lastModified,
							size: inputFile.size
						} : { size: inputFile.size });
					};
					reader.readAsArrayBuffer(inputFile);
				} else {
					parse(inputFile);
				}
			});
		}
	}, {
		key: "create",
		value: function create() {
			return this.load(__dirname + "/../templates/blank." + this.ext);
		}
	}, {
		key: "parseXml",
		value: function parseXml(data) {
			try {
				var opt = { xmlMode: true, decodeEntities: false };
				var handler = new ContentDomHandler(opt);
				new _htmlparser.Parser(handler, opt).end(data);
				var parsed = _cheerio2.default.load(handler.dom, opt);
				if (typeof parsed.cheerio == "undefined") parsed.cheerio = "customized";
				return parsed;
			} catch (error) {
				console.error(error);
				return null;
			}
		}
	}]);

	return ZipDocument;
}();

ZipDocument.ext = "unknown";
ZipDocument.mime = "application/zip";
exports.default = ZipDocument;

var ContentDomHandler = function (_DomHandler) {
	_inherits(ContentDomHandler, _DomHandler);

	function ContentDomHandler() {
		_classCallCheck(this, ContentDomHandler);

		return _possibleConstructorReturn(this, (ContentDomHandler.__proto__ || Object.getPrototypeOf(ContentDomHandler)).apply(this, arguments));
	}

	_createClass(ContentDomHandler, [{
		key: "_addDomElement",
		value: function _addDomElement(el) {
			if (el.type == "text" && (el.data[0] == '\r' || el.data[0] == '\n')) ; //remove format whitespaces
			else return _get(ContentDomHandler.prototype.__proto__ || Object.getPrototypeOf(ContentDomHandler.prototype), "_addDomElement", this).call(this, el);
		}
	}]);

	return ContentDomHandler;
}(_htmlparser.DomHandler);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6WyJaaXBEb2N1bWVudCIsInBhcnRzIiwicmF3IiwicHJvcHMiLCJfc2hvdWxkUmVsZWFzZWQiLCJNYXAiLCJuYW1lIiwicGFydCIsImNyYzMyIiwiX2RhdGEiLCJkYXRhIiwiYXNVaW50OEFycmF5IiwidHlwZSIsImhhcyIsInNldCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsIkJsb2IiLCJnZXREYXRhUGFydCIsImdldCIsInVybCIsIndpbmRvdyIsInJldm9rZU9iamVjdFVSTCIsImNoZWVyaW8iLCJjb25zdHJ1Y3RvciIsInBhcnNlWG1sIiwiYXNUZXh0IiwiZG9tSGFuZGxlciIsIm5ld0RvYyIsIkpTWmlwIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJwYXRoIiwiZmlsZSIsInhtbCIsIm9wdGlvbnMiLCJEYXRlIiwibm93Iiwic2VyaWFsaXplIiwiZG9jdW1lbnQiLCJnZW5lcmF0ZSIsIm1pbWVUeXBlIiwibWltZSIsImxpbmsiLCJjcmVhdGVFbGVtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG93bmxvYWQiLCJocmVmIiwiY2xpY2siLCJyZW1vdmVDaGlsZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicmVxdWlyZSIsIndyaXRlRmlsZSIsImVycm9yIiwiemlwIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwicmVkdWNlIiwic3RhdGUiLCJrIiwidiIsImlucHV0RmlsZSIsIkRvY3VtZW50U2VsZiIsImZpbHRlciIsInJlYWRGaWxlIiwic3BsaXQiLCJwb3AiLCJyZXBsYWNlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImUiLCJ0YXJnZXQiLCJyZXN1bHQiLCJsYXN0TW9kaWZpZWQiLCJzaXplIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJsb2FkIiwiX19kaXJuYW1lIiwiZXh0Iiwib3B0IiwieG1sTW9kZSIsImRlY29kZUVudGl0aWVzIiwiaGFuZGxlciIsIkNvbnRlbnREb21IYW5kbGVyIiwiUGFyc2VyIiwiZW5kIiwicGFyc2VkIiwiY2hlZXIiLCJkb20iLCJjb25zb2xlIiwiZWwiLCJEb21IYW5kbGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBOzs7Ozs7O0lBT3FCQSxXO0FBSXBCLHNCQUFZQyxLQUFaLEVBQWtCQyxHQUFsQixFQUFzQkMsS0FBdEIsRUFBNEI7QUFBQTs7QUFDM0IsT0FBS0YsS0FBTCxHQUFXQSxLQUFYO0FBQ0EsT0FBS0MsR0FBTCxHQUFTQSxHQUFUO0FBQ0EsT0FBS0MsS0FBTCxHQUFXQSxLQUFYO0FBQ0EsT0FBS0MsZUFBTCxHQUFxQixJQUFJQyxHQUFKLEVBQXJCO0FBQ0E7Ozs7MEJBRU9DLEksRUFBSztBQUNaLFVBQU8sS0FBS0wsS0FBTCxDQUFXSyxJQUFYLENBQVA7QUFDQTs7OzhCQUVXQSxJLEVBQUs7QUFDaEIsT0FBSUMsT0FBSyxLQUFLTixLQUFMLENBQVdLLElBQVgsQ0FBVDtBQUNBLE9BQUlFLFFBQU1ELEtBQUtFLEtBQUwsQ0FBV0QsS0FBckI7QUFDQSxPQUFJRSxPQUFLSCxLQUFLSSxZQUFMLEVBQVQsQ0FIZ0IsQ0FHWTtBQUM1QkQsUUFBS0YsS0FBTCxHQUFXRCxLQUFLRSxLQUFMLENBQVdELEtBQVgsR0FBaUJBLEtBQTVCLENBSmdCLENBSWlCO0FBQ2pDLFVBQU9FLElBQVA7QUFDQTs7O21DQUVnQkosSSxFQUFnQjtBQUFBLE9BQVhNLElBQVcsdUVBQU4sS0FBTTs7QUFDaEMsT0FBSUwsT0FBSyxLQUFLTixLQUFMLENBQVdLLElBQVgsQ0FBVDtBQUNBLE9BQUlFLFFBQU1ELEtBQUtFLEtBQUwsQ0FBV0QsS0FBckI7QUFDQSxPQUFHLENBQUMsS0FBS0osZUFBTCxDQUFxQlMsR0FBckIsQ0FBeUJMLEtBQXpCLENBQUosRUFBb0M7QUFDbkMsU0FBS0osZUFBTCxDQUFxQlUsR0FBckIsQ0FBeUJOLEtBQXpCLEVBQStCTyxJQUFJQyxlQUFKLENBQW9C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Q0EsV0FBTyxJQUFQO0FBQ0E7QUFDRDs7Ozs7O0FBckxtQnpELFcsQ0FDYm9GLEcsR0FBSSxTO0FBRFNwRixXLENBRWIyQyxJLEdBQUssaUI7a0JBRlEzQyxXOztJQXdMZnlGLGlCOzs7Ozs7Ozs7OztpQ0FDVU8sRSxFQUFHO0FBQ2pCLE9BQUdBLEdBQUdwRixJQUFILElBQVMsTUFBVCxLQUFvQm9GLEdBQUd0RixJQUFILENBQVEsQ0FBUixLQUFZLElBQVosSUFBb0JzRixHQUFHdEYsSUFBSCxDQUFRLENBQVIsS0FBWSxJQUFwRCxDQUFILEVBQ0MsQ0FERCxDQUNFO0FBREYsUUFHQyw0SUFBNEJzRixFQUE1QjtBQUNEOzs7O0VBTjhCQyxzQiIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBKU1ppcCwge1ppcE9iamVjdH0gZnJvbSAnanN6aXAnXG5pbXBvcnQgY2hlZXIgZnJvbSBcImNoZWVyaW9cIlxuaW1wb3J0IHtQYXJzZXIsIERvbUhhbmRsZXJ9IGZyb20gXCJodG1scGFyc2VyMlwiXG5cbi8qKlxuICogIGRvY3VtZW50IHBhcnNlclxuICpcbiAqICBAZXhhbXBsZVxuICogIERvY3VtZW50LmxvYWQoZmlsZSlcbiAqICBcdC50aGVuKGRvYz0+ZG9jLnBhcnNlKCkpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFppcERvY3VtZW50e1xuXHRzdGF0aWMgZXh0PVwidW5rbm93blwiXG5cdHN0YXRpYyBtaW1lPVwiYXBwbGljYXRpb24vemlwXCJcblxuXHRjb25zdHJ1Y3RvcihwYXJ0cyxyYXcscHJvcHMpe1xuXHRcdHRoaXMucGFydHM9cGFydHNcblx0XHR0aGlzLnJhdz1yYXdcblx0XHR0aGlzLnByb3BzPXByb3BzXG5cdFx0dGhpcy5fc2hvdWxkUmVsZWFzZWQ9bmV3IE1hcCgpXG5cdH1cblxuXHRnZXRQYXJ0KG5hbWUpe1xuXHRcdHJldHVybiB0aGlzLnBhcnRzW25hbWVdXG5cdH1cblxuXHRnZXREYXRhUGFydChuYW1lKXtcblx0XHRsZXQgcGFydD10aGlzLnBhcnRzW25hbWVdXG5cdFx0bGV0IGNyYzMyPXBhcnQuX2RhdGEuY3JjMzJcblx0XHRsZXQgZGF0YT1wYXJ0LmFzVWludDhBcnJheSgpLy91bnNhZmUgY2FsbCwgcGFydC5fZGF0YSBpcyBjaGFuZ2VkXG5cdFx0ZGF0YS5jcmMzMj1wYXJ0Ll9kYXRhLmNyYzMyPWNyYzMyLy9zbyBrZWVwIGNyYzMyIG9uIHBhcnQuX2RhdGEgZm9yIGZ1dHVyZVxuXHRcdHJldHVybiBkYXRhXG5cdH1cblxuXHRnZXREYXRhUGFydEFzVXJsKG5hbWUsdHlwZT1cIiovKlwiKXtcblx0XHRsZXQgcGFydD10aGlzLnBhcnRzW25hbWVdXG5cdFx0bGV0IGNyYzMyPXBhcnQuX2RhdGEuY3JjMzJcblx0XHRpZighdGhpcy5fc2hvdWxkUmVsZWFzZWQuaGFzKGNyYzMyKSl7XG5cdFx0XHR0aGlzLl9zaG91bGRSZWxlYXNlZC5zZXQoY3JjMzIsVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbdGhpcy5nZXREYXRhUGFydChuYW1lKV0se3R5cGV9KSkpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9zaG91bGRSZWxlYXNlZC5nZXQoY3JjMzIpXG5cdH1cblxuXHRnZXRQYXJ0Q3JjMzIobmFtZSl7XG5cdFx0bGV0IHBhcnQ9dGhpcy5wYXJ0c1tuYW1lXVxuXHRcdGxldCBjcmMzMj1wYXJ0Ll9kYXRhLmNyYzMyXG5cdFx0cmV0dXJuIGNyYzMyXG5cdH1cblxuXHRyZWxlYXNlKCl7XG5cdFx0Zm9yKGxldCBbLCB1cmxdIG9mIHRoaXMuX3Nob3VsZFJlbGVhc2VkKXtcblx0XHRcdHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHVybClcblx0XHR9XG5cdH1cblxuXHRnZXRPYmplY3RQYXJ0KG5hbWUpe1xuXHRcdGNvbnN0IHBhcnQ9dGhpcy5wYXJ0c1tuYW1lXVxuXHRcdGlmKCFwYXJ0KVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRlbHNlIGlmKHBhcnQuY2hlZXJpbylcblx0XHRcdHJldHVybiBwYXJ0XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIHRoaXMucGFydHNbbmFtZV09dGhpcy5jb25zdHJ1Y3Rvci5wYXJzZVhtbChwYXJ0LmFzVGV4dCgpKVxuXHR9XG5cdFxuXHRwYXJzZShkb21IYW5kbGVyKXtcblxuXHR9XG5cblx0cmVuZGVyKCl7XG5cblx0fVxuXHRcblx0c2VyaWFsaXplKCl7XG5cdFx0bGV0IG5ld0RvYz1uZXcgSlNaaXAoKVxuXHRcdE9iamVjdC5rZXlzKHRoaXMucGFydHMpLmZvckVhY2gocGF0aD0+e1xuXHRcdFx0bGV0IHBhcnQ9dGhpcy5wYXJ0c1twYXRoXVxuXHRcdFx0aWYocGFydC5jaGVlcmlvKXtcblx0XHRcdFx0bmV3RG9jLmZpbGUocGF0aCxwYXJ0LnhtbCgpKVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdG5ld0RvYy5maWxlKHBhdGgscGFydC5fZGF0YSwgcGFydC5vcHRpb25zKVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0cmV0dXJuIG5ld0RvY1xuXHR9XG5cblx0c2F2ZShmaWxlLG9wdGlvbnMpe1xuXHRcdGZpbGU9ZmlsZXx8dGhpcy5wcm9wcy5uYW1lfHxgJHtEYXRlLm5vdygpfS5kb2N4YFxuXHRcdFxuXHRcdGxldCBuZXdEb2M9dGhpcy5zZXJpYWxpemUoKVxuXHRcdFxuXHRcdGlmKHR5cGVvZihkb2N1bWVudCkhPVwidW5kZWZpbmVkXCIgJiYgd2luZG93LlVSTCAmJiB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCl7XG5cdFx0XHRsZXQgZGF0YT1uZXdEb2MuZ2VuZXJhdGUoey4uLm9wdGlvbnMsdHlwZTpcImJsb2JcIixtaW1lVHlwZTp0aGlzLmNvbnN0cnVjdG9yLm1pbWV9KVxuXHRcdFx0bGV0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGRhdGEpXG5cdFx0XHRsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKVxuXHRcdFx0bGluay5kb3dubG9hZCA9IGZpbGVcblx0XHRcdGxpbmsuaHJlZiA9IHVybDtcblx0XHRcdGxpbmsuY2xpY2soKVxuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxuXHRcdFx0d2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodXJsKVxuXHRcdH1lbHNle1xuXHRcdFx0bGV0IGRhdGE9bmV3RG9jLmdlbmVyYXRlKHsuLi5vcHRpb25zLHR5cGU6XCJub2RlYnVmZmVyXCJ9KVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PlxuXHRcdFx0XHRyZXF1aXJlKFwiZlwiK1wic1wiKS53cml0ZUZpbGUoZmlsZSxkYXRhLGVycm9yPT57XG5cdFx0XHRcdFx0ZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShkYXRhKVxuXHRcdFx0XHR9KVxuXHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdGNsb25lKCl7XG5cdFx0bGV0IHppcD1uZXcgSlNaaXAoKVxuXHRcdGxldCBwcm9wcz0gcHJvcHMgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMpKSA6IHByb3BzXG5cdFx0bGV0IHBhcnRzPU9iamVjdC5rZXlzKHRoaXMucGFydHMpLnJlZHVjZSgoc3RhdGUsIGspPT57XG5cdFx0XHRsZXQgdj10aGlzLnBhcnRzW2tdXG5cdFx0XHRpZih2LmNoZWVyaW8pe1xuXHRcdFx0XHRzdGF0ZVtrXT10aGlzLmNvbnN0cnVjdG9yLnBhcnNlWG1sKHYueG1sKCkpXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0emlwLmZpbGUodi5uYW1lLHYuX2RhdGEsdi5vcHRpb25zKVxuXHRcdFx0XHRzdGF0ZVtrXT16aXAuZmlsZSh2Lm5hbWUpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc3RhdGVcblx0XHR9LHt9KVxuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihwYXJ0cyx6aXAsIHByb3BzKVxuXHR9XG5cblx0LyoqXG5cdCAqICBhIGhlbHBlciB0byBsb2FkIGRvY3VtZW50IGZpbGVcblxuXHQgKiAgQHBhcmFtIGlucHV0RmlsZSB7RmlsZX0gLSBhIGh0bWwgaW5wdXQgZmlsZSwgb3Igbm9kZWpzIGZpbGVcblx0ICogIEByZXR1cm4ge1Byb21pc2V9XG5cdCAqL1xuXG5cdHN0YXRpYyBsb2FkKGlucHV0RmlsZSl7XG5cdFx0Y29uc3QgRG9jdW1lbnRTZWxmPXRoaXNcblxuXHRcdGlmKGlucHV0RmlsZSBpbnN0YW5jZW9mIFppcERvY3VtZW50KVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShpbnB1dEZpbGUpXG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9Pntcblx0XHRcdGZ1bmN0aW9uIHBhcnNlKGRhdGEsIHByb3BzPXt9KXtcblx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdGxldCByYXc9bmV3IEpTWmlwKGRhdGEpLHBhcnRzPXt9XG5cdFx0XHRcdFx0cmF3LmZpbHRlcigocGF0aCxmaWxlKT0+cGFydHNbcGF0aF09ZmlsZSlcblx0XHRcdFx0XHRyZXNvbHZlKG5ldyBEb2N1bWVudFNlbGYocGFydHMscmF3LHByb3BzKSlcblx0XHRcdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdFx0XHRyZWplY3QoZXJyb3IpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYodHlwZW9mIGlucHV0RmlsZT09J3N0cmluZycpey8vZmlsZSBuYW1lXG5cdFx0XHRcdHJlcXVpcmUoJ2ZzJykucmVhZEZpbGUoaW5wdXRGaWxlLGZ1bmN0aW9uKGVycm9yLCBkYXRhKXtcblx0XHRcdFx0XHRpZihlcnJvcilcblx0XHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdFx0ZWxzZSBpZihkYXRhKXtcblx0XHRcdFx0XHRcdHBhcnNlKGRhdGEsIHtuYW1lOmlucHV0RmlsZS5zcGxpdCgvW1xcL1xcXFxdLykucG9wKCkucmVwbGFjZSgvXFwuZG9jeCQvaSwnJyl9KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1lbHNlIGlmKGlucHV0RmlsZSBpbnN0YW5jZW9mIEJsb2Ipe1xuXHRcdFx0XHR2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdHJlYWRlci5vbmxvYWQ9ZnVuY3Rpb24oZSl7XG5cdFx0XHRcdFx0cGFyc2UoZS50YXJnZXQucmVzdWx0LCAoaW5wdXRGaWxlLm5hbWUgPyB7XG5cdFx0XHRcdFx0XHRcdG5hbWU6aW5wdXRGaWxlLm5hbWUucmVwbGFjZSgvXFwuZG9jeCQvaSwnJyksXG5cdFx0XHRcdFx0XHRcdGxhc3RNb2RpZmllZDppbnB1dEZpbGUubGFzdE1vZGlmaWVkLFxuXHRcdFx0XHRcdFx0XHRzaXplOmlucHV0RmlsZS5zaXplXG5cdFx0XHRcdFx0XHR9IDoge3NpemU6aW5wdXRGaWxlLnNpemV9KSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoaW5wdXRGaWxlKTtcblx0XHRcdH1lbHNlIHtcblx0XHRcdFx0cGFyc2UoaW5wdXRGaWxlKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKCl7XG5cdFx0cmV0dXJuIHRoaXMubG9hZChgJHtfX2Rpcm5hbWV9Ly4uL3RlbXBsYXRlcy9ibGFuay4ke3RoaXMuZXh0fWApXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VYbWwoZGF0YSl7XG5cdFx0dHJ5e1xuXHRcdFx0bGV0IG9wdD17eG1sTW9kZTp0cnVlLGRlY29kZUVudGl0aWVzOiBmYWxzZX1cblx0XHRcdGxldCBoYW5kbGVyPW5ldyBDb250ZW50RG9tSGFuZGxlcihvcHQpXG5cdFx0XHRuZXcgUGFyc2VyKGhhbmRsZXIsb3B0KS5lbmQoZGF0YSlcblx0XHRcdGxldCBwYXJzZWQ9Y2hlZXIubG9hZChoYW5kbGVyLmRvbSxvcHQpXG5cdFx0XHRpZih0eXBlb2YocGFyc2VkLmNoZWVyaW8pPT1cInVuZGVmaW5lZFwiKVxuXHRcdFx0XHRwYXJzZWQuY2hlZXJpbz1cImN1c3RvbWl6ZWRcIlxuXHRcdFx0cmV0dXJuIHBhcnNlZFxuXHRcdH1jYXRjaChlcnJvcil7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdH1cbn1cblxuY2xhc3MgQ29udGVudERvbUhhbmRsZXIgZXh0ZW5kcyBEb21IYW5kbGVye1xuXHRfYWRkRG9tRWxlbWVudChlbCl7XG5cdFx0aWYoZWwudHlwZT09XCJ0ZXh0XCIgJiYgKGVsLmRhdGFbMF09PSdcXHInIHx8IGVsLmRhdGFbMF09PSdcXG4nKSlcblx0XHRcdDsvL3JlbW92ZSBmb3JtYXQgd2hpdGVzcGFjZXNcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gc3VwZXIuX2FkZERvbUVsZW1lbnQoZWwpXG5cdH1cbn1cbiJdfQ==