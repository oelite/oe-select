/**
 * Created by mleader1 on 23/08/2016.
 */

import {
    Component, OnInit, NgModule, Input, ViewEncapsulation, ElementRef, Output, EventEmitter,
    ViewChildren, QueryList, Host, forwardRef, Inject, ContentChildren, AfterContentInit, AfterViewInit
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MdInputModule} from "@angular2-material/input";
import {MdIconModule} from "@angular2-material/icon";
import {OESelectService, OESelectedItem} from "./select.service";
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

    uid: string;
    selectorId: string;
    valueBinding: string;
    textBinding: string;
    stateBinding: string;

    @Output()
    onItemToggled: EventEmitter<any> = new EventEmitter<any>();


    constructor(private selectService: OESelectService, public el: ElementRef) {
        this.uid = Utils.NewGuid();

        selectService.onItemRemoved$.subscribe((item: {selectorId: string, item: OESelectedItem})=> {
            if (item.item.uid == this.uid) {
                this.isSelected = false;
                this.item[this.stateBinding] = false;
            }
        });
        selectService.onItemSelected$.subscribe((item: {selectorId: string, item: OESelectedItem})=> {
            if (item.item.uid == this.uid) {
                this.isSelected = true;
                this.item[this.stateBinding] = true;
            }
        });
    }

    ngOnInit() {
        var item = this.selectService.getSelectedItems(this.selectorId, this.uid);
        if (item && item.length) {
            this.isSelected = true;
            this.item[this.stateBinding] = true;
        }
    }

    toggleSelect() {
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
        this.onItemToggled.emit({uid: this.uid, value: this.value, item: this.item, text: this.text});
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
    @ViewChildren(OESelectOptionComponent) dynamicArrayChildren: QueryList<OESelectOptionComponent>;
    @ContentChildren(OESelectOptionComponent) manualChildren: QueryList<OESelectOptionComponent>;
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
    allowMultiple: boolean;
    selectorId: string;

    showItems: boolean;

    @Output()
    onItemSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onItemDeselected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private el: ElementRef, private selectService: OESelectService) {
        this.selectorId = Utils.NewGuid();
        this.selectService.onItemSelected$.subscribe((item)=> {
            var scope = this;
            setTimeout(function () {
                scope.onItemSelected.emit(item);
            }, 100);
        })
        this.selectService.onItemRemoved$.subscribe((item)=> {
            var scope = this;
            setTimeout(function () {
                scope.onItemDeselected.emit(item);
            }, 100);
        });
    }

    ngOnInit() {
        this.selectService.registerSelector(this.selectorId, this.allowMultiple);
    }

    ngAfterViewInit() {
        this.dynamicArrayChildren.forEach((item: OESelectOptionComponent)=> {
            this.configureChildOptionComponent(item);
        });
    }

    ngAfterContentInit() {
        this.manualChildren.forEach((item: OESelectOptionComponent)=> {
            this.configureChildOptionComponent(item);
        });
    }

    configureChildOptionComponent(itemComponent: OESelectOptionComponent) {
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

    onItemToggled(event: any) {
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