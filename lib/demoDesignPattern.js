/*
Scenario to illustrate dataVisual design pattern.

U.S. Navy is testing out a salvage aquaRobot with AI capabilities.  

aquaRobot's task it to maximize the retrieval of high-value objects with limited fuel. 

The retrieval strategy will be visualized showing only the objects that can be retrieved; minimizing rendering resources.

*/


// *********************************************************************************************************************
// ********************************************* DataVisual Design Pattern ********************************************	
// *********************************************************************************************************************

function fnVisualize(data, seaScape){

	var seaScapeDataVisual = new dataVisual();																				// See dataVisual.js for more notes/considerations. 
	
	if (data.length != 0){																									//Join from data scenario
	
		seaScapeDataVisual.joinDataToVisual(data, seaScape, "name", "visualKey");  											// Option specifying dataKey and visualKey.  
		//seaScapeDataVisual.joinDataToVisual(data, seaScape);  					    									// Option assuming name properties have EXACT values		
		
	} // if
	else {																													//Use embedded data in glTF file scenario
		
		seaScapeDataVisual.joinDataToVisual(seaScape);  																	// Option specifying dataKey and visualKey.  

		
	} //if
	
 
	
	var originVector = new THREE.Vector3(0,0,0);																				// Sets origin for distance calculations	

	seaScapeDataVisual.join.forEach(function (join){     																	// Iterate through each joinRow and extend round trip distance  
																															// 1 way trip calculated with ThreeJS distanceTo method
		join.originToVisualObjDistance  = originVector.distanceTo(join.visualObj.position);        									// https://threejs.org/docs/index.html#api/en/math/Vector3.distanceTo
		
	
	});	


	seaScapeDataVisual																										
		.join																												// Complete join obj/structure is sorted
		.sort(function (join1,join2){
				return d3.descending(join1.dataRow.value, join2.dataRow.value ); 											// Sort high to low by dataRow.value
			});  
	
	const fullTank = 150;   																								// Number of Units before running out of power	
	var distanceLeft = fullTank;																							// Accumumulator determines when to stop retrieving visualObjs 
	
	seaScapeDataVisual.join.forEach(function (join){     																	// Iterating in dataRow.value sort-order      

											join.visible = distanceLeft > 0;												// Attribute designating DataVisual.join[i] as visible/invisible 
											distanceLeft -=  (join.originToVisualObjDistance * 2);							// Subtract round trip distance	
										
										});
		

	var maxValue = d3.max(seaScapeDataVisual.join, function(join){return join.visible ? join.dataRow.value : 0});	
	var minValue = d3.min(seaScapeDataVisual.join, function(join){return join.visible ? join.dataRow.value : maxValue});
	var fnColor = d3.scaleSequential(d3.interpolateRdYlGn).domain([minValue, maxValue]); 									// https://github.com/d3/d3-scale-chromatic#interpolateRdYlGn
	

	seaScapeDataVisual.join.forEach(function (join){    																	// Visualize the seaScape data driven by the 'value' attribute 												     
											
											join.visualObj.visible = join.visible;   										// Minimize GPU by only rendering items that will be salvaged
											join.visualObj.color =  fnColor(join.dataRow.value);							// Save color to be referenced by dat Gui and ThreeJS
											
											if (join.visible) { 															// For viusualObjs that will be salvaged	
												
												seaScapeDataVisual
													.setColorVisualObj(join.visualObj,join.visualObj.color )	 			// Set Dynaimic, value-based visualization, includes children	
											
											} //if
										});	//	forEach		
	

	fnDisplay(seaScapeDataVisual);
	

} //fnVisualize

// *********************************************************************************************************************
// ************************************************* Dispaly Visualization ********************************************	
// *********************************************************************************************************************

function fnDisplay(seaScapeDataVisual){
	
	var container = document.getElementById("seaScapeDiv");
	
	var widthHeight = fnGetWidthHeight(container);
	var width =  widthHeight.width;
	var height = widthHeight.height;	
	
	var gui, datGui;																												//Refereced data gui legend/raycasting	
	fnBuildDatGui(container);																								//Build dat.gui with viusalization	
		
																						
	// Turn on the lights and render the visual referencing the scene seaScapeDataVisual.visual built.
	
	seaScapeDataVisual.visual.scene.add(new THREE.AmbientLight(0xffffff,0.5));
	seaScapeDataVisual.visual.scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,0.5));	
	
	var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
	camera.position.set(0, -4, d3.max(seaScapeDataVisual.join, function(join){return join.originToVisualObjDistance} ) * 2); // Under water view at twice maximum distance from origin	
	
	var renderer = new THREE.WebGLRenderer();				
	
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	renderer.setSize( width, height )
	d3.select(renderer.domElement)
		.style("position",	"absolute")
		.style("top",		0)
		.style("left", 		0) 
		.style("right", 	0)
		.style("z-index",	-1);
		
	container.appendChild( renderer.domElement );	

	seaScapeDataVisual.visual.scene.background = new THREE.Color("#1c4a63") ; //Deep Sea Blue

	// aquaRobot
	var dotGeometry = new THREE.Geometry();
	dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
	var dotMaterial = new THREE.PointsMaterial( { size: 20, sizeAttenuation: false } );
	var originPoint = new THREE.Points( dotGeometry, dotMaterial );
	seaScapeDataVisual.visual.scene.add(originPoint);	

	var size = 100;
	var divisions = 40;

	// Sea-scape surface
	var gridHelper = new THREE.GridHelper( size, divisions );
	seaScapeDataVisual.visual.scene.add( gridHelper );
		
	// Visualization of the retrieval/salvage path
	var material = new THREE.LineBasicMaterial({color: "#" + seaScapeDataVisual.join[0].visualObj.material.color.getHexString()});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( 0, 0, 0 ),
		seaScapeDataVisual.join[0].visualObj.position.clone()
	);

	var line = new THREE.Line( geometry, material );
	seaScapeDataVisual.visual.scene.add( line );


	//Animated aquaRobot's salvage strategy
	var index = 0;	
	setInterval(function(){
				
				if (seaScapeDataVisual.join[index].visible){																		//The join's visibiblity, not visualObj's visibility
					line.material.color.set("#" + seaScapeDataVisual.join[index].visualObj.material.color.getHexString() )
					line.geometry.vertices[1].copy(seaScapeDataVisual.join[index].visualObj.position);
					line.geometry.verticesNeedUpdate = true;  																		// https://threejs.org/docs/index.html#api/en/core/Geometry.verticesNeedUpdate
					index = index >= (seaScapeDataVisual.join.length - 1) ? 0 : index + 1;
				} //if
				else {
					index = 0;
				}  //else
	}, 1000); //setInterval
	

	// Raycaster to handle identification of a cube

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	function onMouseDown( event ) {

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; 																	// calculate mouse position in normalized device coordinates
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;																	// (-1 to +1) for both components
			
		raycaster.setFromCamera( mouse, camera );																					// update the picking ray with the camera and mouse position
		
		// Utilize the DataVisual's pre-selected objects for more efficient raycasting.
		var intersects = raycaster.intersectObjects( seaScapeDataVisual.join.map(function(joinRow){ return joinRow.visualObj}) );    // calculate objects intersecting the picking ray
		
		intersects.some(function(intersect){
			
			var join = seaScapeDataVisual.getJoinByUUID(intersect.object.uuid);
			
			if (join){																												// Update dat Gui with selection indicator
				
				d3.select(datGui.domElement)
					.selectAll(".property-name")
					.text(function(){ 
						var searchText = d3.select(this).text().split("****");  
						var cubeName = searchText[searchText.length-1].trim();  ;  
						return cubeName == join.dataRow.name ? "****" + cubeName : cubeName;   
					}) //text
					 
				return true;
				
			} //if
			
		}); //some
		
	} //onMouseDown

	window.addEventListener( 'mousedown', onMouseDown, false );

	animate();

	function animate() {

		requestAnimationFrame( animate );
		controls.update();
				
		renderer.render( seaScapeDataVisual.visual.scene, camera );

	} //animate


	function fnBuildDatGui(container){
				
		var guiDisplay = {"Show Hidden": false };		

		datGui = new dat.GUI({ autoPlace: false });
		container.appendChild(datGui.domElement);
		datGui.domElement.classList.add("a")

		
			
		var fnShowHidden = datGui.add(guiDisplay, 'Show Hidden');
			fnShowHidden.onChange(function (value){
				
				seaScapeDataVisual.join.forEach(function(join){
					
					join.visualObj.visible = value ? true : join.visible;
				
				});
				
				
			}); //onchange
		
		
		var folder = datGui.addFolder("Click an object to indentify");																// Utilizes seaScapeDataVisual.getJoinByUUID(intersect.object.uuid)
		
		var folder = datGui.addFolder("Value");
		folder.open();
		
		var maxDataValue = d3.max(seaScapeDataVisual.join, function(join){return join.dataRow.value; });
		
		seaScapeDataVisual.data.forEach(function(datum){
			
			guiDisplay[datum.name] = datum.value;
			var test = folder.add(guiDisplay, datum.name, 0, maxDataValue);	

		});
		
		d3.select(folder.domElement)
		.selectAll(".c")
		.style("pointer-events","none") 																								//https://stackoverflow.com/questions/38602189/dat-gui-looking-for-a-way-to-lock-slider-and-prevent-updating-of-values-with-m
		.selectAll("input")
		.attr("disabled", "true");

		

		var folder = datGui.addFolder("Salvage Order");
		folder.open();
		
		seaScapeDataVisual.join.forEach(function(join){
			
			if (join.visible){
				
				guiDisplay[join.dataRow.name + " " ] = join.dataRow.value;															// + " " creates unique property
				
				folder.add(guiDisplay, join.dataRow.name + " ", 0, maxDataValue);													
				
				d3.select(folder.__controllers[folder.__controllers.length -1].domElement)  										// A little hack of dat Gui		
					.select(".slider-fg")																							// Find the slider-fg class ...
					.style("background-color",join.visualObj.color);																// Then use data driven visualization
			
			} //if
			
		});	//forEach		
			
		d3.select(folder.domElement)
		.selectAll(".c")
		.style("pointer-events","none") 																								//https://stackoverflow.com/questions/38602189/dat-gui-looking-for-a-way-to-lock-slider-and-prevent-updating-of-values-with-m
		.selectAll("input")
		.attr("disabled", "true");

			

		
	} //fnBuildDatGui

} //fnDisplay

function fnGetWidthHeight(node){
	
	return node.clientHeight == 0 ?  fnGetWidthHeight(node.parentElement)  : {width: node.clientWidth, height: node.clientHeight }
	
} //fnGetWidthHeight
