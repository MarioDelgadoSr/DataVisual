[//]: <> Markdown reference: https://guides.github.com/features/mastering-markdown/

# DataVisual

*DataVisual* is a design pattern for developing data visualizations with [WebGL](https://get.webgl.org/) 3D assets.  
The pattern is implemented in JavaScript using the [ThreeJS] (https://threejs.org/) framework, but is applicable to other frameworks like Babylon.

With a *DataVisual* you can dynamically visualize individual [meshes](https://threejs.org/docs/index.html#api/en/objects/Mesh), that have unique [materials](https://threejs.org/docs/index.html#api/en/materials/Material) associated with them, in a ThreeJS scene.

### Prerequisites

If using the Chrome browser with file system access, the ' --allow-file-access-from-files' flag must be utilized.  
See:  [How to set the allow-file-access-from-files flag option in Google Chrome](http://www.chrome-allow-file-access-from-file.com/)


### Installing

Download zip of code, unzip to a folder and launch index.html from a web server or from the file system with a [WebGL enabled browser] (https://get.webgl.org/).


## Documentation

Observable (documentation in progress): [DataVisual (Data + Visual) Design Pattern for WebGL 3D Assets](https://observablehq.com/d/d3eef89e5e71f3e1)


## Design Pattern Usage Illustrated in the Demonstration

**Assuming the following:**

* A JavaScript data object in the following format: 

```javascript
var data = [{name: "object1", value: value1, ...} ,{name: "object2", value2, ...}, ... }];
```

* A glTF file loaded into the variable *visual* with *name* attibutes for the meshes that match the 'name' attributes for the data object;

**Create a DataVisual object with the following syntax:**

```javascript
var dataVisual = new dataVisual();
dataVisual.joinDataToVisual(data, visual);
```

**The dataVisual has the following properties and methods:**

**Properties:** 

* .join								// A join object (array).  Each element of the array will be an object referencing a matching dataRow and visuaObj.
	* .dataRow						// A reference to data row from the original data array that corresponds to the matching visualObj.
	* .visualObj					// A referenct to the ThreeJS mesh being 'joined' to.
* .data 							// The original data participating in the 'join'.
* .visual							// The original visual participating in the 'join'.
.dataKey 							// The data key attribute being used to join to a corresponding mesh in the visual 
.visualKey 							// The visual key attribute being used to join to in the visual's mesh. *visualKey* can be a mesh property or property of the mesh's *.userData* member

**Methods:**

.getJoinByUUID(uuid)				// A method to retieve a joined row by referencing a mesh's *uuid*. This method is very helpful with [raycasting](https://threejs.org/docs/index.html#api/en/core/Raycaster) techniques. 	
.getJoinByKey(dataKey)              // A method to retreive a joined row by referencing a dataRow's *dataKey*.
.setColorVisualObj(visualObj,color) // A method to set the materia.color property for a mesh.  The method utilized the ThreeJS [traverse](https://threejs.org/docs/index.html#api/en/core/Object3D.traverse) method to set color for any children the mesh may have as well.

## Built With

* [D3.js](https://d3js.org/) - D3 framework
* [ThreeJS](https://threejs.org/) - ThreeJS framework
* [glTF](https://www.khronos.org/gltf/) - Khronos' graphic library Transfer Format
* [dat.gui](https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage) - dat.gui
* [Blender](https://www.blender.org/) - For building a 3D visual and [exporting](https://docs.blender.org/manual/en/dev/addons/io_gltf2.html) it to a glTF file.

## Screen Shot of Demonstration

![Screen Shot of Demonstration](https://raw.githubusercontent.com/MarioDelgadoSr/DataVisual/master/img/demoDesignPatternScreenShot.png)


## Authors

* **Mario Delgado**  
Github: [MarioDelgadoSr](https://github.com/MarioDelgadoSr)
LinkedIn: [Mario Delgado](https://www.linkedin.com/in/mario-delgado-5b6195155/)
[My Data Visualizer](https://qzfcxunzx7ydnpxm3djoqw-on.drv.tw/DataVisualizer/): A data visualization application using the *DataVisual* design pattern.


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details




