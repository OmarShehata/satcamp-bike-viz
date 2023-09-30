import * as Cesium from "cesium";

// This is a preprocessor step that loads all JSON files in public/satcamp_data_collections_gps
// this way we don't need to load the JSON files with a request at runtime
// Everything in satcamp_data_collections_gps ships with this app
// so you probably don't want to put a ton of data in there. Otherwise we can lazily load it
const jsonFiles = import.meta.glob('../public/satcamp_data_collections_gps/**/*.json', { as: 'raw', eager: true })
const basePath = "../public/satcamp_data_collections_gps/"
const jsonFilesMap = {}
for (let name in jsonFiles) {
  const filename = name.replace(basePath, "")
  const parts = filename.split('/')
  const datePart = parts[0]
  const namePart = parts[1]
  if (jsonFilesMap[datePart] == undefined) 
    jsonFilesMap[datePart] = {}

  jsonFilesMap[datePart][namePart] = jsonFiles[name]
}

export function getAllGeojsonFiles(prefix) {
  return jsonFilesMap[prefix]
}

// Given a geojson describing a list of features
// where each feature is a point in time of the same moving object
// returns a CesiumJS SampledPositionProperty
export function convertGeoJSONToCesiumTimeData(geojson) {
  const sampledPositionProperty = new Cesium.SampledPositionProperty();
  const timeArray = [];
  const positionArray = [];

  for (let feature of geojson.features) {
    const lat = feature.geometry.coordinates[1];
    const lon = feature.geometry.coordinates[0];
    const height = 0;
    const timeString = feature.properties.time;
    const time = Cesium.JulianDate.fromIso8601(timeString);
    const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);

    timeArray.push(time);
    positionArray.push(lon, lat, height);
    sampledPositionProperty.addSample(time, position);
  }

  return {
    sampledPositionProperty,
    positionArray,
    timeArray,
    label: geojson.features[0].properties.rx_id
  };
}

export function clampTimeline(viewer, timeArray) {
  const start = timeArray[0];
  const stop = timeArray[timeArray.length - 1];

  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

  viewer.timeline.zoomTo(start, stop);
}

export function addLine(viewer, positionArray, color) {
  return viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(
        positionArray,
      ),
      width: 3,
      material: Cesium.Color.fromCssColorString(color), //green
      clampToGround: true,
    },
  });
}

export function addDynamicPoint(viewer, sampledPositionProperty, name, color) {
  return viewer.entities.add({
        position: sampledPositionProperty,
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString(color),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: name,
          font: "20px sans-serif",
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          showBackground: false,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
}