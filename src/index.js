import { 
  convertGeoJSONToCesiumTimeData, 
  getAllGeojsonFiles,
  clampTimeline,
  addDynamicPoint,
  addLine
} from "./geojson_gps_data.js";
import { adjustHexColor } from './adjust_hex_color.js'

// The URL on your server where CesiumJS's static files are hosted.
window.CESIUM_BASE_URL = "Cesium/";

import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTcyZDQ1ZS1kNWIyLTQ2ODAtYWMwNS03OWExNmQxN2FhMmUiLCJpZCI6MzkxNjAsImlhdCI6MTYwNzI4ODMwN30.eRvkUj485LKXjQ4h7MqpmHcyU5iB5oE7sM3yN5kJHxY";

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  shouldAnimate: true,
});



const urlParams = new URLSearchParams(window.location.search);
let dataPrefix = urlParams.get('data');
const dataPrefixUndefined = dataPrefix == undefined
if (dataPrefix == undefined) {
  dataPrefix = "bike_data_09_13_2023"
}
const timeParam = urlParams.get('timeMultiplier')
if (timeParam) {
  viewer.clock.multiplier = parseInt(timeParam);
} else {
  viewer.clock.multiplier = 44;
}

const geojsonFiles = getAllGeojsonFiles(dataPrefix)
const colors = ["#FAFFD8", "#ECFFB0", "#9AA899", "#54577C", "#4A7B9D",
"#C33C54", "#254E70", "#37718E", "#AEF3E7"]

for (let name in geojsonFiles) {
  const geojson = JSON.parse(geojsonFiles[name])
  const { 
    timeArray, label, 
    sampledPositionProperty, 
    positionArray } = convertGeoJSONToCesiumTimeData(geojson);

  clampTimeline(viewer, timeArray)

  const lineColor = colors.pop()
  addLine(viewer, positionArray, lineColor)

  const dotColor = adjustHexColor(lineColor, 50, 0)
  const dot = addDynamicPoint(viewer, sampledPositionProperty, label, dotColor)

  if (!dataPrefixUndefined && !viewer.trackedEntity) {
    viewer.trackedEntity = dot
  }
}

// Go to hardcoded view only if dataPrefix isn't provided
if (dataPrefixUndefined) {
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(
      -1309406.0415927342,
      -4720905.650324558,
      4075185.3725785543,
    ),
    orientation: {
      direction: new Cesium.Cartesian3(
        -0.8705014934909139,
        0.48215018930726544,
        -0.0987843346946098,
      ),
      up: new Cesium.Cartesian3(
        -0.42755747777151376,
        -0.6414266978139884,
        0.6369979548892635,
      ),
    },
    duration: 0,
  });
} 