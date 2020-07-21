//DataVisual Design pattern developed by Mario Delgado: https://github.com/MarioDelgadoSr
//Reference:  http://www.crockford.com/javascript/private.html

function dataVisual(){
	
	this.join = [];
	this.data = undefined;
	this.visual = undefined;
	this.dataKey = undefined;
	this.visualKey = undefined;
	
	this.nonMatchingDataKeys = [];
	
	var thisDV =  this;   //So 'thisDV' methods can reference 'this' object
	
	 
	// Join data to ThreeJS visual.  If a dataKey to visualKey match is not found, non-matching dataKey value is placed in nonMatchingKeys array.	
	this.joinDataToVisual = function (data, visual, dataKey, visualKey){   
		
		/* 	
			If method is called with just 1 parameter, it is assumed to be a visual with embedded data.

			dataKey and visualKey are optional parameters.  
			If not provided then data[i]["name"] and visual.scene.children[k]["name"] values must match exactly for a join to occur
			visualKey can be either an attribute of the mesh or mesh.userData.  It will try finding it with as  mesh[visualKey] before searching in mesh.userData[visualKey]

			Known issue for objects created by Blender with its duplicate naming convention.  
			ThreeJS 'sanitizes' the name property "item.001" to "item001"; stripping the "."  
			See the following for explanation on why: https://discourse.threejs.org/t/issue-with-gltfloader-and-objects-with-dots-in-their-name-attribute/6726
		*/
			
		dataKey = dataKey || "name";
		visualKey =  visualKey || "name"
		

		thisDV.dataKey = dataKey;
		thisDV.visualKey = visualKey;		
		
		if (arguments.length == 1) {	//Visual has embedded data. Visual must have mesh.name property and mesh.userData with  .userData[dataProperties]
	
			thisDV.visual = arguments[0];
			thisDV.data = [];
			thisDV.join = [];

			thisDV.visual.scene.traverse(function (node) {  													// visuaObj may several children deep into the hierarchy
				
				var dataRow = {};
							
																			
					if (node.hasOwnProperty(visualKey) && node.type == "Mesh" && node.hasOwnProperty("userData")) {    			// Extract embedded data and create dataVisual.data and dataVisual.join			
					
						dataRow[visualKey] =  node[visualKey];				
						
						Object.keys(node.userData).forEach(function(key){
							
							dataRow[key] = node.userData[key];
							
						}); //forEach
						
						thisDV.data.push(dataRow);
						
						thisDV.join.push(	{	dataRow: dataRow, 
											visualObj: node 
										}); //push
					
					} //if

				
			});	// traverse	
			
			
		
		} //if
		
		else {							//Join data to visual	

			// 'this' (via 'thisDV') object's references to original inbound parameters	
			thisDV.data = data;
			thisDV.visual = visual;			
			
			data.forEach(function (dataRow){
												
							var mesh = undefined;
						
							visual.scene.traverse(function (node) {  													// visuaObj may have several children deep into the hierarchy
								
								if (!mesh){ 																			// Only continue on if the mesh hasn't been found yet
									if (node.hasOwnProperty(visualKey)) {               								// Is it a messh attribute? 
									
										mesh = node[visualKey] == dataRow[dataKey] ? node : mesh;	
									
									} //if
									else if (node.hasOwnProperty("userData")){
										
										mesh = 	node.userData[visualKey] == dataRow[dataKey] ? node : mesh;
									
									} //else if
									
								
								}//if 	
							});	// traverse					
							
							if (mesh) {
		
								thisDV.join.push(	{	dataRow: dataRow, 
													visualObj: mesh 
												}); //push
							} //if
							else {
								
								thisDV.nonMatchingDataKeys.push(dataRow[dataKey]);										// No match found for this dataRow[dataKey]
								
							}
								
			}); //data.forEach
			
		} //else
	} //joinDataToVisual



	this.getJoinByUUID = function(uuid, protoString){																// Helper function to get the visualObj 
																													// (or index, protoString == "index") assoicated with 
			return uuid ?																							// the ThreeJS mesh uuid
							thisDV.join[protoString == "index" ? "findIndex" : "find"](function(join){ 
																						return join.visualObj.uuid == uuid;
																					}) //function 
						:	null;
	
	} //getJoinByUUID


	this.getJoinByKey = function(key, protoString){																	// Helper function to get the joined dataRow
																													// (or index, protoString == "index") 
			return key ?																							// where join.data[dataKey] == key (same value as visualKey)			
							thisDV.join[protoString == "index" ? "findIndex" : "find"](function(join){ 
																						return join.dataRow[thisDV.dataKey] == key;
																					}) //function
						:	null;
	
	} //getJoinByKey
	
	this.setColorVisualObj = function(visualObj, color){

		visualObj.traverse(function(node) {  																		//Color the object and any child meshes with color-able materials	
			if (node.type == "Mesh" && node.material) {
					node.material.color.set(color);																	// 	https://threejs.org/docs/index.html#api/en/math/Color.set
			} //if
		}); //visualObj.traverse
		
		
	} //setColorVisualObj

	this.setColorByJoinIndex = function(index, color){
		
		var visualObj = thisDV.join[index].visualObj;
		thisDV.setColorVisualObj(visualObj,color);
		
	} //setColorByJoinIndex 
	
	
} //dataVisual