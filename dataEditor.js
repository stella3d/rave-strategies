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

    folder['AddElement'] = function() {};
    let addElementButton = folder.add(folder, 'AddElement').name('+ Add Element');

    folder['AddElement'] = function() {
        const length = array.length;
        console.log(array);
        let push = function(val) {
            console.log('adding: ', val);
            var newProp = '' + array.length;
            array[newProp] = val;
            array.length++;
        }
        push('');
        folder.remove(addElementButton);
        folder.add(array, '' + length);
        addElementButton = folder.add(folder, 'AddElement').name('+ Add Element');
    }
}

function arrayToObject(array) {
    var obj = {};
    for (let i = 0; i < array.length; i++) {
        obj[i] = array[i];
    }
    obj['isArrayRepresentation'] = true;
    obj['push'] = function(val) {
        console.log('adding: ', val);
        var newProp = '' + this.length;
        this[newProp] = val;
        this.length++;
    }
    obj.length = array.length;
    return obj;
}

function objArrayToArray(obj) {
    var arr = new Array(obj.length);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = obj[i];
    }
    return arr;
}

function displayTextTemporary(element, text, milliseconds) {
    element.textContent = text;
    setTimeout(() => {
        element.textContent = '';
    }, milliseconds);
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

loadStrategyInputData(true)
.then((data) => {
    const saveFeedbackElement = document.getElementById('save-feedback');

    let guiData = arrayMembersToObjects(data);
    console.log("defaults loaded:", data, guiData);
    // depends on dat.gui being loaded before this in the <head>
    let gui = new dat.GUI({ width: 460 });
    //gui.remember(defaults);

    var keys = Object.keys(guiData);
    console.log("keys:", keys);

    let bpmFold = gui.addFolder('bpm');
    bpmFold.add(guiData.bpm, 'min').min(40).max(160).step(1);
    bpmFold.add(guiData.bpm, 'max').min(160).max(420).step(1);
    if(guiData.bpm.min > guiData.bpm.max)
        guiData.bpm.max = guiData.bpm.min;

    addArrayGuiFolder(gui, guiData.genres, 'genres');
    addArrayGuiFolder(gui, guiData.systemList, 'systems');
    addArrayGuiFolder(gui, guiData.sequencerList, 'sequencers');
    addArrayGuiFolder(gui, guiData.actionList, 'actions');
    addArrayGuiFolder(gui, guiData.contextList, 'contexts');
    addArrayGuiFolder(gui, guiData.thingList, 'things');
    addArrayGuiFolder(gui, guiData.keys, 'keys');
    addArrayGuiFolder(gui, guiData.pitches, 'pitch lists');

    let buttonObj = {
        'SAVE': function() {
            let saveData = {};    
            Object.keys(guiData).forEach(k => {
                let val = guiData[k];
                if(val['isArrayRepresentation']) {
                    for (let i = 0; i < val.length; i++) {
                        const element = val[i];
                        if(element['isArrayRepresentation'])
                            val[i] = objArrayToArray(element);    
                    }
                    val = objArrayToArray(val);
                }
                saveData[k] = val;    
            });
            saveUserData(saveData);
            displayTextTemporary(saveFeedbackElement, 'Settings saved.', 12000)
        }
    }

    gui.add(buttonObj, 'SAVE');
});