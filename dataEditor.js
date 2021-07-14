function addArrayGuiFolder(gui, array, name) {
    var fType = typeof array['0'];

    let folder = gui.addFolder(name);
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        //console.log("index: " + i + ", element: ", e);
        switch (fType) {
            case 'string':
                folder.add(array, i);
                break;
            case 'number':
                folder.add(array, i);
                break;
            case 'object':
                addArrayGuiFolder(folder, e, i);
                break;    
            default:
                break;
        }
    }

    folder['addElement'] = function() {};
    let addElementButton = folder.add(folder, 'addElement');

    folder['addElement'] = function() {
        const length = array.length;
        array.push('');
        console.log(array);

        folder.remove(addElementButton);
        folder.add(array, '' + length);
        addElementButton = folder.add(folder, 'addElement');
    }
}

function arrayToObject(array) {
    var obj = {};
    for (let i = 0; i < array.length; i++) {
        obj[i] = array[i];
    }
    obj['isArrayRepresentation'] = true;
    obj.length = array.length;
    obj.push = function(val) {
        console.log('adding: ', val);
        var newProp = '' + this.length;
        obj[newProp] = val;
        this.length++;
    }
    return obj;
}

function arrayMembersToObjects(obj) {
    Object.keys(obj).forEach(key => {
        var val = obj[key];
        if(Array.isArray(val)) {
            if(Array.isArray(val[0])) {
                for (let i = 0; i < val.length; i++) {
                    const innerArray = val[i];
                    val[i] = arrayToObject(innerArray);
                }
            }
            obj[key] = arrayToObject(val);
        }
    });
    return obj;
}

console.log("EDITOR JS INIT");

//document.onloadeddata = () => {
    fetch('./defaultData.json').then(resp => resp.json())
    .then((defaults) => {
        let guiData = arrayMembersToObjects(defaults);
        console.log("defaults loaded:", defaults, guiData);
        // depends on dat.gui being loaded before this in the <head>
        let gui = new dat.GUI();

        var testObj = { a: 5, b: "string", c: ["one", "two"] };
        //gui.remember(defaults);

        var keys = Object.keys(guiData);
        console.log("keys:", keys);

        //gui.add(testObj, 'a');
        //gui.add(testObj, 'b');

        let bpmFold = gui.addFolder('bpm');
        bpmFold.add(defaults.bpm, 'min');
        bpmFold.add(defaults.bpm, 'max');

        addArrayGuiFolder(gui, guiData.genres, 'genres');
        addArrayGuiFolder(gui, guiData.systemList, 'systems');
        addArrayGuiFolder(gui, guiData.sequencerList, 'sequencers');
        addArrayGuiFolder(gui, guiData.actionList, 'actions');
        addArrayGuiFolder(gui, guiData.contextList, 'contexts');
        addArrayGuiFolder(gui, guiData.thingList, 'things');
        addArrayGuiFolder(gui, guiData.keys, 'keys');
        addArrayGuiFolder(gui, guiData.pitches, 'pitch lists');

        /*
        keys.forEach(k => {
            console.log(k);
            if(defaults[k]['isArrayRepresentation'])
                addArrayGuiFolder(gui, guiData[k], k);
            else
                gui.add(guiData, k);
        })
        */
    });

//}