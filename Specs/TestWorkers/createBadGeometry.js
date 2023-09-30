import { createTaskProcessorWorker } from "@yiird/cesium-engine";

export default createTaskProcessorWorker(function () {
  throw new Error("BadGeometry.createGeometry");
});
