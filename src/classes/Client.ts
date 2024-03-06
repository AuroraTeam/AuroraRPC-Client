import WebSocket from "modern-isomorphic-ws";
import { nanoid } from "nanoid";

import { Payload } from "../types/Payload";
import { Request } from "../types/Request";
import { Response, ResponseError } from "../types/Response";
import MessageEmitter from "./MessageEmitter";

export interface Events {
    onClose?: (event: WebSocket.CloseEvent | CloseEvent) => void;
    onError?: (event: WebSocket.ErrorEvent | Event) => void;
    onMessage?: (event: WebSocket.MessageEvent | MessageEvent) => void;
    onOpen?: (event: WebSocket.Event | Event) => void;
}

export class Client {
    #messageEmitter = new MessageEmitter();
    #socket?: WebSocket;
    #url?: string;
    #events?: Events;

    constructor(url?: string, events?: Events) {
        this.#url = url;
        this.#events = events;
    }

    /**
     * Подключение к серверу
     * @throws {Error}
     */
    public connect(url?: string, events?: Events) {
        const _url = url || this.#url;
        if (!_url) throw new Error("[AuroraRPC] Url not defined");

        const getEvents = <T extends keyof Events>(name: T) =>
            events?.[name] || this.#events?.[name];

        return new Promise((resolve, reject) => {
            this.#socket = new WebSocket(_url);
            this.#socket.onopen = (event) => {
                this.#onOpen(event, getEvents("onOpen"));
                resolve(this);
            };
            this.#socket.onclose = (event) =>
                this.#onClose(event, getEvents("onClose"));
            this.#socket.onerror = (event) => {
                this.#onError(event, getEvents("onError"));
                reject(event);
            };
            this.#socket.onmessage = (event) =>
                this.#onMessage(event, getEvents("onMessage"));
        });
    }

    // reopen?
    public close(code?: number, data?: string): void {
        this.#socket?.close(code, data);
    }

    public hasConnected(): boolean {
        return this.#socket?.readyState === this.#socket?.OPEN;
    }

    /**
     * Отправка запроса
     * @param method Тип реквеста
     * @param params Данные
     * @throws {ResponseError | Error}
     */
    public send(method: string, params?: Payload): Promise<Response> {
        if (!this.#socket || !this.hasConnected())
            throw new Error("[AuroraRPC] WebSocket not connected");

        const id = nanoid();
        const request: Request = { id, method, params };

        this.#socket.send(JSON.stringify(request));

        return new Promise((resolve, reject) =>
            this.#messageEmitter.addListener(
                id,
                (data: Response | ResponseError): void => {
                    if ("error" in data) reject(data);
                    else resolve(data);
                },
            ),
        );
    }

    /* Events */

    #onOpen(
        event: WebSocket.Event | Event,
        eventListener?: (event: WebSocket.Event | Event) => void,
    ): void {
        console.log("[AuroraRPC] Connection established");
        if (eventListener) eventListener(event);
    }

    #onClose(
        event: WebSocket.CloseEvent | CloseEvent,
        eventListener?: (event: WebSocket.CloseEvent | CloseEvent) => void,
    ) {
        if (event.wasClean) return console.log("[AuroraRPC] Connection closed");
        if (event.code === 1006) console.error("[AuroraRPC] Break connection");
        else console.error("[AuroraRPC] Unknown error", event);
        if (eventListener) eventListener(event);
    }

    #onMessage(
        event: WebSocket.MessageEvent | MessageEvent,
        eventListener?: (event: WebSocket.MessageEvent | MessageEvent) => void,
    ) {
        this.#messageEmitter.emit(JSON.parse(event.data.toString()));
        if (eventListener) eventListener(event);
    }

    #onError(
        event: WebSocket.ErrorEvent | Event,
        eventListener?: (event: WebSocket.ErrorEvent | Event) => void,
    ) {
        console.error("[AuroraRPC] WebSocket error:", event);
        if (eventListener) eventListener(event);
    }
}
