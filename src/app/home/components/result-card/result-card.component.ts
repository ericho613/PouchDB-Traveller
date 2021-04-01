import { 
  Component, 
  OnInit,
  Input,
  ViewChildren,
  AfterViewInit,
  OnDestroy
 } from '@angular/core';

import { DataNode } from '../../../shared/models';

import { v4 as uuidv4 } from 'uuid';

import { 
  FormControl, 
  FormGroup,
  Validators } from '@angular/forms';

import {ArrayDataSource} from '@angular/cdk/collections';
import {NestedTreeControl} from '@angular/cdk/tree';
import {ResultCardService} from './result-card.service';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrls: ['./result-card.component.scss']
})
export class ResultCardComponent implements OnInit, AfterViewInit, OnDestroy {

  documentDeletionMode: boolean = false;
  @Input() result: any;
  resultId: string;
  documentDeletedId: string;
  documentDeleteErrorMessage: string;
  documentUpdatedId: string;
  documentUpdateErrorMessage: string;
  triggeredUpdate: boolean;
  private dbDetailSub: Subscription;
  showResultBtns: boolean;
  editMode: boolean = false;
  allTreeNodesExpanded: boolean = false;
  moddedTreeData : DataNode[];
  flattenedTreeDataOriginalCopy : DataNode[];
  toggleExpansionBtnTooltip: string = 'Expand All';
  treeControl : NestedTreeControl<DataNode>;
  treeDataSource : ArrayDataSource<DataNode>;
  displayedColumns = ['index', 'field', 'type'];
  tableDataSource: DataNode[];
  selectedFieldId: string;
  cardForm: FormGroup;
  formGroupConfigObj;
  formGroupConfigObjOriginalCopy;
  intialFormValues;
  hoveredRow = {};
  changedFormValues;
  @ViewChildren('formInput') formInputs;
  modifiedElements: DataNode[] = [];
  selectedRow;
  persistLoading: boolean;

  constructor(private store: Store<fromApp.AppState>, private resultCardService: ResultCardService) { 
  }

  ngOnInit(): void {

    this.resultId =  this.result["_id"];

    this.moddedTreeData = this.resultCardService.buildFileTree(this.result, 0);
    
    this.treeControl = new NestedTreeControl<DataNode> (node => node.children);

    this.treeDataSource = new ArrayDataSource<DataNode>(this.moddedTreeData);

    this.formGroupConfigObj = this.resultCardService.buildFormGroupConfigObj(this.moddedTreeData);

    this.cardForm = new FormGroup(this.formGroupConfigObj);

    this.cardForm.valueChanges.subscribe(changedValues => {
      this.triggeredUpdate = false;
    })

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {
      this.documentDeletedId = dbDetailState.documentDeletedId;
      this.documentDeleteErrorMessage = dbDetailState.documentDeleteErrorMessage;
      this.documentUpdatedId = dbDetailState.documentUpdatedId;
      this.documentUpdateErrorMessage = dbDetailState.documentUpdateErrorMessage;
      this.persistLoading = dbDetailState.persistLoading;
    });

  }

  ngAfterViewInit(){
    //resize every form input to match the input value when a 
    // change occurs to the formInputs QueryList
    this.formInputs.changes.subscribe(changesObject => {
      changesObject._results.forEach(input => {
        input.nativeElement.dispatchEvent(new Event('change'));
      })
    });
  }

  //function used in the template to save the hovered as
  // the selected row when changing the field type in
  // edit mode
  selectRow(){
    this.selectedRow = this.hoveredRow;
  }

  //function used in the template that changes the type
  // of the hovered row
  selectFieldType(type){
    let originalTypeOfSelectedRow = this.selectedRow.type;
    
    let formControlExists = !!this.cardForm.get(this.selectedRow.location);

    switch(type){
      case "array":
        if(originalTypeOfSelectedRow !== "array"){

          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl(""));
          }

          this.selectedRow.isExpanded = true;
          const newChildElement = new DataNode();
          newChildElement.key = "0";
          newChildElement.level = this.selectedRow.level + 1;
          newChildElement.type = "string";
          newChildElement.value = "";
          newChildElement.isArrayElement = true;
          newChildElement.parentElementLocation = this.selectedRow.location;
          newChildElement.isNewRow = true;
          let moddedLocation = '[' + uuidv4() + ']';
          newChildElement.location = this.selectedRow.location.concat("*"+ moddedLocation);
          this.selectedRow["children"] = [newChildElement];

          this.cardForm.addControl(newChildElement.location, new FormControl(""));
          this.cardForm.addControl("[key]"+newChildElement.location, new FormControl({value: newChildElement.key, disabled: true}));

          this.populateTableWithExpandedNodes();

          this.markElementAsModified(this.selectedRow);
          this.markElementAsModified(newChildElement);
        };
        this.selectedRow["type"] = "array";
        break;
      case "boolean":
        if(originalTypeOfSelectedRow !== "boolean"){
          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl("", [Validators.required, this.resultCardService.validateBoolean]));
            this.markElementAsModified(this.selectedRow);

          }else{
            this.cardForm.addControl(this.selectedRow.location, new FormControl("", [Validators.required, this.resultCardService.validateBoolean]));
            this.markElementAsModified(this.selectedRow);

          }

          if(this.selectedRow.children){
            delete this.selectedRow.children;
            this.populateTableWithExpandedNodes();
          }

        };
        this.selectedRow["type"] = "boolean";
        break;
      case "object":
        if(originalTypeOfSelectedRow !== "object"){
          
          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl(""));
          }

          this.selectedRow.isExpanded = true;
          const newChildElement = new DataNode();
          newChildElement.key = "";
          newChildElement.level = this.selectedRow.level + 1;
          newChildElement.type = "string";
          newChildElement.value = "";
          newChildElement.parentElementLocation = this.selectedRow.location;
          newChildElement.isNewRow = true;
          let moddedLocation = '[' + uuidv4() + ']';
          newChildElement.location = this.selectedRow.location.concat("*" + moddedLocation);
          this.selectedRow["children"] = [newChildElement];

          this.cardForm.addControl(newChildElement.location, new FormControl(""));
          this.cardForm.addControl("[key]"+newChildElement.location, new FormControl(newChildElement.key));

          this.populateTableWithExpandedNodes();

          this.markElementAsModified(this.selectedRow);
          this.markElementAsModified(newChildElement);
        };
        this.selectedRow["type"] = "object";
        break;
      case "null":
        if(originalTypeOfSelectedRow !== "null"){
          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl(null));
            this.markElementAsModified(this.selectedRow);
          }else{
            this.cardForm.addControl(this.selectedRow.location, new FormControl(null));
            this.markElementAsModified(this.selectedRow);
          }

          if(this.selectedRow.children){
            delete this.selectedRow.children;
            this.populateTableWithExpandedNodes();
          }

        };
        this.selectedRow["type"] = null;
        // this.selectedRow["value"] = null;
        break;
      case "number":
        if(originalTypeOfSelectedRow !== "number"){
          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl("", [Validators.required, this.resultCardService.validateNumber]));
            this.markElementAsModified(this.selectedRow);
          }else{
            this.cardForm.addControl(this.selectedRow.location, new FormControl("", [Validators.required, this.resultCardService.validateNumber]));
            this.markElementAsModified(this.selectedRow);
          }

          if(this.selectedRow.children){
            delete this.selectedRow.children;
            this.populateTableWithExpandedNodes();
          }

        };
        this.selectedRow["type"] = "number";
        break;
      case "string":
        if(originalTypeOfSelectedRow !== "string"){
          if(formControlExists){
            this.cardForm.setControl(this.selectedRow.location, new FormControl(""));
            this.markElementAsModified(this.selectedRow);
          }else{
            this.cardForm.addControl(this.selectedRow.location, new FormControl(""));
            this.markElementAsModified(this.selectedRow);
          }

          if(this.selectedRow.children){
            delete this.selectedRow.children;
            this.populateTableWithExpandedNodes();
          }

        };
        this.selectedRow["type"] = "string";
        break;
    }

  }

   //function used in the template that checks if a form 
  // key input has an error 
  checkKeyInputHasError(keyLocation) : boolean{
    if(this.cardForm.get(keyLocation)){
      if(this.cardForm.get(keyLocation).invalid){
        return true;
      };
    }
    return false;
  }

  //function used in the template that checks if the form 
  // input has an error 
  checkInputHasError(rowElement) : boolean{
    if(this.cardForm.get(rowElement.location)){
      if(this.cardForm.get(rowElement.location).invalid){
        return true;
      };
    }
    return false;
  }

  //function that inserts, replaces, or deletes elements in
  // the modifiedElements array which keeps track of table rows
  // that have been modified
  updateModifedElementsArray(element, removeFromModifiedElementsArray?: boolean) {
    let modifiedElementIndex = this.modifiedElements.findIndex((moddedElement) => {
      return moddedElement.location === element.location;
    });

    if(!removeFromModifiedElementsArray){
      if(modifiedElementIndex < 0){
        this.modifiedElements.push(element);
      };
    }else{
      if(modifiedElementIndex > -1){
        this.modifiedElements.splice(modifiedElementIndex, 1);
      };
    }
    
  }

  //function that is used in the template to mark a table row
  // element for deletion; note that when marked for
  // deletion, the DataNode element is recursively marked
  // for deletion, the modifiedElements array is updated,
  // and the table is reloaded with the changes
  markElementForDeletion(element){

    if(element.type == "array" || element.type == "object"){
      this.revertInputChanges(element);
    }

    this.resultCardService.recursiveMarkNodeForDeletion(element);
    this.updateModifedElementsArray(element);
    if(element.type === "array" || element.type === "object"){
      if("children" in element){
        let extractedNodeChildren = this.resultCardService.recursiveExtractNodeChildren(element);
        extractedNodeChildren.forEach(nodeChild => {
          this.updateModifedElementsArray(nodeChild);
        })
      }
    }
    this.populateTableWithExpandedNodes();
  }

  //function used in the template to add a new row element
  addNewRow(optionSelected){

    const newChildElement = new DataNode();
    newChildElement.type = "string";
    newChildElement.value = "";
    newChildElement.isNewRow = true;

    let parentElement;
    if(this.selectedRow.parentElementLocation){
      let splitParentElementLocationArray = this.selectedRow.parentElementLocation.split("*");

      let rootElement = this.moddedTreeData.find(obj => {
        return obj.location === splitParentElementLocationArray[0];
      });

      let rootElementAndExtractedNodeChildren = [rootElement, ...this.resultCardService.recursiveExtractNodeChildren(rootElement)];

      parentElement = rootElementAndExtractedNodeChildren.find(nodeChild => {
        return nodeChild.location === this.selectedRow.parentElementLocation;
      });
    }

    switch(optionSelected){
      case "addArrayElementTo":

        // this.selectedRow.isExpanded = true;

        this.toggleRecursiveTreeNodeExpansion(this.selectedRow, true);

        newChildElement.isArrayElement = true;

        newChildElement.level = this.selectedRow.level + 1;

        newChildElement.parentElementLocation = this.selectedRow.location;
        
        newChildElement.key = this.selectedRow.children.length + "";

        let addArrayElementTo_moddedLocation = '[' + uuidv4() + ']';
        newChildElement.location = this.selectedRow.location.concat("*" + addArrayElementTo_moddedLocation);

        this.selectedRow.children.push(newChildElement);

        this.markElementAsModified(this.selectedRow);

        this.cardForm.addControl("[key]"+newChildElement.location, new FormControl({value: newChildElement.key, disabled: true}));

        break;

      case "addArrayElementAfter":

        newChildElement.isArrayElement = true;

        newChildElement.level = this.selectedRow.level;

        newChildElement.parentElementLocation = parentElement.location;

        let addArrayElementAfter_indexOfSelectedArrayElement = parentElement.children.findIndex(childElement => {
          return childElement.location === this.selectedRow.location
        });

        let addArrayElementAfter_moddedLocation = '[' + uuidv4() + ']';
        newChildElement.location = parentElement.location.concat("*" + addArrayElementAfter_moddedLocation);

        parentElement.children.splice((addArrayElementAfter_indexOfSelectedArrayElement + 1), 0, newChildElement);

        for(let i = 0; i<parentElement.children.length; i++){
          parentElement.children[i].key = i + "";
          if(!!this.cardForm.get("[key]"+parentElement.children[i].location)){
            this.cardForm.setControl("[key]"+parentElement.children[i].location, new FormControl({value: i, disabled: true}))
          }
        };

        this.markElementAsModified(parentElement);

        this.cardForm.addControl("[key]"+newChildElement.location, new FormControl({value: newChildElement.key, disabled: true}));

        break;

      case "addFieldTo":

        // this.selectedRow.isExpanded = true;

        this.toggleRecursiveTreeNodeExpansion(this.selectedRow, true);

        newChildElement.key = "";

        newChildElement.level = this.selectedRow.level + 1;

        newChildElement.parentElementLocation = this.selectedRow.location;

        let addFieldTo_moddedLocation = '[' + uuidv4() + ']';
        newChildElement.location = this.selectedRow.location.concat("*" + addFieldTo_moddedLocation);

        this.selectedRow.children.push(newChildElement);

        this.markElementAsModified(this.selectedRow);

        this.cardForm.addControl("[key]"+newChildElement.location, new FormControl(newChildElement.key));

        break;
        
      case "addFieldAfter":
        newChildElement.key = "";

        if(this.selectedRow.parentElementLocation){

          newChildElement.parentElementLocation = parentElement.location;

          newChildElement.level = this.selectedRow.level;

          let addFieldAfter_indexOfSelectedArrayElement = parentElement.children.findIndex(childElement => {
            return childElement.location === this.selectedRow.location
          });
  
          let addFieldAfter_moddedLocation = '[' + uuidv4() + ']';
          newChildElement.location = parentElement.location.concat("*" + addFieldAfter_moddedLocation);
  
          parentElement.children.splice((addFieldAfter_indexOfSelectedArrayElement + 1), 0, newChildElement);

          this.markElementAsModified(parentElement);

        }else{

          newChildElement.level = 1;

          let addFieldAfter_indexOfSelectedArrayElement = this.moddedTreeData.findIndex(childElement => {
            return childElement.location === this.selectedRow.location
          });
  
          let addFieldAfter_moddedLocation = '[' + uuidv4() + ']';
          newChildElement.location = addFieldAfter_moddedLocation;
  
          this.moddedTreeData.splice((addFieldAfter_indexOfSelectedArrayElement + 1), 0, newChildElement);

        }

        this.cardForm.addControl("[key]"+newChildElement.location, new FormControl(newChildElement.key));
        
        break;
        
    }

    this.cardForm.addControl(newChildElement.location, new FormControl(""));
    this.markElementAsModified(newChildElement);
    this.populateTableWithExpandedNodes();

  }

  //function used in the template to remove a new row
  // element
  removeNewRow(element){
    
    if(element.children){
      let extractedNodeChildren = this.resultCardService.recursiveExtractNodeChildren(element);
      for(let i = (extractedNodeChildren.length-1); i >=0 ; i--){
        this.removeNewRow(extractedNodeChildren[i]);
      }
    }

    if(element.parentElementLocation){
      let splitParentElementLocationArray = element.parentElementLocation.split("*");

      let rootElement = this.moddedTreeData.find(obj => {
        return obj.location === splitParentElementLocationArray[0];
      });

      let rootElementAndExtractedNodeChildren = [rootElement, ...this.resultCardService.recursiveExtractNodeChildren(rootElement)];

      let parentElement = rootElementAndExtractedNodeChildren.find(nodeChild => {
        return nodeChild.location === element.parentElementLocation;
      });

      let removalIndexOfParentElement = parentElement.children.findIndex(childElement => {
        return childElement.location === element.location;
      })

      if(removalIndexOfParentElement > -1){
        parentElement.children.splice(removalIndexOfParentElement, 1);
      }

      if(parentElement.type === "array"){
        for(let i = 0; i<parentElement.children.length; i++){
          parentElement.children[i].key = i + "";
          if(!!this.cardForm.get("[key]"+parentElement.children[i].location)){
            this.cardForm.setControl("[key]"+parentElement.children[i].location, new FormControl({value: i, disabled: true}))
          }
        };
      }

    }else{
      let removalIndex = this.moddedTreeData.findIndex(childElement => {
        return childElement.location === element.location;
      })

      if(removalIndex > -1){
        this.moddedTreeData.splice(removalIndex, 1);
      }
    }
    
    if(!!this.cardForm.get(element.location)){
      this.cardForm.removeControl(element.location);
    }

    if(!!this.cardForm.get('[key]'+element.location)){
      this.cardForm.removeControl('[key]'+element.location);
    }
    
    let removalIndexOfModifiedElementsArray = this.modifiedElements.findIndex(modifiedElement => {
      return modifiedElement.location === element.location;
    })

    if(removalIndexOfModifiedElementsArray > -1){
      this.modifiedElements.splice(removalIndexOfModifiedElementsArray, 1);
    }

    this.populateTableWithExpandedNodes();

  }

  //function used in the template to change the "key"
  // value of the element to the value typed in the 
  // input of the field; the 'location' value of the
  // element is also modified to reflect the changes
  // to the element key
  modifyElementKey(element, value){
    element.key = value;
    this.markElementAsModified(element);
  }

  //function that marks a table row element as modified; the 
  // modified elements array is also updated in the process
  markElementAsModified(element, value?){
    element.delete = false;
    element.modified = true;
    if(value){
      element.value = value;
    }
    this.updateModifedElementsArray(element);
  }

  //function that reverts/resets any modifications made to an 
  // input or table row element
  revertInputChanges(element){

    if(!element){
      return;
    }

    if(element.isNewRow){
      this.removeNewRow(element);
      return;
    }

    if(element.type === "array" || element.type === "object"){
      let extractedNodeChildren = this.resultCardService.recursiveExtractNodeChildren(element);
      for(let i = (extractedNodeChildren.length-1); i >=0 ; i--){
        this.revertInputChanges(extractedNodeChildren[i]);
      }
      
    }

    let originalElement = this.flattenedTreeDataOriginalCopy.find(originalElement => {
      return element.location === originalElement.location;
    });

    let formControlExists = !!this.cardForm.get(element.location);
    
    if(originalElement){
      element.type = originalElement.type;
      element.key = originalElement.key;
      element.value = originalElement.value;
      if(originalElement.children){
        element["children"] = originalElement.children;
        this.populateTableWithExpandedNodes();
      }else{
        delete element["children"];
        this.populateTableWithExpandedNodes();
      }
    }

    if(formControlExists){
      this.cardForm.setControl(element.location, this.formGroupConfigObjOriginalCopy[element.location]);
      if(this.cardForm.get(element.location)){
        this.cardForm.get(element.location).reset();
        this.cardForm.get(element.location).setValue(this.intialFormValues[element.location]);
      }
    }

    if(!!this.cardForm.get('[key]'+element.location)){
      this.cardForm.get('[key]'+element.location).reset();
      this.cardForm.get('[key]'+element.location).setValue(this.intialFormValues['[key]'+element.location]);
      this.revertInputSize('[key]'+element.location);
    }

    if(element.type !== "array" && element.type !== "object"){
      this.revertInputSize(element.location);
    }else{
      let extractedNodeChildren = this.resultCardService.recursiveExtractNodeChildren(element);
      extractedNodeChildren.forEach(nodeChild => {

        this.revertInputChanges(nodeChild);

      })

    }

    if("modified" in element){
      delete element.modified;
    };
    if("delete" in element){
      delete element.delete;
    };
    if("parentDelete" in element){
      delete element.parentDelete;
    }
    this.updateModifedElementsArray(element, true);

  }

  //function that resets the size of the input to the
  // original size which corresponds with default/initial
  // number of characters in the input
  revertInputSize(elementLocation){
    
    let foundInput = this.formInputs._results.find((result) => {
      return result.nativeElement.name === elementLocation;
    });

    if(foundInput){
      let foundHtmlElement = foundInput.nativeElement;
      foundHtmlElement.dispatchEvent(new Event('change'));
    }
  }

  //function used by the template to allow this component
  // to keep track of which row the user is interacting
  // with
  mouseEnterRow(row){
    this.hoveredRow = row;
    console.log(this.hoveredRow);
  }

  //function used by the template that works with 
  // mouseEnterRow() to allow this component
  // to keep track of which row the user is interacting
  // with
  mouseLeaveRow(){
    this.hoveredRow = {};
  }

  //function used by the tree control to determine if
  // the DataNode object representing each tree node 
  // has a child DataNode object
  hasChild = (_: number, nodeData: DataNode) => !!nodeData.children;

  //function that is used in the template to check if the
  // element key is unique in the same hierarchy level
  checkElementKeyIsNotUnique(element){

    if(element.parentElementLocation){
      let splitParentElementLocationArray = element.parentElementLocation.split("*");

      let rootElement = this.moddedTreeData.find(obj => {
        return obj.location === splitParentElementLocationArray[0];
      });

      let rootElementAndExtractedNodeChildren = [rootElement, ...this.resultCardService.recursiveExtractNodeChildren(rootElement)];

      let parentElement = rootElementAndExtractedNodeChildren.find(nodeChild => {
        return nodeChild.location === element.parentElementLocation;
      });

      let filterResults = parentElement.children.filter((childElement) => {
        return childElement.key === element.key;
      });

      return filterResults.length > 1;

    }else{
      let filterResults = this.moddedTreeData.filter((nodeElement) => {
        return nodeElement.key === element.key;
      });

      return filterResults.length > 1;
    };

  }

  //function that is used in the template to expand all
  // or collapse all tree nodes and child tree nodes of the 
  // tree displayed to the user
  toggleAllTreeNodesExpansion(){
    this.treeControl.dataNodes = this.moddedTreeData;
    if(!this.allTreeNodesExpanded){
      this.treeControl.expandAll();
      this.toggleExpansionBtnTooltip = 'Collapse All';
    }else{
      this.treeControl.collapseAll();
      this.toggleExpansionBtnTooltip = 'Expand All';
    }
    
    this.allTreeNodesExpanded = !this.allTreeNodesExpanded;
    this.moddedTreeData.forEach(obj => {
      this.resultCardService.setIsExpandedRecursively(obj, this.allTreeNodesExpanded);
    });
  }

  //function that is used by the template when the form
  // is submitted
  onSubmit() {
    // console.log(this.formInputs);
    console.log(this.moddedTreeData);
    // console.log(this.flattenedTreeDataOriginalCopy);
    // console.log(this.tableDataSource);
    // console.log(this.modifiedElements);
    // console.log(this.cardForm);
    console.log(this.resultCardService.constructObjectFromDataNodeArray(this.moddedTreeData));

    this.triggeredUpdate = true;
    this.store.dispatch(DbDetailActions.persist({persistType:"update", documentToUpdate: this.resultCardService.constructObjectFromDataNodeArray(this.moddedTreeData)}));

    //prevent editing of the _id field  and the _rev field of the
    // document

    //make sure that the user cannot add _id or _rev to the
    // already created document

    //account for row deletion

    // this.editMode =  false;

  }

  //function used in the template to recursively toggle the
  // expansion or collapse of a tree node and child tree nodes
  toggleRecursiveTreeNodeExpansion(node, value?) {
    
    if(node.children) {
      if(node.isExpanded != null){
        if(!value){
          node.isExpanded = !node.isExpanded;
        }else{
          node.isExpanded = value;
        };

        if(node.isExpanded === false) {
          this.treeControl.collapse(node);
        }else{
          this.treeControl.expand(node);
        };

      };

      node.children.forEach(objChild => {
        this.toggleRecursiveTreeNodeExpansion(objChild, node.isExpanded);
      });
    }
  }

  //function that creates the table that is shown to the
  // user; the top level DataNode objects of the DataNode
  // array used by the tree control are shown by default;
  // if a parent DataNode object has their 'isExpanded'
  // field set to true, then their child DataNode objects
  // are also shown
  populateTableWithExpandedNodes(){
    this.tableDataSource = [...this.moddedTreeData];
    for(let i = (this.tableDataSource.length-1); i >= 0; i--) {
      if(this.tableDataSource[i].children) {

        if(this.tableDataSource[i].isExpanded != null){

          if(this.tableDataSource[i].isExpanded === true) {
            let extractedNodeChildren = this.resultCardService.recursiveExtractNodeChildren(this.tableDataSource[i], true);
            this.tableDataSource.splice((i+1), 0 , ...extractedNodeChildren);
          };
  
        };
  
      }
    }
  }

  //function used in the template to recursively toggle the 
  // expansion or collapse of a table row which correspond
  // with a tree DataNode object
  toggleRecursiveTableElementExpansion(element) {
    this.toggleRecursiveTreeNodeExpansion(element);
    this.populateTableWithExpandedNodes();
  }

  //function used by the template to activate edit mode and
  // to focus on the corresponding form input when a value
  // in the tree is double clicked by the user
  activateEditModeAndFocusInput(event: Event) {
    this.selectedFieldId = (<HTMLInputElement>event.target).id;
    this.activateEditMode();
  }

  //function used in the template to activate edit mode and
  // to create the table (with expanded nodes) that is shown
  // to the user; when edit mode is activated, the user will
  // be shown the table instead of the tree where the user
  // can make edits to the data
  activateEditMode() {
    
    this.flattenedTreeDataOriginalCopy = this.resultCardService.createFlattenedTreeData(this.moddedTreeData);
    this.intialFormValues = this.cardForm.getRawValue();
    this.formGroupConfigObjOriginalCopy = {...this.formGroupConfigObj};
    this.populateTableWithExpandedNodes();
    this.editMode = true;
  }

  //function used in the template to cancel edit mode so
  // that the user is shown the tree instead of the table;
  // when edit mode is cancelled, the user will not be able
  // to make edits to the data presented in the tree until
  // edit mode is activated again
  cancelEditMode() {
    for(let i = (this.modifiedElements.length-1); i >=0 ; i--){
      this.revertInputChanges(this.modifiedElements[i]);
    }
    this.cardForm = new FormGroup(this.formGroupConfigObjOriginalCopy);
    this.editMode = false;
    console.log(this.moddedTreeData)
  }

  //function used in the template to activate document deletion mode
  activateDocumentDeletion(){
    this.documentDeletionMode = true;
    // console.log(this.documentDeletionMode);
  }

  //function used in the template to cancel document deletion mode
  cancelDeleteDocumentMode(){
    this.documentDeletionMode = false;
  }

  //function used in the template to delete a document
  deleteDocument(){
    this.store.dispatch(DbDetailActions.persist({persistType:"delete", documentToDeleteId: this.result["_id"]}));
  }

  //function used in the template to create a stringified copy of
  // the result JavaScript object
  stringifyResult(){
    return JSON.stringify(this.result);
  }

  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
  }
}
