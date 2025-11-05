import { Tool, ToolError } from '../base.js';
import { z } from 'zod';
import { unique, map, pipe, uniqueBy, filter, isIncludedIn } from 'remeda';
import { PythonToolOutput } from './output.js';
import { ValidationError } from 'ajv';
import { hasMinLength } from '../../internals/helpers/array.js';
import { Emitter } from '../../emitter/emitter.js';
import { shallowCopy } from '../../serializer/utils.js';
import { UserMessage } from '../../backend/message.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PythonTool extends Tool {
  static {
    __name(this, "PythonTool");
  }
  name = "Python";
  description = [
    "Run Python and/or shell code and return the console output. Use for isolated calculations, computations, data or file manipulation but still prefer assistant's capabilities (IMPORTANT: Do not use for text analysis or summarization).",
    "Files provided by the user, or created in a previous run, will be accessible if and only if they are specified in the input. It is necessary to always print() results.",
    "The following shell commands are available:",
    "Use ffmpeg to convert videos.",
    "Use yt-dlp to download videos, and unless specified otherwise use `-S vcodec:h264,res,acodec:m4a` for video and `-x --audio-format mp3` for audio-only.",
    "Use pandoc to convert documents between formats (like MD, DOC, DOCX, PDF) -- and don't forget that you can create PDFs by writing markdown and then converting.",
    "In Python, the following modules are available:",
    "Use numpy, pandas, scipy and sympy for working with data.",
    "Use matplotlib to plot charts.",
    "Use pillow (import PIL) to create and manipulate images.",
    "Use moviepy for complex manipulations with videos.",
    "Use PyPDF2, pikepdf, or fitz to manipulate PDFs.",
    "Use pdf2image to convert PDF to images.",
    "Other Python libraries are also available -- however, prefer using the ones above.",
    "Prefer using qualified imports -- `import library; library.thing()` instead of `import thing from library`.",
    "Do not attempt to install libraries manually -- it will not work.",
    "Each invocation of Python runs in a completely fresh VM -- it will not remember anything from before.",
    "Do not use this tool multiple times in a row, always write the full code you want to run in a single invocation."
  ].join(" ");
  storage;
  files = [];
  emitter = Emitter.root.child({
    namespace: [
      "tool",
      "python"
    ],
    creator: this
  });
  async inputSchema() {
    this.files = await this.storage.list();
    const fileNames = unique(map(this.files, ({ filename }) => filename));
    return z.object({
      language: z.enum([
        "python",
        "shell"
      ]).describe("Use shell for ffmpeg, pandoc, yt-dlp"),
      code: z.string().describe("full source code file that will be executed"),
      ...hasMinLength(fileNames, 1) ? {
        inputFiles: z.array(z.enum(fileNames)).describe("To access an existing file, you must specify it; otherwise, the file will not be accessible. IMPORTANT: If the file is not provided in the input, it will not be accessible.")
      } : {}
    });
  }
  preprocess;
  constructor(options) {
    super(options);
    if (!options.codeInterpreter.url) {
      throw new ValidationError([
        {
          message: "Property must be a valid URL!",
          data: options,
          propertyName: "codeInterpreter.url"
        }
      ]);
    }
    this.preprocess = options.preprocess;
    this.storage = options.storage;
  }
  static {
    this.register();
  }
  async _run(input, _options, run) {
    const inputFiles = await pipe(this.files ?? await this.storage.list(), uniqueBy((f) => f.filename), filter((file) => isIncludedIn(file.filename, input.inputFiles ?? [])), (files) => this.storage.upload(files));
    const getSourceCode = /* @__PURE__ */ __name(async () => {
      if (this.preprocess) {
        const { llm, promptTemplate } = this.preprocess;
        const response = await llm.create({
          messages: [
            new UserMessage(promptTemplate.render({
              input: input.code
            }))
          ],
          abortSignal: run.signal
        });
        return response.getTextContent().trim();
      }
      return input.code;
    }, "getSourceCode");
    const prefix = "/workspace/";
    const result = await callCodeInterpreter({
      url: `${this.options.codeInterpreter.url}/v1/execute`,
      body: {
        source_code: await getSourceCode(),
        files: Object.fromEntries(inputFiles.map((file) => [
          `${prefix}${file.filename}`,
          file.pythonId
        ]))
      },
      signal: run.signal
    });
    const filesOutput = await this.storage.download(Object.entries(result.files).filter(([path, _]) => path.startsWith(prefix)).map(([path, pythonId]) => ({
      path,
      pythonId: String(pythonId)
    })).map((file) => ({
      filename: file.path.slice(prefix.length),
      pythonId: file.pythonId
    })).filter((file) => inputFiles.every((input2) => input2.filename !== file.filename || input2.pythonId !== file.pythonId)));
    return new PythonToolOutput(result.stdout, result.stderr, result.exit_code, filesOutput);
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      files: shallowCopy(this.files),
      storage: this.storage,
      preprocess: this.preprocess
    };
  }
  loadSnapshot(snapshot) {
    super.loadSnapshot(snapshot);
  }
}
async function callCodeInterpreter({ url, body, signal }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    signal
  }).catch((error) => {
    if (error.cause.name == "HTTPParserError") {
      throw new ToolError("Request to code interpreter has failed -- ensure that CODE_INTERPRETER_URL points to the new HTTP endpoint (default port: 50081).", [
        error
      ]);
    } else {
      throw new ToolError("Request to code interpreter has failed.", [
        error
      ]);
    }
  });
  if (!response?.ok && response.status > 400) {
    throw new ToolError(`Request to code interpreter has failed with HTTP status code ${response.status}.`, [
      new Error(await response.text())
    ]);
  }
  return await response.json();
}
__name(callCodeInterpreter, "callCodeInterpreter");

export { PythonTool, callCodeInterpreter };
//# sourceMappingURL=python.js.map
//# sourceMappingURL=python.js.map