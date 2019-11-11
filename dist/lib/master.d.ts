/// <reference types="node" />
import { ForkOptions, ChildProcess } from 'child_process';
declare class Slave {
    readonly fork: ChildProcess;
    private readonly events;
    private readonly responseEmitter;
    constructor(fork: ChildProcess);
    on(event: string, listener: (payload?: any) => void | Promise<any>): void;
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
