import { Identifier } from "./Identifier";
import { Payload } from "./Payload";

export interface Request {
    id?: Identifier;
    method: string;
    params?: Payload;
}
