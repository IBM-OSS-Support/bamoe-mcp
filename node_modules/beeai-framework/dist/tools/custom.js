import { Tool, StringToolOutput, ToolError } from './base.js';
import { FrameworkError } from '../errors.js';
import { z } from 'zod';
import { validate } from '../internals/helpers/general.js';
import { callCodeInterpreter } from './python/python.js';
import { Emitter } from '../emitter/emitter.js';
import { merge } from 'remeda';
import { omitUndefined } from '../internals/helpers/object.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CustomToolCreateError extends FrameworkError {
  static {
    __name(this, "CustomToolCreateError");
  }
}
class CustomToolExecuteError extends FrameworkError {
  static {
    __name(this, "CustomToolExecuteError");
  }
}
const toolOptionsSchema = z.object({
  codeInterpreter: z.object({
    url: z.string().url(),
    connectionOptions: z.any().optional()
  }),
  sourceCode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.any()
}).passthrough();
class CustomTool extends Tool {
  static {
    __name(this, "CustomTool");
  }
  name;
  description;
  emitter = Emitter.root.child({
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
    validate(options, toolOptionsSchema);
    super(options);
    this.name = options.name;
    this.description = options.description;
  }
  async _run(input, options, run) {
    try {
      const result = await callCodeInterpreter({
        url: `${this.options.codeInterpreter.url}/v1/execute-custom-tool`,
        body: {
          tool_source_code: this.options.sourceCode,
          tool_input_json: JSON.stringify(input),
          env: merge(omitUndefined(this.options.env ?? {}), omitUndefined(options.env ?? {}))
        },
        signal: run.signal
      });
      if (result.stderr) {
        throw new CustomToolExecuteError(result.stderr);
      }
      return new StringToolOutput(result.tool_output_json);
    } catch (e) {
      if (e instanceof ToolError) {
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
      const result = await callCodeInterpreter({
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
      if (e instanceof ToolError) {
        throw new CustomToolCreateError(e.message, [
          e
        ]);
      } else {
        throw e;
      }
    }
  }
}

export { CustomTool, CustomToolCreateError, CustomToolExecuteError };
//# sourceMappingURL=custom.js.map
//# sourceMappingURL=custom.js.map