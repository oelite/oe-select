"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var funcs_1 = require("../../utils/funcs");
/**
 * Created by mleader1 on 23/08/2016.
 */
var OESelectedItem = (function () {
    function OESelectedItem(uid, value, text, item) {
        this.uid = uid || funcs_1.Utils.NewGuid();
        this.value = value || null;
        this.item = item || null;
        this.text = text || null;
    }
    return OESelectedItem;
}());
exports.OESelectedItem = OESelectedItem;
var OESelectorState = (function () {
    function OESelectorState(selectorId, selectedItems, allowMultipleSelect) {
        this.selectorId = selectorId || funcs_1.Utils.NewGuid();
        this.selectedItems = selectedItems || [];
        this.allowMultipleSelect = allowMultipleSelect || false;
    }
    return OESelectorState;
}());
exports.OESelectorState = OESelectorState;
var OESelectService = (function () {
    function OESelectService() {
        this.selectors = [];
        this.onItemSelected$ = new core_1.EventEmitter();
        this.onItemRemoved$ = new core_1.EventEmitter();
    }
    OESelectService.prototype.getSelectedItems = function (selectorId, itemUId) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var matchedItems = selector.selectedItems;
                if (itemUId)
                    matchedItems = selector.selectedItems.filter(function (item) { return item.uid === itemUId; });
                return matchedItems;
            }
        }
        return null;
    };
    OESelectService.prototype.getSelector = function (selectorId) {
        if (selectorId) {
            var matches = this.selectors.filter(function (item) { return item.selectorId === selectorId; });
            if (matches.length)
                return matches[0];
        }
        return null;
    };
    OESelectService.prototype.registerSelector = function (selectorId, allowMultipleSelect, selectedItems) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector)
                console.warn('[OE Selector - Warning] a duplicated selector registration is identified - id:' + selectorId);
            else {
                var newSelector = new OESelectorState(selectorId, selectedItems, allowMultipleSelect);
                this.selectors.push(newSelector);
            }
        }
    };
    OESelectService.prototype.registerSelectedItem = function (selectorId, uid, value, text, item) {
        if (selectorId && uid) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var newItem = new OESelectedItem(uid, value, text, item);
                var matches = selector.selectedItems.filter(function (item) { return item.uid === uid; });
                if (!matches.length) {
                    if (selector.allowMultipleSelect)
                        selector.selectedItems.push(newItem);
                    else {
                        this.clearSelectorItems(selector);
                        selector.selectedItems = [newItem];
                    }
                }
                else {
                    if (selector.allowMultipleSelect)
                        selector.selectedItems[selector.selectedItems.indexOf(matches[0])] = newItem;
                    else {
                        this.clearSelectorItems(selector);
                        selector.selectedItems = [newItem];
                    }
                }
                this.onItemSelected$.emit({ selectorId: selectorId, item: item });
            }
        }
    };
    OESelectService.prototype.deregisterSelectedItem = function (selectorId, uid, value, text, item) {
        if (selectorId && uid) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var newItem = new OESelectedItem(uid, value, text, item);
                var matches = selector.selectedItems.filter(function (item) { return item.uid === uid; });
                if (!matches.length) {
                    if (selector.allowMultipleSelect)
                        selector.selectedItems.splice(selector.selectedItems.indexOf(matches[0]), 1);
                    else
                        this.clearSelectorItems(selector);
                    this.onItemRemoved$.emit({ selectorId: selectorId, item: newItem });
                }
            }
        }
    };
    OESelectService.prototype.clearSelectorItems = function (selector) {
        if (selector) {
            var removeItems = selector.selectedItems;
            selector.selectedItems = [];
            for (var _i = 0, removeItems_1 = removeItems; _i < removeItems_1.length; _i++) {
                var item = removeItems_1[_i];
                this.onItemRemoved$.emit({ selectorId: selector.selectorId, item: item });
            }
        }
    };
    OESelectService = __decorate([
        core_1.Injectable()
    ], OESelectService);
    return OESelectService;
}());
exports.OESelectService = OESelectService;
//# sourceMappingURL=select.service.js.map