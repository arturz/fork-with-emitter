/// <reference types="node" />
import { ForkOptions, ChildProcess } from 'child_process';
declare class Slave {
    readonly fork: ChildProcess;
    private readonly eventsContainer;
    private readonly requestEventsContainer;
    private readonly requestResponseEmitter;
    readonly on: (event: string, handler: import("./types/Handler").default) => void;
    readonly once: (event: string, fn: import("./types/Handler").default) => void;
    readonly removeListener: (event: string, handler: import("./types/Handler").default) => void;
    readonly onRequest: (event: string, handler: import("./types/Handler").default) => void;
    readonly onceRequest: (event: string, fn: import("./types/Handler").default) => void;
    readonly removeRequestListener: (event: string, handler: import("./types/Handler").default) => void;
    constructor(fork: ChildProcess);
    emit(event: string, payload?: any): void;
    request(event: string, payload?: any, maximumTimeout?: number): Promise<unknown>;
    kill(): void;
    private handleMessage;
}
declare type Options = ForkOptions & {
    args?: string[];
};
export declare const createSlave: (modulePath: string, options?: Options) => Slave;
export {};
