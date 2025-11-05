import { FrameworkError, ValueError } from './errors.js';
import { clone, isPlainObject, pickBy, identity } from 'remeda';
import Mustache from 'mustache';
import { Serializable } from './internals/serializable.js';
import { toJsonSchema, createSchemaValidator } from './internals/helpers/schema.js';
import { getProp } from './internals/helpers/object.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PromptTemplateError extends FrameworkError {
  static {
    __name(this, "PromptTemplateError");
  }
  template;
  constructor(message, template, context) {
    super(message, [], {
      context
    });
    this.template = template;
  }
}
class ValidationPromptTemplateError extends PromptTemplateError {
  static {
    __name(this, "ValidationPromptTemplateError");
  }
}
class PromptTemplate extends Serializable {
  static {
    __name(this, "PromptTemplate");
  }
  config;
  static functions = {
    trim: /* @__PURE__ */ __name(() => (text, render) => {
      return render(text).replace(/(,\s*$)/g, "");
    }, "trim")
  };
  constructor(config) {
    super();
    this.config = {
      ...config,
      defaults: config.defaults ?? {},
      schema: toJsonSchema(config.schema),
      escape: Boolean(config.escape),
      customTags: config.customTags ?? [
        "{{",
        "}}"
      ],
      functions: {
        ...PromptTemplate.functions,
        ...config.functions
      }
    };
  }
  static {
    this.register();
  }
  validateInput(input) {
    const validator = createSchemaValidator(this.config.schema, {
      coerceTypes: false
    });
    const success = validator(input);
    if (!success) {
      throw new ValidationPromptTemplateError(`Template cannot be rendered because input does not adhere to the template schema.`, this, {
        errors: validator.errors
      });
    }
  }
  fork(customizer) {
    const config = clone(this.config);
    const newConfig = customizer?.(config) ?? config;
    if (!isPlainObject(newConfig)) {
      throw new ValueError("Return type from customizer must be a config or nothing.");
    }
    return new PromptTemplate(newConfig);
  }
  render(input) {
    const updatedInput = {
      ...input
    };
    Object.assign(updatedInput, pickBy(this.config.defaults, (_, k) => getProp(updatedInput, [
      k
    ]) === void 0));
    this.validateInput(updatedInput);
    const view = {
      ...this.config.functions,
      ...updatedInput
    };
    const output = Mustache.render(this.config.template, view, {}, {
      tags: this.config.customTags,
      ...!this.config.escape && {
        escape: identity()
      }
    });
    if (output.match(/\[object (.+)]/)) {
      throw new ValidationPromptTemplateError("Rendered template contains incorrectly serialized value!", this, {
        output
      });
    }
    return output;
  }
  loadSnapshot(data) {
    this.config = data.config;
  }
  createSnapshot() {
    return {
      config: this.config
    };
  }
}

export { PromptTemplate, PromptTemplateError, ValidationPromptTemplateError };
//# sourceMappingURL=template.js.map
//# sourceMappingURL=template.js.map