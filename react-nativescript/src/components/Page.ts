// import * as console from "../shared/Logger";
import * as React from "react";
import { useRef } from "react";
import { PageProps, PropsWithoutForwardedRef } from "../shared/NativeScriptComponentTypings";
import { Page as NativeScriptPage, NavigatedData } from "tns-core-modules/ui/page/page";
import { _ContentView, ContentViewComponentProps, useContentViewInheritance, ContentViewOmittedProps } from "./ContentView";
import { useEventListener } from "../client/EventHandling";

interface Props {
    onNavigatingTo?: PageNavigationEventHandler;
    onNavigatedTo?: PageNavigationEventHandler;
    onNavigatingFrom?: PageNavigationEventHandler;
    onNavigatedFrom?: PageNavigationEventHandler;
}

export type PageNavigationEventHandler = (args: NavigatedData) => void;

export type PageComponentProps<
    E extends NativeScriptPage = NativeScriptPage
> = Props & Partial<PageProps> & ContentViewComponentProps<E>;

/**
 * A React wrapper around the NativeScript Page component.
 * See: ui/page/page
 */
export function _Page<
    P extends PageComponentProps<E>,
    E extends NativeScriptPage = NativeScriptPage
>(props: React.PropsWithChildren<P>)
{
    console.log(`[_Page.render()] entered`);
    const ref: React.RefObject<E> = (props.forwardedRef || useRef());
    console.log(`[_Page.render()] using ref: ${ref === props.forwardedRef ? "forwardedRef" : "useRef"}. ref.current:`, ref.current);
    const intrinsicProps = usePageInheritance(ref.current!, props);
    console.log(`[_Page.render()] performed usePageInheritance; returning ReactElement now.`);

    return React.createElement(
        "page",
        {
            ...intrinsicProps,
            ref,
        },
        null
    );
}

export const Page = React.forwardRef<NativeScriptPage, PropsWithoutForwardedRef<PageComponentProps>>(
    (props: React.PropsWithChildren<PropsWithoutForwardedRef<PageComponentProps>>, ref: React.RefObject<NativeScriptPage>) => {
        const { children, ...rest } = props;

        return React.createElement(
            _Page,
            {
                ...rest,
                forwardedRef: ref,
            },
            children
        );
    }
);

/**
 * A hook to handle adding/removing events any time a dependent event listener handler in the props changes value.
 * That is to say, on mount, update, and unmount.
 * 
 * @param node the host instance of the underlying intrinsic element for this React component.
 * @param props the props for the React component (from which this function will use any event listener handlers).
 */
export function usePageEvents<
    P extends PageComponentProps<E>,
    E extends NativeScriptPage = NativeScriptPage
>(
    node: E|null,
    props: P
): void
{
    useEventListener(node, "navigatedFrom", props.onNavigatedFrom);
    useEventListener(node, "navigatedTo", props.onNavigatedTo);
    useEventListener(node, "navigatingFrom", props.onNavigatingFrom);
    useEventListener(node, "navigatingTo", props.onNavigatingTo);
}

/**
 * A hook to inherit all the behaviour of this React component. Useful when creating a React component that
 * wraps an intrinsic element that extends the same intrinsic element as this one.
 * 
 * @param node the host instance of the underlying intrinsic element for this React component.
 * @param props all props for the intrinsic element and also its React wrapper (e.g. event listener handlers).
 * 
 * @returns just the props to be passed on to the underlying intrinsic element.
 */
export function usePageInheritance<
    P extends PageComponentProps<E>,
    E extends NativeScriptPage = NativeScriptPage
>(
    node: E|null,
    props: P
): Omit<P, PageOmittedProps>
{
    console.log(`[usePageInheritance] Entered.`);
    const intrinsicProps = useContentViewInheritance(node, props);
    console.log(`[usePageInheritance] used useContentViewInheritance. Shall now enter usePageEvents.`);
    usePageEvents(node, intrinsicProps);
    console.log(`[usePageInheritance] used usePageEvents. Shall now return intrinsic props.`);

    const {
        onNavigatedFrom,
        onNavigatedTo,
        onNavigatingFrom,
        onNavigatingTo,
        ...rest
    } = intrinsicProps;

    // Omit all event handlers because they aren't used by the intrinsic element.
    return { ...rest } as Omit<P, PageOmittedProps>;
}

export type PageOmittedProps = keyof Pick<Props,
"onNavigatedFrom"|
"onNavigatedTo"|
"onNavigatingFrom"|
"onNavigatingTo"
> | ContentViewOmittedProps;