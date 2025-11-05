import { DefaultRunner } from './runner.js';
import { UnconstrainedMemory } from '../../../../memory/unconstrainedMemory.js';
import { UserMessage, AssistantMessage, Role } from '../../../../backend/message.js';
import { ReActAgentUserPrompt } from '../../prompts.js';
import { zip } from 'remeda';
import { RunContext } from '../../../../context.js';

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
      const memory3 = new UnconstrainedMemory();
      await memory3.addMany([
        new UserMessage("What is your name?"),
        new AssistantMessage("I am Bee")
      ]);
      return memory3;
    }, "createMemory");
    const createInstance = /* @__PURE__ */ __name(async (memory3, prompt2) => {
      const instance3 = new DefaultRunner({
        llm: expect.any(Function),
        memory: memory3,
        tools: [],
        templates: {}
      }, {}, new RunContext({}, {}));
      await instance3.init({
        prompt: prompt2
      });
      return instance3;
    }, "createInstance");
    const memory = await createMemory();
    const prompt = "What can you do for me?";
    const instance = await createInstance(memory, prompt);
    const memory2 = await createMemory();
    await memory2.add(new UserMessage(prompt, {
      createdAt: /* @__PURE__ */ new Date()
    }));
    const instance2 = await createInstance(memory2, null);
    expect(instance.memory.messages).toEqual(instance2.memory.messages);
  });
  it.each([
    ReActAgentUserPrompt.fork((old) => ({
      ...old,
      functions: {
        ...old.functions,
        formatMeta: /* @__PURE__ */ __name(() => "", "formatMeta")
      }
    })),
    ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: `{{input}}`
    })),
    ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: `User: {{input}}`
    })),
    ReActAgentUserPrompt.fork((old) => ({
      ...old,
      template: ``
    }))
  ])("Correctly formats user input", async (template) => {
    const memory = new UnconstrainedMemory();
    await memory.addMany([
      new UserMessage("What is your name?"),
      new AssistantMessage("Bee"),
      new UserMessage("Who are you?"),
      new AssistantMessage("I am a helpful assistant.")
    ]);
    const prompt = "What can you do for me?";
    const instance = new DefaultRunner({
      llm: expect.any(Function),
      memory,
      tools: [],
      templates: {
        user: template
      }
    }, {}, new RunContext({}, {}));
    await instance.init({
      prompt
    });
    for (const [a, b] of zip([
      ...memory.messages.filter((msg) => msg.role === Role.USER),
      new UserMessage(prompt)
    ], instance.memory.messages.filter((msg) => msg.role === Role.USER))) {
      expect(template.render({
        input: a.text,
        meta: void 0
      })).toStrictEqual(b.text);
    }
  });
});
//# sourceMappingURL=runner.spec.js.map
//# sourceMappingURL=runner.spec.js.map