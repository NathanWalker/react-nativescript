import * as React from "react";
import { PercentLength, FormattedString } from "tns-core-modules/ui/text-base/text-base";
import { Color } from "tns-core-modules/color";
import { Span } from "tns-core-modules/text/span";
import { ContentView, TextBase, ViewBase, StackLayout, Label, TabView, Page, ProxyViewContainer } from "react-nativescript/dist/client/ElementRegistry";
import { ViewProps, StylePropContents } from "react-nativescript/dist/shared/NativeScriptComponentTypings";
import { NavigationButton } from "tns-core-modules/ui/action-bar/action-bar";
import {
    $Button,
    $ContentView,
    $TextView,
    $TextField,
    $Label,
    // StylePropContents,
    $DockLayout,
    $AbsoluteLayout,
    $StackLayout,
    $FlexboxLayout,
    $ListView,
    $ActionBar,
    $TabView,
    $TabViewItem,
    $Page,
} from "react-nativescript/dist/index";
import * as ReactNativeScript from "react-nativescript/dist/index";
import { TabViewItem } from "tns-core-modules/ui/tab-view/tab-view";
import { PageComponentProps } from "react-nativescript/dist/components/Page";
import { PortalToPageWithActionBar } from "./navigation";

type ViewBaseProp<T extends ViewBase> = {
    [P in keyof T]: T[P]
};

export class TextFieldTest extends React.Component<{ toWhat: string }, {}> {
    render(){
        return React.createElement('TextField', null, `Hello ${this.props.toWhat}`);
        // { type: "TextField", props: { toWhat: string, children: string } }
    }
}

export class TextViewTest extends React.Component<{ toWhat: string }, {}> {
    render(){
        // return (<ReactTextView text={`Hello ${this.props.toWhat}`}/>);
        return (<$TextView>{`Hello ${this.props.toWhat}`}</$TextView>);
    }
}

export class LabelTest extends React.Component<{ toWhat: string }, {}> {
    render(){
        return (<$Label>{`Hello ${this.props.toWhat}`}</$Label>);
    }
}

class MyRootView extends React.Component<{}, {}> {
    render(){
        return React.createElement('frame', null);
    }
}

export class NestedContentView extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            $ContentView,
            {
                style: {
                    /* Note that "75%" and "yellow" also work at run-time; it's just that the typings disallow it. */
                    backgroundColor: new Color("yellow"),
                    width: { unit: "%", value: 75 },
                    height: { unit: "%", value: 75 }
                },
                // backgroundColor: "yellow",
                // width: 75,
            },
            React.createElement(
                $ContentView,
                {
                    /* Seems that these props are totally untyped (deep 'any'). */
                    style: {
                        backgroundColor: new Color("orange"),
                        width: 50,
                        height: 50
                    },
                }
            )
        );
    }
}

/**
 * Referring to:
 * https://github.com/NativeScript/nativescript-sdk-examples-js/blob/master/app/ns-ui-widgets-category/formatted-string/code-behind/code-behind-ts-page.ts
 * https://www.nativescript.org/blog/bolding-italicizing-and-underlining-portions-of-text-in-nativescript
 */

export class FormattedStringLabel extends React.Component<{}, {}> {
    render(){
        const formattedString = new FormattedString();

        const firstSpan: Span = new Span();
        firstSpan.color = new Color("#3C5AFD");
        firstSpan.text = "NativeScript";

        const secondSpan: Span = new Span();
        secondSpan.text = " is an ";

        const thirdSpan: Span = new Span();
        thirdSpan.fontWeight = "bold";
        thirdSpan.fontSize = 28;
        thirdSpan.textDecoration = "underline";
        thirdSpan.color = new Color("white");
        thirdSpan.backgroundColor = new Color("green");
        thirdSpan.fontFamily = "Courier";
        thirdSpan.text = "AMAZING";

        const fourthSpan: Span = new Span();
        fourthSpan.text = " framework";

        [firstSpan, secondSpan, thirdSpan, fourthSpan]
        .forEach((span) => {
            formattedString.spans.push(span);
        })

        // return React.createElement(
        //     ReactLabel,
        //     {
        //         formattedText: formattedString
        //     },
        //     null
        // );

        return (
            <$Label formattedText={formattedString} />
        )
    }
}
