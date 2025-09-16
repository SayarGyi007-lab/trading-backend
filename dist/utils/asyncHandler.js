"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (ControlFn) => (req, res, next) => {
    Promise.resolve(ControlFn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
