/**
 * Created by mleader1 on 28/06/2016.
 */
"use strict";
var Utils = (function () {
    function Utils() {
    }
    /*
     * Marge 2 arrays of objects based on comparison of a property (such as primary key/id for the entity)
     * */
    Utils.mergeArray = function (arr1, arr2, prop) {
        var result = [];
        if (prop != undefined && prop.length > 0) {
            var value1 = arr1.filter(function (item) {
                return item.hasOwnProperty(prop);
            });
            var value2 = arr2.filter(function (item) {
                return value1.filter(function (obj) {
                    return obj.hasOwnProperty(prop) && obj[prop] === item[prop];
                }).length === 0;
            });
            result = value1.concat(value2);
        }
        else {
            result = arr1;
            for (var _i = 0, arr2_1 = arr2; _i < arr2_1.length; _i++) {
                var item = arr2_1[_i];
                if (arr1.indexOf(item) < 0)
                    result.push(item);
            }
        }
        return result;
    };
    /*
     * Flat objects array into 1 dimension array based on comparison of a property (such as primary key/id for the entity)
     * */
    Utils.flatArrays = function (arr, prop) {
        var result = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var item = arr_1[_i];
            if (item) {
                if (!item.isArray) {
                    if (result.indexOf(item) < 0)
                        result.push(item);
                }
                else {
                    var children = this.flatArrays(item);
                    if (children) {
                        result = this.mergeArray(result, children, prop);
                    }
                }
            }
        }
        return result;
    };
    Utils.NewGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    Utils.isNumber = function (value) {
        return Object.prototype.toString.call(value) === '[object Number]';
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=funcs.js.map