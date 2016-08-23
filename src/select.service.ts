import {Injectable, EventEmitter} from "@angular/core";
import {Utils} from "../../../core/utils/funcs";
/**
 * Created by mleader1 on 23/08/2016.
 */


export class OESelectedItem {
    uid: string;
    text: string;
    value: any;
    item: any;

    constructor(uid?: string, value?: any, text?: string, item?: any) {
        this.uid = uid || Utils.NewGuid();
        this.value = value || null;
        this.item = item || null;
        this.text = text || null;
    }
}
export class OESelectorState {
    selectorId: string;
    selectedItems: OESelectedItem[];
    allowMultipleSelect: boolean;

    constructor(selectorId?: string, selectedItems?: OESelectedItem[], allowMultipleSelect?: boolean) {
        this.selectorId = selectorId || Utils.NewGuid();
        this.selectedItems = selectedItems || [];
        this.allowMultipleSelect = allowMultipleSelect || false;
    }
}


@Injectable()
export class OESelectService {
    selectors: OESelectorState[];

    onItemSelected$: EventEmitter<{selectorId: string, item: OESelectedItem}>;
    onItemRemoved$: EventEmitter<{selectorId: string, item: OESelectedItem}>;

    constructor() {
        this.selectors = [];
        this.onItemSelected$ = new EventEmitter<{selectorId: string, item: OESelectedItem}>();
        this.onItemRemoved$ = new EventEmitter<{selectorId: string, item: OESelectedItem}>();
    }

    getSelectedItems(selectorId: string, itemUId?: string): OESelectedItem[] {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var matchedItems = selector.selectedItems;
                if (itemUId)
                    matchedItems = selector.selectedItems.filter(item=>item.uid === itemUId);

                return matchedItems;
            }
        }
        return null;
    }

    getSelector(selectorId: string): OESelectorState {
        if (selectorId) {
            var matches = this.selectors.filter((item)=>item.selectorId === selectorId);
            if (matches.length)
                return matches[0];
        }
        return null;
    }

    registerSelector(selectorId: string, allowMultipleSelect?: boolean, selectedItems?: OESelectedItem[]) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector)
                console.warn('[OE Selector - Warning] a duplicated selector registration is identified - id:' + selectorId);
            else {
                var newSelector = new OESelectorState(selectorId, selectedItems, allowMultipleSelect);
                this.selectors.push(newSelector);
            }
        }

    }

    registerSelectedItem(selectorId: string, uid: string, value: any, text: string, item: any) {
        if (selectorId && uid) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                var newItem = new OESelectedItem(uid, value, text, item);

                var matches = selector.selectedItems.filter((item)=>item.uid === uid);
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
                this.onItemSelected$.emit({selectorId: selectorId, item: item});
            }
        }
    }

    deregisterSelectedItem(selectorId: string, uid: string, value: any, text: string, item: any) {
        if (selectorId && uid) {
            var selector = this.getSelector(selectorId);

            if (selector) {
                var newItem = new OESelectedItem(uid, value, text, item);
                var matches = selector.selectedItems.filter((item)=>item.uid === uid);
                if (!matches.length) {
                    if (selector.allowMultipleSelect)
                        selector.selectedItems.splice(selector.selectedItems.indexOf(matches[0]), 1);
                    else
                        this.clearSelectorItems(selector);
                    this.onItemRemoved$.emit({selectorId: selectorId, item: newItem});
                }
            }
        }
    }

    clearSelectorItems(selector: OESelectorState) {
        if (selector) {
            var removeItems = selector.selectedItems;
            selector.selectedItems = [];
            for (var item of removeItems) {
                this.onItemRemoved$.emit({selectorId: selector.selectorId, item: item});
            }
        }
    }
}