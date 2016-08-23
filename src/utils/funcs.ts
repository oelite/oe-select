/**
 * Created by mleader1 on 28/06/2016.
 */

export class Utils {
    /*
     * Marge 2 arrays of objects based on comparison of a property (such as primary key/id for the entity)
     * */
    public static mergeArray(arr1: any[], arr2: any[], prop?: string): any[] {
        var result: any[] = [];
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
            for (var item of arr2) {
                if (arr1.indexOf(item) < 0)
                    result.push(item);
            }
        }
        return result;
    }


    /*
     * Flat objects array into 1 dimension array based on comparison of a property (such as primary key/id for the entity)
     * */
    public static flatArrays(arr: any, prop?: string): any[] {
        var result = [];
        for (var item of arr) {
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
    }


    public static NewGuid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    public static isNumber(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Number]';
    }


}