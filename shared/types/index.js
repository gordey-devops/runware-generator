"use strict";
/**
 * Shared types for Runware Generator
 * Re-export all types from api and ipc modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = exports.GenerationType = exports.GenerationStatus = void 0;
var api_types_1 = require("./api.types");
Object.defineProperty(exports, "GenerationStatus", { enumerable: true, get: function () { return api_types_1.GenerationStatus; } });
Object.defineProperty(exports, "GenerationType", { enumerable: true, get: function () { return api_types_1.GenerationType; } });
var ipc_types_1 = require("./ipc.types");
Object.defineProperty(exports, "IPC_CHANNELS", { enumerable: true, get: function () { return ipc_types_1.IPC_CHANNELS; } });
//# sourceMappingURL=index.js.map