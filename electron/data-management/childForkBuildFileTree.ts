import { v4 as uuidv4 } from 'uuid';
import { DataNode } from '../../src/app/shared/models';

let nodeCounter = 0;

//function used to convert a JavaScript object to a
// DataNode object array that can be used by the
// tree control to display a tree to the user; the resulting
// DataNode object array is also used to create a
// configuration object for the FormGroup() constructor
export function buildFileTree(obj: {[key: string]: any}, level: number, prevLocation?: string, parentNodeType?: string): DataNode[] {
    return Object.keys(obj).reduce<DataNode[]>((accumulator, key) => {

        console.log(nodeCounter);
        nodeCounter++;
        const value = obj[key];
        const node = new DataNode();
        node.key = key;
        node.level = level + 1;

        let moddedLocation = '[' + uuidv4() + ']';
        node.location = prevLocation? prevLocation.concat("*"+ moddedLocation) : moddedLocation ;
        if(parentNodeType === "array"){
        node.isArrayElement = true;
        node.parentElementLocation = prevLocation;
        }

        if(parentNodeType === "object"){
        node.parentElementLocation = prevLocation;
        }
        
        if (value != null) {
        if (Array.isArray(value)) {
            node.children = buildFileTree(value, level + 1, node.location, "array");
            node.type = 'array';
            node.isExpanded = false;
        }else if (typeof value === 'object') {
            node.children = buildFileTree(value, level + 1, node.location, "object");
            node.type = 'object';
            node.isExpanded = false;
        } else {
            node.value = value;
            node.type = typeof value;
        }
        }else {
        node.value = null;
        node.type = null;
        }

        return accumulator.concat(node);
    }, []);
}

process.on('message', (obj, level) => {
    process.send(buildFileTree(obj, level));
});