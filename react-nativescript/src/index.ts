// import ReactReconciler = require('react-reconciler');
import * as ReactReconciler from 'react-reconciler';

import { TNSElements, elementMap, ConcreteViewConstructor } from './elementRegistry';
// TODO: Would be less coupled if we imported View and TextBase from elementRegistry.ts.
import { View } from 'tns-core-modules/ui/core/view/view';
import { Color } from 'tns-core-modules/color/color';
import { ViewBase } from 'tns-core-modules/ui/core/view-base/view-base';
import { ContentView } from "tns-core-modules/ui/content-view";
import { TextBase } from 'tns-core-modules/ui/text-base/text-base';
import { TextView } from 'tns-core-modules/ui/text-view/text-view';
import { Page } from "tns-core-modules/ui/page";
import { FlexboxLayout } from "tns-core-modules/ui/layouts/flexbox-layout/flexbox-layout";
// import { Page } from 'tns-core-modules/ui/page/page';
import { Frame } from 'tns-core-modules/ui/frame/frame';

type Type = TNSElements;
type Props = Record<string, any>;
type Container = View; // The root node of the app. Typically Frame, but View is more flexible.
type Instance = View; // We may extend this to Observable in future, to allow the tree to contain non-visual components.
type TextInstance = TextBase;
type HydratableInstance = any;
type PublicInstance = any;
type HostContext = any;
type UpdatePayload = any;
type ChildSet = any;
type TimeoutHandle = number; // Actually strictly should be Node-style timeout
type NoTimeout = any;
const noTimeoutValue: NoTimeout = undefined;

const rootHostContext: HostContext = {};
const childHostContext: HostContext = {};

// https://medium.com/@agent_hunt/hello-world-custom-react-renderer-9a95b7cd04bc
const hostConfig: ReactReconciler.HostConfig<Type, Props, Container, Instance, TextInstance, HydratableInstance, PublicInstance, HostContext, UpdatePayload, ChildSet, TimeoutHandle, NoTimeout> = {
    getPublicInstance(instance: Instance | TextInstance): PublicInstance {
        // TODO (this was a complete guess).
        return instance;
    },
    getRootHostContext(rootContainerInstance: Container): HostContext {
        return rootHostContext;
    },
    getChildHostContext(parentHostContext: HostContext, type: Type, rootContainerInstance: Container): HostContext {
        return childHostContext;
    },
    /**
     * This function is called when we have made a in-memory render tree of all the views (Remember we are yet to attach it the the actual root dom node).
     * Here we can do any preparation that needs to be done on the rootContainer before attaching the in memory render tree.
     * For example: In the case of react-dom, it keeps track of all the currently focused elements, disabled events temporarily, etc.
     * @param rootContainerInstance - root dom node you specify while calling render. This is most commonly <div id="root"></div>
     */
    prepareForCommit(rootContainerInstance: Container): void {
        // TODO
    },
    /**
     * This function gets executed after the inmemory tree has been attached to the root dom element. Here we can do any post attach operations that needs to be done.
     *  For example: react-dom re-enabled events which were temporarily disabled in prepareForCommit and refocuses elements, etc.
     * @param rootContainerInstance - root dom node you specify while calling render. This is most commonly <div id="root"></div>
     */
    resetAfterCommit(rootContainerInstance: Container): void {
        // TODO
    },
    createInstance(
        type: Type,
        props: Props,
        rootContainerInstance: Container,
        hostContext: HostContext,
        internalInstanceHandle: ReactReconciler.OpaqueHandle,
    ): Instance {
        const viewConstructor: ConcreteViewConstructor = elementMap[type];
        if(!viewConstructor){
            throw new Error(`Unrecognised type, "${type}", not found in element registry.`);
        }
        console.log(`[createInstance() 1a] type: ${type}. props:`, props);
        console.log(`[createInstance() 1b] type: ${type}. rootContainerInstance:`, rootContainerInstance);
        // FIXME: https://reactjs.org/docs/jsx-in-depth.html#user-defined-components-must-be-capitalized
        // Summarised in: https://medium.com/@agent_hunt/introduction-to-react-native-renderers-aka-react-native-is-the-java-and-react-native-renderers-are-828a0022f433
        // TODO: at the moment, I only support components from tns-core-modules. Ultimately we want to support any registered component.
        const view: View = new viewConstructor();

        // view.height = 100;
        // view.width = 100;
        // (view as FlexboxLayout).style.width = 100;
        // (view as FlexboxLayout).style.height = 100;
        // (view as FlexboxLayout).style.backgroundColor = new Color(100, 255, 255, 0);
        // const aChild = new ContentView();
        // aChild.style.width = 100;
        // aChild.style.height = 100;
        // aChild.style.backgroundColor = new Color(100, 0, 255, 255);
        // view._addView(aChild);

        console.log(`[createInstance() 1c] type: ${type}. constructed:`, view);
        Object.keys(props).forEach((prop: string) => {
            const value: any = props[prop];

            // TODO: much more work here. Handle styles and event listeners, for example. Think this Observable method handles barely anything.
            if(prop === "children"){
                if(hostConfig.shouldSetTextContent(type, props)){
                    if(view instanceof TextBase){
                        // WARNING: unsure that this is how you're supposed to use HostConfig.
                        hostConfig.commitTextUpdate(view, "", value);
                        console.log(`[createInstance() 1d] type: ${type}. after commitTextUpdate():`, view.text);
                    } else {
                        const tv: TextView = hostConfig.createTextInstance(value, rootContainerInstance, hostContext, internalInstanceHandle) as TextView;

                        console.warn(`Support for setting textContent of a non-TextBase view is experimental.`);
                        hostConfig.appendChild(view, tv);
                    }
                } else {
                    console.warn(`No support for nesting children yet.`);
                }
            } else if(prop === "className"){
                console.warn(`remapping 'className' to 'class'; might be undesired behaviour.`);
                view.set("class", value);
            } else if(prop === "style"){
                console.warn(`Support for setting styles is experimental.`);
                Object.keys(value).forEach((styleName: string) => {
                    const styleValue: any = value[styleName];
                    view.set(styleName, styleValue);
                });
            } else {
                view.set(prop, value);
            }

            // TODO: should probably notify of property change, too.
        });
        console.log(`[createInstance() 1e] type: ${type}. returning:`, view);

        // TODO: also merge in the hostContext (whatever that is).

        return view;
    },
    appendInitialChild(parentInstance: Instance, child: Instance | TextInstance): void {
        console.log(`[appendInitialChild()]`);
        parentInstance._addView(child);
    },
    /**
     * Docs from: https://blog.atulr.com/react-custom-renderer-2/
     * @param parentInstance - the DOM element after appendInitialChild()
     * @param type - the type of Fiber, e.g. "div"
     * @param props - the props to be passed to the host Element.
     * @param rootContainerInstance - root dom node you specify while calling render. This is most commonly <div id="root"></div>
     * @param hostContext - contains the context from the parent node enclosing this node. This is the return value from getChildHostContext of the parent node.
     * @returns A boolean value which decides if commitMount() for this element needs to be called.
     */
    finalizeInitialChildren(
        parentInstance: Instance,
        type: Type,
        props: Props,
        rootContainerInstance: Container,
        hostContext: HostContext,
    ): boolean {
        // TODO
        return false;
    },
    /**
     * From: https://blog.atulr.com/react-custom-renderer-3/
     * @param instance - the current DOM instance of the Node.
     * @param type - the type of fiber, e.g. "div".
     * @param oldProps - props before this update.
     * @param newProps - incoming props.
     * @param rootContainerInstance - root dom node you specify while calling render. This is most commonly <div id="root"></div>
     * @param hostContext - contains the context from the parent node enclosing this node. This is the return value from getChildHostContext of the parent node.
     * @returns This function should return a payload object. Payload is a Javascript object that can contain information on what needs to be changed on this host element.
     */
    prepareUpdate(
        instance: Instance,
        type: Type,
        oldProps: Props,
        newProps: Props,
        rootContainerInstance: Container,
        hostContext: HostContext,
    ): null | UpdatePayload {
        // TODO
        return null;
    },
    shouldSetTextContent(type: Type, props: Props): boolean {
        return typeof props.children === 'string' || typeof props.children === 'number';
    },
    /**
     * This function is used to deprioritize rendering of some subtrees. Mostly used in cases where the subtree is hidden or offscreen.
     * @param type - the DOM type of the element, e.g. "div"
     * @param props - the props to be passed to the Element.
     */
    shouldDeprioritizeSubtree(type: Type, props: Props): boolean {
        return !!props.hidden; // Purely based on React-DOM.
    },
    createTextInstance(
        text: string,
        rootContainerInstance: Container,
        hostContext: HostContext,
        internalInstanceHandle: ReactReconciler.OpaqueHandle,
    ): TextInstance {
        // See createInstance().

        /* Is TextView the most appropriate here?
         * Alternative is TextField. TextBase just a base class.
         * Medium tutorial uses: document.createTextNode(text); */
        const textView: TextView = new TextView();
        textView.text = text;

        // TODO: maybe inherit the style information from container..?
        // TODO: also merge in the hostContext (whatever that is).

        return textView;
    },
    scheduleDeferredCallback(
        callback: () => any,
        options?: { timeout: number },
    ): any {
        // TODO: check whether default timeout should be 0.
        if(!options) options = { timeout: 0 };

        return setTimeout(callback, options.timeout);
    },
    cancelDeferredCallback(callbackID: any): void {
        clearTimeout(callbackID);
    },
    setTimeout(handler: (...args: any[]) => void, timeout: number): TimeoutHandle | NoTimeout {
        return setTimeout(handler, timeout);
    },
    clearTimeout(handle: TimeoutHandle | NoTimeout): void {
        clearTimeout(handle);
    },
    noTimeout: noTimeoutValue,
    now: Date.now,
    isPrimaryRenderer: true,
    supportsMutation: true, // TODO
    supportsPersistence: false,
    supportsHydration: false,

    /* Mutation (optional) */
    appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
        console.log(`[appendChild()]`, parentInstance, child);
        
        if(parentInstance instanceof Page || parentInstance instanceof ContentView){
            /* These elements were originally designed to hold one element only:
             * https://stackoverflow.com/a/55351086/5951226 */
            parentInstance.content = child;
        } else {
            parentInstance._addView(child);
        }
        // TODO: check whether a property/event change should be fired.
    },
    appendChildToContainer(container: Container, child: Instance | TextInstance): void {
        console.log(`[appendChildToContainer()] deferring to appendChild()`, container, child);
        hostConfig.appendChild(container, child);
        // TODO: check whether a property/event change should be fired.
    },
    commitTextUpdate(textInstance: TextInstance, oldText: string, newText: string): void {
        console.log(`[commitTextUpdate()]`, textInstance);
        textInstance.text = newText;
        // e.g.: https://github.com/NativeScript/NativeScript/blob/master/tns-core-modules/data/observable/observable.ts#L53
        textInstance.notifyPropertyChange("text", newText, oldText);
    },
    /**
     * From: https://blog.atulr.com/react-custom-renderer-2/
     * This function is called for every element that has set the return value of finalizeInitialChildren() to true. This method is called after all the steps are done (ie after resetAfterCommit), meaning the entire tree has been attached to the dom.
     * This method is mainly used in react-dom for implementing autofocus. This method exists in react-dom only and not in react-native.
     * @param instance 
     * @param type 
     * @param newProps 
     * @param internalInstanceHandle 
     */
    commitMount(
        instance: Instance,
        type: Type,
        newProps: Props,
        internalInstanceHandle: ReactReconciler.OpaqueHandle,
    ): void {
        instance.focus();
    },
    commitUpdate(
        instance: Instance,
        updatePayload: UpdatePayload,
        type: Type,
        oldProps: Props,
        newProps: Props,
        internalInstanceHandle: ReactReconciler.OpaqueHandle,
    ): void {
        Object.keys(newProps).forEach((prop: string) => {
            const value: any = newProps[prop];
            if(prop === "children"){
                if(typeof prop === "string" || typeof prop === "number"){
                    if(instance instanceof TextBase){
                        const oldText: string = instance.text;
                        instance.text = value;
                        instance.notifyPropertyChange("text", "newText", oldText);
                    } else {
                        console.warn(`commitUpdate() called with text as a prop upon a non-TextBase View. Text-setting is only implemented for instances extending TextBase.`);
                    }
                }
            } else {
                instance.set(prop, value);
                // TODO: check whether Observable.set() is appropriate.
                // TODO: should probably notify of property change, too.
            }
        })
    },
    insertBefore(parentInstance: Instance, child: Instance | TextInstance, beforeChild: Instance | TextInstance): void {
        // TODO: Refer to {N}Vue's implementation: https://github.com/nativescript-vue/nativescript-vue/blob/master/platform/nativescript/renderer/ViewNode.js#L157
        let beforeChildIndex: number = 0;
        parentInstance.eachChild((viewBase: ViewBase) => {
            if(viewBase === beforeChild){
                return false;
            } else {
                beforeChildIndex++;
                return true;
            }
        });
        // NOTE: Untested. Potentially has an off-by-one error.
        // TODO: fire child._parentChanged()?
        parentInstance._addView(child, beforeChildIndex);
    },
    /**
     * From: https://blog.atulr.com/react-custom-renderer-3/
     * This function is called whenever an element needs to insertedBefore the top most level component (Root component) itself.
     * @param container - the root container node to which a the child node needs to be inserted.
     * @param child - the dom node that needs to be inserted.
     * @param beforeChild - the child node before which the new child node needs to be inserted.
     */
    insertInContainerBefore(
        container: Container,
        child: Instance | TextInstance,
        beforeChild: Instance | TextInstance,
    ): void {
        let beforeChildIndex: number = 0;
        container.eachChild((viewBase: ViewBase) => {
            if(viewBase === beforeChild){
                return false;
            } else {
                beforeChildIndex++;
                return true;
            }
        });
        // NOTE: Untested. Potentially has an off-by-one error.
        container._addView(child, beforeChildIndex);
    },
    removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
        parentInstance._removeView(child);
        // TODO: check whether a property/event change should be fired.
    },
    removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
        container._removeView(child);
        // TODO: check whether a property/event change should be fired.
    },
    resetTextContent(instance: Instance): void {
        if(instance instanceof TextBase){
            const oldText: string = instance.text;
            instance.text = "";
            instance.notifyPropertyChange("text", "", oldText);
        } else {
            console.warn(`resetTextContent() stub called on a non-TextBase View. Text-resetting is only implemented for instances extending TextBase.`);
        }
    },
}
const reactReconcilerInst = ReactReconciler<Type, Props, Container, Instance, TextInstance, HydratableInstance, PublicInstance, HostContext, UpdatePayload, ChildSet, TimeoutHandle, NoTimeout>(hostConfig);

// https://blog.atulr.com/react-custom-renderer-1/
export default {
    render: (
        reactElement: ReactReconciler.ReactNodeList, // <App />
        domElement: Container, // document.getElementById('root')
        callback: () => void|null|undefined = () => undefined // Called after the component is rendered or updated
    ) => {
        const container = reactReconcilerInst.createContainer(domElement, false, false);

        // console.log("[render() 1a] Created container", container);
        // console.log("[render() 1b] Created container", container._root);

        // update the root Container
        return reactReconcilerInst.updateContainer(
            reactElement,
            container,
            null,
            callback
        );
    }
};