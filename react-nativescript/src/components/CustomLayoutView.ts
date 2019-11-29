import * as console from "../shared/Logger";
import * as React from "react";
import { CustomLayoutViewProps } from "../shared/NativeScriptComponentTypings";
import { CustomLayoutView as NativeScriptCustomLayoutView } from "tns-core-modules/ui/content-view/content-view";
import { ContainerViewComponentProps, ContainerViewOmittedPropNames, useContainerViewInheritance } from "./ContainerView";

/**
 * Auxiliary props for the wrapping component rather than the intrinsic element.
 */
export interface CustomLayoutViewAuxProps {}
export type CustomLayoutViewOmittedPropNames = ContainerViewOmittedPropNames;
export type CustomLayoutViewComponentProps = CustomLayoutViewAuxProps & Partial<CustomLayoutViewProps> & ContainerViewComponentProps;

/**
 * A hook to inherit all the behaviour of this React component. Useful when creating a React component that
 * wraps an intrinsic element that extends the same intrinsic element as this one.
 * 
 * @param ref the host instance of the underlying intrinsic element for this React component.
 * @param props all props for the intrinsic element and also its React wrapper (e.g. event listener handlers).
 * 
 * @returns just the props to be passed on to the underlying intrinsic element.
 */
export function useCustomLayoutViewInheritance<
    P extends ContainerViewComponentProps,
    E extends NativeScriptCustomLayoutView = NativeScriptCustomLayoutView
>(
    ref: React.RefObject<E>,
    props: P
): Omit<P, CustomLayoutViewOmittedPropNames>
{
    const intrinsicProps = useContainerViewInheritance(ref, props);
    // ContainerView has no events of its own to handle

    // We have to explicitly type this because of an issue with tsc inference... :(
    return intrinsicProps as Omit<P, ContainerViewOmittedPropNames>;
}

