
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  email: 'email',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  nodes: 'nodes',
  edges: 'edges',
  viewport: 'viewport',
  isPublished: 'isPublished',
  runCount: 'runCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowRunScalarFieldEnum = {
  id: 'id',
  workflowId: 'workflowId',
  userId: 'userId',
  status: 'status',
  scope: 'scope',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  duration: 'duration'
};

exports.Prisma.NodeRunScalarFieldEnum = {
  id: 'id',
  workflowRunId: 'workflowRunId',
  nodeId: 'nodeId',
  nodeType: 'nodeType',
  status: 'status',
  inputs: 'inputs',
  outputs: 'outputs',
  error: 'error',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  duration: 'duration'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.RunStatus = exports.$Enums.RunStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.RunScope = exports.$Enums.RunScope = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  SINGLE: 'SINGLE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Workflow: 'Workflow',
  WorkflowRun: 'WorkflowRun',
  NodeRun: 'NodeRun'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\91933\\Desktop\\Fullstack\\Projects\\PROJECTS\\NextFlow\\src\\generated\\client_v2",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\Users\\91933\\Desktop\\Fullstack\\Projects\\PROJECTS\\NextFlow\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../src/generated/client_v2\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id          String        @id\n  clerkId     String        @unique\n  email       String\n  name        String?\n  createdAt   DateTime      @default(now())\n  updatedAt   DateTime\n  workflows   Workflow[]\n  WorkflowRun WorkflowRun[]\n}\n\nmodel Workflow {\n  id          String        @id @default(cuid())\n  userId      String\n  name        String        @default(\"Untitled Workflow\")\n  description String?\n  nodes       Json\n  edges       Json\n  viewport    Json?\n  isPublished Boolean       @default(false)\n  runCount    Int           @default(0)\n  createdAt   DateTime      @default(now())\n  updatedAt   DateTime      @updatedAt\n  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n  runs        WorkflowRun[]\n\n  @@index([userId])\n}\n\nmodel WorkflowRun {\n  id          String    @id @default(cuid())\n  workflowId  String\n  userId      String\n  status      RunStatus @default(PENDING)\n  scope       RunScope  @default(FULL)\n  startedAt   DateTime  @default(now())\n  completedAt DateTime?\n  duration    Int?\n  nodeRuns    NodeRun[]\n  User        User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  workflow    Workflow  @relation(fields: [workflowId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([workflowId])\n}\n\nmodel NodeRun {\n  id            String      @id @default(cuid())\n  workflowRunId String\n  nodeId        String\n  nodeType      String\n  status        RunStatus   @default(PENDING)\n  inputs        Json?\n  outputs       Json?\n  error         String?\n  startedAt     DateTime    @default(now())\n  completedAt   DateTime?\n  duration      Int?\n  workflowRun   WorkflowRun @relation(fields: [workflowRunId], references: [id], onDelete: Cascade)\n\n  @@index([workflowRunId])\n}\n\nenum RunScope {\n  FULL\n  PARTIAL\n  SINGLE\n}\n\nenum RunStatus {\n  PENDING\n  RUNNING\n  SUCCESS\n  FAILED\n}\n",
  "inlineSchemaHash": "66258fad2c741f7061c403948373eb2259b672125834c127ed58434ca22d810d",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"clerkId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"workflows\",\"kind\":\"object\",\"type\":\"Workflow\",\"relationName\":\"UserToWorkflow\"},{\"name\":\"WorkflowRun\",\"kind\":\"object\",\"type\":\"WorkflowRun\",\"relationName\":\"UserToWorkflowRun\"}],\"dbName\":null},\"Workflow\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nodes\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"edges\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"viewport\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"isPublished\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"runCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UserToWorkflow\"},{\"name\":\"runs\",\"kind\":\"object\",\"type\":\"WorkflowRun\",\"relationName\":\"WorkflowToWorkflowRun\"}],\"dbName\":null},\"WorkflowRun\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"workflowId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"RunStatus\"},{\"name\":\"scope\",\"kind\":\"enum\",\"type\":\"RunScope\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"duration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"nodeRuns\",\"kind\":\"object\",\"type\":\"NodeRun\",\"relationName\":\"NodeRunToWorkflowRun\"},{\"name\":\"User\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UserToWorkflowRun\"},{\"name\":\"workflow\",\"kind\":\"object\",\"type\":\"Workflow\",\"relationName\":\"WorkflowToWorkflowRun\"}],\"dbName\":null},\"NodeRun\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"workflowRunId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nodeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nodeType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"RunStatus\"},{\"name\":\"inputs\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"outputs\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"error\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"duration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"workflowRun\",\"kind\":\"object\",\"type\":\"WorkflowRun\",\"relationName\":\"NodeRunToWorkflowRun\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

