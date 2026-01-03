"use strict";
/**
 * API types synchronized with backend/api/schemas.py
 * These types must match the Pydantic schemas exactly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationType = exports.GenerationStatus = void 0;
/**
 * Generation status enum
 */
var GenerationStatus;
(function (GenerationStatus) {
    GenerationStatus["PENDING"] = "pending";
    GenerationStatus["PROCESSING"] = "processing";
    GenerationStatus["COMPLETED"] = "completed";
    GenerationStatus["FAILED"] = "failed";
})(GenerationStatus || (exports.GenerationStatus = GenerationStatus = {}));
/**
 * Generation type enum
 */
var GenerationType;
(function (GenerationType) {
    GenerationType["TEXT_TO_IMAGE"] = "text-to-image";
    GenerationType["IMAGE_TO_IMAGE"] = "image-to-image";
    GenerationType["TEXT_TO_VIDEO"] = "text-to-video";
    GenerationType["UPSCALE"] = "upscale";
})(GenerationType || (exports.GenerationType = GenerationType = {}));
//# sourceMappingURL=api.types.js.map