import { Tool, ToolInputValidationError, ToolError, JSONToolOutput } from '../base.js';
import { Cache } from '../../cache/decoratorCache.js';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 } from 'uuid';
import { z } from 'zod';
import { Emitter } from '../../emitter/emitter.js';

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
class QdrantDatabaseTool extends Tool {
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
    return z.object({
      action: z.nativeEnum(QdrantAction).describe(`The action to perform. ${"ListCollections"} lists all collections, ${"GetCollectionInfo"} fetches details for a specified collection, ${"Search"} executes a vector search, ${"Insert"} inserts new vectors, and ${"Delete"} removes vectors.`),
      collectionName: z.string().optional().describe(`The name of the collection to query, required for ${"GetCollectionInfo"}, ${"Search"}, ${"Insert"}, and ${"Delete"}`),
      vector: z.array(z.number()).optional().describe(`The vector to search for, required for ${"Search"}.`),
      vectors: z.array(z.array(z.number())).optional().describe(`The vectors to insert, required for ${"Insert"}.`),
      topK: z.coerce.number().int().default(10).optional().describe(`The number of nearest neighbors to return.`),
      filter: z.record(z.string(), z.any()).optional().describe(`Optional filter for ${"Search"}.`),
      payload: z.array(z.record(z.string(), z.any())).optional().describe(`Additional payload to insert with vectors.`),
      ids: z.array(z.string().or(z.number())).optional().describe(`Array of IDs to delete or insert.`)
    });
  }
  emitter = Emitter.root.child({
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
      throw new ToolInputValidationError(`Collection name is required for ${"GetCollectionInfo"}, ${"Search"}, ${"Insert"}, and ${"Delete"} actions.`);
    }
    if (input.action === "Search" && (!input.collectionName || !input.vector)) {
      throw new ToolInputValidationError(`Vector is required for ${"Search"} action.`);
    }
    if (input.action === "Insert" && (!input.collectionName || !input.vectors)) {
      throw new ToolInputValidationError(`Vectors are required for ${"Insert"} action.`);
    }
  }
  static {
    this.register();
  }
  async client() {
    return new QdrantClient(this.options.connection);
  }
  async _run(input, _options) {
    switch (input.action) {
      case "ListCollections": {
        const collections = await this.listCollections();
        return new JSONToolOutput(collections);
      }
      case "GetCollectionInfo": {
        if (!input.collectionName) {
          throw new ToolError("A collection name is required for Qdrant GetCollectionInfo action");
        }
        const collectionInfo = await this.getCollectionInfo(input.collectionName);
        return new JSONToolOutput(collectionInfo);
      }
      case "Search": {
        if (!input.collectionName || !input.vector) {
          throw new ToolError("A collection name and vector are required for Qdrant Search action");
        }
        const searchResults = await this.search(input);
        return new JSONToolOutput(searchResults);
      }
      case "Insert": {
        if (!input.collectionName || !input.vectors) {
          throw new ToolError("A collection name and vectors are required for Qdrant Insert action");
        }
        const insertResults = await this.insert(input);
        return new JSONToolOutput(insertResults);
      }
      case "Delete": {
        if (!input.collectionName || !input.ids) {
          throw new ToolError("Collection name and ids are required for Qdrant Delete action");
        }
        const deleteResults = await this.delete(input);
        return new JSONToolOutput(deleteResults);
      }
      default: {
        throw new ToolError(`Invalid action specified: ${input.action}`);
      }
    }
  }
  async listCollections() {
    try {
      const client = await this.client();
      const response = await client.getCollections();
      return response.collections.map((collection) => collection.name);
    } catch (error) {
      throw new ToolError(`Failed to list collections from Qdrant: ${error}`);
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
      id: input?.ids?.[index] ?? v4(),
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
  Cache(),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", []),
  _ts_metadata("design:returntype", Promise)
], QdrantDatabaseTool.prototype, "client", null);

export { QdrantAction, QdrantDatabaseTool };
//# sourceMappingURL=qdrant.js.map
//# sourceMappingURL=qdrant.js.map