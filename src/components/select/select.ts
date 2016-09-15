/**
 * Created by mleader1 on 23/08/2016.
 */

import {
    Component, OnInit, NgModule, Input, ViewEncapsulation, ElementRef, Output, EventEmitter,
    ViewChildren, QueryList, Host, forwardRef, Inject, ContentChildren, AfterContentInit, AfterViewInit,
    ChangeDetectorRef
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MdInputModule} from "@angular2-material/input";
import {MdIconModule} from "@angular2-material/icon";
import {OESelectService, OESelectItem} from "./select.service";
import {Utils} from "../../utils/funcs";


@Component({
    selector: 'oe-option',
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'option.html'
})
export class OESelectOptionComponent {
    @Input()
    value: any;
    @Input()
    item: any;
    @Input()
    isSelected: boolean;
    @Input()
    text: string;
    @Input()
    isUnselectAllAction: boolean;
    @Input()
    selectorId: string;

    valueBinding: string = "id";
    textBinding: string = "name";
    stateBinding: string = "selected";

    @Output()
    onItemToggled: EventEmitter<any> = new EventEmitter<any>();


    constructor(private selectService: OESelectService, public el: ElementRef) {
        selectService.onItemSelected$.subscribe((item: {selectorId: string, item: OESelectItem})=> {
            if (item.item.value === this.value)
                this.refreshItem(true, item.item);
        });
        selectService.onItemRemoved$.subscribe((item: {selectorId: string, item: OESelectItem})=> {
            if (item.item.value === this.value)
                this.refreshItem(false, item.item);
        });
    }

    refreshItem(selected: boolean, item?: OESelectItem) {
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


    }

    ngOnInit() {
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
    }

    toggleSelect() {
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
        scope.onItemToggled.emit({value: this.value, item: this.item, text: this.text});
    }

}


@Component({
    selector: 'oe-select',
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'select.html',
    styleUrls: ['select.scss'],
    host: {
        '(document:click)': 'onClick($event)'
    }
})
export class OESelectComponent implements OnInit, AfterContentInit, AfterViewInit {
    @ViewChildren(OESelectOptionComponent) viewChildrenSource: QueryList<OESelectOptionComponent>;
    @ContentChildren(OESelectOptionComponent) contentChildrenSource: QueryList<OESelectOptionComponent>;
    selectedText: string;
    @Input()
    placeHolder: string;
    @Input()
    disabled: boolean;
    @Input()
    items: any[];
    @Input()
    textBinding: string = 'name';
    @Input()
    valueBinding: string = 'id';
    @Input()
    stateBinding: string = 'selected';
    @Input()
    allowMultiple: boolean = false;
    @Input()
    selectorId: string;
    @Input()
    selectedValues: any[];
    @Input()
    showDeselectAction: boolean = true;

    showItems: boolean;

    @Output()
    onItemSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onItemDeselected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private el: ElementRef, private selectService: OESelectService, private cdr: ChangeDetectorRef) {
        this.selectService.onItemSelected$.subscribe((item)=> {
            var scope = this;
            if (item.selectorId == this.selectorId) {
                scope.validateSelections();
                scope.onItemSelected.emit(item);
            }
        });

        this.selectService.onItemRemoved$.subscribe((item)=> {
            var scope = this;
            if (item.selectorId == this.selectorId) {
                scope.validateSelections();
                scope.onItemDeselected.emit(item);
            }
        });
        this.selectService.onSelectorDisplayTextUpdate$.subscribe((item)=> {
            if (item.selectorId === this.selectorId) {
                if (item.text != this.placeHolder)
                    this.selectedText = item.text;
                else
                    this.selectedText = null;
            }
        });
    }

    ngOnInit() {
        if (!this.selectorId)
            this.selectorId = Utils.NewGuid();
        this.selectService.registerSelector(this.selectorId, this.allowMultiple, [], this.placeHolder);

        if (this.selectedValues && this.selectedValues.length) {
            for (var selectedValue of this.selectedValues) {
                var objItem = {};
                objItem[this.stateBinding] = true;
                objItem[this.valueBinding] = selectedValue;
                this.selectService.registerItem(this.selectorId, true, selectedValue, selectedValue, objItem, true);
            }
        }

    }

    ngAfterViewInit() {
        if (this.viewChildrenSource)
            this.viewChildrenSource.forEach((item: OESelectOptionComponent)=> {
                this.configureChildOptionComponent(item);
            });
    }

    ngAfterContentInit() {
        if (this.contentChildrenSource)
            this.contentChildrenSource.forEach((item: OESelectOptionComponent)=> {
                this.configureChildOptionComponent(item);
            });
    }

    configureChildOptionComponent(itemComponent: OESelectOptionComponent) {
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
    }

    show() {
        if (!this.disabled)
            this.showItems = true;
    }

    close() {
        this.showItems = false;
    }

    onClick(event) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    get selectedItems(): any[] {
        var selectedItems = this.selectService.getSelectedItems(this.selectorId);
        var returnValueObjects = [];
        if (selectedItems && selectedItems.length) {
            for (var item of selectedItems) {
                returnValueObjects.push[item.item];
            }
        }
        return selectedItems;
    }

    validateSelections() {
        var selectedItems = this.selectService.getSelectedItems(this.selectorId);
        if (selectedItems && selectedItems.length) {
            if (!this.allowMultiple) {
                this.close();
            }
        }
        else {
            this.close();
        }
    }
}

export const
    OE_MD_Select_DIRECTIVES = [
        OESelectComponent, OESelectOptionComponent
    ];

@NgModule({
    imports: [CommonModule, MdInputModule, MdIconModule],
    declarations: [...OE_MD_Select_DIRECTIVES],
    providers: [OESelectService],
    exports: [...OE_MD_Select_DIRECTIVES]
})
export class OE_MD_SelectModule {
}