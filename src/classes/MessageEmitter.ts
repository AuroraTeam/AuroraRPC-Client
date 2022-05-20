import { SafeIdentifier } from "../types/Identifier";
import { Response, ResponseError, ResponseEvent } from "../types/Response";

export default class MessageEmitter {
    #listeners: Map<SafeIdentifier, ResponseEvent> = new Map();

    public addListener(id: SafeIdentifier, listener: ResponseEvent) {
        this.#listeners.set(id, listener);
    }

    public emit(data: Response | ResponseError) {
        if (data.id === undefined || data.id === null)
            // TODO Implement notifications
            return console.error("[AuroraRPC] Broken request: ", data);
        if (!this.#listeners.has(data.id))
            return console.error("[AuroraRPC] Unhandled request: ", data);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#listeners.get(data.id)!(data);
        this.#listeners.delete(data.id);
    }
}
