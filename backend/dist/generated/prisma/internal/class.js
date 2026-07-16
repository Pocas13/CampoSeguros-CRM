"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.8.0",
    "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id            Int            @id @default(autoincrement())\n  email         String         @unique\n  name          String?\n  password      String\n  refreshTokens RefreshToken[]\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n}\n\nmodel RefreshToken {\n  id        Int      @id @default(autoincrement())\n  token     String   @unique\n  user      User     @relation(fields: [userId], references: [id])\n  userId    Int\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshTokens\",\"kind\":\"object\",\"type\":\"RefreshToken\",\"relationName\":\"RefreshTokenToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"RefreshToken\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"RefreshTokenToUser\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"user\",\"refreshTokens\",\"_count\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_avg\",\"_sum\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"RefreshToken.findUnique\",\"RefreshToken.findUniqueOrThrow\",\"RefreshToken.findFirst\",\"RefreshToken.findFirstOrThrow\",\"RefreshToken.findMany\",\"RefreshToken.createOne\",\"RefreshToken.createMany\",\"RefreshToken.createManyAndReturn\",\"RefreshToken.updateOne\",\"RefreshToken.updateMany\",\"RefreshToken.updateManyAndReturn\",\"RefreshToken.upsertOne\",\"RefreshToken.deleteOne\",\"RefreshToken.deleteMany\",\"RefreshToken.groupBy\",\"RefreshToken.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"token\",\"userId\",\"expiresAt\",\"createdAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"email\",\"name\",\"password\",\"updatedAt\",\"every\",\"some\",\"none\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
    graph: "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_ACAZAAA6ACAaAAA6ACAbAAA6ACA2AgAAAAE3AgAAAAQ4AgAAAAQ5AgAAAAE6AgAAAAE7AgAAAAE8AgAAAAE9AgA-ACEINggAAAABNwgAAAAEOAgAAAAEOQgAAAABOggAAAABOwgAAAABPAgAAAABPQgAPwAhCS4AAEAAMC8AABwAEDAAAEAAMDECADYAITVAADgAIUEBADcAIUIBAEEAIUMBADcAIURAADgAIQ4FAABDACAaAABEACAbAABEACA2AQAAAAE3AQAAAAU4AQAAAAU5AQAAAAE6AQAAAAE7AQAAAAE8AQAAAAE9AQBCACE-AQAAAAE_AQAAAAFAAQAAAAEOBQAAQwAgGgAARAAgGwAARAAgNgEAAAABNwEAAAAFOAEAAAAFOQEAAAABOgEAAAABOwEAAAABPAEAAAABPQEAQgAhPgEAAAABPwEAAAABQAEAAAABCDYCAAAAATcCAAAABTgCAAAABTkCAAAAAToCAAAAATsCAAAAATwCAAAAAT0CAEMAIQs2AQAAAAE3AQAAAAU4AQAAAAU5AQAAAAE6AQAAAAE7AQAAAAE8AQAAAAE9AQBEACE-AQAAAAE_AQAAAAFAAQAAAAEKBAAASgAgLgAARQAwLwAACQAQMAAARQAwMQIARgAhNUAASQAhQQEARwAhQgEASAAhQwEARwAhREAASQAhCDYCAAAAATcCAAAABDgCAAAABDkCAAAAAToCAAAAATsCAAAAATwCAAAAAT0CADoAIQs2AQAAAAE3AQAAAAQ4AQAAAAQ5AQAAAAE6AQAAAAE7AQAAAAE8AQAAAAE9AQA9ACE-AQAAAAE_AQAAAAFAAQAAAAELNgEAAAABNwEAAAAFOAEAAAAFOQEAAAABOgEAAAABOwEAAAABPAEAAAABPQEARAAhPgEAAAABPwEAAAABQAEAAAABCDZAAAAAATdAAAAABDhAAAAABDlAAAAAATpAAAAAATtAAAAAATxAAAAAAT1AADsAIQNFAAADACBGAAADACBHAAADACAJAwAATAAgLgAASwAwLwAAAwAQMAAASwAwMQIARgAhMgEARwAhMwIARgAhNEAASQAhNUAASQAhDAQAAEoAIC4AAEUAMC8AAAkAEDAAAEUAMDECAEYAITVAAEkAIUEBAEcAIUIBAEgAIUMBAEcAIURAAEkAIUgAAAkAIEkAAAkAIAAAAAAAAU0BAAAAAQFNQAAAAAEFTQIAAAABUwIAAAABVAIAAAABVQIAAAABVgIAAAABBRIAAG8AIBMAAHIAIEoAAHAAIEsAAHEAIFAAAAEAIAMSAABvACBKAABwACBQAAABACAAAAAAAAABTQEAAAABCxIAAF8AMBMAAGQAMEoAAGAAMEsAAGEAMEwAAGIAIE0AAGMAME4AAGMAME8AAGMAMFAAAGMAMFEAAGUAMFIAAGYAMAQxAgAAAAEyAQAAAAE0QAAAAAE1QAAAAAECAAAABQAgEgAAagAgAwAAAAUAIBIAAGoAIBMAAGkAIAELAABuADAJAwAATAAgLgAASwAwLwAAAwAQMAAASwAwMQIAAAABMgEAAAABMwIARgAhNEAASQAhNUAASQAhAgAAAAUAIAsAAGkAIAIAAABnACALAABoACAILgAAZgAwLwAAZwAQMAAAZgAwMQIARgAhMgEARwAhMwIARgAhNEAASQAhNUAASQAhCC4AAGYAMC8AAGcAEDAAAGYAMDECAEYAITIBAEcAITMCAEYAITRAAEkAITVAAEkAIQQxAgBUACEyAQBSACE0QABTACE1QABTACEEMQIAVAAhMgEAUgAhNEAAUwAhNUAAUwAhBDECAAAAATIBAAAAATRAAAAAATVAAAAAAQQSAABfADBKAABgADBMAABiACBQAABjADAAAgQAAGwAIEIAAFcAIAQxAgAAAAEyAQAAAAE0QAAAAAE1QAAAAAEGMQIAAAABNUAAAAABQQEAAAABQgEAAAABQwEAAAABREAAAAABAgAAAAEAIBIAAG8AIAMAAAAJACASAABvACATAABzACAIAAAACQAgCwAAcwAgMQIAVAAhNUAAUwAhQQEAUgAhQgEAXQAhQwEAUgAhREAAUwAhBjECAFQAITVAAFMAIUEBAFIAIUIBAF0AIUMBAFIAIURAAFMAIQIEBgIFAAMBAwABAQQHAAAAAAUFAAgYAAkZAAoaAAsbAAwAAAAAAAUFAAgYAAkZAAoaAAsbAAwBAwABAQMAAQUFABEYABIZABMaABQbABUAAAAAAAUFABEYABIZABMaABQbABUGAgEHCAEICwEJDAEKDQEMDwENEQQOEgUPFAEQFgQRFwYUGAEVGQEWGgQcHQcdHg0eHwIfIAIgIQIhIgIiIwIjJQIkJwQlKA4mKgInLAQoLQ8pLgIqLwIrMAQsMxAtNBY"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map