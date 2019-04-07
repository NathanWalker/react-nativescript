/**
 * Code in here referenced from: https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMComponent.js which carries the following copyright:
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in React-LICENSE.txt.
 */
import assertValidProps from "../shared/assertValidProps";

const DANGEROUSLY_SET_INNER_HTML: string = 'dangerouslySetInnerHTML';
const SUPPRESS_CONTENT_EDITABLE_WARNING: string = 'suppressContentEditableWarning';
const SUPPRESS_HYDRATION_WARNING: string = 'suppressHydrationWarning';
const AUTOFOCUS: string = 'autoFocus';
const CHILDREN: string = 'children';
const STYLE: string = 'style';
const HTML: string = '__html';

export function diffProperties(
    domElement: Element,
    tag: string,
    lastRawProps: object,
    nextRawProps: object,
    rootContainerElement: Element | Document,
  ): null | Array<any> {
    // if(__DEV__){
    //   validatePropertiesInDevelopment(tag, nextRawProps);
    // }
  
    let updatePayload: null | Array<any> = null;
  
    let lastProps: object = lastRawProps;
    let nextProps: object = nextRawProps;

    // switch(tag){
    //   case 'input':
    //     lastProps = ReactDOMInputGetHostProps(domElement, lastRawProps);
    //     nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps);
    //     updatePayload = [];
    //     break;
    //   case 'option':
    //     lastProps = ReactDOMOptionGetHostProps(domElement, lastRawProps);
    //     nextProps = ReactDOMOptionGetHostProps(domElement, nextRawProps);
    //     updatePayload = [];
    //     break;
    //   case 'select':
    //     lastProps = ReactDOMSelectGetHostProps(domElement, lastRawProps);
    //     nextProps = ReactDOMSelectGetHostProps(domElement, nextRawProps);
    //     updatePayload = [];
    //     break;
    //   case 'textarea':
    //     lastProps = ReactDOMTextareaGetHostProps(domElement, lastRawProps);
    //     nextProps = ReactDOMTextareaGetHostProps(domElement, nextRawProps);
    //     updatePayload = [];
    //     break;
    //   default:
    //     lastProps = lastRawProps;
    //     nextProps = nextRawProps;
    //     if (
    //       typeof lastProps.onClick !== 'function' &&
    //       typeof nextProps.onClick === 'function'
    //     ) {
    //       // TODO: This cast may not be sound for SVG, MathML or custom elements.
    //       trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
    //     }
    //     break;
    // }
    
    assertValidProps(tag, nextProps);

    let propKey: string;
    let styleName: string;
    let styleUpdates: Record<string, string>|null = null;
    for (propKey in lastProps) {
        if (
            nextProps.hasOwnProperty(propKey) ||
            !lastProps.hasOwnProperty(propKey) ||
            lastProps[propKey] == null
        ) {
            continue;
        }
        if (propKey === STYLE) {
            const lastStyle = lastProps[propKey];
            for (styleName in lastStyle) {
                if (lastStyle.hasOwnProperty(styleName)) {
                    if (!styleUpdates) {
                        styleUpdates = {};
                    }
                    styleUpdates[styleName] = '';
                }
            }
        } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
            // Noop. This is handled by the clear text mechanism.
        } else if (
            propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
            propKey === SUPPRESS_HYDRATION_WARNING
        ) {
            // Noop
        } else if (propKey === AUTOFOCUS) {
            // Noop. It doesn't work on updates anyway.
        // } else if (registrationNameModules.hasOwnProperty(propKey)) {
        //     // This is a special case. If any listener updates we need to ensure
        //     // that the "current" fiber pointer gets updated so we need a commit
        //     // to update this element.
        //     if (!updatePayload) {
        //         updatePayload = [];
        //     }
        } else {
            // For all other deleted properties we add it to the queue. We use
            // the whitelist in the commit phase instead.
            (updatePayload = updatePayload || []).push(propKey, null);
        }
    }


    for (propKey in nextProps) {
        const nextProp = nextProps[propKey];
        const lastProp = lastProps != null ? lastProps[propKey] : undefined;
        if (
            !nextProps.hasOwnProperty(propKey) ||
            nextProp === lastProp ||
            (nextProp == null && lastProp == null)
        ) {
            continue;
        }
        if (propKey === STYLE) {
            if (__DEV__) {
                if (nextProp) {
                    // Freeze the next style object so that we can assume it won't be
                    // mutated. We have already warned for this in the past.
                    Object.freeze(nextProp);
                }
            }
            if (lastProp) {
                // Unset styles on `lastProp` but not on `nextProp`.
                for (styleName in lastProp) {
                    if (
                        lastProp.hasOwnProperty(styleName) &&
                        (!nextProp || !nextProp.hasOwnProperty(styleName))
                    ) {
                        if (!styleUpdates) {
                            styleUpdates = {};
                        }
                        styleUpdates[styleName] = '';
                    }
                }
                // Update styles that changed since `lastProp`.
                for (styleName in nextProp) {
                    if (
                        nextProp.hasOwnProperty(styleName) &&
                        lastProp[styleName] !== nextProp[styleName]
                    ) {
                        if (!styleUpdates) {
                            styleUpdates = {};
                        }
                        styleUpdates[styleName] = nextProp[styleName];
                    }
                }
            } else {
                // Relies on `updateStylesByID` not mutating `styleUpdates`.
                if (!styleUpdates) {
                    if (!updatePayload) {
                        updatePayload = [];
                    }
                    updatePayload.push(propKey, styleUpdates);
                }
                styleUpdates = nextProp;
            }
        } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            const nextHtml = nextProp ? nextProp[HTML] : undefined;
            const lastHtml = lastProp ? lastProp[HTML] : undefined;
            if (nextHtml != null) {
                if (lastHtml !== nextHtml) {
                    (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
                }
            } else {
                // TODO: It might be too late to clear this if we have children
                // inserted already.
            }
        } else if (propKey === CHILDREN) {
            if (
                lastProp !== nextProp &&
                (typeof nextProp === 'string' || typeof nextProp === 'number')
            ) {
                (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
            }
        } else if (
            propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
            propKey === SUPPRESS_HYDRATION_WARNING
        ) {
            // Noop
        // } else if (registrationNameModules.hasOwnProperty(propKey)) {
        //     if (nextProp != null) {
        //         // We eagerly listen to this even though we haven't committed yet.
        //         if (__DEV__ && typeof nextProp !== 'function') {
        //             warnForInvalidEventListener(propKey, nextProp);
        //         }
        //         ensureListeningTo(rootContainerElement, propKey);
        //     }
        //     if (!updatePayload && lastProp !== nextProp) {
        //         // This is a special case. If any listener updates we need to ensure
        //         // that the "current" props pointer gets updated so we need a commit
        //         // to update this element.
        //         updatePayload = [];
        //     }
        // } else {
            // For any other property we always add it to the queue and then we
            // filter it out using the whitelist during the commit.
            (updatePayload = updatePayload || []).push(propKey, nextProp);
        }
    }
    if (styleUpdates) {
        // if (__DEV__) {
        //     validateShorthandPropertyCollisionInDev(styleUpdates, nextProps[STYLE]);
        // }
        (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
    }
    return updatePayload;
}