// DataVisual: documentation: https://github.com/mariodelgadosr/dataVisual
class dataVisual {
  
	//DataVisual Design pattern developed by Mario Delgado: https://github.com/mariodelgadosr/dataVisual
	constructor( { data, visual, dataKey, visualKey } ={} ) {
  
		this.data = data;
		this.visual = visual;
		this.dataKey = dataKey;
		this.visualKey = visualKey;
	  
		this.join = [];
		this.nonMatchingDataKeys = [];
	  
		if (this.visual) 
			 this.joinDataToVisual(this.data, this.visual, this.dataKey, this.visualKey); 
		
		return;
    
	} // constructor
  
	/*
		   Join data to ThreeJS visual.  
		 If a dataKey to visualKey match is not found, non-matching dataKey value(s) are placed in nonMatchingKeys array.
	  
		  dataKey and visualKey are optional parameters.  

		  If not provided then data[i]["name"] and visual.scene.children[k]["name"] values 
		  must match exactly for a join to occur. visualKey can be either an attribute of the 
		  mesh or mesh.userData.  It will try finding it within mesh[visualKey] before searching in
		  mesh.userData[visualKey]

				Known issue for objects created by Blender with its duplicate naming convention.  
				ThreeJS 'sanitizes' the name property "item.001" to "item001"; stripping the "."  
				See the following for explanation: 
		  https://discourse.threejs.org/t/issue-with-gltfloader-and-objects-with-dots-in-their-name-attribute/6726
		  
	*/  
	//joinDataToVisual(data_or_visual, visual, dataKey, visualKey)  
	joinDataToVisual(...dataVisualArguments){
    
		this.dataKey   = this.dataKey   || dataVisualArguments[2] || "name";
		this.visualKey = this.visualKey || dataVisualArguments[3] || "name";	

		// Embedded Data scenario:
		// Visual has embedded data and must have mesh.name property and mesh.userData with .userData[dataProperties] 
		if (dataVisualArguments.length == 1 || !dataVisualArguments[0]) {	
	
			this.visual = dataVisualArguments[0] ? dataVisualArguments[0] : dataVisualArguments[1];
			this.data = [];

			// visuaObj may be several children deep into the hierarchy
			this.visual.scene.traverse( node => {  													
				
				const dataRow = {};
        
				const groupTest =  node.type == "Group" && node.hasOwnProperty("userData");
				const meshTest =  node.type == "Mesh" && node.hasOwnProperty("userData");
							
				// Extract embedded data and create dataVisual.data and dataVisual.join														
				if (node.hasOwnProperty(this.visualKey) && (groupTest || meshTest ) ){      				
            
					if (Object.keys(node.userData).length > 0 ){
						
						dataRow[this.visualKey] =  node[this.visualKey];	
						
						Object.keys(node.userData).forEach( key => {
						
							  if (key == "recid") {		
								alert("Error: 'recid' is a reserved data property.");
								return null;
							  } //if	


							  //dataRow[key] = node.userData[key];
							  if (key.substring(0,2) == "\\s"){
								dataRow[key.substring(2)] = node.userData[key];
							  }
							  else {
								dataRow[key] = typeof node.userData[key] == "string" ? 
													  this.constructor.autoType([node.userData[key]])[0] : 
													  node.userData[key] ;										
							  }

						}); //forEach

					  this.data.push(dataRow);

					  this.join.push(	{	dataRow: dataRow, 
										visualObj: node 
									  }); //push
					
					} // if
					
				} // if

				
			});	// traverse	
				
		} // if 
    
		// External (non-embedded) data is being joined to the visual
		else {
		  
		  this.data = this.data || dataVisualArguments[0];
		  this.visual = this.visual || dataVisualArguments[1];
		
		  this.data.forEach( (dataRow) => {

				  let mesh = undefined;

				  // visuaObj may several children deep into the hierarchy
				  this.visual.scene.traverse(node => {  	

					// Only continue on if the mesh hasn't been found yet
					if (!mesh){ 																			
					  if (node.hasOwnProperty(this.visualKey)) {               								

						mesh = node[this.visualKey] == dataRow[this.dataKey] ? node : mesh;	

					  } //if
					  else if (node.hasOwnProperty("userData")){

						mesh = 	node.userData[this.visualKey] == dataRow[this.dataKey] ? node : mesh;

					  } //else if


					}//if 	
				  });	// traverse					

				  if (mesh) {

					this.join.push(	{	dataRow: dataRow, 
									  visualObj: mesh 
									}); //push
				  } //if
				  else {

					// No match found for this dataRow[this.dataKey]
					this.nonMatchingDataKeys.push(dataRow[this.dataKey]);										

				  }

		  }); // this.data.forEach
		  
		} // else  
	
	} // joinDataToVisual

	// Helper function to get the visualObj 
	// (or index, protoString == "index") assoicated with the ThreeJS mesh uuid
	getJoinByUUID(uuid, protoString){	
    
			return uuid ?																							
							this.join[protoString == "index" ? "findIndex" : "find"](join => join.visualObj.uuid == uuid)
						:	null;
	
	} // getJoinByUUID

	// Helper function to get the joined dataRow
	// (or index, protoString == "index") where join.data[this.dataKey] == key (same value as visualKey)
	getJoinByKey(key, protoString){	
			return key ?																										
							this.join[protoString == "index" ? "findIndex" : "find"](join => join.dataRow[this.dataKey] == key)  
						:	null;
	
	} // getJoinByKey

	// Helper function to get an array of a specified data column (attribute/property) in the DataVisual
	// for all dataRows
	getDataColumn(column){
      return this.data.map(dataRow => dataRow[column]); 
	}  	
	
	//  Color the object and any child meshes with color-able materials
	// 	https://threejs.org/docs/index.html#api/en/math/Color.set
	setColorVisualObj(visualObj, color){

		visualObj.traverse( node => {  																		
			if (node.type == "Mesh" && node.material) {
					node.material.color.set(color);																	
			} //if
		}); //visualObj.traverse
		
		
	} // setColorVisualObj

	setColorByJoinIndex(index, color) {
		
		var visualObj = this.join[index].visualObj;
		this.setColorVisualObj(visualObj,color);
		
	} // setColorByJoinIndex 
  
	// Isolate (make only visible) all visual objects in the visualObjs array
	isolateObjects(visualObjs) {
  
		//First make all objects invisibile
		this.join.forEach( join => join.visualObj.visible = false ); 

		//Now make only visualObjs visible
		visualObjs.forEach( v => v.visible = true ); 
  
	} // isolateOjbects 
  
	showAll() {
    
		this.join.forEach( join => join.visualObj.visible = true ); 
    
	} // showAll 

	_onMouseEvent({event, 
					renderer, 
					camera, 
					mouse, 
					raycaster, 
					toolTipDiv, 
					getToolTipText, 
					handleDblClick = () => {},
					handleEnter,
					handleLeave} = {} ){
		 
		  event =  event || window.event;
	   
		  const showTooltip = (join, mouse, renderer, toolTipDiv) => {
			
			const tooltip_width = 120;
			let x_offset = -tooltip_width/2;
			let y_offset = 30;

			let posX = (mouse.x * (renderer.domElement.offsetWidth / 2))  + (renderer.domElement.offsetWidth / 2);
			posX += x_offset;
			let posY = -(mouse.y * (renderer.domElement.offsetHeight / 2)) + (renderer.domElement.offsetHeight / 2)
			posY += y_offset;

			let toolTipStyle =  ' display: block;';  
			toolTipStyle += ' left: ' + posX + 'px;';
			toolTipStyle += ' top: ' + posY + 'px;';
			toolTipStyle += ' background-color: #ffffff; position:absolute; text-align:left; padding: 2px 2px;';
			toolTipStyle += ' font-family: Verdana,Arial,sans-serif; font-size: 11px;';
			toolTipStyle += ' opacity: 0.7; border: 1px solid black; box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);';
			toolTipStyle += ' border-radius: 3px; pointer-events: none;';           

			toolTipDiv.setAttribute("style", toolTipStyle);

			toolTipDiv.innerHTML = getToolTipText(join, this);

		  };  // showTooltip

	   
		  switch (event.type) {
				case "mouseleave": if (handleLeave && this.onHoverJoin) {
										handleLeave(this.onHoverJoin, this);
										this.onHoverJoin = null;
								   } 
								   break;
				case "mousemove": if (!handleEnter) toolTipDiv.setAttribute("style", "display: none;"); 
				case "dblclick":  // calculate mouse position in normalized device coordinates
								  // https://threejs.org/docs/index.html#api/en/core/Raycaster
								  mouse.x = ( event.offsetX / renderer.domElement.clientWidth) * 2 - 1;     
								  mouse.y = - ( event.offsetY / renderer.domElement.clientHeight ) * 2 + 1;                                                                    
								  // update the picking ray with the camera and mouse position
								  raycaster.setFromCamera( mouse, camera );     			

								  // Calculate objects intersecting the picking ray.
								  // Use the DataVisual join to retrieve only objects 
								  // in the scene participating in the join.
								  const visualObjects = this.join.map(joinRow => joinRow.visualObj);
								  const intersects = raycaster.intersectObjects(visualObjects, true); 
			  
								  const getJoin = (intersect) => {

									 const join = this.getJoinByUUID(intersect.object.uuid);

									 const findParent = (intersect) => {
										let parent;
										intersect
										  .object
										  .traverseAncestors(o => parent = visualObjects.includes(o) ? o : parent);
										return this.getJoinByUUID(parent.uuid);
									 } // findParent  

									 return  join ? join : findParent(intersect);  

								  } // getJoin              
										
								  if (intersects[0]) {
									const join = getJoin(intersects[0]);  
									switch(event.type) {
										case "mousemove": if (handleEnter || handleLeave) {
															if (this.onHoverJoin !== join){
															  
															  if (this.onHoverJoin && handleLeave) {
																handleLeave(this.onHoverJoin, this);                     
															  } // if  
															  
															  if (handleEnter) {
																this.onHoverJoin = join;  
																handleEnter(this.onHoverJoin, this);
															  } // if   
															
															} // if
														  } // if
														  else { 
															showTooltip(join, mouse, renderer, toolTipDiv);
														  } // else 
														 break;
										case "dblclick":  handleDblClick(join, this);
														  break;

									} // switch   
								  } // if
								  else if (handleLeave && this.onHoverJoin){ 
									handleLeave(this.onHoverJoin, this);
									this.onHoverJoin = null;
								  } //else if
								  break;
		  } //switch  
	   
	   
	} // _onMouseEvent   
  
	/*
		 Add a tooltip for the Data Visual using the threeJS renderer and camera properties. 
		 
		 getToolTipText (optional) is a callback function that is passed the current DataVisual join the
		 mouse cursor is over.  If undefined, all dataRow properties associated with the join are displayed
		 in the tooltip. If handleDblCLick callback is specfied, getToolTipText mush be passed as 
		 a callback or undefined. 
		 
		 handleDblClick (optional) is a callback function that is passed the current DataVisual join
		 associated with the double-click event.
		 
	*/   
	addToolTip(renderer, camera, getToolTipText) {

		getToolTipText = getToolTipText ? 
						 getToolTipText : 
						(join) => Object.keys(join.dataRow)
												  .map(field => field + ": " + join.dataRow[field])
												  .join("<br/>");
		
		// Example of a handleDblClick callback function:
		// handleDblClick = (join) => console.log(getToolTipText(join));

		const toolTipDiv = document.createElement("div");
			  toolTipDiv.setAttribute("id", "toolTipDiv");
			  toolTipDiv.setAttribute("style", "display: none;");
			  renderer.domElement.parentElement.appendChild(toolTipDiv); 

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		
		const parms =  {renderer, camera, mouse, raycaster, toolTipDiv, getToolTipText};

		renderer.domElement.addEventListener( "mousemove",  
											(e) => this._onMouseEvent({e, ...parms}), false ); 
		renderer.domElement.addEventListener( "mouseleave", 
											(e) => this._onMouseEvent({e, ...parms}), false); 
	   
		return this; 
  
	}  // addToolTip   
  
	onDblClick(renderer, camera, handleDblClick = () => {}){    

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		
		const parms =  {renderer, camera, mouse, raycaster, handleDblClick};
		
		renderer.domElement.addEventListener( "dblclick", 
											 (e) => this._onMouseEvent({e, ...parms}), false );  
		
		return this;
		
	} //onDblClick 

	onHover(renderer, camera, handleEnter = () => {}, handleLeave = () => {} ){ 
	
		this.onHoverJoin = null;
		
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		
		const parms =  {renderer, camera, mouse, raycaster, handleEnter, handleLeave};
		
		renderer.domElement.addEventListener( "mousemove",  
											(e) => this._onMouseEvent({e, ...parms}), false ); 
		renderer.domElement.addEventListener( "mouseleave", 
											(e) => this._onMouseEvent({e, ...parms}), false); 
	   
		return this;
	}  

	// Duplicated d3.autoType to make dataVisual class independent of the D3.js framework 
	  static autoType(object) {

		// https://github.com/d3/d3-dsv/blob/289130009bde2b5662d16cc350b083567c2e2a1b/src/autoType.js#L1
		// https://github.com/d3/d3-dsv/issues/45
		var fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();
		
		for (var key in object) {
		  var value = object[key].trim(), number, m;
		  if (!value) value = null;
		  else if (value === "true") value = true;
		  else if (value === "false") value = false;
		  else if (value === "NaN") value = NaN;
		  else if (!isNaN(number = +value)) value = number;
		  else if 
			(m = 
			 value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)
			) {
				if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
				value = new Date(value);
			  }
		  else continue;
		  object[key] = value;
		}
		return object;

	} // autoType
  
  
} // dataVisual