import Handler from '../types/Handler';
export default class EventsContainer {
    private readonly events;
    readonly add: (event: string, handler: Handler) => void;
    readonly addOnce: (event: string, fn: Handler) => void;
    readonly delete: (event: string, handler: Handler) => void;
    readonly get: (event: string) => Handler[];
    readonly forEach: (event: string, fn: Handler) => void;
}
