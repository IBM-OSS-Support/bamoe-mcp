'use strict';

var runner_cjs = require('./runner.cjs');
var unconstrainedMemory_cjs = require('../../../../memory/unconstrainedMemory.cjs');
var message_cjs = require('../../../../backend/message.cjs');
var prompts_cjs = require('../../prompts.cjs');
var remeda = require('remeda');
var context_cjs = require('../../../../context.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
vi.mock("@/memory/tokenMemory.js", async () => {
  const { UnconstrainedMemory: UnconstrainedMemory2 } = await import('../../../../memory/unconstrainedMemory.js');
  let TokenMemory = class TokenMemory extends UnconstrainedMemory2 {
    static {
      __name(this, "TokenMemory");
    }
  };
  return {
    TokenMemory
  };
});
vi.mock("@/context.js");
describe("ReAct Agent Runner", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  it("Handles different prompt input source", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(/* @__PURE__ */ new Date("2024-09-10T19:51:46.954Z"));
    const createMemory = /* @__PURE__ */ __name(async () => {
      const memory3 = new unconstrainedMemory_cjs.UnconstrainedMemory();
      await memory3.addMany([
        new message_cjs.UserMessage("What is your name?"),
        new message_cjs.AssistantMessage("I am Bee")
      ]);
      return memory3;
    }, "createMemory");
    const createInstance = /* @__PURE__ */ __name(async (memory3, prompt2) => {
      const instance3 = new runner_cjs.DefaultRunner({
        llm: expect.any(Function),
        memory: memory3,
        tools: [],
        templates: {}
      }, {}, new context_cjs.RunContext({}, {}));
      await instance3.init({
        prompt: prompt2
      });
      return instance3;
    }, "createInstance");
    const memory = await createMemory();
    const prompt = "What can you do for me?";
    const instance = await createInstance(memory, prompt);
    const memory2 = await createMemory();
    await memory2.add(new message_cjs.UserMessage(prompt, {
      createdAt: /* @__PURE__ */ new Date()
    }));
    const instance2 = await createInstance(memory2, null);
    expect(instance.memory.messages).toEqual(instance2.memory.messages);
  });
  it.each([
    prompts_cjs.ReActAgentUserPrompt.fork((old) => ({
      ...old,
      functions: {
        ...old.functions,
        formatMeta: /* @__PURE__ */ __name(() => "", "formatMeta")
      }
    })),
    prompts_cjs.ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: `{{input}}`
    })),
    prompts_cjs.ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: `User: {{input}}`
    })),
    prompts_cjs.ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: ``
    }))
  ])("Correctly formats user input", async (template) => {
    const memory = new unconstrainedMemory_cjs.UnconstrainedMemory();
    await memory.addMany([
      new message_cjs.UserMessage("What is your name?"),
      new message_cjs.AssistantMessage("Bee"),
      new message_cjs.UserMessage("Who are you?"),
      new message_cjs.AssistantMessage("I am a helpful assistant.")
    ]);
    const prompt = "What can you do for me?";
    const instance = new runner_cjs.DefaultRunner({
      llm: expect.any(Function),
      memory,
      tools: [],
      templates: {
        user: template
      }
    }, {}, new context_cjs.RunContext({}, {}));
    await instance.init({
      prompt
    });
    for (const [a, b] of remeda.zip([
      ...memory.messages.filter((msg) => msg.role === message_cjs.Role.USER),
      new message_cjs.UserMessage(prompt)
    ], instance.memory.messages.filter((msg) => msg.role === message_cjs.Role.USER))) {
      expect(template.render({
        input: a.text,
        meta: void 0
      })).toStrictEqual(b.text);
    }
  });
});
//# sourceMappingURL=runner.spec.cjs.map
//# sourceMappingURL=runner.spec.cjs.map