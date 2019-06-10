<!-- Markdown reference: https://guides.github.com/features/mastering-markdown/ -->

# *DataVisual*

*DataVisual* is a design pattern for developing data visualizations with [WebGL](https://get.webgl.org/) 3D assets.  
The pattern is implemented in JavaScript using the [ThreeJS](https://threejs.org/) framework, but is applicable to other frameworks like [Babylon](https://www.babylonjs.com/).

With a *DataVisual* you can dynamically visualize individual [meshes](https://threejs.org/docs/index.html#api/en/objects/Mesh), that have unique [materials](https://threejs.org/docs/index.html#api/en/materials/Material) associated with them, in a ThreeJS scene.

Traditional [dataset processing](https://en.wikipedia.org/wiki/Set_theory) can be used on a *DataVisual* leveraging [JavaScript's robust array methods](https://www.w3schools.com/js/js_array_methods.asp); most notably [MapReduce](http://jcla1.com/blog/javascript-mapreduce) patterns.

## *DataVisual* Demonstrated With a U.S Navy Salvage Robot (aquaRobot) Use Case

![Screen Shot of Demonstration](https://github.com/MarioDelgadoSr/DataVisual/blob/master/img/demoDesignPatternScreenShot.png)

The demo illustrates *DataVisual* features with a use case simulating a U.S. Navy (*Go Navy! Beat Army*) aquaRobot determining an optimal salvage
retrieval strategy for objects floating and submersed out at sea.  aquaRobot utilizes information about the salvage items in a data array partnered/join with the 3D visual's spatial attributes to maximize the salvage; keeping track of how
much fuel it would have left.  

The 3D visual was developed with [Blender](https://www.blender.org/) and exported as a [glTF](https://en.wikipedia.org/wiki/GlTF) file.  
ThreeJS's [GLTFLoader](https://threejs.org/docs/index.html#examples/loaders/GLTFLoader) is used in the demonstration to load the 3D visual an then dynamically visualizes it.


The visualization animates the salvage strategy and leverages several of *DataVisual*'s features including:

* Maintaing join context when sorting the join object;
* Referencing joined properties from both the data and visual;
* Dynamic data coloring/visualization using [D3.js](https://d3js.org/).
* Rendering only objects that will be salvaged with a data-drive algorithm;  
	*All objects can be displayed/rendered with a user-driven (aquaRobot's Operator) option for *human* validation;
* Demonstration of the raycasting to display which object is selected; leveraging *DataVisual*'s *getJoinByUUID* method.


### Prerequisites

If using the Chrome browser with file system access, the *--allow-file-access-from-files* flag **must** be used.  
See:  [How to set the allow-file-access-from-files flag option in Google Chrome](http://www.chrome-allow-file-access-from-file.com/)


### Installing

Download zip of code, unzip to a folder and launch index.html from a web server or from the file system with a [WebGL enabled browser](https://get.webgl.org/).


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

Property | Description
-------- | -----------
.join | A join object (array).  Each element of the array will be an object referencing a joined (matching) dataRow and visuaObj.
.join.dataRow | A reference to data row from the original data array that corresponds to the joined (matching) visualObj.
.join.visualObj | A reference to the ThreeJS mesh being 'joined' to.
.data | The original data participating in the 'join'.
.visual | The original visual participating in the 'join'.
.dataKey | The data key attribute being used to join to a corresponding mesh in the visual.
.visualKey |The visual key attribute being used to join to the visual's mesh. Property *visualKey* can be a direct property of a mesh or a property of the mesh's *.userData* member.
.nonMatchingDataKeys | An array holding any dataKey(s) that did not join/match when the *joinDataToVisual* method was invoked.
**Methods:**

Method | Description
-------| -----------
.joinDataToVisual(data, visual) | Join *data* to a *visual*'s mesh utilizing each objects *name* property
.joinDataToVisual(data, visual, dataKey, visualKey) | Join *data* to a *visual* utilizing *data*'s *dataKey* property and *visual*'s *visualKey* property.  *visualKey* can be a direct property of a mesh, or it's *.userData* property.
.getJoinByUUID(uuid) | Get a joined row by referencing a mesh's *uuid*. This method is very helpful with [raycasting](https://threejs.org/docs/index.html#api/en/core/Raycaster) techniques. 	
.getJoinByKey(dataKey) | Get a joined row by referencing a dataRow's *dataKey*.
.setColorVisualObj(visualObj,color) | Set the materia.color property for a mesh.  The method utilized the ThreeJS [traverse](https://threejs.org/docs/index.html#api/en/core/Object3D.traverse) method to set color for any children the mesh may have as well.

## Built With

* [D3.js](https://d3js.org/) - D3 framework
* [ThreeJS](https://threejs.org/) - ThreeJS framework
* [glTF](https://www.khronos.org/gltf/) - Khronos' graphic library Transfer Format
* [GLTFLoader](https://threejs.org/docs/index.html#examples/loaders/GLTFLoader) - A loader for glTF 2.0 resources
* [dat.gui](https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage) - dat.gui
* [Blender](https://www.blender.org/) - For building a 3D visual and [exporting](https://docs.blender.org/manual/en/dev/addons/io_gltf2.html) it to a glTF file.


## Author

* **Mario Delgado**  Github: [MarioDelgadoSr](https://github.com/MarioDelgadoSr)
* LinkedIn: [Mario Delgado](https://www.linkedin.com/in/mario-delgado-5b6195155/)
* [My Data Visualizer](https://qzfcxunzx7ydnpxm3djoqw-on.drv.tw/DataVisualizer/): A data visualization application using the *DataVisual* design pattern.


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details




