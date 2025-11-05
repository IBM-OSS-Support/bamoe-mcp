import { ValueError } from '../errors.js';
import { BackendProviders } from './constants.js';
import { capitalize, isEmpty } from 'remeda';
import { Tool } from '../tools/base.js';
import { hasMinLength } from '../internals/helpers/array.js';
import { z } from 'zod';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function findProviderDef(value) {
  return Object.values(BackendProviders).find((p) => p.name === value || p.module === value || p.aliases.includes(value)) ?? null;
}
__name(findProviderDef, "findProviderDef");
function parseModel(name) {
  if (!name) {
    throw new ValueError("Neither 'provider' nor 'provider:model' was specified.");
  }
  const [providerId, ...rest] = name.split(":");
  const modelId = rest.join(":");
  const providerDef = findProviderDef(providerId);
  if (!providerDef) {
    throw new ValueError("Model does not contain provider name!");
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
  return module[`${providerDef.name}${capitalize(type)}Model`];
}
__name(loadModel, "loadModel");
async function generateToolUnionSchema(tools) {
  if (isEmpty(tools)) {
    throw new ValueError("No tools provided!");
  }
  const schemas = await Promise.all(tools.map(async (tool) => z.object({
    name: z.literal(tool.name),
    parameters: await tool.inputSchema()
  })));
  return hasMinLength(schemas, 2) ? z.discriminatedUnion("name", schemas) : schemas[0];
}
__name(generateToolUnionSchema, "generateToolUnionSchema");
function filterToolsByToolChoice(tools, value) {
  if (value === "none") {
    return [];
  }
  if (!value || value === "required" || value === "auto") {
    return tools;
  }
  if (value instanceof Tool) {
    const tool = tools.find((tool2) => tool2 === value);
    if (!tool) {
      throw new ValueError(`Invalid tool choice provided! Tool was not found.`);
    }
    return [
      tool
    ];
  }
  throw new ValueError(`Invalid tool choice provided (${value})!`);
}
__name(filterToolsByToolChoice, "filterToolsByToolChoice");

export { filterToolsByToolChoice, generateToolUnionSchema, loadModel, parseModel };
//# sourceMappingURL=utils.js.map
//# sourceMappingURL=utils.js.map