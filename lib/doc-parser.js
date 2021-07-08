const { ObjectID } = require("mongodb");

const values = {
    decode: function (value) {
        if (value === null || value === undefined) {
            return value
        }

        if (Array.isArray(value)) {
            return value.map(this.decode);
        }

        if (typeof value === 'object') {
            if ('$oid' in value) {
                return new ObjectID(value.$oid);
            }

            throw new Error("can't decode object");
        }

        return value;
    },
    encode: function (value) {
        if (value === null || value === undefined) {
            return value
        }

        if (value instanceof ObjectID) {
            return { $oid: value.toHexString() };
        }

        if (Array.isArray(value)) {
            return Promise.all(value.map(this.encode));
        }

        if (typeof value === 'object') {
            throw new Error("can't encode object")
        }

        return value;
    }
}

module.exports = {
    decode: function (data) {
        const obj = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null) {
                if ('$oid' in value) {
                    obj[key] = values.decode(value);
                } else {
                    obj[key] = module.exports.decode(value);
                }

            } else {
                obj[key] = values.decode(value);
            }
        }

        return obj;
    },
    encode: function (doc) {
        const obj = {};

        for (const [key, value] of Object.entries(doc)) {

            if (typeof value === 'object' && !(value instanceof ObjectID) && value != null) {
                obj[key] = module.exports.encode(value);
            } else {
                obj[key] = values.encode(value);
            }
        }

        return obj;
    }

}