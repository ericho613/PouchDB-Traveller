/**
 * Model representing database connection
 */
export class DBConnection{
    id: string;
    dbAliasName?: string;
    connectionPath: string;
    lastDateTimeAccessed?: string;
    type?:string;
}