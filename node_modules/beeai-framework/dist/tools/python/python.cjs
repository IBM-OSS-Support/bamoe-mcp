'use strict';

var base_cjs = require('../base.cjs');
var zod = require('zod');
var remeda = require('remeda');
var output_cjs = require('./output.cjs');
var ajv = require('ajv');
var array_cjs = require('../../internals/helpers/array.cjs');
var emitter_cjs = require('../../emitter/emitter.cjs');
var utils_cjs = require('../../serializer/utils.cjs');
var message_cjs = require('../../backend/message.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PythonTool extends base_cjs.Tool {
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
  emitter = emitter_cjs.Emitter.root.child({
    namespace: [
      "tool",
      "python"
    ],
    creator: this
  });
  async inputSchema() {
    this.files = await this.storage.list();
    const fileNames = remeda.unique(remeda.map(this.files, ({ filename }) => filename));
    return zod.z.object({
      language: zod.z.enum([
        "python",
        "shell"
      ]).describe("Use shell for ffmpeg, pandoc, yt-dlp"),
      code: zod.z.string().describe("full source code file that will be executed"),
      ...array_cjs.hasMinLength(fileNames, 1) ? {
        inputFiles: zod.z.array(zod.z.enum(fileNames)).describe("To access an existing file, you must specify it; otherwise, the file will not be accessible. IMPORTANT: If the file is not provided in the input, it will not be accessible.")
      } : {}
    });
  }
  preprocess;
  constructor(options) {
    super(options);
    if (!options.codeInterpreter.url) {
      throw new ajv.ValidationError([
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
    const inputFiles = await remeda.pipe(this.files ?? await this.storage.list(), remeda.uniqueBy((f) => f.filename), remeda.filter((file) => remeda.isIncludedIn(file.filename, input.inputFiles ?? [])), (files) => this.storage.upload(files));
    const getSourceCode = /* @__PURE__ */ __name(async () => {
      if (this.preprocess) {
        const { llm, promptTemplate } = this.preprocess;
        const response = await llm.create({
          messages: [
            new message_cjs.UserMessage(promptTemplate.render({
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
    return new output_cjs.PythonToolOutput(result.stdout, result.stderr, result.exit_code, filesOutput);
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      files: utils_cjs.shallowCopy(this.files),
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
      throw new base_cjs.ToolError("Request to code interpreter has failed -- ensure that CODE_INTERPRETER_URL points to the new HTTP endpoint (default port: 50081).", [
        error
      ]);
    } else {
      throw new base_cjs.ToolError("Request to code interpreter has failed.", [
        error
      ]);
    }
  });
  if (!response?.ok && response.status > 400) {
    throw new base_cjs.ToolError(`Request to code interpreter has failed with HTTP status code ${response.status}.`, [
      new Error(await response.text())
    ]);
  }
  return await response.json();
}
__name(callCodeInterpreter, "callCodeInterpreter");

exports.PythonTool = PythonTool;
exports.callCodeInterpreter = callCodeInterpreter;
//# sourceMappingURL=python.cjs.map
//# sourceMappingURL=python.cjs.map