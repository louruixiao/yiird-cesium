import { createTaskProcessorWorker } from "@yiird/cesium-engine";

export default createTaskProcessorWorker(function (parameters) {
  throw new Error(parameters.message);
});
