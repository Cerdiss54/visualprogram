"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJSON = csvToJSON;
exports.formatCSVFileToJSONFile = formatCSVFileToJSONFile;
function csvToJSON(input, delimiter) {
    if (!input || input.length === 0) {
        throw new Error("Входной массив пуст");
    }
    if (input.length < 2) {
        throw new Error("Нет строк с данными");
    }
    var headers = input[0].split(delimiter);
    if (headers.length === 0 || headers.some(function (h) { return h.trim() === ''; })) {
        throw new Error("Неверные заголовки");
    }
    var result = [];
    for (var i = 1; i < input.length; i++) {
        var values = input[i].split(delimiter);
        if (values.length !== headers.length) {
            throw new Error("\u0421\u0442\u0440\u043E\u043A\u0430 ".concat(i + 1, ": \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0443 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u0432"));
        }
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            var header = headers[j].trim();
            var value = values[j].trim();
            if (value === '') {
                obj[header] = '';
            }
            else {
                var numValue = Number(value);
                obj[header] = isNaN(numValue) ? value : numValue;
            }
        }
        result.push(obj);
    }
    return result;
}
var res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);
var fs_1 = require("fs");
function formatCSVFileToJSONFile(input, output, delimiter) {
    return __awaiter(this, void 0, void 0, function () {
        var csvContent, lines, jsonData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.readFile(input, 'utf-8')];
                case 1:
                    csvContent = _a.sent();
                    lines = csvContent
                        .split('\n')
                        .map(function (line) { return line.trim(); })
                        .filter(function (line) { return line.length > 0; });
                    jsonData = csvToJSON(lines, delimiter);
                    return [4 /*yield*/, fs_1.promises.writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8')];
                case 2:
                    _a.sent();
                    console.log("\u0424\u0430\u0439\u043B \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0432 ".concat(output));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    throw new Error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0444\u0430\u0439\u043B\u0430: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    formatCSVFileToJSONFile('src/data.csv', 'output.json', ';')
        .then(function () { return console.log('Готово!'); })
        .catch(function (err) { return console.error('Ошибка: ', err.message); });
}
