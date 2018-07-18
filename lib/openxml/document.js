"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _document = require("../document");

var _document2 = _interopRequireDefault(_document);

var _part = require("./part");

var _part2 = _interopRequireDefault(_part);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Base) {
	_inherits(_class, _Base);

	function _class() {
		_classCallCheck(this, _class);

		var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));

		_this.main = new _part2.default("", _this);
		_this.officeDocument = new _this.constructor.OfficeDocument(_this.main.getRelTarget("officeDocument"), _this);
		return _this;
	}

	_createClass(_class, [{
		key: "render",
		value: function render() {
			var _officeDocument;

			return (_officeDocument = this.officeDocument).render.apply(_officeDocument, arguments);
		}
	}, {
		key: "parse",
		value: function parse() {
			var _officeDocument2;

			return (_officeDocument2 = this.officeDocument).parse.apply(_officeDocument2, arguments);
		}
	}, {
		key: "dxa2Px",
		value: function dxa2Px(a) {
			return this.pt2Px(parseInt(a) / 20.0);
		}
	}, {
		key: "pt2Px",
		value: function pt2Px(pt) {
			return Math.ceil(pt * 96 / 72);
		}
	}, {
		key: "cm2Px",
		value: function cm2Px(cm) {
			return this.pt2Px(parseInt(cm) * 28.3464567 / 360000);
		}
	}, {
		key: "asColor",
		value: function asColor(v) {
			if (!v || v.length == 0 || v == 'auto') return '#000000';
			v = v.split(' ')[0];
			return v.charAt(0) == '#' ? v : RGB.test(v) ? '#' + v : v;
		}
	}, {
		key: "shadeColor",
		value: function shadeColor(color, percent) {
			if (!RGB.test(color)) return color;
			var R = parseInt(color.substring(1, 3), 16);
			var G = parseInt(color.substring(3, 5), 16);
			var B = parseInt(color.substring(5, 7), 16);

			R = parseInt(R * (100 + percent) / 100);
			G = parseInt(G * (100 + percent) / 100);
			B = parseInt(B * (100 + percent) / 100);

			R = R < 255 ? R : 255;
			G = G < 255 ? G : 255;
			B = B < 255 ? B : 255;

			var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
			var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
			var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

			return "#" + RR + GG + BB;
		}
	}, {
		key: "toPx",
		value: function toPx(length) {
			var value = parseFloat(length),
			    units = String(length).match(RE_LENGTH_UNIT)[1];

			switch (units) {
				case 'em':
					return value * 16;
				case 'rem':
					return value * 16;
				case 'cm':
					return value * 96 / 2.54;
				case 'mm':
					return value * 96 / 2.54 / 10;
				case 'in':
					return value * 96;
				case 'pt':
					return value * 72;
				case 'pc':
					return value * 72 / 12;
				default:
					return value;
			}
		}
	}, {
		key: "vender",
		get: function get() {
			"Microsoft";
		}
	}, {
		key: "product",
		get: function get() {
			return 'Office 2010';
		}
	}, {
		key: "contentTypes",
		get: function get() {
			return this.getObjectPart("[Content_Types].xml")("Types");
		}
	}]);

	return _class;
}(_document2.default);

_class.OfficeDocument = _part2.default;
exports.default = _class;

var RGB = /([a-fA-F0-9]{2}?){3}?/;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVueG1sL2RvY3VtZW50LmpzIl0sIm5hbWVzIjpbImFyZ3VtZW50cyIsIm1haW4iLCJQYXJ0Iiwib2ZmaWNlRG9jdW1lbnQiLCJjb25zdHJ1Y3RvciIsIk9mZmljZURvY3VtZW50IiwiZ2V0UmVsVGFyZ2V0IiwicmVuZGVyIiwicGFyc2UiLCJhIiwicHQyUHgiLCJwYXJzZUludCIsInB0IiwiTWF0aCIsImNlaWwiLCJjbSIsInYiLCJsZW5ndGgiLCJzcGxpdCIsImNoYXJBdCIsIlJHQiIsInRlc3QiLCJjb2xvciIsInBlcmNlbnQiLCJSIiwic3Vic3RyaW5nIiwiRyIsIkIiLCJSUiIsInRvU3RyaW5nIiwiR0ciLCJCQiIsInZhbHVlIiwicGFyc2VGbG9hdCIsInVuaXRzIiwiU3RyaW5nIiwibWF0Y2giLCJSRV9MRU5HVEhfVU5JVCIsImdldE9iamVjdFBhcnQiLCJCYXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQUdDLG1CQUFhO0FBQUE7O0FBQUEsK0dBQ0hBLFNBREc7O0FBRVosUUFBS0MsSUFBTCxHQUFVLElBQUlDLGNBQUosQ0FBUyxFQUFULFFBQVY7QUFDQSxRQUFLQyxjQUFMLEdBQW9CLElBQUksTUFBS0MsV0FBTCxDQUFpQkMsY0FBckIsQ0FBb0MsTUFBS0osSUFBTCxDQUFVSyxZQUFWLENBQXVCLGdCQUF2QixDQUFwQyxRQUFwQjtBQUhZO0FBSVo7Ozs7MkJBU087QUFBQTs7QUFDUCxVQUFPLHdCQUFLSCxjQUFMLEVBQW9CSSxNQUFwQix3QkFBOEJQLFNBQTlCLENBQVA7QUFDQTs7OzBCQUVNO0FBQUE7O0FBQ04sVUFBTyx5QkFBS0csY0FBTCxFQUFvQkssS0FBcEIseUJBQTZCUixTQUE3QixDQUFQO0FBQ0E7Ozt5QkFFTVMsQyxFQUFFO0FBQ1IsVUFBTyxLQUFLQyxLQUFMLENBQVdDLFNBQVNGLENBQVQsSUFBWSxJQUF2QixDQUFQO0FBQ0E7Ozt3QkFFS0csRSxFQUFHO0FB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QUw7QUFBWSxZQUFPQSxRQUFRLEVBQWY7QUFDWixTQUFLLElBQUw7QUFBWSxZQUFPQSxRQUFRLEVBQWY7QUFDWixTQUFLLElBQUw7QUFBWSxZQUFPQSxRQUFRLEVBQVIsR0FBYSxFQUFwQjtBQUNaO0FBQVksWUFBT0EsS0FBUDtBQVJiO0FBVUE7OztzQkF2RVc7QUFBQztBQUFZOzs7c0JBRVo7QUFBQyxVQUFPLGFBQVA7QUFBcUI7OztzQkFFakI7QUFDakIsVUFBTyxLQUFLTSxhQUFMLENBQW1CLHFCQUFuQixFQUEwQyxPQUExQyxDQUFQO0FBQ0E7Ozs7RUFaMkJDLGtCOztPQStFckJsQyxjLEdBQWVILGM7OztBQUV2QixJQUFJa0IsTUFBSSx1QkFBUiIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXNlIGZyb20gXCIuLi9kb2N1bWVudFwiXG5pbXBvcnQgUGFydCBmcm9tICcuL3BhcnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgQmFzZXtcblx0Y29uc3RydWN0b3IoKXtcblx0XHRzdXBlciguLi5hcmd1bWVudHMpXG5cdFx0dGhpcy5tYWluPW5ldyBQYXJ0KFwiXCIsdGhpcylcblx0XHR0aGlzLm9mZmljZURvY3VtZW50PW5ldyB0aGlzLmNvbnN0cnVjdG9yLk9mZmljZURvY3VtZW50KHRoaXMubWFpbi5nZXRSZWxUYXJnZXQoXCJvZmZpY2VEb2N1bWVudFwiKSwgdGhpcylcblx0fVxuXHRnZXQgdmVuZGVyKCl7XCJNaWNyb3NvZnRcIn1cblxuXHRnZXQgcHJvZHVjdCgpe3JldHVybiAnT2ZmaWNlIDIwMTAnfVxuXG5cdGdldCBjb250ZW50VHlwZXMoKXtcblx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3RQYXJ0KFwiW0NvbnRlbnRfVHlwZXNdLnhtbFwiKShcIlR5cGVzXCIpXG5cdH1cblxuXHRyZW5kZXIoKXtcblx0XHRyZXR1cm4gdGhpcy5vZmZpY2VEb2N1bWVudC5yZW5kZXIoLi4uYXJndW1lbnRzKVxuXHR9XG5cblx0cGFyc2UoKXtcblx0XHRyZXR1cm4gdGhpcy5vZmZpY2VEb2N1bWVudC5wYXJzZSguLi5hcmd1bWVudHMpXG5cdH1cblxuXHRkeGEyUHgoYSl7XG5cdFx0cmV0dXJuIHRoaXMucHQyUHgocGFyc2VJbnQoYSkvMjAuMClcblx0fVxuXG5cdHB0MlB4KHB0KXtcblx0XHRyZXR1cm4gTWF0aC5jZWlsKHB0Kjk2LzcyKVxuXHR9XG5cblx0Y20yUHgoY20pe1xuXHRcdHJldHVybiB0aGlzLnB0MlB4KHBhcnNlSW50KGNtKSoyOC4zNDY0NTY3LzM2MDAwMClcblx0fVxuXG5cdGFzQ29sb3Iodil7XG5cdFx0aWYoIXYgfHwgdi5sZW5ndGg9PTAgfHwgdj09J2F1dG8nKVxuXHRcdFx0cmV0dXJuICcjMDAwMDAwJ1xuXHRcdHY9di5zcGxpdCgnICcpWzBdXG5cdFx0cmV0dXJuIHYuY2hhckF0KDApPT0nIycgPyB2IDogKFJHQi50ZXN0KHYpID8gJyMnK3YgOiB2KVxuXHR9XG5cblx0c2hhZGVDb2xvcihjb2xvciwgcGVyY2VudCkge1xuXHRcdGlmKCFSR0IudGVzdChjb2xvcikpXG5cdFx0XHRyZXR1cm4gY29sb3Jcblx0XHR2YXIgUiA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cmluZygxLDMpLDE2KTtcblx0XHR2YXIgRyA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cmluZygzLDUpLDE2KTtcblx0XHR2YXIgQiA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cmluZyg1LDcpLDE2KTtcblxuXHRcdFIgPSBwYXJzZUludChSICogKDEwMCArIHBlcmNlbnQpIC8gMTAwKTtcblx0XHRHID0gcGFyc2VJbnQoRyAqICgxMDAgKyBwZXJjZW50KSAvIDEwMCk7XG5cdFx0QiA9IHBhcnNlSW50KEIgKiAoMTAwICsgcGVyY2VudCkgLyAxMDApO1xuXG5cdFx0UiA9IChSPDI1NSk/UjoyNTU7XG5cdFx0RyA9IChHPDI1NSk/RzoyNTU7XG5cdFx0QiA9IChCPDI1NSk/QjoyNTU7XG5cblx0XHR2YXIgUlIgPSAoKFIudG9TdHJpbmcoMTYpLmxlbmd0aD09MSk/XCIwXCIrUi50b1N0cmluZygxNik6Ui50b1N0cmluZygxNikpO1xuXHRcdHZhciBHRyA9ICgoRy50b1N0cmluZygxNikubGVuZ3RoPT0xKT9cIjBcIitHLnRvU3RyaW5nKDE2KTpHLnRvU3RyaW5nKDE2KSk7XG5cdFx0dmFyIEJCID0gKChCLnRvU3RyaW5nKDE2KS5sZW5ndGg9PTEpP1wiMFwiK0IudG9TdHJpbmcoMTYpOkIudG9TdHJpbmcoMTYpKTtcblxuXHRcdHJldHVybiBcIiNcIitSUitHRytCQjtcblx0fVxuXHRcblx0dG9QeChsZW5ndGgpIHtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KGxlbmd0aCksXG5cdFx0XHR1bml0cyA9IFN0cmluZyhsZW5ndGgpLm1hdGNoKFJFX0xFTkdUSF9VTklUKVsxXTtcblxuXHRcdHN3aXRjaCAodW5pdHMpIHtcblx0XHRcdGNhc2UgJ2VtJyA6IHJldHVybiB2YWx1ZSAqIDE2O1xuXHRcdFx0Y2FzZSAncmVtJzogcmV0dXJuIHZhbHVlICogMTY7XG5cdFx0XHRjYXNlICdjbScgOiByZXR1cm4gdmFsdWUgKiA5NiAvIDIuNTQ7XG5cdFx0XHRjYXNlICdtbScgOiByZXR1cm4gdmFsdWUgKiA5NiAvIDIuNTQgLyAxMDtcblx0XHRcdGNhc2UgJ2luJyA6IHJldHVybiB2YWx1ZSAqIDk2O1xuXHRcdFx0Y2FzZSAncHQnIDogcmV0dXJuIHZhbHVlICogNzI7XG5cdFx0XHRjYXNlICdwYycgOiByZXR1cm4gdmFsdWUgKiA3MiAvIDEyO1xuXHRcdFx0ZGVmYXVsdCAgIDogcmV0dXJuIHZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBPZmZpY2VEb2N1bWVudD1QYXJ0XG59XG5sZXQgUkdCPS8oW2EtZkEtRjAtOV17Mn0/KXszfT8vO1xuIl19