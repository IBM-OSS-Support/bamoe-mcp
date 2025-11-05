import { AssistantMessage, SystemMessage } from '../backend/message.js';
import { BaseMemory } from './base.js';
import { PromptTemplate } from '../template.js';
import { shallowCopy } from '../serializer/utils.js';
import { z } from 'zod';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const SummarizeMemoryTemplate = new PromptTemplate({
  schema: z.object({
    summary: z.string()
  }),
  template: `Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary.

Current summary:
{{summary}}`
});
class SummarizeMemory extends BaseMemory {
  static {
    __name(this, "SummarizeMemory");
  }
  summary = "";
  template;
  llm;
  constructor(config) {
    super();
    this.template = config.template ?? SummarizeMemoryTemplate;
    this.llm = config.llm;
  }
  static {
    this.register();
  }
  get messages() {
    const currentSummary = this.summary;
    if (!currentSummary) {
      return [];
    }
    return [
      new AssistantMessage(currentSummary)
    ];
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  async delete(message) {
    return false;
  }
  async add(message, _index) {
    const response = await this.llm.create({
      messages: [
        new SystemMessage(this.template.render({
          summary: this.summary
        })),
        new AssistantMessage(`New lines of conversation:
${message.role}: ${message.text}

New summary:
`)
      ]
    });
    this.summary = response.getTextContent();
  }
  reset() {
    this.summary = "";
  }
  createSnapshot() {
    return {
      summary: this.summary,
      template: this.template,
      llm: this.llm,
      messages: shallowCopy(this.messages)
    };
  }
  loadSnapshot(state) {
    Object.assign(this, state);
  }
}

export { SummarizeMemory, SummarizeMemoryTemplate };
//# sourceMappingURL=summarizeMemory.js.map
//# sourceMappingURL=summarizeMemory.js.map