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
var OESelectItem = (function () {
    function OESelectItem(value, selected, text, item) {
        this.value = value;
        this.selected = selected;
        this.item = item || null;
        this.text = text || null;
    }
    return OESelectItem;
}());
exports.OESelectItem = OESelectItem;
var OESelectorState = (function () {
    function OESelectorState(selectorId, items, allowMultipleSelect, defaultEmptyPlaceholderText, defaultMultipleSelectionStateDisplayText) {
        this.selectorId = selectorId || funcs_1.Utils.NewGuid();
        this.items = items || [];
        this.allowMultipleSelect = allowMultipleSelect || false;
        this.defaultEmptyPlaceholderText = defaultEmptyPlaceholderText || "";
        this.defaultMultipleSelectionStateDisplayText = defaultMultipleSelectionStateDisplayText || "(multiple selected)";
    }
    return OESelectorState;
}());
exports.OESelectorState = OESelectorState;
var OESelectService = (function () {
    function OESelectService() {
        this.selectors = [];
        this.onItemSelected$ = new core_1.EventEmitter();
        this.onItemRemoved$ = new core_1.EventEmitter();
        this.onInitItemRegistered$ = new core_1.EventEmitter();
        this.onSelectorDisplayTextUpdate$ = new core_1.EventEmitter();
    }
    OESelectService.prototype.getSelectedItems = function (selectorId, itemValue) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                {
                    var matchedItems = selector.items.filter(function (item) { return item.selected && (itemValue == null || itemValue === item.value); });
                    return matchedItems;
                }
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
    OESelectService.prototype.registerSelector = function (selectorId, allowMultipleSelect, items, emptySelectionPlaceholderText, defaultMultiSelectionText) {
        if (selectorId) {
            var newSelector = new OESelectorState(selectorId, items, allowMultipleSelect, emptySelectionPlaceholderText, defaultMultiSelectionText);
            var selector = this.getSelector(selectorId);
            if (selector) {
                this.selectors[this.selectors.indexOf(selector)] = newSelector;
            }
            else {
                this.selectors.push(newSelector);
            }
            if (items && items.length) {
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var item = items_1[_i];
                    if (item.selected)
                        this.onInitItemRegistered$.emit({ selectorId: selectorId, item: item });
                }
            }
        }
    };
    OESelectService.prototype.registerItem = function (selectorId, selected, value, text, item, ignoreSelectEmit) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var matches = selector.items.filter(function (item) { return item.value === value; });
                var existingSelectedItems = this.getSelectedItems(selectorId);
                if (matches.length) {
                    var existingItem = matches[0];
                    if (existingItem.text != text && text)
                        existingItem.text = text;
                    if (item != null)
                        existingItem.item = item;
                    //existingItem.text ==>  the first time component is instantiated there will be no 'text' value assigned so the test below indicates whether existingItem was first time initiated.
                    if (existingItem.selected !== selected && selected === true && existingItem.text) {
                        if (!selector.allowMultipleSelect && existingSelectedItems)
                            for (var _i = 0, existingSelectedItems_1 = existingSelectedItems; _i < existingSelectedItems_1.length; _i++) {
                                var existingSelectedItem = existingSelectedItems_1[_i];
                                this.deselectItem(selectorId, existingSelectedItem.value, existingSelectedItem.text, existingSelectedItem.item);
                            }
                        existingItem.selected = true;
                        if (!ignoreSelectEmit)
                            this.onItemSelected$.emit({ selectorId: selectorId, item: existingItem });
                    }
                    if (existingItem.selected)
                        if (selector.allowMultipleSelect && existingSelectedItems && existingSelectedItems.length >= 2) {
                            this.notifySelectorDisplayUpdate(selectorId, selector.defaultMultipleSelectionStateDisplayText);
                        }
                        else
                            this.notifySelectorDisplayUpdate(selectorId, existingItem.text);
                }
                else {
                    var newItem = new OESelectItem(value, selected, text, item);
                    if (selected === true) {
                        if (!selector.allowMultipleSelect && existingSelectedItems)
                            for (var _a = 0, existingSelectedItems_2 = existingSelectedItems; _a < existingSelectedItems_2.length; _a++) {
                                var existingSelectedItem = existingSelectedItems_2[_a];
                                this.deselectItem(selectorId, existingSelectedItem.value, existingSelectedItem.text, existingSelectedItem.item);
                            }
                        selector.items.push(newItem);
                        if (!ignoreSelectEmit)
                            this.onItemSelected$.emit({ selectorId: selectorId, item: newItem });
                        if (selector.allowMultipleSelect && existingSelectedItems && existingSelectedItems.length >= 1) {
                            this.notifySelectorDisplayUpdate(selectorId, selector.defaultMultipleSelectionStateDisplayText);
                        }
                        else
                            this.notifySelectorDisplayUpdate(selectorId, newItem.text);
                    }
                }
            }
        }
    };
    OESelectService.prototype.notifySelectorDisplayUpdate = function (selectorId, displayText) {
        this.onSelectorDisplayTextUpdate$.emit({ selectorId: selectorId, text: displayText });
    };
    OESelectService.prototype.deselectItem = function (selectorId, itemValue, text, item, ignoreSelectorDisplayUpdate) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var existingSelectedItems = this.getSelectedItems(selectorId, itemValue);
                if (existingSelectedItems && existingSelectedItems.length) {
                    var existingItem = existingSelectedItems[0];
                    existingItem.selected = false;
                    this.onItemRemoved$.emit({ selectorId: selectorId, item: existingItem });
                    if (!ignoreSelectorDisplayUpdate) {
                        if (selector.allowMultipleSelect) {
                            var remainingSelectedItems = this.getSelectedItems(selectorId);
                            if (remainingSelectedItems && remainingSelectedItems.length)
                                this.notifySelectorDisplayUpdate(selector.selectorId, remainingSelectedItems.length == 1 ? remainingSelectedItems[0].text : selector.defaultMultipleSelectionStateDisplayText);
                            else
                                this.notifySelectorDisplayUpdate(selector.selectorId, selector.defaultEmptyPlaceholderText);
                        }
                        else
                            this.notifySelectorDisplayUpdate(selector.selectorId, selector.defaultEmptyPlaceholderText);
                    }
                }
            }
        }
    };
    OESelectService.prototype.clearSelectedItems = function (selector) {
        if (selector) {
            var removeItems = this.getSelectedItems(selector.selectorId);
            if (removeItems)
                for (var _i = 0, removeItems_1 = removeItems; _i < removeItems_1.length; _i++) {
                    var item = removeItems_1[_i];
                    this.deselectItem(selector.selectorId, item.value, item.text, item.item, true);
                }
            this.notifySelectorDisplayUpdate(selector.selectorId, selector.defaultEmptyPlaceholderText);
        }
    };
    OESelectService = __decorate([
        core_1.Injectable()
    ], OESelectService);
    return OESelectService;
}());
exports.OESelectService = OESelectService;
//# sourceMappingURL=select.service.js.map