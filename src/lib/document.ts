import isObject from "isobject";
import { ObjectId } from "mongodb";

/**
 * Encodes a mongodb document to json so it can be decoded later
 * @param value The mongodb document
 * @returns a object that can be json stringified
 */
export function encode(value: any): any {
    if (value instanceof ObjectId) {
        return { $oid: value.toHexString() };
    }

    if (Array.isArray(value)) {
        return value.map((v) => encode(v));
    }

    if (isObject(value)) {

        return Object.entries(value)
            .reduce((t, [key, val]) => ({ ...t, [key]: encode(val) }), {});
    }

    return value;
}


/**
 * Takes an encoded document and rebuildes it to a mongodb document
 * @param value the encoded json document
 * @returns the mongodb document
 */
export function decode(value: any): any {
    if (Array.isArray(value)) {
        return value.map((v) => decode(v));
    }

    if (isObject(value)) {
        if ('$oid' in value) {
            return new ObjectId(value.$oid);
        }

        return Object.entries(value).reduce((t, [key, val]) => ({ ...t, [key]: decode(val) }), {});
    }

    return value;
}