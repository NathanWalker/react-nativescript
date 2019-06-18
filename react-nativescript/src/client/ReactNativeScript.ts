/**
 * Code in here referenced from: https://github.com/gaearon/react/blob/1c7af862246e24574540f05c459f5fac0fad7086/src/renderers/dom/fiber/ReactDOMFiberEntry.js which carries the following copyright:
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * They have since moved to a MIT-style licence, which is reproduced in React-LICENSE.txt.
 */

import * as ReactReconciler from 'react-reconciler';
import { reactReconcilerInst, Container } from "./HostConfig";
import * as React from "react";
import { ReactPortal, createElement, createRef } from "react";
import { createPortal as _createPortal } from './ReactPortal';
import { run, hasLaunched, getRootView } from "tns-core-modules/application";
import { Frame, Page, TabView, View, ContentView, ProxyViewContainer } from "../client/ElementRegistry";
import { AbsoluteLayout as RCTAbsoluteLayout } from "../components/AbsoluteLayout";
import { ActionBar as RCTActionBar } from "../components/ActionBar";
import { ActionItem as RCTActionItem } from "../components/ActionItem";
import { Button as RCTButton } from "../components/Button";
import { Frame as RCTFrame } from "../components/Frame";
import { ActivityIndicator as RCTActivityIndicator } from "../components/ActivityIndicator";
import { DatePicker as RCTDatePicker } from "../components/DatePicker";
import { ScrollView as RCTScrollView } from "../components/ScrollView";
import { SearchBar as RCTSearchBar } from "../components/SearchBar";
import { SegmentedBar as RCTSegmentedBar } from "../components/SegmentedBar";
import { Slider as RCTSlider } from "../components/Slider";
import { DockLayout as RCTDockLayout } from "../components/DockLayout";
import { FlexboxLayout as RCTFlexboxLayout } from "../components/FlexboxLayout";
import { GridLayout as RCTGridLayout } from "../components/GridLayout";
import { HtmlView as RCTHtmlView } from "../components/HtmlView";
import { Label as RCTLabel } from "../components/Label";
import { ListView as RCTListView } from "../components/ListView";
import { ListPicker as RCTListPicker } from "../components/ListPicker";
import { ListViewCell as RCTListViewCell } from "../components/ListViewCell";
// import { Portal as RCTPortal } from "../components/Portal";
import { NavigationButton as RCTNavigationButton } from "../components/NavigationButton";
import { Placeholder as RCTPlaceholder } from "../components/Placeholder";
import { Progress as RCTProgress } from "../components/Progress";
import { StackLayout as RCTStackLayout } from "../components/StackLayout";
import { Switch as RCTSwitch } from "../components/Switch";
import { TextField as RCTTextField } from "../components/TextField";
import { TextView as RCTTextView } from "../components/TextView";
import { TabView as RCTTabView } from "../components/TabView";
import { TabViewItem as RCTTabViewItem } from "../components/TabViewItem";
import { TimePicker as RCTTimePicker } from "../components/TimePicker";
import { ContentView as RCTContentView } from "../components/ContentView";
import { WebView as RCTWebView } from "../components/WebView";
import { WrapLayout as RCTWrapLayout } from "../components/WrapLayout";
import { Page as RCTPage } from "../components/Page";
import { Image as RCTImage } from "../components/Image";

// declare global {
//     var __DEV__: boolean|undefined;
// }

(global as any).__DEV__ = false;

// https://blog.atulr.com/react-custom-renderer-1/
export function createPortal(
    children: ReactReconciler.ReactNodeList,
    // ReactFabric passes in a containerTag rather than a container; hope it can figure out how to re-use a root when the container is null :/
    container: Container,
    key: string|null = null,
): ReactPortal {
    // invariant(
    //   isValidContainer(container),
    //   'Target container is not a DOM element.',
    // );
    // TODO (from Facebook): pass ReactDOM portal implementation as third argument
    const portal = _createPortal(children, container, null, key);
    // console.log(`Created portal:`, portal);
    return portal;
}

type RootKey = Container|string|null;
const roots = new Map<RootKey, ReactReconciler.FiberRoot>();

/**
 * React NativeScript can render into any container that extends View,
 * but it makes sense to use the Frame > Page model if your whole app
 * (rather than a portion of it) will be described using React NativeScript.
 * 
 * @param reactElement - Your <App/> component.
 * @param domElement - Your root component; typically Page, but can be any View. Accepts null for a detached tree.
 * @param callback - A callback to run after the component (typically <App/>) is rendered.
 * @param containerTag - A unique key by which to keep track of the root (useful when the domElement is null).
 * 'roots' with reference to: https://github.com/facebook/react/blob/ef4ac42f8893afd0240d2679db7438f1b599bbd4/packages/react-native-renderer/src/ReactFabric.js#L119
 * @returns a ref to the container.
 */
export function render(
    reactElement: ReactReconciler.ReactNodeList,
    domElement: Container|null,
    callback: () => void|null|undefined = () => undefined,
    containerTag: string|null = null
){
    const key: RootKey = containerTag || domElement;
    let root: ReactReconciler.FiberRoot = roots.get(key);
    if(!root){
        root = reactReconcilerInst.createContainer(domElement, false, false);
        roots.set(key, root);
    }

    reactReconcilerInst.updateContainer(
        reactElement,
        root,
        null,
        callback
    );

    return reactReconcilerInst.getPublicRootInstance(root);
}

// https://github.com/facebook/react/blob/61f62246c8cfb76a4a19d1661eeaa5822ec37b36/packages/react-native-renderer/src/ReactNativeRenderer.js#L139
/**
 * Calls removeChildFromContainer() to make the container remove its immediate child.
 * If said container is null (i.e. a detached tree), note that null.removeChild() doesn't exist, so it's a no-op.
 * Either way, it'll delete our reference to the root and thus should remove the React association from it.
 * @param containerTag - the key uniquely identifying this root (either the container itself, or a string).
 */
export function unmountComponentAtNode(containerTag: RootKey): void {
    const root: ReactReconciler.FiberRoot = roots.get(containerTag);
    if(!root) return;
    // TODO (from FB): Is it safe to reset this now or should I wait since this unmount could be deferred?
    reactReconcilerInst.updateContainer(null, root, null, () => {
        roots.delete(containerTag);
    });
}

/**
 * Convenience function to start your React NativeScript app.
 * This should be placed as the final line of your app.ts file, as no
 * code will run after it (at least on iOS).
 *  
 * @param app - Your <App/> component (must have a <Page> as its outermost
 *              component).
 * @param frame - The top frame for your NativeScript app (optional).
 * @param refToPage - Reference to the host Page of your outermost component.
 */
export function startWithFrame(
    app: ReactReconciler.ReactNodeList,
    frame: Frame = new Frame(),
    refToPage: React.RefObject<Page>
): void {
    run({
        create: () => {
            frame.navigate({
                create: () => {
                    console.log(`[frame.navigate() -> create()] Rendering app. refToPage.current:`, refToPage.current);

                    render(
                        app,
                        /* Any view would do here - ProxyViewContainer is not being used for anything clever;
                         * I prevent the HostConfig from calling appendChild() when the child is a Page. */
                        new ProxyViewContainer(),
                        () => {
                            console.log(`Container updated!`);
                        }
                    );

                    console.log(`render() hopefully complete; refToPage.current:`, refToPage.current);

                    return refToPage.current;
                }
            });

            return frame;
        }
    });
}

/**
 * Convenience function to start your React NativeScript app.
 * This should be placed as the final line of your app.ts file, as no
 * code will run after it (at least on iOS).
 *  
 * @param app - Your <App/> component. Outermost component must be a View
 *              of some kind, but strictly not Page or Frame.
 * @param frame - The top frame for your NativeScript app (optional).
 * @param page - A custom Page for your NativeScript app (optional).
 */
export function startWithFrameAndPage(
    app: ReactReconciler.ReactNodeList,
    frame: Frame = new Frame(),
    page: Page = new Page(),
): void {
    run({
        create: () => {
            frame.navigate({
                create: () => {
                    render(app, page, () => console.log(`Container updated!`));
    
                    return page;
                }
            });

            return frame;
        }
    });
}

/**
 * Convenience function to start your React NativeScript app.
 * This should be placed as the final line of your app.ts file, as no
 * code will run after it (at least on iOS).
 * 
 * Construct a non-React-managed container, call run.create(), and return
 * the container whilst rendering may still be in process.
 * 
 * Supports HMR (for whatever reason)!
 *  
 * @param app - Your <App/> component.
 * @param rootView - The root view for your NativeScript app
 */
export function startWithView(
    app: ReactReconciler.ReactNodeList,
    providedRootView: View = new ContentView(),
): void
{
    // if(
    //     !(providedRootView instanceof TabView || providedRootView instanceof Frame)
    // ){
    //     console.warn(`Support for root view components other than Frame or TabView is limited.`);
    // }

    const existingRootView: View|undefined = getRootView();
    const _hasLaunched: boolean = hasLaunched();
    console.log(`[app.ts] startWithView(). hasLaunched(): ${_hasLaunched} existing rootView was: ${existingRootView}`);
    const rootView: View = existingRootView || providedRootView;

    // hasLaunched seems to always be false (don't ask me why) so we take a truthy rootView to mean the same thing.
    if(_hasLaunched || existingRootView){
        console.log(`[renderIntoRootView] no-op (hot reload)`);

        // render(app, rootView, () => console.log(`Container updated!`));
    } else {
        console.log(`[renderIntoRootView] calling run() method`);

        run({
            create: () => {
                render(app, rootView, () => console.log(`Container updated!`));
    
                return rootView;
            }
        });
    }
}

/**
 * Convenience function to start your React NativeScript app.
 * This should be placed as the final line of your app.ts file, as no
 * code will run after it (at least on iOS).
 * 
 * Construct a non-React-managed container, render into it, and upon
 * render completion, return the ref to the React tree root in run.create().
 * 
 * WARNING: it seems that this approach does not support hot reloading!
 * Neither does returning the constructed container instead!
 *  
 * @param app - Your <App/> component.
 * @param refToApp - Reference to the root component of your React app's tree.
 */
export function startWithAnyView(
    app: ReactReconciler.ReactNodeList,
    refToApp: React.RefObject<View>
): void
{
    const existingRootView: View|undefined = getRootView();
    const _hasLaunched: boolean = hasLaunched();
    console.log(`[app.ts] startWithView(). hasLaunched(): ${_hasLaunched} existing rootView was: ${existingRootView}`);
    if(_hasLaunched || existingRootView){
        console.log(`[renderIntoRootView] hot reload: no-op`);
        
        if(existingRootView instanceof Frame){
            console.log(`[renderIntoRootView] hot reload: calling reloadPage() on root frame`);
            if(existingRootView.currentPage){
                (existingRootView as any).reloadPage();
            }
        }
        return;
    };

    const rootView = new ContentView();
    render(app, rootView, () => {
        console.log(`Container updated!`);

        console.log(`[renderIntoRootView] calling run() method`);
    
        run({
            create: () => {
                return refToApp.current;
                // return rootView;
            }
        });
    });
}

export {
    // RCTDialogs,
    // RCTGestures,
    RCTAbsoluteLayout,
    RCTActionBar,
    RCTActionItem,
    RCTActivityIndicator,
    RCTButton,
    RCTContentView,
    RCTDatePicker,
    RCTDockLayout,
    RCTFlexboxLayout,
    RCTFrame,
    RCTGridLayout,
    RCTHtmlView,
    RCTImage,
    RCTLabel,
    RCTListView,
    RCTListPicker,
    RCTNavigationButton,
    RCTPage,
    RCTPlaceholder,
    RCTProgress,
    RCTScrollView,
    RCTSearchBar,
    RCTSegmentedBar,
    RCTSlider,
    RCTStackLayout,
    RCTSwitch,
    RCTTabView,
    RCTTabViewItem,
    RCTTextField,
    RCTTextView,
    RCTTimePicker,
    RCTWebView,
    RCTWrapLayout,
};