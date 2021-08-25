const { ObjectID } = require("mongodb");
const isObject = require("isobject");


module.exports = {
    decode: function (value) {
        if (Array.isArray(value)) {
            return value.map((v) => this.decode(v));
        }

        if (isObject(value)) {
            if ('$oid' in value) {
                return new ObjectID(value.$oid);
            }

            return Object.entries(value).reduce((t,[key,val]) => ({...t, [key]: this.decode(val)}),{});
        }

        return value;
    },
    encode: function (value) {
        if (value instanceof ObjectID) {
            return { $oid: value.toHexString() };
        }

        if (Array.isArray(value)) {
            return value.map((v) => this.encode(v));
        }

        if (isObject(value)) {
            return Object.entries(value).reduce((t,[key,val]) => ({...t, [key]: this.encode(val)}),{});
        }

        return value;
    }

}