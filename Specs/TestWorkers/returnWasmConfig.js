import { createTaskProcessorWorker } from "@yiird/cesium-engine";

export default createTaskProcessorWorker(function returnWasmConfig(parameters) {
  const wasmConfig = parameters.webAssemblyConfig;
  return wasmConfig;
});
