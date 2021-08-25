import { ObjectId } from "mongodb";
import { encode, decode } from "./document";

const ids = new Array(100).fill(0).map(() => new ObjectId());

const equals = [
    {
        decoded: {
            _id: ids[2],
            sub: {
                test: "test",
                array: [
                    "test",
                    "test2",
                    "test3"
                ]
            },
            username: "test",
            password: "test",
            array: [0, 1, 2, 3]

        },
        encoded: {
            _id: { $oid: ids[2].toHexString() },
            sub: {
                test: "test",
                array: [
                    "test",
                    "test2",
                    "test3"
                ]
            },
            username: "test",
            password: "test",
            array: [0, 1, 2, 3]
        }
    }
];

test("encode()", () => {
    for (const { decoded, encoded } of equals) {
        expect(encode(decoded)).toMatchObject(encoded);
    }
});

test("decode()", () => {
    for (const { decoded, encoded } of equals) {
        expect(decode(encoded)).toMatchObject(decoded);
    }
});