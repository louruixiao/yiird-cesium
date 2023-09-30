import { createTaskProcessorWorker } from "@yiird/cesium-engine";

export default createTaskProcessorWorker(function () {
  return function () {
    //functions are not cloneable
  };
});
