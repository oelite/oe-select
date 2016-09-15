import {Injectable, EventEmitter} from "@angular/core";
import {Utils} from "../../utils/funcs";
/**
 * Created by mleader1 on 23/08/2016.
 */


export class OESelectItem {
    text: string;
    value: any;
    selected: boolean;
    item: any;


    constructor(value: any, selected: boolean, text?: string, item?: any) {
        this.value = value;
        this.selected = selected;
        this.item = item || null;
        this.text = text || null;
    }
}
export class OESelectorState {
    selectorId: string;
    items: OESelectItem[];
    allowMultipleSelect: boolean;
    defaultMultipleSelectionStateDisplayText: string;
    defaultEmptyPlaceholderText: string;

    constructor(selectorId?: string, items?: OESelectItem[], allowMultipleSelect?: boolean, defaultEmptyPlaceholderText?: string, defaultMultipleSelectionStateDisplayText?: string) {
        this.selectorId = selectorId || Utils.NewGuid();
        this.items = items || [];
        this.allowMultipleSelect = allowMultipleSelect || false;
        this.defaultEmptyPlaceholderText = defaultEmptyPlaceholderText || "";
        this.defaultMultipleSelectionStateDisplayText = defaultMultipleSelectionStateDisplayText || "(multiple selected)"
    }
}


@Injectable()
export class OESelectService {
    selectors: OESelectorState[];

    onItemSelected$: EventEmitter<{selectorId: string, item: OESelectItem}>;
    onItemRemoved$: EventEmitter<{selectorId: string, item: OESelectItem}>;
    onInitItemRegistered$: EventEmitter<{selectorId: string, item: OESelectItem}>;
    onSelectorDisplayTextUpdate$: EventEmitter<{selectorId: string,text: string}>;

    constructor() {
        this.selectors = [];
        this.onItemSelected$ = new EventEmitter<{selectorId: string, item: OESelectItem}>();
        this.onItemRemoved$ = new EventEmitter<{selectorId: string, item: OESelectItem}>();
        this.onInitItemRegistered$ = new EventEmitter<{selectorId: string, item: OESelectItem}>();
        this.onSelectorDisplayTextUpdate$ = new EventEmitter<{selectorId: string,text: string}>();
    }

    getSelectedItems(selectorId: string, itemValue?: any): OESelectItem[] {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {
                {
                    var matchedItems = selector.items.filter(item=>item.selected && (itemValue == null || itemValue === item.value));
                    return matchedItems;
                }
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

    registerSelector(selectorId: string, allowMultipleSelect?: boolean, items?: OESelectItem[], emptySelectionPlaceholderText?: string, defaultMultiSelectionText?: string) {
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
                for (var item of items) {
                    if (item.selected)
                        this.onInitItemRegistered$.emit({selectorId: selectorId, item: item});
                }
            }
        }

    }

    registerItem(selectorId: string, selected: boolean, value: any, text: string, item: any, ignoreSelectEmit: boolean) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);
            if (selector) {

                var matches = selector.items.filter((item)=>item.value === value);
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
                            for (var existingSelectedItem of existingSelectedItems) {
                                this.deselectItem(selectorId, existingSelectedItem.value, existingSelectedItem.text, existingSelectedItem.item);
                            }

                        existingItem.selected = true;
                        if (!ignoreSelectEmit)
                            this.onItemSelected$.emit({selectorId: selectorId, item: existingItem});
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
                            for (var existingSelectedItem of existingSelectedItems) {
                                this.deselectItem(selectorId, existingSelectedItem.value, existingSelectedItem.text, existingSelectedItem.item);
                            }

                        selector.items.push(newItem);
                        if (!ignoreSelectEmit)
                            this.onItemSelected$.emit({selectorId: selectorId, item: newItem});

                        if (selector.allowMultipleSelect && existingSelectedItems && existingSelectedItems.length >= 1) {
                            this.notifySelectorDisplayUpdate(selectorId, selector.defaultMultipleSelectionStateDisplayText);
                        }
                        else
                            this.notifySelectorDisplayUpdate(selectorId, newItem.text);

                    }
                }

            }
        }
    }

    notifySelectorDisplayUpdate(selectorId: string, displayText: string) {
        this.onSelectorDisplayTextUpdate$.emit({selectorId: selectorId, text: displayText});
    }

    deselectItem(selectorId: string, itemValue: any, text: string, item: any, ignoreSelectorDisplayUpdate?: boolean) {
        if (selectorId) {
            var selector = this.getSelector(selectorId);

            if (selector) {
                var existingSelectedItems = this.getSelectedItems(selectorId, itemValue);
                if (existingSelectedItems && existingSelectedItems.length) {
                    var existingItem = existingSelectedItems[0];
                    existingItem.selected = false;
                    this.onItemRemoved$.emit({selectorId: selectorId, item: existingItem});

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
    }

    clearSelectedItems(selector: OESelectorState) {
        if (selector) {
            var removeItems = this.getSelectedItems(selector.selectorId);
            if (removeItems)
                for (var item of removeItems) {
                    this.deselectItem(selector.selectorId, item.value, item.text, item.item, true);
                }

            this.notifySelectorDisplayUpdate(selector.selectorId, selector.defaultEmptyPlaceholderText);
        }
    }
}