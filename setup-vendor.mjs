import {copyFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const destination=path.join(root,'dist/vendor');
await mkdir(destination,{recursive:true});
const files=[['build/three.module.js','three.module.js'],['examples/jsm/controls/OrbitControls.js','OrbitControls.js'],['examples/jsm/geometries/RoundedBoxGeometry.js','RoundedBoxGeometry.js'],['examples/jsm/exporters/GLTFExporter.js','GLTFExporter.js'],['LICENSE','THREE-LICENSE.txt']];
try{for(const [source,name] of files)await copyFile(path.join(root,'node_modules/three',source),path.join(destination,name));console.log('Hestia 2.0 renderer files are ready.');}
catch{console.error('Renderer setup failed. Run npm ci from the project folder, then try again.');process.exit(1);}
