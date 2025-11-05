import { join } from 'path';
import { StringToolOutput, Tool, ToolError } from './base.js';
import { Emitter } from '../emitter/emitter.js';
import { ValueError } from '../errors.js';
import { parse } from 'yaml';
import { toCamelCase, isEmpty, isTruthy, clone } from 'remeda';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAPIToolOutput extends StringToolOutput {
  static {
    __name(this, "OpenAPIToolOutput");
  }
  status;
  statusText;
  result;
  constructor(status, statusText, result = "") {
    super(), this.status = status, this.statusText = statusText, this.result = result;
    this.status = status;
    this.statusText = statusText;
    this.result = result ?? "";
  }
}
class OpenAPITool extends Tool {
  static {
    __name(this, "OpenAPITool");
  }
  name;
  description;
  url;
  openApiSchema;
  inputSchema() {
    const getReferencedObject = /* @__PURE__ */ __name((json, refPath) => {
      const pathSegments = refPath.split("/");
      let currentObject = json;
      for (const segment of pathSegments) {
        if (segment === "#") {
          continue;
        }
        currentObject = currentObject[segment];
      }
      return currentObject;
    }, "getReferencedObject");
    return {
      type: "object",
      required: [
        "path",
        "method"
      ],
      oneOf: Object.entries(this.openApiSchema.paths).flatMap(([path, pathSpec]) => Object.entries(pathSpec).map(([method, methodSpec]) => ({
        additionalProperties: false,
        properties: {
          path: {
            const: path,
            description: "Do not replace variables in path, instead of, put them to the parameters object."
          },
          method: {
            const: method,
            description: methodSpec.summary || methodSpec.description
          },
          ...methodSpec.requestBody?.content?.["application/json"]?.schema ? {
            body: methodSpec.requestBody?.content?.["application/json"]?.schema
          } : {},
          ...methodSpec.parameters ? {
            parameters: {
              type: "object",
              additionalProperties: false,
              required: methodSpec.parameters.filter((p) => p.required === true).map((p) => p.name),
              properties: methodSpec.parameters.reduce((acc, p) => !p.$ref ? {
                ...acc,
                [p.name]: {
                  ...p.schema,
                  description: p.name
                }
              } : {
                ...acc,
                [getReferencedObject(this.openApiSchema, p.$ref)?.name]: {
                  ...getReferencedObject(this.openApiSchema, p.$ref)?.schema,
                  description: getReferencedObject(this.openApiSchema, p.$ref)?.name
                }
              }, {})
            }
          } : {}
        }
      })))
    };
  }
  emitter;
  static {
    this.register();
  }
  constructor(options) {
    super(options);
    this.openApiSchema = parse(options.openApiSchema);
    this.url = this.options.url || this.openApiSchema.servers?.find((s) => s?.url)?.url;
    if (!this.url) {
      throw new ValueError("OpenAPI schema hasn't any server with url specified. Pass it manually.");
    }
    this.name = options.name ?? this.openApiSchema?.info?.title?.trim();
    if (!this.name) {
      throw new ValueError("OpenAPI schema hasn't 'name' specified. Pass it manually.");
    }
    this.emitter = Emitter.root.child({
      namespace: [
        "tool",
        "web",
        "openAPI",
        toCamelCase(this.name)
      ],
      creator: this
    });
    this.description = options.description || this.openApiSchema?.info?.description || "Performs REST API requests to the servers and retrieves the response. The server API interfaces are defined in OpenAPI schema. \nOnly use the OpenAPI tool if you need to communicate to external servers.";
    if (!this.description) {
      throw new ValueError("OpenAPI schema hasn't 'description' specified. Pass it manually.");
    }
  }
  async _run(input, _options, run) {
    let path = input.path || "";
    const url = new URL(this.url);
    Object.keys(input.parameters ?? {}).forEach((key) => {
      const value = input.parameters[key];
      const newPath = path.replace(`{${key}}`, value);
      if (newPath == path) {
        url.searchParams.append(key, value);
      } else {
        path = newPath;
      }
    });
    url.pathname = join(url.pathname, path);
    const options = {
      ...this.options.fetchOptions,
      signal: AbortSignal.any([
        run.signal,
        this.options.fetchOptions?.signal
      ].filter(isTruthy)),
      body: !isEmpty(input.body) ? input.body : void 0,
      method: input.method.toLowerCase(),
      headers: {
        Accept: "application/json",
        ...this.options.fetchOptions?.headers
      }
    };
    await run.emitter.emit("beforeFetch", {
      options,
      url
    });
    try {
      const response = await fetch(url.toString(), options);
      const text = await response.text();
      const output = new OpenAPIToolOutput(response.status, response.statusText, text);
      await run.emitter.emit("afterFetch", {
        data: output,
        url
      });
      return output;
    } catch (err) {
      throw new ToolError(`Request to ${url} has failed.`, [
        err
      ]);
    }
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      openApiSchema: clone(this.openApiSchema),
      name: this.name,
      description: this.description,
      url: this.url
    };
  }
}

export { OpenAPITool, OpenAPIToolOutput };
//# sourceMappingURL=openapi.js.map
//# sourceMappingURL=openapi.js.map