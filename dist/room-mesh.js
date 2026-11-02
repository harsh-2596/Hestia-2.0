import * as THREE from 'three';
import {roomPoints} from './room-geometry.js';
export function roomSurface(r){const shape=new THREE.Shape(roomPoints(r).map(p=>new THREE.Vector2(...p)));for(const h of r.holes||[])shape.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(...p))));const g=new THREE.ShapeGeometry(shape);const uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/r.w,uv.getY(i)/r.d);g.rotateX(Math.PI/2);return g;}
