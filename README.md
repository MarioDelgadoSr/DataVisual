<!-- Markdown reference: https://guides.github.com/features/mastering-markdown/ -->

# *DataVisual*

*DataVisual* is a design/programming pattern for developing data visualizations with [WebGL](https://get.webgl.org/) 3D assets.  
The pattern is implemented in JavaScript using the [Three.js](https://threejs.org/) framework, but is applicable to other frameworks like [Babylon](https://www.babylonjs.com/).

With a *DataVisual* you can dynamically visualize individual [meshes](https://threejs.org/docs/index.html#api/en/objects/Mesh), that have unique [materials](https://threejs.org/docs/index.html#api/en/materials/Material) associated with them, in a Three.js scene.

Traditional [dataset processing](https://en.wikipedia.org/wiki/Set_theory) can be used on a *DataVisual* leveraging [JavaScript's robust array methods](https://www.w3schools.com/js/js_array_methods.asp); most notably [MapReduce](https://www.geeksforgeeks.org/how-to-map-reduce-and-filter-a-set-element-using-javascript/) patterns.

## *Hello DataVisual* demo ([source](HelloDataVisual.html)) is available on [Observable](https://observablehq.com/@mariodelgadosr/hello-datavisual) and in the [repository](https://mariodelgadosr.github.io/DataVisual/HelloDataVisual.html).

## *DataVisual* Demonstrated With a U.S Navy Salvage Robot (aquaBot) Use Case

![Screen Shot of Demonstration](https://github.com/MarioDelgadoSr/DataVisual/blob/master/img/demoDesignPatternScreenShot.png)

The [demonstration](https://mariodelgadosr.github.io/DataVisual/) illustrates *DataVisual*'s features with a use case simulating a U.S. Navy (*Go Navy! Beat Army*) aquaBot determining an optimal salvage
retrieval strategy for objects floating and submersed out at sea.  

aquaBot utilizes information about the salvage items in a data array partnered (*join*ed) with the 3D visual's spatial attributes to maximize the salvage with a fixed amount of fuel.  

The 3D visual was developed with [Blender](https://www.blender.org/) and exported as a [glTF](https://en.wikipedia.org/wiki/GlTF) file.  Three.js's [GLTFLoader](https://threejs.org/docs/index.html#examples/loaders/GLTFLoader) is used in the demonstration to load the 3D visual an then dynamically visualizes it.


The visualization animates the salvage strategy and leverages several of *DataVisual*'s features including:

* Maintaining join context when sorting the join object;
* Referencing joined properties from both the data and visual;
* Dynamic data coloring/visualization using [D3.js](https://d3js.org/).
* Rendering only objects that will be salvaged with a data-driven algorithm;  
	* All objects can be displayed/rendered with a user-driven (aquaBot's operator) option for *human* validation;
* Use of the built-in tooltip and mouse event handler.

### Prerequisites

If using the Chrome browser with file system access, the *--allow-file-access-from-files* flag **must** be used.  
See:  [How to set the allow-file-access-from-files flag option in Google Chrome](http://www.chrome-allow-file-access-from-file.com/)


### Installing

Download zip of code, unzip to a folder and launch index.html from a web server or from the file system with a [WebGL enabled browser](https://get.webgl.org/).

The [demonstration application](https://mariodelgadosr.github.io/DataVisual/) will intially prompt for the type of glTF file to utilize:

![Screen Shot of glTF Selection](https://github.com/MarioDelgadoSr/DataVisual/blob/master/img/gltfSelection.PNG)

* gltf/seaScape.gltf utilizes data as a separate object in the *join*.
* gltf/seaScapeEmbeddedData.gltf utilizes embedded data within the glTF file; extracting it first before implementing the *join*.

## Documentation

Several Observable Notebooks in the [DataVisual Collection](https://observablehq.com/collection/@mariodelgadosr/datavisual).


## Design Pattern Usage Illustrated in the Demonstration

### DataVisual with Data in an Object Not Embedded in the Visual 

**Assuming the following:**

* A JavaScript data object in the following format: 

```javascript
const data = [{name: "object1", value: value1, ...} ,{name: "object2", value2, ...}, ... }];
```

* A glTF file loaded into the variable *visual* with *name* attibutes for the meshes that match the *name* attributes for the data object;

**Create a DataVisual object with the following syntax:**

```javascript
const datVisual = new dataVisual();
datVisual.joinDataToVisual(data, visual);

// Alternate instantiation pattern supported by the ES6 class:
// const datVisual = new dataVisual({data, visual});
```

### DataVisual with Data Embedded in the Visual

Three.js, as well as the glTF specifications, provide for a strategy to extend the visual with data that can be visualized:

* With Three.js it is the [*userData*](https://threejs.org/docs/index.html#api/en/core/Object3D.userData) property.
* With gltF it is the [*extras*](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-extras) property.

Instantiating a **DataVisual** in the following format creates a *dataVisual* object from a *visual* when the data is embedded in the [*userData*](https://threejs.org/docs/index.html#api/en/core/Object3D.userData)  property.

```javascript
const datVisual = new dataVisual();
datVisual.joinDataToVisual(visual);

// Alternate instantiation pattern supported by the ES6 class:
// const datVisual = new dataVisual({visual});
```

**The dataVisual has the following methods and properties:**

**Methods:**

Method | Description
-------| -----------
.joinDataToVisual(data, visual) | Join *data* to a *visual*'s mesh utilizing each object's *name* property
.joinDataToVisual(data, visual, dataKey, visualKey) | Join *data* to a *visual* utilizing *data*'s *dataKey* property and *visual*'s *visualKey* property.  *visualKey* can be a direct property of a mesh, or its *.userData* property.
.joinDataToVisual(visual) | Creates a *dataVisual* object from a *visual* when the data is embedded within the [*userData*](https://threejs.org/docs/index.html#api/en/core/Object3D.userData) property for mesh(es).
.getJoinByUUID(uuid) | Get a joined row by referencing a mesh's *uuid*. This method is very helpful with [raycasting](https://threejs.org/docs/index.html#api/en/core/Raycaster) techniques. 	
.getJoinByUUID(uuid, "index") | Get a joined row's index by referencing a mesh's *uuid*. This method is very helpful with [raycasting](https://threejs.org/docs/index.html#api/en/core/Raycaster) techniques. 	
.getJoinByKey(dataKey) | Get a joined row by referencing a dataRow's *dataKey*.
.getJoinByKey(dataKey, "index") | Get a joined row's index by referencing a dataRow's *dataKey*.
.getDataColumn(column) | Get an array of a specified column (attribute/property) form the *dataVisual*'s data.
.setColorVisualObj(visualObj,color) | Set the material.color property for a mesh.  The method utilizes the Three.js [traverse](https://threejs.org/docs/index.html#api/en/core/Object3D.traverse) method to set color for any children the mesh may have as well.
.setColorByJoinIndex(index,color) | Set the material.color property for a mesh by referencing the index of the join. The method invokes .setColorVisualObj for the given index.
.isolateObjects(visualObjs) | Isolates makes solely the visual objects in the *visualObjs* array visible; *visible* = true;
.showAll() | Shows all visual objects in the *DataVisual* visible; *visible* = true; 
.addToolTip(renderer, camera[, getToolTipText]) | Implements a custom tooltip assuming the following parameters:  (See [Hello, DataVisual!](https://observablehq.com/@mariodelgadosr/hello-datavisual) for an example.)<br/><br/>*renderer*: A Three.js [WebGLRenderer object](https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer) that has been attached to an HTML parent element.<br/><br/>*camera*: A Three.js [camera object](https://threejs.org/docs/index.html#api/en/cameras/Camera)<br/><br/>*getToolTipText*: An optional tooltip text callback function that will be passed two parameters: references to the *join* row and the *dataVisual* instance itself.  With the second  parameter (*dataVisual*) the callback has access to all the object's properties.<br/><br/> The *getToolTipText* callback function must return a [DOMString](https://developer.mozilla.org/en-US/docs/Web/API/DOMString) that will be assigned to the tooltip's [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) property. 
.onHover(renderer, camera, handleEnter [,handleLeave]) | Implements mouse hover handlers for joined objects. Both ***handleEnter*** and the optional ***handleLeave*** callback funtions will be will be passed two parameters: references to the *join* row and the *dataVisual* instance itself. With the second (*dataVisual*) parameter the callback has access to all the object's properties.
.onDoublClick(renderer, camera, handleDblClick) | <br/><br/>Implements a mouse double-click event handler for joined objects. The ***handleDblClick*** callback function/handler will be passed two parameters: references to the *join* row and the *dataVisual* instance itself. With the second (*dataVisual*) parameter the callback has access to all the object's properties.

**Properties:** 

Property | Description
-------- | -----------
.join | A join object (array).  Each element of the array will be an object referencing a joined (matching) dataRow and visuaObj.
.join[n].dataRow | A reference to nth data row from the original data array that corresponds to the joined nth (matching) visualObj.
.join[n].visualObj | A reference to the nth Three.js mesh being 'joined' to that corresponds to the joined nth (matching) dataRow.
.data | The original data participating in the 'join'.
.visual | The original visual participating in the 'join'.
.dataKey | The data key attribute being used to join to a corresponding mesh in the visual.
.visualKey |The visual key attribute being used to join to the visual's mesh. Property *visualKey* can be a direct property of a mesh or a property of the mesh's *.userData* member.
.nonMatchingDataKeys | An array holding any dataKey(s) that did not join/match when the *joinDataToVisual* method was invoked.


## Built With

* [D3.js](https://d3js.org/) - D3 framework
* [Three.js](https://threejs.org/) - Three.js framework
* [glTF](https://www.khronos.org/gltf/) - Khronos' graphic library Transmission Format
* [GLTFLoader](https://threejs.org/docs/index.html#examples/loaders/GLTFLoader) - A loader for glTF 2.0 resources
* [dat.gui](https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage) - dat.gui
* [Blender](https://www.blender.org/) - For building a 3D visual and [exporting](https://docs.blender.org/manual/en/dev/addons/io_gltf2.html) it to a glTF file.


## Author

* **Mario Delgado**  Github: [MarioDelgadoSr](https://github.com/MarioDelgadoSr)
* LinkedIn: [Mario Delgado](https://www.linkedin.com/in/mario-delgado-5b6195155/)
* [My Data Visualizer](http://MyDataVisualizer.com): A data visualization application using the [*DataVisual*](https://github.com/MarioDelgadoSr/DataVisual) design pattern.


## License

Free to all non-profit organizations.  Businesses can [email](mailto:MyDataVisualizer@gmail.com) for licences details.




