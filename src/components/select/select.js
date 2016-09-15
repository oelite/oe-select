/**
 * Created by mleader1 on 23/08/2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var common_1 = require("@angular/common");
var input_1 = require("@angular2-material/input");
var icon_1 = require("@angular2-material/icon");
var select_service_1 = require("./select.service");
var funcs_1 = require("../../utils/funcs");
var OESelectOptionComponent = (function () {
    function OESelectOptionComponent(selectService, el) {
        var _this = this;
        this.selectService = selectService;
        this.el = el;
        this.valueBinding = "id";
        this.textBinding = "name";
        this.stateBinding = "selected";
        this.onItemToggled = new core_1.EventEmitter();
        selectService.onItemSelected$.subscribe(function (item) {
            if (item.item.value === _this.value)
                _this.refreshItem(true, item.item);
        });
        selectService.onItemRemoved$.subscribe(function (item) {
            if (item.item.value === _this.value)
                _this.refreshItem(false, item.item);
        });
    }
    OESelectOptionComponent.prototype.refreshItem = function (selected, item) {
        this.isSelected = selected;
        if (!this.item)
            this.item = item && item.item ? item.item : {} || {};
        if (this.isSelected != this.item[this.stateBinding]) {
            if (this.isSelected != null)
                this.item[this.stateBinding] = selected;
            else if (this.item[this.stateBinding] != null)
                this.isSelected = this.item[this.stateBinding];
            else if (item && item.item && item.item[this.stateBinding] != null) {
                this.isSelected = item.item[this.stateBinding];
                this.item[this.stateBinding] = item.item[this.stateBinding];
            }
        }
        if (this.value != this.item[this.valueBinding]) {
            if (this.value != null)
                this.item[this.valueBinding] = this.value;
            else if (this.item[this.valueBinding] != null)
                this.value = this.item[this.valueBinding];
            else if (item && item.item && item.item[this.valueBinding]) {
                this.value = item.item[this.valueBinding];
                this.item[this.valueBinding] = item.item[this.valueBinding];
            }
        }
        if (this.text != this.item[this.textBinding]) {
            if (this.text != null)
                this.item[this.textBinding] = this.text;
            else if (this.item[this.textBinding] != null) {
                this.text = this.item[this.textBinding];
            }
            else if (item && item.item && item.item[this.textBinding]) {
                this.text = item.item[this.textBinding];
                this.item[this.textBinding] = item.item[this.textBinding];
            }
        }
    };
    OESelectOptionComponent.prototype.ngOnInit = function () {
        var item = this.selectService.getSelectedItems(this.selectorId, this.value || (this.item ? this.item[this.valueBinding] : null));
        this.selectService.registerItem(this.selectorId, this.isSelected, this.value, this.text, this.item, true);
        //
        // if (item && item.length) {
        //     var scope = this;
        //     setTimeout(function () {
        //         scope.refreshItem(true);
        //         scope.selectService.registerItem(scope.selectorId, true, scope.value, scope.text, scope.item)
        //         scope.selectService.notifySelectorDisplayUpdate(scope.selectorId, scope.text);
        //     }, 1);
        // }
        // else {
        //     this.selectService.registerItem(this.selectorId, this.isSelected, this.value, this.text, this.item);
        // }
    };
    OESelectOptionComponent.prototype.toggleSelect = function () {
        var selector = this.selectService.getSelector(this.selectorId);
        if (!(this.isSelected || this.isUnselectAllAction)) {
            this.isSelected = true;
            if (this.item) {
                this.item[this.stateBinding] = true;
                this.item[this.valueBinding] = this.value;
                this.item[this.textBinding] = this.text;
            }
            this.selectService.registerItem(this.selectorId, this.isSelected, this.value, this.text, this.item, false);
        }
        else {
            if (!this.isUnselectAllAction) {
                if (selector && selector.allowMultipleSelect && !this.isUnselectAllAction) {
                    this.isSelected = false;
                    if (this.item) {
                        this.item[this.stateBinding] = false;
                        this.item[this.valueBinding] = this.value;
                        this.item[this.textBinding] = this.text;
                    }
                    this.selectService.deselectItem(this.selectorId, this.value, this.text, this.item);
                }
            }
            else {
                this.selectService.clearSelectedItems(selector);
            }
        }
        var scope = this;
        scope.onItemToggled.emit({ value: this.value, item: this.item, text: this.text });
    };
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "value");
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "item");
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "isSelected");
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "text");
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "isUnselectAllAction");
    __decorate([
        core_1.Input()
    ], OESelectOptionComponent.prototype, "selectorId");
    __decorate([
        core_1.Output()
    ], OESelectOptionComponent.prototype, "onItemToggled");
    OESelectOptionComponent = __decorate([
        core_1.Component({
            selector: 'oe-option',
            encapsulation: core_1.ViewEncapsulation.None,
            templateUrl: 'option.html'
        })
    ], OESelectOptionComponent);
    return OESelectOptionComponent;
}());
exports.OESelectOptionComponent = OESelectOptionComponent;
var OESelectComponent = (function () {
    function OESelectComponent(el, selectService, cdr) {
        var _this = this;
        this.el = el;
        this.selectService = selectService;
        this.cdr = cdr;
        this.textBinding = 'name';
        this.valueBinding = 'id';
        this.stateBinding = 'selected';
        this.allowMultiple = false;
        this.showDeselectAction = true;
        this.onItemSelected = new core_1.EventEmitter();
        this.onItemDeselected = new core_1.EventEmitter();
        this.selectService.onItemSelected$.subscribe(function (item) {
            var scope = _this;
            if (item.selectorId == _this.selectorId) {
                scope.validateSelections();
                scope.onItemSelected.emit(item);
            }
        });
        this.selectService.onItemRemoved$.subscribe(function (item) {
            var scope = _this;
            if (item.selectorId == _this.selectorId) {
                scope.validateSelections();
                scope.onItemDeselected.emit(item);
            }
        });
        this.selectService.onSelectorDisplayTextUpdate$.subscribe(function (item) {
            if (item.selectorId === _this.selectorId) {
                if (item.text != _this.placeHolder)
                    _this.selectedText = item.text;
                else
                    _this.selectedText = null;
            }
        });
    }
    OESelectComponent.prototype.ngOnInit = function () {
        if (!this.selectorId)
            this.selectorId = funcs_1.Utils.NewGuid();
        this.selectService.registerSelector(this.selectorId, this.allowMultiple, [], this.placeHolder);
        if (this.selectedValues && this.selectedValues.length) {
            for (var _i = 0, _a = this.selectedValues; _i < _a.length; _i++) {
                var selectedValue = _a[_i];
                var objItem = {};
                objItem[this.stateBinding] = true;
                objItem[this.valueBinding] = selectedValue;
                this.selectService.registerItem(this.selectorId, true, selectedValue, selectedValue, objItem, true);
            }
        }
    };
    OESelectComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.viewChildrenSource)
            this.viewChildrenSource.forEach(function (item) {
                _this.configureChildOptionComponent(item);
            });
    };
    OESelectComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this.contentChildrenSource)
            this.contentChildrenSource.forEach(function (item) {
                _this.configureChildOptionComponent(item);
            });
    };
    OESelectComponent.prototype.configureChildOptionComponent = function (itemComponent) {
        if (!itemComponent.item) {
            itemComponent.item = {};
            itemComponent.valueBinding = this.valueBinding;
            itemComponent.textBinding = this.textBinding;
            itemComponent.stateBinding = this.stateBinding;
            if (this.valueBinding)
                itemComponent.item[this.valueBinding] = itemComponent.value;
            if (this.textBinding)
                itemComponent.item[this.textBinding] = itemComponent.text;
            if (this.stateBinding)
                itemComponent.item[this.stateBinding] = itemComponent.isSelected;
        }
        else {
            if (this.valueBinding && !itemComponent.value)
                itemComponent.value = itemComponent.item[this.valueBinding];
            else
                itemComponent.item[this.valueBinding] = itemComponent.value;
            if (this.textBinding && itemComponent.text)
                itemComponent.text = itemComponent.item[this.textBinding];
            else
                itemComponent.item[this.textBinding] = itemComponent.text;
            if (this.stateBinding && itemComponent.isSelected == null)
                itemComponent.isSelected = itemComponent.item[this.stateBinding];
            else
                itemComponent.item[this.stateBinding] = itemComponent.isSelected;
        }
        itemComponent.selectorId = this.selectorId;
        if (this.selectedValues && this.selectedValues.indexOf(itemComponent.value) >= 0) {
            itemComponent.isSelected = true;
            itemComponent.item[this.stateBinding] = true;
        }
        if (!itemComponent.isUnselectAllAction) {
            this.selectService.registerItem(this.selectorId, itemComponent.isSelected, itemComponent.value || itemComponent.item[this.valueBinding], itemComponent.text, itemComponent.item, true);
        }
    };
    OESelectComponent.prototype.show = function () {
        if (!this.disabled)
            this.showItems = true;
    };
    OESelectComponent.prototype.close = function () {
        this.showItems = false;
    };
    OESelectComponent.prototype.onClick = function (event) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.close();
        }
    };
    Object.defineProperty(OESelectComponent.prototype, "selectedItems", {
        get: function () {
            var selectedItems = this.selectService.getSelectedItems(this.selectorId);
            var returnValueObjects = [];
            if (selectedItems && selectedItems.length) {
                for (var _i = 0, selectedItems_1 = selectedItems; _i < selectedItems_1.length; _i++) {
                    var item = selectedItems_1[_i];
                    returnValueObjects.push[item.item];
                }
            }
            return selectedItems;
        },
        enumerable: true,
        configurable: true
    });
    OESelectComponent.prototype.validateSelections = function () {
        var selectedItems = this.selectService.getSelectedItems(this.selectorId);
        if (selectedItems && selectedItems.length) {
            if (!this.allowMultiple) {
                this.close();
            }
        }
        else {
            this.close();
        }
    };
    __decorate([
        core_1.ViewChildren(OESelectOptionComponent)
    ], OESelectComponent.prototype, "viewChildrenSource");
    __decorate([
        core_1.ContentChildren(OESelectOptionComponent)
    ], OESelectComponent.prototype, "contentChildrenSource");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "placeHolder");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "disabled");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "items");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "textBinding");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "valueBinding");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "stateBinding");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "allowMultiple");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "selectorId");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "selectedValues");
    __decorate([
        core_1.Input()
    ], OESelectComponent.prototype, "showDeselectAction");
    __decorate([
        core_1.Output()
    ], OESelectComponent.prototype, "onItemSelected");
    __decorate([
        core_1.Output()
    ], OESelectComponent.prototype, "onItemDeselected");
    OESelectComponent = __decorate([
        core_1.Component({
            selector: 'oe-select',
            encapsulation: core_1.ViewEncapsulation.None,
            templateUrl: 'select.html',
            styleUrls: ['select.scss'],
            host: {
                '(document:click)': 'onClick($event)'
            }
        })
    ], OESelectComponent);
    return OESelectComponent;
}());
exports.OESelectComponent = OESelectComponent;
exports.OE_MD_Select_DIRECTIVES = [
    OESelectComponent, OESelectOptionComponent
];
var OE_MD_SelectModule = (function () {
    function OE_MD_SelectModule() {
    }
    OE_MD_SelectModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule, input_1.MdInputModule, icon_1.MdIconModule],
            declarations: exports.OE_MD_Select_DIRECTIVES.slice(),
            providers: [select_service_1.OESelectService],
            exports: exports.OE_MD_Select_DIRECTIVES.slice()
        })
    ], OE_MD_SelectModule);
    return OE_MD_SelectModule;
}());
exports.OE_MD_SelectModule = OE_MD_SelectModule;
//# sourceMappingURL=select.js.map