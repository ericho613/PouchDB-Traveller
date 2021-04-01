/**
 * Model representing an index in the PouchDB database
 */
export class DBIndex {
    name?: string;
    fields: Array<any>;
    ddoc?: string;
    type?: string;
}