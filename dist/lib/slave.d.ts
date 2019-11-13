export declare const isSlave: boolean;
export declare const master: {
    on: (event: string, handler: import("./types/Handler").default) => void;
    once: (event: string, fn: import("./types/Handler").default) => void;
    removeListener: (event: string, handler: import("./types/Handler").default) => void;
    onRequest: (event: string, handler: import("./types/Handler").default) => void;
    onceRequest: (event: string, fn: import("./types/Handler").default) => void;
    removeRequestListener: (event: string, handler: import("./types/Handler").default) => void;
    emit(event: string, payload?: any): void;
    request(event: string, payload?: any, maximumTimeout?: number): Promise<unknown>;
};
