/*
Scenario to illustrate dataVisual design pattern.

U.S. Navy is testing out a salvage aquaBot with AI capabilities.  

aquaBot's task it to maximize the retrieval of high-value objects with limited fuel. 

The retrieval strategy will be visualized showing only the objects that can be retrieved; minimizing rendering resources.

*/


// *********************************************************************************************************************
// ********************************************* DataVisual Design Pattern ********************************************	
// *********************************************************************************************************************

function fnVisualize(data, seaScape){

	const seaScapeDataVisual = new dataVisual();																				// See dataVisual.js for more notes/considerations. 
	
	if (data.length != 0){																									//Join from data scenario
	
		seaScapeDataVisual.joinDataToVisual(data, seaScape, "name", "visualKey");  											// Option specifying dataKey and visualKey.  
		//seaScapeDataVisual.joinDataToVisual(data, seaScape);  					    									// Option assuming name properties have EXACT values		
		
	} // if
	else {																													//Use embedded data in glTF file scenario
		
		seaScapeDataVisual.joinDataToVisual(seaScape);  																	// Option specifying embedded data.  

		
	} //if
	
 
	
	const originVector = new THREE.Vector3(0,0,0);																				// Sets origin for distance calculations	

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
	let distanceLeft = fullTank;																							// Accumumulator determines when to stop retrieving visualObjs 
	
	seaScapeDataVisual.join.forEach(function (join){     																	// Iterating in dataRow.value sort-order      

											join.visible = distanceLeft > 0;												// Attribute designating DataVisual.join[i] as visible/invisible 
											distanceLeft -=  (join.originToVisualObjDistance * 2);							// Subtract round trip distance	
										
										});
		

	const maxValue = d3.max(seaScapeDataVisual.join, function(join){return join.visible ? join.dataRow.value : 0});	
	const minValue = d3.min(seaScapeDataVisual.join, function(join){return join.visible ? join.dataRow.value : maxValue});
	const fnColor = d3.scaleSequential(d3.interpolateRdYlGn).domain([minValue, maxValue]); 									// https://github.com/d3/d3-scale-chromatic#interpolateRdYlGn
	

	seaScapeDataVisual.join.forEach(function (join){    																	// Visualize the seaScape data driven by the 'value' attribute 												     
											
											join.visualObj.visible = join.visible;   										// Minimize GPU by only rendering items that will be salvaged
											join.color =  fnColor(join.dataRow.value);										// Save color to be referenced by dat Gui and ThreeJS
											
											if (join.visible) { 															// For viusualObjs that will be salvaged	
												
												seaScapeDataVisual
													.setColorVisualObj(join.visualObj, join.color )	 						// Set Dynaimic, value-based visualization, includes children	
											
											} //if
										});	//	forEach		
	

	fnDisplay(seaScapeDataVisual);
	

} //fnVisualize

// *********************************************************************************************************************
// ************************************************* Dispaly Visualization ********************************************	
// *********************************************************************************************************************

function fnDisplay(seaScapeDataVisual){
	
	const container = document.getElementById("seaScapeDiv");
	
	const widthHeight = fnGetWidthHeight(container);
	const width =  widthHeight.width;
	const height = widthHeight.height;	
	
	const datGui = new dat.GUI({ autoPlace: false });
		  container.appendChild(datGui.domElement);
		  //datGui.domElement.classList.add("a")	
	
	fnBuildDatGui(datGui, container);																								//Build dat.gui with viusalization	
																						
	// Turn on the lights and render the visual referencing the scene seaScapeDataVisual.visual built.
	
	seaScapeDataVisual.visual.scene.add(new THREE.AmbientLight(0xffffff,0.5));
	seaScapeDataVisual.visual.scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,0.5));	
	
	const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
	camera.position.set(0, -4, d3.max(seaScapeDataVisual.join, function(join){return join.originToVisualObjDistance} ) * 2); // Under water view at twice maximum distance from origin	
	
	const renderer = new THREE.WebGLRenderer();				
	
	const controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.autoRotate =  true;
	
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
	const botGeometry = new THREE.IcosahedronGeometry(1);
	const botMaterial = new THREE.MeshBasicMaterial();
	const aquaBot = new THREE.Mesh(botGeometry, botMaterial);
	seaScapeDataVisual.visual.scene.add(aquaBot);	

	var size = 100;
	var divisions = 40;

	// Sea-scape surface
	const gridHelper = new THREE.GridHelper( size, divisions );
	seaScapeDataVisual.visual.scene.add( gridHelper );
		
	// Visualization of the retrieval/salvage path
	const material = new THREE.LineBasicMaterial({color: seaScapeDataVisual.join[0].visualObj.material.color});

	const geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( 0, 0, 0 ),
		seaScapeDataVisual.join[0].visualObj.position.clone()
	);

	const line = new THREE.Line( geometry, material );
	seaScapeDataVisual.visual.scene.add( line );


	//Animated aquaBot's salvage strategy
	let index = 0;	
	setInterval(function(){
				//The join's visibiblity, not visualObj's visibility
				if (seaScapeDataVisual.join[index].visible){																		
					line.material.color.setHex(seaScapeDataVisual.join[index].visualObj.material.color.getHex() )
					line.geometry.vertices[1].copy(seaScapeDataVisual.join[index].visualObj.position);
					// https://threejs.org/docs/index.html#api/en/core/Geometry.verticesNeedUpdate
					line.geometry.verticesNeedUpdate = true;  																		
					index = index >= (seaScapeDataVisual.join.length - 1) ? 0 : index + 1;
				} //if
				else {
					index = 0;
				}  //else
	}, 1000); //setInterval
	
	seaScapeDataVisual.addToolTip(renderer, camera)
					  .onHover(renderer, camera,
							  (join) => d3.select(datGui.domElement)
											  .selectAll(".property-name")
											  .text(function(){ 
												const searchText = d3.select(this).text().split("****");  
												const cubeName = searchText[searchText.length-1].trim();  ;  
												return cubeName == join.dataRow.name ? "****" + cubeName : cubeName;                                                 
											}) // text
					   );

	animate();

	function animate() {

		requestAnimationFrame( animate );
		controls.update();			
		renderer.render( seaScapeDataVisual.visual.scene, camera );

	} //animate


  //https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
	function fnBuildDatGui(datGui, container){
				
		const guiDisplay = {"Show Hidden": false };		
	
		const chkShowHidden = datGui.add(guiDisplay, 'Show Hidden');
			
		chkShowHidden.onChange(function (value){
				
				seaScapeDataVisual.join.forEach(function(join){
					
					join.visualObj.visible = value ? true : join.visible;
				
				});
								
			}); //onchange
		
		// Utilizes seaScapeDataVisual.getJoinByUUID(intersect.object.uuid)
		datGui.addFolder("Double-click an object for more details");														
		
		let folder = datGui.addFolder("Value");
		    folder.open();
		
		const maxDataValue = d3.max(seaScapeDataVisual.join, function(join){return join.dataRow.value; });
		
		seaScapeDataVisual.data.forEach(function(datum){
			
			guiDisplay[datum.name] = datum.value;
			folder.add(guiDisplay, datum.name, 0, maxDataValue);	
		
		});
		
    //Disable slider and input for read-only legend effect
    d3.select(folder.domElement)
      .selectAll(".c")
      .style("pointer-events","none") 																								
      .selectAll("input")
      .attr("disabled", "true");
    

		folder = datGui.addFolder("Salvage Order");
		folder.open();
		
		seaScapeDataVisual.join.forEach(function(join){
			
			if (join.visible){
				
				// + " " creates unique property
				guiDisplay[join.dataRow.name + " " ] = join.dataRow.value;															
				
				folder.add(guiDisplay, join.dataRow.name + " ", 0, maxDataValue);													
				
				// A little hack of dat Gui		
				d3.select(folder.__controllers[folder.__controllers.length -1].domElement)  
					// Find the slider-fg class ...	
					.select(".slider-fg")	
					// Then use data driven visualization		
					.style("background-color", join.color);		
			
			} //if
			
		});	//forEach	
    
    //Disable slider and input for read-only legend effect
    d3.select(folder.domElement)
      .selectAll(".c")
      .style("pointer-events","none") 																								
      .selectAll("input")
      .attr("disabled", "true");    
    
    // Observable notebook-specific positioning styling
    d3.select(datGui.domElement)
      .style("position","absolute")
      .style("top","0px")
      .style("right","20px");
         
			
	} //fnBuildDatGui

} //fnDisplay

function fnGetWidthHeight(node){
	
	return node.clientHeight == 0 ?  fnGetWidthHeight(node.parentElement)  : {width: node.clientWidth, height: node.clientHeight }
	
} //fnGetWidthHeight
