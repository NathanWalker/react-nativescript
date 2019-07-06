import * as console from "../shared/Logger";
import * as React from "react";
import * as ReactNativeScript from "../client/ReactNativeScript";
import { TabViewItemProps, ViewBaseProps, PropsWithoutForwardedRef } from "../shared/NativeScriptComponentTypings";
import { View, ViewBase, StackLayout, Color, ContentView, Label } from "../client/ElementRegistry";
import {
    TabView as NativeScriptTabView,
    TabViewItem as NativeScriptTabViewItem,
} from "tns-core-modules/ui/tab-view/tab-view";
import { ViewBaseComponentProps, RCTViewBase } from "./ViewBase";

interface Props {
    // view: View
}

export type TabViewItemComponentProps<
    E extends NativeScriptTabViewItem = NativeScriptTabViewItem
> = Props /* & typeof RCTTabViewItem.defaultProps */ & Partial<TabViewItemProps> & ViewBaseComponentProps<E>;

/**
 * A React wrapper around the NativeScript TabViewItem component.
 *
 * See: ui/tab-view/tab-view
 * See: https://github.com/NativeScript/nativescript-sdk-examples-js/blob/master/app/ns-ui-widgets-category/tab-view/code-behind/code-behind-ts-page.ts
 */
export class _TabViewItem<
    P extends TabViewItemComponentProps<E>,
    S extends {},
    E extends NativeScriptTabViewItem
> extends RCTViewBase<P, S, E> {
    render() {
        const {
            forwardedRef,

            onPropertyChange,

            children,
            // view, /* We disallow this at the typings level. */
            ...rest
        } = this.props;

        if (React.Children.count(children) > 1 || typeof children === "string" || typeof children === "number") {
            throw new Error(
                `'children' property passed into TabViewItem must be a single child node, which must not be a number or string`
            );
        }

        return React.createElement(
            "tabViewItem",
            {
                ...rest,
                ref: forwardedRef || this.myRef,
            },
            children
        );
    }
}

type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<TabViewItemComponentProps<NativeScriptTabViewItem>>;

export const TabViewItem: React.ComponentType<
    OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptTabViewItem>
> = React.forwardRef<NativeScriptTabViewItem, OwnPropsWithoutForwardedRef>(
    (props: React.PropsWithChildren<OwnPropsWithoutForwardedRef>, ref: React.RefObject<NativeScriptTabViewItem>) => {
        const { children, ...rest } = props;

        return React.createElement(
            _TabViewItem,
            {
                ...rest,
                forwardedRef: ref,
            },
            children
        );
    }
);
