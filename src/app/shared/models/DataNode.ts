/**
 * Json node data with nested structure. Each node has a key, a value, and a list of children
 */
export class DataNode {
    children: DataNode[];
    key: string;
    value: any;
    type: any;
    isExpanded?: boolean;
    level?: number;
    location: string;
    delete?: boolean;
    modified?: boolean;
    parentDelete?: boolean;
    isArrayElement?: boolean;
    parentElementLocation?: string;
    isNewRow?: boolean;
}