import { BlobReader, BlobWriter, TextReader, TextWriter, ZipReader, ZipWriter } from "../lib/zip.js/index.js";
import { SimulationInstance } from "./simulation.js";
import { FloatTexture } from "./webGlFunctions.js";

/**
 * @param {Blob} file 
 * @param {SimulationInstance} instance
 */
export async function loadZip(file, instance){
    const zipFileReader = new BlobReader(file);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const images = entries.filter(entry => /.*\.png$/.test(entry.filename));

    const metadataEntry = entries.find(entry => entry.filename === "meta.json");
    if(!metadataEntry) throw new Error("No metadata file found(meta.json)");

    const textWriter = new TextWriter();
    metadataEntry.getData(textWriter);
    const metadata = validateMetadata(JSON.parse(await textWriter.getData()));

    if(metadata.width !== instance.width) throw new Error(`Save file width(${metadata.width}) does not match current width(${instance.width})`);
    if(metadata.height !== instance.height) throw new Error(`Save file height(${metadata.height}) does not match current height(${instance.height})`);

    for(const image of images){
        const blobWriter = new BlobWriter("image/png");
        await image.getData(blobWriter);
        const imageBlob = await blobWriter.getData();
        const data = await extractImageData(imageBlob, metadata.width, metadata.height);
        writeField(image.filename, instance, data);
    }
}

/**
 * @param {SimulationInstance} instance 
 */
export async function saveZip(instance){
    const zipFileWriter = new BlobWriter("application/x-zip");
    const zipWriter = new ZipWriter(zipFileWriter);

    await addField(zipWriter, instance.fieldConductivityX, "conductivity-x.png");
    await addField(zipWriter, instance.fieldConductivityY, "conductivity-y.png");
    await addField(zipWriter, instance.fieldConductivityZ, "conductivity-z.png");

    const metadata = {
        width: instance.width,
        height: instance.height,
        partial: false,
    }
    zipWriter.add("meta.json", new TextReader(JSON.stringify(metadata)));

    await zipWriter.close();
    return await zipFileWriter.getData();
}

/**
 * 
 * @param {ZipWriter} zipWriter 
 * @param {FloatTexture} field 
 * @param {string} name 
 */
async function addField(zipWriter, field, name){
    const fieldData = field.getData();
    const imageBlob = await saveImageData(fieldData, field.width, field.height);
    const blobReader = new BlobReader(imageBlob);
    zipWriter.add(name, blobReader);
}

/**
 * @param {Object} object 
 * @returns {{
 *   width: number,
 *   height: number,
 *   partial: boolean,
 * }}
 */
export function validateMetadata(object){
    if (!("width"   in object)) throw new Error("\"width\" attribute missing from meta.json");
    if (!("height"  in object)) throw new Error("\"height\" attribute missing from meta.json");
    if (!("partial" in object)) throw new Error("\"partial\" attribute missing from meta.json");

    if (typeof object.width   !== "number" ) throw new Error("\"width\" must be a number");
    if (typeof object.height  !== "number" ) throw new Error("\"height\" must be a number");
    if (typeof object.partial !== "boolean") throw new Error("\"partial\" must be a boolean");

    return object;
}

/**
 * @param {string} name 
 * @param {SimulationInstance} instance 
 * @param {Float32Array} data 
 */
function writeField(name, instance, data){
    switch(name){
        case "conductivity-x.png":
            instance.fieldConductivityX.setData(data);
            break;
        case "conductivity-y.png":
            instance.fieldConductivityY.setData(data);
            break;
        case "conductivity-z.png":
            instance.fieldConductivityZ.setData(data);
            break;
        default:
            throw new Error(`No destination for ${name}`);
    }
}

/**
 * @param {Blob} file 
 * @param {number} expectedWidth 
 * @param {number} expectedHeight 
 * @returns {Promise<Float32Array>}
 */
async function extractImageData(file, expectedWidth, expectedHeight){
    const imageRegex = /^image\/*/;
    if(!imageRegex.test(file.type)) throw new Error("Blob type is not image");

    const imageNode = new Image();
    await new Promise(r => {
        imageNode.onload = r;
        imageNode.src = URL.createObjectURL(file);
    });

    if(imageNode.width !== expectedWidth) throw new Error(`Image width(${imageNode.width}) is not equal to the expected width(${expectedWidth})`);
    if(imageNode.height !== expectedHeight) throw new Error(`Image width(${imageNode.height}) is not equal to the expected width(${expectedHeight})`);

    const canvasNode = document.createElement("canvas");
    canvasNode.width = imageNode.width;
    canvasNode.height = imageNode.height;
    const graphicsContext = canvasNode.getContext("2d");
    graphicsContext.drawImage(imageNode, 0, 0);
    const imageData = graphicsContext.getImageData(0, 0, canvasNode.width, canvasNode.height);
    return new Float32Array(imageData.data.buffer);
}

/**
 * @param {Float32Array} data
 * @param {number} width
 * @param {number} height
 * @returns {Promise<Blob>}
 */
async function saveImageData(data, width, height){
    const convertedData = new Uint8ClampedArray(data.slice().buffer);
    const canvasNode = document.createElement("canvas");
    canvasNode.width = width;
    canvasNode.height = height;
    const graphicsContext = canvasNode.getContext("2d");
    const imageData = new ImageData(convertedData, width, height);
    graphicsContext.putImageData(imageData, 0, 0);
    const blobResponse = await fetch(canvasNode.toDataURL("image/png"));
    return await blobResponse.blob();
}