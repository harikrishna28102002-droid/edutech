import prisma from "./prisma";
import { chunkMarkdownDocument } from "./chunking";

export type DatasetFormat = "ALPACA" | "CHATML" | "DPO" | "RETRIEVAL_TRIPLET";
export type DataSplit = "TRAIN" | "VALIDATION" | "TEST";

export interface GeneratedTrainingSample {
  id: string;
  split: DataSplit;
  format: DatasetFormat;
  instruction: string;
  inputContext?: string;
  outputResponse: string;
  rejectedResponse?: string;
  negativeContext?: string;
  sourceDocPath: string;
  sourceChunkIndex?: number;
  category: string;
  tags: string[];
}

export interface TrainingDatasetSummary {
  id: string;
  name: string;
  description: string;
  format: DatasetFormat;
  version: string;
  totalSamples: number;
  trainCount: number;
  valCount: number;
  testCount: number;
  sourceRepo: string;
  createdAt: string;
  samples: GeneratedTrainingSample[];
}

// In-memory fallback dataset storage if PostgreSQL is offline
let IN_MEMORY_DATASETS: TrainingDatasetSummary[] = [];

// Fallback seed doc pages for chunking if DB is starting or offline
const FALLBACK_CORE_PAGES = [
  {
    path: "tutorial/first-steps.md",
    title: "First Steps with FastAPI",
    category: "tutorial",
    content: `# First Steps

The simplest FastAPI file could look like this:

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
\`\`\`

## Run the Code
Run the live server with:
\`\`\`bash
$ uvicorn main:app --reload
\`\`\`

Open your browser at \`http://127.0.0.1:8000\`. You will see the JSON response:
\`\`\`json
{"message": "Hello World"}
\`\`\`

## Interactive API Docs
Now go to \`http://127.0.0.1:8000/docs\`. You will see the automatic interactive API documentation provided by Swagger UI!`,
  },
  {
    path: "tutorial/path-params.md",
    title: "Path Parameters & Type Validation",
    category: "tutorial",
    content: `# Path Parameters

You can declare path "parameters" or "variables" with the same syntax used by Python format strings:

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
\`\`\`

The value of the path parameter \`item_id\` will be passed to your function as the argument \`item_id\`.

### Data validation
If you run this example and open your browser at \`http://127.0.0.1:8000/items/foo\`, you will see a clean HTTP error:

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer"
    }
  ]
}
\`\`\``,
  },
  {
    path: "tutorial/dependencies/index.md",
    title: "FastAPI Dependency Injection System",
    category: "dependencies",
    content: `# Dependencies - First Steps

FastAPI has a very powerful but intuitive **Dependency Injection** system. It is designed to be very simple to use, and to make it very easy for any developer to integrate other components with FastAPI.

\`\`\`python
from typing import Annotated
from fastapi import Depends, FastAPI

app = FastAPI()

async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: Annotated[dict, Depends(common_parameters)]):
    return commons
\`\`\`

Whenever a new request arrives, FastAPI will call the dependency function, get the result, and assign it to the parameter in your path operation function.`,
  },
  {
    path: "deployment/docker.md",
    title: "FastAPI in Containers - Docker Orchestration",
    category: "deployment",
    content: `# FastAPI in Containers - Docker

When deploying FastAPI applications, a common approach is to build a **Linux container image** using Docker.

## Dockerfile Example
\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD ["fastapi", "run", "app/main.py", "--port", "80"]
\`\`\`

Containers provide reproducible environments, dependency isolation, and predictable cloud deployments.`,
  },
  {
    path: "tutorial/cors.md",
    title: "CORS (Cross-Origin Resource Sharing)",
    category: "middleware",
    content: `# CORS (Cross-Origin Resource Sharing)

CORS or "Cross-Origin Resource Sharing" refers to the situations when a frontend running in a browser has JavaScript code that communicates with a backend, and the backend is in a different "origin" than the frontend.

## Use CORSMiddleware
You can configure it in your FastAPI application using \`CORSMiddleware\`:

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\``,
  },
  {
    path: "tutorial/background-tasks.md",
    title: "Background Tasks",
    category: "background-tasks",
    content: `# Background Tasks

You can define background tasks to be run after returning a response. This is useful for operations that need to happen after a request, but where the client doesn't really have to be waiting for the operation to complete before receiving the response.

\`\`\`python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def write_notification(email: str, message: str = ""):
    with open("log.txt", mode="w") as email_file:
        content = f"notification for {email}: {message}"
        email_file.write(content)

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, message="some notification")
    return {"message": "Notification sent in the background"}
\`\`\``,
  },
];

// Helper to extract code blocks from raw markdown chunk
function extractCodeBlocks(text: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      lang: match[1] || "text",
      code: match[2].trim(),
    });
  }
  return blocks;
}

// Extract key technical concepts from chunk content
function extractConcepts(content: string): string[] {
  const concepts: string[] = [];
  if (content.includes("Depends") || content.includes("Annotated")) concepts.push("Dependency Injection");
  if (content.includes("BackgroundTasks")) concepts.push("Background Tasks");
  if (content.includes("CORSMiddleware") || content.includes("allow_origins")) concepts.push("CORS Configuration");
  if (content.includes("path parameter") || content.includes("{item_id}")) concepts.push("Path Parameter Validation");
  if (content.includes("Docker") || content.includes("FROM python")) concepts.push("Docker Containerization");
  if (content.includes("uvicorn") || content.includes("fastapi run")) concepts.push("ASGI Server Deployment");
  if (content.includes("status_code") || content.includes("422")) concepts.push("Error Handling & Validation");
  return concepts;
}

export interface RawChunkData {
  id: string;
  sourceDocPath: string;
  category: string;
  heading: string;
  headingPath: string;
  content: string;
  chunkIndex: number;
}

// Retrieve raw chunks from PostgreSQL or fallback pages
export async function getRealDocChunks(): Promise<RawChunkData[]> {
  try {
    const dbChunks = await prisma.docChunk.findMany({
      include: {
        page: {
          select: {
            title: true,
            path: true,
            category: true,
          },
        },
      },
      orderBy: [{ pageId: "asc" }, { chunkIndex: "asc" }],
    });

    if (dbChunks.length > 0) {
      return dbChunks.map((c) => ({
        id: c.id,
        sourceDocPath: c.page.path,
        category: c.page.category,
        heading: c.heading || c.page.title,
        headingPath: c.headingPath || c.page.title,
        content: c.content,
        chunkIndex: c.chunkIndex,
      }));
    }
  } catch (err) {
    // DB offline, fall through to fallback chunking
  }

  // Chunk fallback documentation pages
  const fallbackChunks: RawChunkData[] = [];
  for (const page of FALLBACK_CORE_PAGES) {
    const chunks = chunkMarkdownDocument(page.content, page.title, 300, 30);
    chunks.forEach((c) => {
      fallbackChunks.push({
        id: `chunk_${page.path.replace(/[^a-zA-Z0-9]/g, "_")}_${c.chunkIndex}`,
        sourceDocPath: page.path,
        category: page.category,
        heading: c.heading,
        headingPath: c.headingPath,
        content: c.content,
        chunkIndex: c.chunkIndex,
      });
    });
  }

  return fallbackChunks;
}

// Synthesize diverse training samples from a real doc chunk
export function synthesizeSamplesFromChunk(
  chunk: RawChunkData,
  allChunks: RawChunkData[],
  targetFormat: DatasetFormat
): GeneratedTrainingSample[] {
  const samples: GeneratedTrainingSample[] = [];
  const codeBlocks = extractCodeBlocks(chunk.content);
  const concepts = extractConcepts(chunk.content);
  const primaryCode = codeBlocks.find((b) => b.lang === "python" || b.lang === "dockerfile")?.code || "";

  // 1. Task / How-To Sample
  if (primaryCode) {
    const instruction = `How do I implement ${chunk.heading} in FastAPI? Provide a complete, modern working code example.`;
    const outputResponse = `Here is how to implement ${chunk.heading} in FastAPI according to the official documentation:\n\n\`\`\`python\n${primaryCode}\n\`\`\`\n\n### Key Concepts\n${chunk.content.replace(/```[\s\S]*?```/g, "").slice(0, 300).trim()}...`;
    
    // Hard negative for retrieval triplets (select chunk from different category)
    const negativeChunk = allChunks.find((c) => c.category !== chunk.category) || allChunks[0];

    // Rejected response for DPO (common anti-patterns: unannotated, sync blocking, or missing CORS)
    let rejectedResponse = "";
    if (chunk.content.includes("Depends")) {
      rejectedResponse = `In FastAPI you do:\n\`\`\`python\n@app.get('/items/')\ndef read_items(commons = Depends(common_parameters)):\n    return commons\n\`\`\`\n(Note: This uses older legacy syntax without Annotated and doesn't type-hint the returned dependency value).`;
    } else if (chunk.content.includes("Docker")) {
      rejectedResponse = `Use standard python image:\n\`\`\`dockerfile\nFROM python:latest\nCOPY . .\nRUN pip install -r requirements.txt\nCMD python app/main.py\n\`\`\`\n(Note: Uses python:latest instead of slim, lacks layer caching, and runs dev server without Uvicorn worker flags).`;
    } else if (chunk.content.includes("Path Parameters")) {
      rejectedResponse = `You can do:\n\`\`\`python\n@app.get('/items/{item_id}')\ndef get_item(item_id):\n    return {'item_id': int(item_id)}\n\`\`\`\n(Note: Lacks FastAPI type annotations, so automatic validation and Swagger schema generation will fail).`;
    } else {
      rejectedResponse = `You can configure it manually in your route handlers without middleware or type hints:\n\`\`\`python\n@app.get('/')\ndef handler():\n    return {'status': 'done'}\n\`\`\``;
    }

    samples.push({
      id: `sample_${chunk.id}_instruct`,
      split: "TRAIN", // Will be reassigned during split partitioning
      format: targetFormat,
      instruction,
      inputContext: `Reference documentation: ${chunk.sourceDocPath} (${chunk.headingPath})`,
      outputResponse,
      rejectedResponse,
      negativeContext: negativeChunk ? negativeChunk.content : undefined,
      sourceDocPath: chunk.sourceDocPath,
      sourceChunkIndex: chunk.chunkIndex,
      category: chunk.category,
      tags: [...concepts, "code-generation", "fastapi-official"],
    });
  }

  // 2. Conceptual Explanation / Architecture Sample
  const cleanDoc = chunk.content.replace(/```[\s\S]*?```/g, "").trim();
  if (cleanDoc.length > 80) {
    const instruction = `Explain the architecture and behavior of ${chunk.heading} in FastAPI.`;
    const outputResponse = `### ${chunk.headingPath}\n\n${cleanDoc}\n\nFastAPI automatically leverages standard Python type annotations and Starlette to deliver asynchronous concurrency and OpenAPI schemas.`;

    const negativeChunk = allChunks.find((c) => c.category !== chunk.category && c.id !== chunk.id) || allChunks[1];

    samples.push({
      id: `sample_${chunk.id}_concept`,
      split: "TRAIN",
      format: targetFormat,
      instruction,
      inputContext: `FastAPI Canonical Docs: ${chunk.sourceDocPath}`,
      outputResponse,
      rejectedResponse: `FastAPI handles ${chunk.heading} like any other web framework using Flask-like global request state.`,
      negativeContext: negativeChunk ? negativeChunk.content : undefined,
      sourceDocPath: chunk.sourceDocPath,
      sourceChunkIndex: chunk.chunkIndex,
      category: chunk.category,
      tags: [...concepts, "concepts", "architecture"],
    });
  }

  // 3. Error Analysis / Validation Troubleshooting Sample
  if (chunk.content.includes("validation") || chunk.content.includes("422") || chunk.content.includes("type")) {
    const instruction = `What causes an HTTP 422 Unprocessable Entity error in FastAPI, and how does the framework format the response?`;
    const outputResponse = `In FastAPI, an **HTTP 422 Unprocessable Entity** response occurs automatically when an incoming request fails type validation (e.g. passing a string to a path parameter annotated with \`int\`).\n\nThe response contains a JSON \`detail\` array with the exact field path, parsing error type, and developer-friendly message.`;

    samples.push({
      id: `sample_${chunk.id}_troubleshoot`,
      split: "TRAIN",
      format: targetFormat,
      instruction,
      inputContext: `Documentation Section: ${chunk.sourceDocPath}`,
      outputResponse,
      rejectedResponse: `HTTP 422 is a server internal 500 crash caused by missing try-catch blocks around your endpoint logic.`,
      negativeContext: allChunks[0]?.content,
      sourceDocPath: chunk.sourceDocPath,
      sourceChunkIndex: chunk.chunkIndex,
      category: chunk.category,
      tags: ["validation", "http-422", "troubleshooting", "error-handling"],
    });
  }

  return samples;
}

// Partition samples into Train, Validation, and Test splits
export function partitionSplits(
  samples: GeneratedTrainingSample[],
  ratios: { train: number; val: number; test: number } = { train: 0.8, val: 0.1, test: 0.1 }
): GeneratedTrainingSample[] {
  const total = samples.length;
  if (total === 0) return [];

  const trainCount = Math.floor(total * ratios.train);
  const valCount = Math.floor(total * ratios.val);

  return samples.map((sample, idx) => {
    let split: DataSplit = "TRAIN";
    if (idx >= trainCount && idx < trainCount + valCount) {
      split = "VALIDATION";
    } else if (idx >= trainCount + valCount) {
      split = "TEST";
    }
    return {
      ...sample,
      split,
    };
  });
}

// Convert a sample to Alpaca instruction-tuning JSON format
export function formatAsAlpaca(sample: GeneratedTrainingSample) {
  return {
    instruction: sample.instruction,
    input: sample.inputContext || "",
    output: sample.outputResponse,
    metadata: {
      id: sample.id,
      split: sample.split,
      category: sample.category,
      sourceDocPath: sample.sourceDocPath,
      tags: sample.tags,
    },
  };
}

// Convert a sample to ChatML / OpenAI Chat fine-tuning format
export function formatAsChatML(sample: GeneratedTrainingSample) {
  const systemPrompt =
    "You are an expert Python and FastAPI technical assistant. Provide accurate, modern, production-grade solutions based on official FastAPI documentation.";
  const userContent = sample.inputContext
    ? `${sample.instruction}\n\n[Context: ${sample.inputContext}]`
    : sample.instruction;

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
      { role: "assistant", content: sample.outputResponse },
    ],
    metadata: {
      id: sample.id,
      split: sample.split,
      category: sample.category,
      sourceDocPath: sample.sourceDocPath,
    },
  };
}

// Convert a sample to DPO / Preference alignment format
export function formatAsDPO(sample: GeneratedTrainingSample) {
  return {
    prompt: sample.instruction,
    chosen: sample.outputResponse,
    rejected: sample.rejectedResponse || "Incomplete answer without code or proper type annotations.",
    metadata: {
      id: sample.id,
      split: sample.split,
      category: sample.category,
      sourceDocPath: sample.sourceDocPath,
    },
  };
}

// Convert a sample to Information Retrieval Triplet format for bi-encoder embedding tuning
export function formatAsRetrievalTriplet(sample: GeneratedTrainingSample) {
  return {
    query: sample.instruction,
    positive: sample.outputResponse,
    negative: sample.negativeContext || "FastAPI is a Python web framework.",
    metadata: {
      id: sample.id,
      split: sample.split,
      category: sample.category,
      sourceDocPath: sample.sourceDocPath,
    },
  };
}

// Format dataset into target string representation (JSON or JSONL)
export function serializeDataset(
  samples: GeneratedTrainingSample[],
  format: DatasetFormat,
  outputType: "json" | "jsonl" = "jsonl"
): string {
  const formatted = samples.map((s) => {
    switch (format) {
      case "CHATML":
        return formatAsChatML(s);
      case "DPO":
        return formatAsDPO(s);
      case "RETRIEVAL_TRIPLET":
        return formatAsRetrievalTriplet(s);
      case "ALPACA":
      default:
        return formatAsAlpaca(s);
    }
  });

  if (outputType === "jsonl") {
    return formatted.map((item) => JSON.stringify(item)).join("\n");
  }

  return JSON.stringify(formatted, null, 2);
}

// Main execution pipeline: Generate a complete dataset from real doc chunks
export async function generateTrainingDataset(options: {
  name?: string;
  format?: DatasetFormat;
  trainRatio?: number;
  valRatio?: number;
  testRatio?: number;
  maxSamples?: number;
}): Promise<TrainingDatasetSummary> {
  const {
    name = `FastAPI Training Set (${options.format || "ALPACA"}) - v${Date.now().toString().slice(-4)}`,
    format = "ALPACA",
    trainRatio = 0.8,
    valRatio = 0.1,
    testRatio = 0.1,
    maxSamples = 50,
  } = options;

  // 1. Fetch real doc chunks
  const chunks = await getRealDocChunks();

  // 2. Synthesize raw training samples
  let rawSamples: GeneratedTrainingSample[] = [];
  for (const chunk of chunks) {
    const chunkSamples = synthesizeSamplesFromChunk(chunk, chunks, format);
    rawSamples.push(...chunkSamples);
  }

  // Deduplicate and cap to maxSamples
  if (rawSamples.length > maxSamples) {
    rawSamples = rawSamples.slice(0, maxSamples);
  }

  // 3. Partition into Train / Validation / Test splits
  const partitionedSamples = partitionSplits(rawSamples, {
    train: trainRatio,
    val: valRatio,
    test: testRatio,
  });

  const trainCount = partitionedSamples.filter((s) => s.split === "TRAIN").length;
  const valCount = partitionedSamples.filter((s) => s.split === "VALIDATION").length;
  const testCount = partitionedSamples.filter((s) => s.split === "TEST").length;

  const datasetId = `ds_${Date.now()}`;
  const summary: TrainingDatasetSummary = {
    id: datasetId,
    name,
    description: `Automated training dataset synthesized directly from ${chunks.length} official FastAPI documentation chunks for fine-tuning.`,
    format,
    version: "1.0.0",
    totalSamples: partitionedSamples.length,
    trainCount,
    valCount,
    testCount,
    sourceRepo: "fastapi/fastapi",
    createdAt: new Date().toISOString(),
    samples: partitionedSamples,
  };

  // 4. Try persisting to PostgreSQL
  try {
    const createdDataset = await prisma.trainingDataset.create({
      data: {
        name,
        description: summary.description,
        format,
        version: summary.version,
        totalSamples: summary.totalSamples,
        trainCount: summary.trainCount,
        valCount: summary.valCount,
        testCount: summary.testCount,
        sourceRepo: summary.sourceRepo,
      },
    });

    summary.id = createdDataset.id;

    for (const sample of partitionedSamples) {
      await prisma.trainingSample.create({
        data: {
          datasetId: createdDataset.id,
          split: sample.split,
          format: sample.format,
          instruction: sample.instruction,
          inputContext: sample.inputContext,
          outputResponse: sample.outputResponse,
          rejectedResponse: sample.rejectedResponse,
          negativeContext: sample.negativeContext,
          sourceDocPath: sample.sourceDocPath,
          sourceChunkIndex: sample.sourceChunkIndex,
          category: sample.category,
          tags: sample.tags,
        },
      });
    }
  } catch (err) {
    console.warn("Notice: PostgreSQL is offline. Training dataset saved to in-memory registry.");
  }

  // Save to in-memory registry
  IN_MEMORY_DATASETS.unshift(summary);

  return summary;
}

// Fetch all generated datasets (PostgreSQL with in-memory fallback)
export async function listTrainingDatasets(): Promise<TrainingDatasetSummary[]> {
  try {
    const dbDatasets = await prisma.trainingDataset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        samples: {
          take: 50,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (dbDatasets.length > 0) {
      return dbDatasets.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description || "",
        format: d.format as DatasetFormat,
        version: d.version,
        totalSamples: d.totalSamples,
        trainCount: d.trainCount,
        valCount: d.valCount,
        testCount: d.testCount,
        sourceRepo: d.sourceRepo,
        createdAt: d.createdAt.toISOString(),
        samples: d.samples.map((s) => ({
          id: s.id,
          split: s.split as DataSplit,
          format: s.format as DatasetFormat,
          instruction: s.instruction,
          inputContext: s.inputContext || undefined,
          outputResponse: s.outputResponse,
          rejectedResponse: s.rejectedResponse || undefined,
          negativeContext: s.negativeContext || undefined,
          sourceDocPath: s.sourceDocPath || "",
          sourceChunkIndex: s.sourceChunkIndex || undefined,
          category: s.category,
          tags: s.tags,
        })),
      }));
    }
  } catch (err) {
    // DB offline, fall through to in-memory datasets
  }

  // If in-memory is empty, auto-generate a baseline default dataset
  if (IN_MEMORY_DATASETS.length === 0) {
    await generateTrainingDataset({
      name: "FastAPI Instruction Tuning Benchmark (Base)",
      format: "ALPACA",
    });
  }

  return IN_MEMORY_DATASETS;
}
