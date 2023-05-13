import { Identifier } from "./Identifier";
import { Payload } from "./Payload";

export interface Response {
    id: Identifier;
    result: Payload;
}

export interface ResponseError {
    id: Identifier;
    error: {
        code: number;
        message: string;
    };
}

export type ResponseEvent = (data: Response | ResponseError) => void;
