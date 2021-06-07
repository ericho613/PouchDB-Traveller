import { Injectable } from '@angular/core';
import { DataNode } from '../../../shared/models';
import { 
    FormControl,
    Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ResultCardService {

  forbiddenKeyNames: Array<string> = ["_id", "_rev"];

  constructor(
  ) {}

  //function that recursively marks a DataNode object 
  // and child DataNode objects for deletion
  recursiveMarkNodeForDeletion(node){
    node.delete = true;
    node.modified = true;
    if(node.children){
      if(node.children.length > 0){
        node.children.forEach(childNode => {
          childNode.delete = true;
          childNode.modified = true;
          childNode.parentDelete = true;
          this.recursiveMarkNodeForDeletion(childNode);
        })
      }
    }
  }

  //function that builds a configuration object for the
  // FormGroup() constructor; this function takes an
  // array of DataNodes, which will be the file tree, and
  // converts it to an object that has key/value pairs;
  // the keys are assigned the unique locations of
  // each DataNode object, and values are assigned 
  // FormControl objects with default values and validation
  // settings; note that the child DataNode objects of
  // each DataNode object are also processed, and every
  // DataNode object and child DataNode object is placed
  // in the same object (i.e. the original hierarchy is
  // flattened)
  buildFormGroupConfigObj(dataNodeArr: DataNode[]){
    
    return dataNodeArr.reduce((accumulator, currentItem) => {

      const value = currentItem.value;
      const type = currentItem.type;
      const location = currentItem.location;
      const key = currentItem.key;
      const level = currentItem.level;

      let configObj = {};

      configObj['[key]'+location] = new FormControl(
        {value: key, disabled: currentItem.isArrayElement || (key ==="_id" && level == 1) || (key ==="_rev" && level == 1)? true : false},
        [
          ((control: FormControl): {[s: string]: boolean} => {
            if (this.forbiddenKeyNames.indexOf(control.value) !== -1 && level == 1) {
              return {'keyNameIsForbidden': true};
            }
            return null;
          }).bind(this)
        ]
        );
      
      switch(type){

        case "array": case "object":

          let extractedNodeChildren = this.recursiveExtractNodeChildren(currentItem);
          let childConfigObj = this.buildFormGroupConfigObj(extractedNodeChildren);
          configObj= {...configObj, ...childConfigObj};
          break;
        
        case "number":
          configObj[location + ''] = new FormControl(value, [Validators.required, this.validateNumber]);
          break;

        case "boolean":
          configObj[location + ''] = new FormControl(value, [Validators.required, this.validateBoolean]);
          break;

        case "string":
          configObj[location + ''] = new FormControl({value: value, disabled: (key ==="_id" && level == 1) || (key ==="_rev" && level == 1)? true : false});
          break;

        default:
          configObj[location + ''] = new FormControl(value);
          break;
      }

      return {...accumulator, ...configObj};
    }, {});

  }

  //function that is used by a FormControl object to validate
  // whether the input value is a valid boolean value
  validateBoolean(control: FormControl): {[s: string]: boolean}{

    if(control.value === true || control.value === false || control.value === "true" || control.value === "false"){
      return null;
    }
    return {'invalidBooleanValue': true};
    
  }

  //function that is used by a FormControl object to validate
  // whether the input value is a valid number value
  validateNumber(control: FormControl): {[s: string]: boolean}{

    if(isNaN(control.value) === true){
      return {'invalidNumberValue': true};
    }
    return null;
    
  }

  //function that is used by the toggleAllTreeNodesExpansion()
  // function to recursively assign a boolean value to the 
  // 'isExpanded' field for a DataNode object and
  // child DataNode objects
  setIsExpandedRecursively(obj: DataNode, value: boolean) {
    if(obj.children) {
      if(obj.isExpanded != null){
        obj.isExpanded = value;
      }
      obj.children.forEach(objChild => {
        this.setIsExpandedRecursively(objChild, value);
      })
    }
  }

  //function that creates a copy of the tree
  // data with all child nodes in a flattened hierarchy; the
  // copy is used for reverting changes while still in 
  // edit mode
  createFlattenedTreeData(treeData){
    let copyOfTreeData = [...treeData];
    for(let i = (copyOfTreeData.length-1); i >= 0; i--) {
      if(copyOfTreeData[i].children) {

        let extractedNodeChildren = this.recursiveExtractNodeChildren(copyOfTreeData[i]);
        copyOfTreeData.splice((i+1), 0 , ...extractedNodeChildren);

      }
    }
    
    for(let i = (copyOfTreeData.length-1); i >= 0; i--) {
      copyOfTreeData[i] = {...copyOfTreeData[i]};
    }
    
    return copyOfTreeData;
    
  }

  //function used to construct a JavaScript object from
  // an array of DataNode objects
  constructObjectFromDataNodeArray(dataNodeArray: DataNode[]){

    return Object.keys(dataNodeArray).reduce((accumulator, key) => {
      let objKey = dataNodeArray[key].key;
      let objValue;

      if(dataNodeArray[key].type === "array"){
        if(dataNodeArray[key].children){
          objValue = this.constructNormalArrayFromDataNodeArray(dataNodeArray[key].children);
        }
      }else if(dataNodeArray[key].type === "object"){
        if(dataNodeArray[key].children){
          objValue = this.constructObjectFromDataNodeArray(dataNodeArray[key].children);
        }
      }else{
        switch(dataNodeArray[key].type){
          case "string":
            objValue = dataNodeArray[key].value;
            break;
          case "boolean":
            objValue = dataNodeArray[key].value === true || dataNodeArray[key].value === "true"? true : false;
            break;
          case "number":
            objValue = +dataNodeArray[key].value;
            break;
          case null:
            objValue = null;
            break;
          default:
            objValue = dataNodeArray[key].value;
            break;
        }
        
      }

      let newObject = {};
      if(!dataNodeArray[key].delete){
        newObject[objKey] = objValue;
      }
      
      return accumulator = {...accumulator, ...newObject};
    }, {});

  }

  //function used to construct a JavaScript object from
  // an array of DataNode objects
  constructNormalArrayFromDataNodeArray(dataNodeArray: DataNode[]){
    return Object.keys(dataNodeArray).reduce((accumulator, key) => {

      let objValue;

      if(dataNodeArray[key].type === "array"){
        if(dataNodeArray[key].children){
          objValue = this.constructNormalArrayFromDataNodeArray(dataNodeArray[key].children);
        }
      }else if(dataNodeArray[key].type === "object"){
        if(dataNodeArray[key].children){
          objValue = this.constructObjectFromDataNodeArray(dataNodeArray[key].children);
        }
      }else{
        switch(dataNodeArray[key].type){
          case "string":
            objValue = dataNodeArray[key].value;
            break;
          case "boolean":
            objValue = dataNodeArray[key].value === true || dataNodeArray[key].value === "true"? true : false;
            break;
          case "number":
            objValue = +dataNodeArray[key].value;
            break;
          case null:
            objValue = null;
            break;
          default:
            objValue = dataNodeArray[key].value;
            break;
        }
      }

      if(!dataNodeArray[key].delete){
        return accumulator = [...accumulator, objValue];
      }

      return accumulator = [...accumulator];
    }, []);
  }

  // //function used to convert a JavaScript object to a
  // // DataNode object array that can be used by the
  // // tree control to display a tree to the user; the resulting
  // // DataNode object array is also used to create a
  // // configuration object for the FormGroup() constructor
  // buildFileTree(obj: {[key: string]: any}, level: number, prevLocation?: string, parentNodeType?: string): DataNode[] {
  //   return Object.keys(obj).reduce<DataNode[]>((accumulator, key) => {
  //     const value = obj[key];
  //     const node = new DataNode();
  //     node.key = key;
  //     node.level = level + 1;

  //     let moddedLocation = '[' + uuidv4() + ']';
  //     node.location = prevLocation? prevLocation.concat("*"+ moddedLocation) : moddedLocation ;
  //     if(parentNodeType === "array"){
  //       node.isArrayElement = true;
  //       node.parentElementLocation = prevLocation;
  //     }

  //     if(parentNodeType === "object"){
  //       node.parentElementLocation = prevLocation;
  //     }
      
  //     if (value != null) {
  //       if (Array.isArray(value)) {
  //         node.children = this.buildFileTree(value, level + 1, node.location, "array");
  //         node.type = 'array';
  //         node.isExpanded = false;
  //       }else if (typeof value === 'object') {
  //         node.children = this.buildFileTree(value, level + 1, node.location, "object");
  //         node.type = 'object';
  //         node.isExpanded = false;
  //       } else {
  //         node.value = value;
  //         node.type = typeof value;
  //       }
  //     }else {
  //       node.value = null;
  //       node.type = null;
  //     }
  
  //     return accumulator.concat(node);
  //   }, []);
  // }

  //function that recursively extracts child DataNode objects
  // from a parent DataNode object; the result is an array
  // of all child/nested DataNode objects for a given parent
  // DataNode object; note that this function can be
  // used to only extract the DataNode object children of 
  // DataNode parent objects that have been expanded (i.e. 
  // have the 'isExpanded' field set to true)
  recursiveExtractNodeChildren(node : DataNode, onlyExpandedNodes?: boolean) : DataNode[]{
    let extractedNodeChildren = [];
    if(node.children) {

      if(onlyExpandedNodes){

        if(node.isExpanded != null){

          if(node.isExpanded === true) {
  
            node.children.forEach(objChild => {
              extractedNodeChildren.push(objChild);
              extractedNodeChildren.push(...this.recursiveExtractNodeChildren(objChild, true));
            });
  
          };
  
        };

      }else{

        node.children.forEach(objChild => {
          extractedNodeChildren.push(objChild);
          extractedNodeChildren.push(...this.recursiveExtractNodeChildren(objChild));
        });

      }

    };

    return extractedNodeChildren;
  }

}
