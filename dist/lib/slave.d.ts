export declare const isSlave: boolean;
export declare const master: {
    on(event: string, listener: Function): void;
    emit(event: string, payload?: any): void;
    request(event: string, payload?: any, maximumTimeout?: number): Promise<unknown>;
};
