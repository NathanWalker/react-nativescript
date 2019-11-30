// import * as console from "../shared/Logger";
import * as React from "react";
import { createRef } from "react";
import { ButtonProps, NarrowedEventData } from "../shared/NativeScriptComponentTypings";
import { Button as NativeScriptButton } from "@nativescript/core";
import { TextBaseComponentProps, useTextBaseInheritance, TextBaseOmittedPropNames } from "./TextBase";
import { useEventListener } from "../client/EventHandling";

/**
 * Auxiliary props for the wrapping component rather than the intrinsic element.
 */
export interface ButtonAuxProps {
}
export type ButtonOmittedPropNames = keyof ButtonAuxProps | TextBaseOmittedPropNames;
export type ButtonComponentProps = ButtonAuxProps & Partial<ButtonProps> & TextBaseComponentProps;

/**
 * A hook to inherit all the behaviour of this React component. Useful when creating a React component that
 * wraps an intrinsic element that extends the same intrinsic element as this one.
 * 
 * @param ref the host instance of the underlying intrinsic element for this React component.
 * @param props all props for the intrinsic element and also its React wrapper (e.g. event listener handlers).
 * 
 * @returns just the props to be passed on to the underlying intrinsic element.
 */
export function useButtonInheritance<
    P extends ButtonComponentProps,
    E extends NativeScriptButton = NativeScriptButton
>(
    ref: React.RefObject<E>,
    props: P
): Omit<P, ButtonOmittedPropNames>
{
    const intrinsicProps = useTextBaseInheritance(ref, props);
    // No events

    // We have to explicitly type this because of an issue with tsc inference... :(
    return intrinsicProps as Omit<P, ButtonOmittedPropNames>;
}

export function _Button(props: React.PropsWithChildren<ButtonComponentProps>, ref?: React.RefObject<NativeScriptButton>)
{
    ref = ref || createRef<NativeScriptButton>();
    const { children, text, formattedText, ...intrinsicProps } = useButtonInheritance(ref, props);

    if (text && formattedText) {
        console.warn(`Both text and formattedText provided; shall use formattedText.`);
    }

    const textContent = {
        [formattedText ? "formattedText" : "text"]: formattedText || text,
    };

    return React.createElement(
        "button",
        {
            ...intrinsicProps,
            ...textContent,
            ref,
        },
        children // Weird that a Button may contain children, but what do I know.
    );
}

export const Button = React.forwardRef<NativeScriptButton, React.PropsWithChildren<ButtonComponentProps>>(_Button);
