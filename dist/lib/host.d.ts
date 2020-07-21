/// <reference types="node" />
import { ForkOptions, ChildProcess } from 'child_process';
export declare class Fork {
    readonly process: ChildProcess;
    private eventsContainer;
    private requestEventsContainer;
    private requestResolvers;
    readonly on: (event: string, handler: import("./types/Handler").default) => void;
    readonly once: (event: string, fn: import("./types/Handler").default) => void;
    readonly removeListener: (event: string, handler: import("./types/Handler").default) => void;
    readonly onRequest: (event: string, handler: import("./types/Handler").default) => void;
    readonly onceRequest: (event: string, fn: import("./types/Handler").default) => void;
    readonly removeRequestListener: (event: string, handler: import("./types/Handler").default) => void;
    constructor(process: ChildProcess);
    private clearAfterExit;
    emit(event: string, data?: any): void;
    request<T>(event: string, data?: any, maximumTimeout?: number): Promise<T>;
    kill(): void;
    private handleMessage;
}
declare type Options = ForkOptions & {
    args?: string[];
};
export declare const createFork: (modulePath: string, options?: Options) => Fork;
export {};
