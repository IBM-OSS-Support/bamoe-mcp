'use strict';

var base_cjs = require('../base.cjs');
var decoratorCache_cjs = require('../../cache/decoratorCache.cjs');
var jsClientRest = require('@qdrant/js-client-rest');
var uuid = require('uuid');
var zod = require('zod');
var emitter_cjs = require('../../emitter/emitter.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
var QdrantAction = /* @__PURE__ */ function(QdrantAction2) {
  QdrantAction2["ListCollections"] = "ListCollections";
  QdrantAction2["GetCollectionInfo"] = "GetCollectionInfo";
  QdrantAction2["Search"] = "Search";
  QdrantAction2["Insert"] = "Insert";
  QdrantAction2["Delete"] = "Delete";
  return QdrantAction2;
}({});
class QdrantDatabaseTool extends base_cjs.Tool {
  static {
    __name(this, "QdrantDatabaseTool");
  }
  name = "QdrantDatabaseTool";
  description = `Can query data from a Qdrant vector database. IMPORTANT: strictly follow this order of actions:
     1. ${"ListCollections"} - List all the Qdrant collections
     2. ${"GetCollectionInfo"} - Get information about a Qdrant collection
     3. ${"Insert"} - Insert data into a Qdrant collection
     3. ${"Search"} - Perform search on a Qdrant collection
     4. ${"Delete"} - Delete from a Qdrant collection`;
  inputSchema() {
    return zod.z.object({
      action: zod.z.nativeEnum(QdrantAction).describe(`The action to perform. ${"ListCollections"} lists all collections, ${"GetCollectionInfo"} fetches details for a specified collection, ${"Search"} executes a vector search, ${"Insert"} inserts new vectors, and ${"Delete"} removes vectors.`),
      collectionName: zod.z.string().optional().describe(`The name of the collection to query, required for ${"GetCollectionInfo"}, ${"Search"}, ${"Insert"}, and ${"Delete"}`),
      vector: zod.z.array(zod.z.number()).optional().describe(`The vector to search for, required for ${"Search"}.`),
      vectors: zod.z.array(zod.z.array(zod.z.number())).optional().describe(`The vectors to insert, required for ${"Insert"}.`),
      topK: zod.z.coerce.number().int().default(10).optional().describe(`The number of nearest neighbors to return.`),
      filter: zod.z.record(zod.z.string(), zod.z.any()).optional().describe(`Optional filter for ${"Search"}.`),
      payload: zod.z.array(zod.z.record(zod.z.string(), zod.z.any())).optional().describe(`Additional payload to insert with vectors.`),
      ids: zod.z.array(zod.z.string().or(zod.z.number())).optional().describe(`Array of IDs to delete or insert.`)
    });
  }
  emitter = emitter_cjs.Emitter.root.child({
    namespace: [
      "tool",
      "database",
      "qdrant"
    ],
    creator: this
  });
  validateInput(schema, input) {
    super.validateInput(schema, input);
    if (input.action != "ListCollections" && !input.collectionName) {
      throw new base_cjs.ToolInputValidationError(`Collection name is required for ${"GetCollectionInfo"}, ${"Search"}, ${"Insert"}, and ${"Delete"} actions.`);
    }
    if (input.action === "Search" && (!input.collectionName || !input.vector)) {
      throw new base_cjs.ToolInputValidationError(`Vector is required for ${"Search"} action.`);
    }
    if (input.action === "Insert" && (!input.collectionName || !input.vectors)) {
      throw new base_cjs.ToolInputValidationError(`Vectors are required for ${"Insert"} action.`);
    }
  }
  static {
    this.register();
  }
  async client() {
    return new jsClientRest.QdrantClient(this.options.connection);
  }
  async _run(input, _options) {
    switch (input.action) {
      case "ListCollections": {
        const collections = await this.listCollections();
        return new base_cjs.JSONToolOutput(collections);
      }
      case "GetCollectionInfo": {
        if (!input.collectionName) {
          throw new base_cjs.ToolError("A collection name is required for Qdrant GetCollectionInfo action");
        }
        const collectionInfo = await this.getCollectionInfo(input.collectionName);
        return new base_cjs.JSONToolOutput(collectionInfo);
      }
      case "Search": {
        if (!input.collectionName || !input.vector) {
          throw new base_cjs.ToolError("A collection name and vector are required for Qdrant Search action");
        }
        const searchResults = await this.search(input);
        return new base_cjs.JSONToolOutput(searchResults);
      }
      case "Insert": {
        if (!input.collectionName || !input.vectors) {
          throw new base_cjs.ToolError("A collection name and vectors are required for Qdrant Insert action");
        }
        const insertResults = await this.insert(input);
        return new base_cjs.JSONToolOutput(insertResults);
      }
      case "Delete": {
        if (!input.collectionName || !input.ids) {
          throw new base_cjs.ToolError("Collection name and ids are required for Qdrant Delete action");
        }
        const deleteResults = await this.delete(input);
        return new base_cjs.JSONToolOutput(deleteResults);
      }
      default: {
        throw new base_cjs.ToolError(`Invalid action specified: ${input.action}`);
      }
    }
  }
  async listCollections() {
    try {
      const client = await this.client();
      const response = await client.getCollections();
      return response.collections.map((collection) => collection.name);
    } catch (error) {
      throw new base_cjs.ToolError(`Failed to list collections from Qdrant: ${error}`);
    }
  }
  async getCollectionInfo(collectionName) {
    const client = await this.client();
    const response = await client.getCollection(collectionName);
    return response;
  }
  async insert(input) {
    const client = await this.client();
    const points = input.vectors.map((vector, index) => ({
      id: input?.ids?.[index] ?? uuid.v4(),
      vector,
      payload: input?.payload?.[index] || {}
    }));
    const response = await client.upsert(input.collectionName, {
      points
    });
    return response;
  }
  async search(input) {
    const client = await this.client();
    const searchParams = {
      query: input.vector,
      limit: input.topK || 10,
      with_payload: true,
      filter: input.filter
    };
    const response = await client.query(input.collectionName, searchParams);
    return response;
  }
  async delete(input) {
    const client = await this.client();
    const response = await client.delete(input.collectionName, {
      points: input.ids
    });
    return response;
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache(),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", []),
  _ts_metadata("design:returntype", Promise)
], QdrantDatabaseTool.prototype, "client", null);

exports.QdrantAction = QdrantAction;
exports.QdrantDatabaseTool = QdrantDatabaseTool;
//# sourceMappingURL=qdrant.cjs.map
//# sourceMappingURL=qdrant.cjs.map