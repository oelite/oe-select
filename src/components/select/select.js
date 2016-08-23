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
        this.onItemToggled = new core_1.EventEmitter();
        this.uid = funcs_1.Utils.NewGuid();
        selectService.onItemRemoved$.subscribe(function (item) {
            if (item.item.uid == _this.uid) {
                _this.isSelected = false;
                _this.item[_this.stateBinding] = false;
            }
        });
        selectService.onItemSelected$.subscribe(function (item) {
            if (item.item.uid == _this.uid) {
                _this.isSelected = true;
                _this.item[_this.stateBinding] = true;
            }
        });
    }
    OESelectOptionComponent.prototype.ngOnInit = function () {
        var item = this.selectService.getSelectedItems(this.selectorId, this.uid);
        if (item && item.length) {
            this.isSelected = true;
            this.item[this.stateBinding] = true;
        }
    };
    OESelectOptionComponent.prototype.toggleSelect = function () {
        if (!(this.isSelected || this.isUnselectAllAction)) {
            this.isSelected = true;
            this.item[this.stateBinding] = true;
            this.selectService.registerSelectedItem(this.selectorId, this.uid, this.value, this.text, this.item);
        }
        else {
            var selector = this.selectService.getSelector(this.selectorId);
            if (!this.isUnselectAllAction) {
                if (selector && selector.allowMultipleSelect && !this.isUnselectAllAction) {
                    this.isSelected = false;
                    this.item[this.stateBinding] = false;
                    this.selectService.deregisterSelectedItem(this.selectorId, this.uid, this.value, this.text, this.item);
                }
            }
            else {
                this.selectService.clearSelectorItems(selector);
            }
        }
        this.onItemToggled.emit({ uid: this.uid, value: this.value, item: this.item, text: this.text });
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
    function OESelectComponent(el, selectService) {
        var _this = this;
        this.el = el;
        this.selectService = selectService;
        this.textBinding = 'name';
        this.valueBinding = 'id';
        this.stateBinding = 'selected';
        this.onItemSelected = new core_1.EventEmitter();
        this.onItemDeselected = new core_1.EventEmitter();
        this.selectorId = funcs_1.Utils.NewGuid();
        this.selectService.onItemSelected$.subscribe(function (item) {
            var scope = _this;
            setTimeout(function () {
                scope.onItemSelected.emit(item);
            }, 100);
        });
        this.selectService.onItemRemoved$.subscribe(function (item) {
            var scope = _this;
            setTimeout(function () {
                scope.onItemDeselected.emit(item);
            }, 100);
        });
    }
    OESelectComponent.prototype.ngOnInit = function () {
        this.selectService.registerSelector(this.selectorId, this.allowMultiple);
    };
    OESelectComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.dynamicArrayChildren.forEach(function (item) {
            _this.configureChildOptionComponent(item);
        });
    };
    OESelectComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.manualChildren.forEach(function (item) {
            _this.configureChildOptionComponent(item);
        });
    };
    OESelectComponent.prototype.configureChildOptionComponent = function (itemComponent) {
        if (!itemComponent.item) {
            itemComponent.item = {};
            itemComponent.valueBinding = this.valueBinding;
            itemComponent.textBinding = this.textBinding;
            itemComponent.stateBinding = this.stateBinding;
            itemComponent.item[this.valueBinding] = itemComponent.value;
            itemComponent.item[this.textBinding] = itemComponent.text;
            itemComponent.item[this.stateBinding] = itemComponent.isSelected;
        }
        else {
            itemComponent.value = itemComponent.item[this.valueBinding];
            itemComponent.text = itemComponent.item[this.textBinding];
            itemComponent.isSelected = itemComponent.item[this.stateBinding];
        }
        itemComponent.selectorId = this.selectorId;
        if (itemComponent.isSelected && !itemComponent.isUnselectAllAction) {
            var item = this.selectService.getSelectedItems(this.selectorId, itemComponent.uid);
            if (!(item && item.length)) {
                this.selectService.registerSelectedItem(this.selectorId, itemComponent.uid, itemComponent.value, itemComponent.text, itemComponent.item);
            }
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
    OESelectComponent.prototype.onItemToggled = function (event) {
        var selectedItems = this.selectService.getSelectedItems(this.selectorId);
        if (selectedItems && selectedItems.length) {
            if (!this.allowMultiple) {
                this.selectedText = selectedItems[0].text;
                this.close();
            }
            else {
                if (selectedItems.length > 1)
                    this.selectedText = "(multiple selected)";
                else
                    this.selectedText = selectedItems[0].text || ' ';
            }
        }
        else {
            this.selectedText = null;
            this.close();
        }
    };
    __decorate([
        core_1.ViewChildren(OESelectOptionComponent)
    ], OESelectComponent.prototype, "dynamicArrayChildren");
    __decorate([
        core_1.ContentChildren(OESelectOptionComponent)
    ], OESelectComponent.prototype, "manualChildren");
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