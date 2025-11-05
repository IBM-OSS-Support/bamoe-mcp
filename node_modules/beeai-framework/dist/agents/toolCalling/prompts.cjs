'use strict';

var template_cjs = require('../../template.cjs');
var zod = require('zod');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const ToolCallingAgentSystemPrompt = new template_cjs.PromptTemplate({
  schema: zod.z.object({
    role: zod.z.string(),
    instructions: zod.z.string().optional()
  }),
  functions: {
    formatDate: /* @__PURE__ */ __name(function() {
      return (/* @__PURE__ */ new Date()).toISOString();
    }, "formatDate")
  },
  defaults: {
    role: "A helpful AI assistant",
    instructions: ""
  },
  template: `Assume the role of {{role}}.
{{#instructions}}

Your instructions are:
{{.}}
{{/instructions}}

When the user sends a message, figure out a solution and provide a final answer to the user by calling the 'final_answer' tool.
Before you call the 'final_answer' tool, ensure that you have gathered sufficient evidence to support the final answer.

# Best practices
- Use markdown syntax to format code snippets, links, JSON, tables, images, and files.
- If the provided task is unclear, ask the user for clarification.
- Do not refer to tools or tool outputs by name when responding.
- Do not call the same tool twice with the similar inputs.

# Date and Time
The current date and time is: {{formatDate}}
You do not need a tool to get the current Date and Time. Use the information available here.
`
});
const ToolCallingAgentTaskPrompt = new template_cjs.PromptTemplate({
  schema: zod.z.object({
    prompt: zod.z.string(),
    context: zod.z.string().optional(),
    expectedOutput: zod.z.string().optional()
  }),
  template: `{{#context}}This is the context that you are working with:
{{.}}

{{/context}}
{{#expectedOutput}}
This is the expected criteria for your output:
{{.}}

{{/expectedOutput}}
Your task: {{prompt}}
`
});

exports.ToolCallingAgentSystemPrompt = ToolCallingAgentSystemPrompt;
exports.ToolCallingAgentTaskPrompt = ToolCallingAgentTaskPrompt;
//# sourceMappingURL=prompts.cjs.map
//# sourceMappingURL=prompts.cjs.map