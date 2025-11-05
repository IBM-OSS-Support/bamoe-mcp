'use strict';

var base_cjs = require('./base.cjs');
var errors_cjs = require('../errors.cjs');
var zod = require('zod');
var general_cjs = require('../internals/helpers/general.cjs');
var python_cjs = require('./python/python.cjs');
var emitter_cjs = require('../emitter/emitter.cjs');
var remeda = require('remeda');
var object_cjs = require('../internals/helpers/object.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CustomToolCreateError extends errors_cjs.FrameworkError {
  static {
    __name(this, "CustomToolCreateError");
  }
}
class CustomToolExecuteError extends errors_cjs.FrameworkError {
  static {
    __name(this, "CustomToolExecuteError");
  }
}
const toolOptionsSchema = zod.z.object({
  codeInterpreter: zod.z.object({
    url: zod.z.string().url(),
    connectionOptions: zod.z.any().optional()
  }),
  sourceCode: zod.z.string().min(1),
  name: zod.z.string().min(1),
  description: zod.z.string().min(1),
  inputSchema: zod.z.any()
}).passthrough();
class CustomTool extends base_cjs.Tool {
  static {
    __name(this, "CustomTool");
  }
  name;
  description;
  emitter = emitter_cjs.Emitter.root.child({
    namespace: [
      "tool",
      "custom"
    ],
    creator: this
  });
  inputSchema() {
    return this.options.inputSchema;
  }
  static {
    this.register();
  }
  constructor(options) {
    general_cjs.validate(options, toolOptionsSchema);
    super(options);
    this.name = options.name;
    this.description = options.description;
  }
  async _run(input, options, run) {
    try {
      const result = await python_cjs.callCodeInterpreter({
        url: `${this.options.codeInterpreter.url}/v1/execute-custom-tool`,
        body: {
          tool_source_code: this.options.sourceCode,
          tool_input_json: JSON.stringify(input),
          env: remeda.merge(object_cjs.omitUndefined(this.options.env ?? {}), object_cjs.omitUndefined(options.env ?? {}))
        },
        signal: run.signal
      });
      if (result.stderr) {
        throw new CustomToolExecuteError(result.stderr);
      }
      return new base_cjs.StringToolOutput(result.tool_output_json);
    } catch (e) {
      if (e instanceof base_cjs.ToolError) {
        throw new CustomToolExecuteError(e.message, [
          e
        ]);
      } else {
        throw e;
      }
    }
  }
  loadSnapshot(snapshot) {
    super.loadSnapshot(snapshot);
  }
  static async fromSourceCode({ env, ...codeInterpreter }, sourceCode) {
    try {
      const result = await python_cjs.callCodeInterpreter({
        url: `${codeInterpreter.url}/v1/parse-custom-tool`,
        body: {
          tool_source_code: sourceCode
        }
      });
      if (result.error_messages) {
        throw new CustomToolCreateError(result.error_messages.join("\n"));
      }
      return new CustomTool({
        codeInterpreter,
        sourceCode,
        name: result.tool_name,
        description: result.tool_description,
        inputSchema: JSON.parse(result.tool_input_schema_json),
        env
      });
    } catch (e) {
      if (e instanceof base_cjs.ToolError) {
        throw new CustomToolCreateError(e.message, [
          e
        ]);
      } else {
        throw e;
      }
    }
  }
}

exports.CustomTool = CustomTool;
exports.CustomToolCreateError = CustomToolCreateError;
exports.CustomToolExecuteError = CustomToolExecuteError;
//# sourceMappingURL=custom.cjs.map
//# sourceMappingURL=custom.cjs.map