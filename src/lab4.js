"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.having = exports.groupBy = exports.sort = exports.where = void 0;
var where = function (key, value) {
    return function (data) {
        return data.filter(function (item) { return item[key] === value; });
    };
};
exports.where = where;
var sort = function (key) {
    return function (data) {
        return __spreadArray([], data, true).sort(function (a, b) {
            if (a[key] < b[key])
                return -1;
            if (a[key] > b[key])
                return 1;
            return 0;
        });
    };
};
exports.sort = sort;
var groupBy = function (key) {
    return function (data) {
        var groups = {};
        data.forEach(function (item) {
            var groupKey = String(item[key]);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });
        return Object.keys(groups).map(function (k) { return ({
            key: k,
            items: groups[k]
        }); });
    };
};
exports.groupBy = groupBy;
var having = function (predicate) {
    return function (groups) {
        return groups.filter(predicate);
    };
};
exports.having = having;
var query = function () {
    var steps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        steps[_i] = arguments[_i];
    }
    return function (initialData) {
        return steps.reduce(function (data, step) { return step(data); }, initialData);
    };
};
exports.query = query;
