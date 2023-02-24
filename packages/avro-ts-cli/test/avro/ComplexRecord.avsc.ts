/* eslint-disable @typescript-eslint/no-namespace */

export type User = ComExampleAvro.User;

export namespace ComExampleAvro {
    export const FooSchema = "{\"type\":\"record\",\"name\":\"Foo\",\"fields\":[{\"name\":\"label\",\"type\":\"string\"}]}";
    export const FooName = "com.example.avro.Foo";
    export interface Foo {
        label: string;
    }
    export const EmailAddressSchema = "{\"type\":\"record\",\"name\":\"EmailAddress\",\"doc\":\"Stores details about an email address that a user has associated with their account.\",\"fields\":[{\"name\":\"address\",\"doc\":\"The email address, e.g. `foo@example.com`\",\"type\":\"string\"},{\"name\":\"verified\",\"doc\":\"true if the user has clicked the link in a confirmation email to this address.\",\"type\":\"boolean\",\"default\":false},{\"name\":\"dateAdded\",\"doc\":\"Timestamp (milliseconds since epoch) when the email address was added to the account.\",\"type\":\"long\"}]}";
    export const EmailAddressName = "com.example.avro.EmailAddress";
    /**
     * Stores details about an email address that a user has associated with their account.
     */
    export interface EmailAddress {
        /**
         * The email address, e.g. `foo@example.com`
         */
        address: string;
        /**
         * true if the user has clicked the link in a confirmation email to this address.
         *
         * Default: false
         */
        verified?: boolean;
        /**
         * Timestamp (milliseconds since epoch) when the email address was added to the account.
         */
        dateAdded: number;
    }
    export const StatusSchema = "{\"type\":\"enum\",\"name\":\"status\",\"doc\":\"* `ACTIVE`: the token should work\\n* `REVOKED`: the user has explicitly revoked the token\",\"symbols\":[\"ACTIVE\",\"REVOKED\"]}";
    export const StatusName = "com.example.avro.status";
    /**
     * * `ACTIVE`: the token should work
     * * `REVOKED`: the user has explicitly revoked the token
     */
    export type Status = "ACTIVE" | "REVOKED";
    export const UserSchema = "{\"type\":\"record\",\"name\":\"User\",\"namespace\":\"com.example.avro\",\"doc\":\"This is a user record in a fictitious to-do-list management app. It supports arbitrary grouping and nesting of items, and allows you to add items by email or by tweeting.\\n\\nNote this app doesn't actually exist. The schema is just a demo for [Avrodoc](https://github.com/ept/avrodoc)!\",\"fields\":[{\"name\":\"id\",\"doc\":\"System-assigned numeric user ID. Cannot be changed by the user.\",\"type\":\"int\"},{\"name\":\"username\",\"doc\":\"The username chosen by the user. Can be changed by the user.\",\"type\":\"string\"},{\"name\":\"passwordHash\",\"doc\":\"The user's password, hashed using [scrypt](http://www.tarsnap.com/scrypt.html).\",\"type\":\"string\"},{\"name\":\"signupDate\",\"doc\":\"Timestamp (milliseconds since epoch) when the user signed up\",\"type\":\"long\"},{\"name\":\"mapField\",\"type\":{\"type\":\"map\",\"values\":{\"type\":\"record\",\"name\":\"Foo\",\"fields\":[{\"name\":\"label\",\"type\":\"string\"}]}}},{\"name\":\"emailAddresses\",\"doc\":\"All email addresses on the user's account\",\"type\":{\"type\":\"array\",\"items\":{\"type\":\"record\",\"name\":\"EmailAddress\",\"doc\":\"Stores details about an email address that a user has associated with their account.\",\"fields\":[{\"name\":\"address\",\"doc\":\"The email address, e.g. `foo@example.com`\",\"type\":\"string\"},{\"name\":\"verified\",\"doc\":\"true if the user has clicked the link in a confirmation email to this address.\",\"type\":\"boolean\",\"default\":false},{\"name\":\"dateAdded\",\"doc\":\"Timestamp (milliseconds since epoch) when the email address was added to the account.\",\"type\":\"long\"}]}}},{\"name\":\"status\",\"doc\":\"Indicator of whether this authorization is currently active, or has been revoked\",\"type\":{\"type\":\"enum\",\"name\":\"status\",\"doc\":\"* `ACTIVE`: the token should work\\n* `REVOKED`: the user has explicitly revoked the token\",\"symbols\":[\"ACTIVE\",\"REVOKED\"]}}]}";
    export const UserName = "com.example.avro.User";
    /**
     * This is a user record in a fictitious to-do-list management app. It supports arbitrary grouping and nesting of items, and allows you to add items by email or by tweeting.
     *
     * Note this app doesn't actually exist. The schema is just a demo for [Avrodoc](https://github.com/ept/avrodoc)!
     */
    export interface User {
        /**
         * System-assigned numeric user ID. Cannot be changed by the user.
         */
        id: number;
        /**
         * The username chosen by the user. Can be changed by the user.
         */
        username: string;
        /**
         * The user's password, hashed using [scrypt](http://www.tarsnap.com/scrypt.html).
         */
        passwordHash: string;
        /**
         * Timestamp (milliseconds since epoch) when the user signed up
         */
        signupDate: number;
        mapField: {
            [index: string]: ComExampleAvro.Foo;
        };
        /**
         * All email addresses on the user's account
         */
        emailAddresses: ComExampleAvro.EmailAddress[];
        /**
         * Indicator of whether this authorization is currently active, or has been revoked
         */
        status: ComExampleAvro.Status;
    }
}
