import * as React from "react";
import { ContentView } from "tns-core-modules/ui/content-view/content-view";
import { TextBase, ViewBase, PercentLength, FormattedString } from "tns-core-modules/ui/text-base/text-base";
import { Color } from "tns-core-modules/color";
import { Span } from "tns-core-modules/text/span";
import { ViewProps, StylePropContents } from "react-nativescript/dist/components/NativeScriptComponentTypings";
import {
    Button as ReactButton,
    ContentView as ReactContentView,
    TextView as ReactTextView,
    Label as ReactLabel,
    // StylePropContents,
    DockLayout as ReactDockLayout,
    AbsoluteLayout as ReactAbsoluteLayout,
    FlexboxLayout as ReactFlexboxLayout,
    ListView as ReactListView,
} from "react-nativescript/dist/index";
import { FlexboxLayout } from "react-nativescript/dist/components/FlexboxLayout";
const PropTypes = require('prop-types');

type ViewBaseProp<T extends ViewBase> = {
    [P in keyof T]: T[P]
};

class MyTextField extends React.Component<{ toWhat: string }, {}> {
    render(){
        return React.createElement('TextField', null, `Hello ${this.props.toWhat}`);
        // { type: "TextField", props: { toWhat: string, children: string } }
    }
}

export class MyTextView extends React.Component<{ toWhat: string }, {}> {
    render(){
        return React.createElement(ReactTextView, null, `Hello ${this.props.toWhat}`);
        // { type: "TextField", props: { toWhat: string, children: string } }
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
            ReactContentView,
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
                ReactContentView,
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

        return React.createElement(
            ReactLabel,
            {
                formattedText: formattedString
            },
            null
        );
    }
}

export class Marquee extends React.Component<{ text: string }, { date: Date, index: number }> {
    private loopID: number;
    // private timerID!: number;
    // private text: string = "NativeScript is an AMAZING framework";

    /* Warning: %s.getChildContext(): childContextTypes must be defined in order to use getChildContext(). GameLoopProvider */
    static contextTypes = {
        loop: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            index: 0
        };
    }
  
    componentDidMount() {
    //   this.timerID = setInterval(
    //       () => this.tick(),
    //       100
    //   );
        this.loopID = this.context.loop.subscribe(this.tick.bind(this));
    }
  
    componentWillUnmount() {
        // clearInterval(this.timerID);
        this.context.loop.unsubscribe(this.loopID);
    }
  
    tick() {
        this.setState((prev) => ({
            date: new Date(),
            index: (prev.index + 1) % this.props.text.length
        }));
    }

    render(){
        const { text } = this.props;
        const { index } = this.state;

        return React.createElement(
            ReactLabel,
            {
                text: text.slice(index, text.length)
            },
            null
        );
    }
}

export class GameLoop {
    private readonly subscribers = [];
    private loopID: number|null = null;

	constructor(private readonly frameRateMs: number = 1000 / 60){
		this.loop = this.loop.bind(this);
	}

	loop(): void {
		this.subscribers.forEach((callback) => {
			callback.call();
		});

        /* NativeScript doesn't have requestAnimationFrame() :( */
        // this.loopID = global.requestAnimationFrame(this.loop);
        this.loopID = setTimeout(this.loop, this.frameRateMs);
	}

	start(): void {
		if (!this.loopID) {
			this.loop();
		}
	}

	stop(): void {
		if (!this.loopID) {
            // window.cancelAnimationFrame(this.loopID);
            clearTimeout(this.loopID);
			this.loopID = null;
		}
	}

	subscribe(callback: (...args: any[]) => any): number {
		return this.subscribers.push(callback);
	}

	unsubscribe(id: number): void {
		this.subscribers.splice((id - 1), 1);
	}
}

export class GameLoopProvider extends React.Component<{ frameRateMs?: number, style?: Partial<StylePropContents> }, {}> {
    private readonly loop;

    /* Warning: %s.getChildContext(): childContextTypes must be defined in order to use getChildContext(). GameLoopProvider */
    static propTypes = {
        children: PropTypes.any,
        style: PropTypes.object,
    };
    
    static childContextTypes = {
        loop: PropTypes.object,
    };

	constructor(props) {
		super(props);

		this.loop = new GameLoop(this.props.frameRateMs || 1000 / 60);
	}

	componentDidMount() {
		this.loop.start();
	}

	componentWillUnmount() {
		this.loop.stop();
	}

	getChildContext() {
        console.log(`[GameLoopProvider] getChildContext()!`);
		return {
			loop: this.loop,
		};
	}

	render() {
        const { children, frameRateMs, ...rest } = this.props;

		return React.createElement(
            ReactContentView,
            {
                style: {
                    width: { unit: "%", value: 100 },
                    height: { unit: "%", value: 100 }
                },
                ...rest,
            },
            children
        );
	}
}

export class FlexboxLayoutTest1 extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            FlexboxLayout,
            {
                style: {
                    alignItems: "center",
                    justifyContent: "space-between",
                },
            },
            // React.createElement(
            //     'ContentView',
            //     {
            //         backgroundColor: new Color("blue"),
            //         width: 75,
            //         height: 100
            //     }
            // ),
            // React.createElement(
            //     'ContentView',
            //     {
            //         backgroundColor: new Color("red"),
            //         width: 75,
            //         height: 80
            //     }
            // ),
            // React.createElement(
            //     'ContentView',
            //     {
            //         backgroundColor: new Color("yellow"),
            //         width: 75,
            //         height: 140
            //     }
            // ),
            // React.createElement(
            //     'ContentView',
            //     {
            //         backgroundColor: new Color("lightgreen"),
            //         width: 75,
            //         height: 70
            //     }
            // ),
            React.createElement(
                ReactContentView,
                {
                    style: {
                        backgroundColor: new Color("blue"),
                        width: 75,
                        height: 100
                    },
                }
            ),
            // React.createElement(
            //     ReactContentView,
            //     {
            //         style: {
            //             backgroundColor: new Color("red"),
            //             width: 75,
            //             height: 80
            //         },
            //     }
            // ),
            // React.createElement(
            //     ReactContentView,
            //     {
            //         style: {
            //             backgroundColor: new Color("yellow"),
            //             width: 75,
            //             height: 140
            //         },
            //     }
            // ),
            // React.createElement(
            //     ReactContentView,
            //     {
            //         style: {
            //             backgroundColor: new Color("lightgreen"),
            //             width: 75,
            //             height: 70
            //         },
            //     }
            // ),
        );
    }
}

// React.createElement(
//     MyButton,
//     {
//         onTap: (args: EventData) => console.log("Tapped!", args),
//         text: "Tap me!",
//         className: "btn btn-primary btn-active"
//     },
//     null
// ),

// React.createElement(
//     ReactButton,
//     {
//         onPress: (args: EventData) => console.log("Tapped!", args),
//         title: "Tap me!",
//         // className: "btn btn-primary btn-active"
//     },
//     null
// ),

export class Clock extends React.Component<{}, { date: Date }> {
    private timerID!: number;

    constructor(props) {
        super(props);
        this.state = { date: new Date() };
    }
  
    componentDidMount() {
      this.timerID = setInterval(
          () => this.tick(),
          1000
      );
    }

    shouldComponentUpdate(){
        console.log(`[Clock] shouldComponentUpdate`);
        return true;
    }

    componentWillUpdate(){
        console.log(`[Clock] componentWillUpdate`);
    }

    componentDidUpdate(){
        console.log(`[Clock] componentDidUpdate`);
    }
  
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
  
    tick() {
        this.setState({
          date: new Date()
        });
    }
  
    render() {
        console.log(`[Clock] render()!`);
        
        return React.createElement(
            ReactTextView,
            {
            },
            this.state.date.toLocaleTimeString()
        );
    }
}

export class ListViewTest extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            ReactListView,
            {
                items: [
                    /* Enough cells to see how view recycling works/ doesn't work */
                    ...[...Array(7).keys()].map((val) => {
                        return { text: val };
                    })
                ],
                cellFactory: (item: any, container: ContentView) => {
                    return React.createElement(
                        "label",
                        {
                            key: container._domId,
                            text: `${item.text}`,
                            fontSize: 150,
                            // textWrap: true,
                            // class: "title"
                            
                        }
                    )
                }
            },
            null
        );
    }
}

export class GameLoopTest extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            GameLoopProvider,
            {
                frameRateMs: (1000 / 60) // Bigger number means slower
            },
            React.createElement(
                Marquee,
                {
                    text: "NativeScript is an AMAZING framework"
                },
                null
            ),
        );
    }
}

export class DockLayoutTest extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            ReactDockLayout,
            {
                stretchLastChild: true,
            },
            React.createElement(
                ReactButton,
                {
                    dock: "left",
                    text: "Left",
                    backgroundColor: "#0099CC",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "top",
                    text: "Top",
                    backgroundColor: "#AA0078",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "right",
                    text: "Right",
                    backgroundColor: "#8C489F",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "bottom",
                    text: "Bottom",
                    backgroundColor: "#B3B3D7",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    // dock: "bottom",
                    text: "Fill",
                    // 'grey' is invalid! D:
                    color: new Color("gray"),
                    backgroundColor: "#CCFFFF",
                    onPress: () => {}
                },
                null
            ),
        );
    }
}

export class AbsoluteLayoutTest extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            ReactAbsoluteLayout,
            {
            },
            React.createElement(
                ReactButton,
                {
                    dock: "left",
                    text: "Left: 10, Top: 5",
                    left: 10,
                    top: 5,
                    backgroundColor: "#0099CC",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "top",
                    text: "Left: 30, Top: 80",
                    left: 30,
                    top: 80,
                    backgroundColor: "#C3C3E5",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "right",
                    text: "Left: 150, Top: 25",
                    left: 150,
                    top: 25,
                    backgroundColor: "#CCFFFF",
                    onPress: () => {}
                },
                null
            ),
            React.createElement(
                ReactButton,
                {
                    dock: "bottom",
                    text: "Left: 70, Top: 150",
                    left: 70,
                    top: 150,
                    backgroundColor: "#8C489F",
                    onPress: () => {}
                },
                null
            ),
        );
    }
}

export class FlexboxLayoutTest2 extends React.Component<{}, {}> {
    render(){
        return React.createElement(
            ReactFlexboxLayout,
            {
                flexDirection: "column-reverse",
                justifyContent: "space-around",
                alignItems: "stretch",
                height: 300,
                width: 300,
                backgroundColor: "lightGray"
            },
            React.createElement(
                ReactLabel,
                {
                    text: "Label 1",
                    width: 60,
                    height: 60,
                    backgroundColor: "red",
                },
                null
            ),
            React.createElement(
                ReactLabel,
                {
                    text: "Label 2",
                    alignSelf: "center",
                    width: 60,
                    height: 60,
                    backgroundColor: "green",
                },
                null
            ),
            React.createElement(
                ReactLabel,
                {
                    text: "Label 3",
                    alignSelf: "flex-end",
                    width: 60,
                    height: 60,
                    backgroundColor: "blue",
                },
                null
            ),
            React.createElement(
                ReactLabel,
                {
                    text: "Label 4",
                    width: 60,
                    height: 60,
                    backgroundColor: "yellow",
                },
                null
            ),
        );
    }
}
