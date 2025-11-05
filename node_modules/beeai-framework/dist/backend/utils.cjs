'use strict';

var errors_cjs = require('../errors.cjs');
var constants_cjs = require('./constants.cjs');
var remeda = require('remeda');
var base_cjs = require('../tools/base.cjs');
var array_cjs = require('../internals/helpers/array.cjs');
var zod = require('zod');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function findProviderDef(value) {
  return Object.values(constants_cjs.BackendProviders).find((p) => p.name === value || p.module === value || p.aliases.includes(value)) ?? null;
}
__name(findProviderDef, "findProviderDef");
function parseModel(name) {
  if (!name) {
    throw new errors_cjs.ValueError("Neither 'provider' nor 'provider:model' was specified.");
  }
  const [providerId, ...rest] = name.split(":");
  const modelId = rest.join(":");
  const providerDef = findProviderDef(providerId);
  if (!providerDef) {
    throw new errors_cjs.ValueError("Model does not contain provider name!");
  }
  return {
    providerId,
    modelId,
    providerDef
  };
}
__name(parseModel, "parseModel");
async function loadModel(name, type) {
  const { providerDef } = parseModel(name);
  const module = await import(`beeai-framework/adapters/${providerDef.module}/backend/${type}`);
  return module[`${providerDef.name}${remeda.capitalize(type)}Model`];
}
__name(loadModel, "loadModel");
async function generateToolUnionSchema(tools) {
  if (remeda.isEmpty(tools)) {
    throw new errors_cjs.ValueError("No tools provided!");
  }
  const schemas = await Promise.all(tools.map(async (tool) => zod.z.object({
    name: zod.z.literal(tool.name),
    parameters: await tool.inputSchema()
  })));
  return array_cjs.hasMinLength(schemas, 2) ? zod.z.discriminatedUnion("name", schemas) : schemas[0];
}
__name(generateToolUnionSchema, "generateToolUnionSchema");
function filterToolsByToolChoice(tools, value) {
  if (value === "none") {
    return [];
  }
  if (!value || value === "required" || value === "auto") {
    return tools;
  }
  if (value instanceof base_cjs.Tool) {
    const tool = tools.find((tool2) => tool2 === value);
    if (!tool) {
      throw new errors_cjs.ValueError(`Invalid tool choice provided! Tool was not found.`);
    }
    return [
      tool
    ];
  }
  throw new errors_cjs.ValueError(`Invalid tool choice provided (${value})!`);
}
__name(filterToolsByToolChoice, "filterToolsByToolChoice");

exports.filterToolsByToolChoice = filterToolsByToolChoice;
exports.generateToolUnionSchema = generateToolUnionSchema;
exports.loadModel = loadModel;
exports.parseModel = parseModel;
//# sourceMappingURL=utils.cjs.map
//# sourceMappingURL=utils.cjs.map