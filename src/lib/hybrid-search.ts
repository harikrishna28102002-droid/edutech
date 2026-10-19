import prisma from "./prisma";
import { generateEmbedding, cosineSimilarity } from "./embeddings";
import { BM25Index } from "./bm25";
import { embedAllDocPages } from "./embed-service";

export interface SearchResultChunk {
  chunkId: string;
  pageId: string;
  docTitle: string;
  docSlug: string;
  docPath: string;
  category: string;
  githubUrl: string;
  heading: string | null;
  headingPath: string | null;
  content: string;
  snippet: string;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
  finalScore: number;
  denseRank: number;
  sparseRank: number;
  matchHighlights: string[];
}

export interface HybridSearchResponse {
  query: string;
  mode: "hybrid" | "vector" | "keyword";
  isReranked: boolean;
  totalCandidates: number;
  returnedCount: number;
  timings: {
    denseMs: number;
    sparseMs: number;
    fusionMs: number;
    rerankMs: number;
    totalMs: number;
  };
  results: SearchResultChunk[];
}

// Generate highlighted contextual snippet around query keywords
function generateSnippet(content: string, query: string, maxLength: number = 260): string {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const cleanContent = content.replace(/^#+.*$/gm, "").replace(/```[\s\S]*?```/g, " [code snippet] ");
  const lower = cleanContent.toLowerCase();

  let bestIndex = 0;
  for (const term of queryTerms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      bestIndex = Math.max(0, idx - 40);
      break;
    }
  }

  let snippet = cleanContent.slice(bestIndex, bestIndex + maxLength).trim();
  if (bestIndex > 0) snippet = "..." + snippet;
  if (bestIndex + maxLength < cleanContent.length) snippet += "...";

  return snippet;
}

// Extract matching words for UI badges
function findMatchHighlights(content: string, query: string): string[] {
  const terms = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const matches: string[] = [];
  const lower = content.toLowerCase();

  for (const term of terms) {
    if (lower.includes(term) && !matches.includes(term)) {
      matches.push(term);
    }
  }

  return matches;
}

// Fallback memory chunks if database has no chunks yet
const FALLBACK_MEMORY_CHUNKS = [
  {
    id: "mem-1",
    pageId: "fastapi-first-steps",
    docTitle: "First Steps with FastAPI",
    docSlug: "tutorial-first-steps",
    docPath: "tutorial/first-steps.md",
    category: "tutorial",
    githubUrl: "https://github.com/tiangolo/fastapi/blob/master/docs/en/docs/tutorial/first-steps.md",
    heading: "Creating a FastAPI Application",
    headingPath: "FastAPI > Tutorial > First Steps",
    content: "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/')\nasync def root():\n    return {'message': 'Hello World'}\n\nRun the live server with: uvicorn main:app --reload",
  },
  {
    id: "mem-2",
    pageId: "fastapi-path-params",
    docTitle: "Path Parameters & Type Validation",
    docSlug: "tutorial-path-params",
    docPath: "tutorial/path-params.md",
    category: "tutorial",
    githubUrl: "https://github.com/tiangolo/fastapi/blob/master/docs/en/docs/tutorial/path-params.md",
    heading: "Path Parameters with Python Types",
    headingPath: "FastAPI > Tutorial > Path Parameters",
    content: "You can declare path parameters or variables with Python standard type hints:\n\n@app.get('/items/{item_id}')\nasync def read_item(item_id: int):\n    return {'item_id': item_id}\n\nFastAPI automatically validates data types and returns HTTP 422 if invalid.",
  },
  {
    id: "mem-3",
    pageId: "fastapi-dependencies",
    docTitle: "FastAPI Dependency Injection System",
    docSlug: "tutorial-dependencies",
    docPath: "tutorial/dependencies/index.md",
    category: "dependencies",
    githubUrl: "https://github.com/tiangolo/fastapi/blob/master/docs/en/docs/tutorial/dependencies/index.md",
    heading: "Dependency Injection with Depends",
    headingPath: "FastAPI > Dependencies > First Steps",
    content: "FastAPI provides an intuitive Dependency Injection system using Depends.\n\nfrom typing import Annotated\nfrom fastapi import Depends, FastAPI\n\nasync def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):\n    return {'q': q, 'skip': skip, 'limit': limit}\n\n@app.get('/items/')\nasync def read_items(commons: Annotated[dict, Depends(common_parameters)]):\n    return commons",
  },
  {
    id: "mem-4",
    pageId: "fastapi-docker",
    docTitle: "FastAPI in Containers - Docker",
    docSlug: "deployment-docker",
    docPath: "deployment/docker.md",
    category: "deployment",
    githubUrl: "https://github.com/tiangolo/fastapi/blob/master/docs/en/docs/deployment/docker.md",
    heading: "Building Production Docker Container",
    headingPath: "FastAPI > Deployment > Docker",
    content: "Build a production Linux container image using Docker:\n\nFROM python:3.11-slim\nWORKDIR /code\nCOPY ./requirements.txt /code/requirements.txt\nRUN pip install --no-cache-dir --upgrade -r /code/requirements.txt\nCOPY ./app /code/app\nCMD ['fastapi', 'run', 'app/main.py', '--port', '80']",
  },
];

export async function hybridSearch(options: {
  query: string;
  mode?: "hybrid" | "vector" | "keyword";
  limit?: number;
  rerank?: boolean;
}): Promise<HybridSearchResponse> {
  const { query, mode = "hybrid", limit = 10, rerank = true } = options;
  const startOverall = Date.now();

  let denseMs = 0;
  let sparseMs = 0;
  let fusionMs = 0;
  let rerankMs = 0;

  // 1. Fetch chunks from PostgreSQL database
  let chunks = await prisma.docChunk.findMany({
    include: {
      page: {
        select: {
          title: true,
          slug: true,
          path: true,
          category: true,
          githubUrl: true,
        },
      },
    },
  });

  // If no chunks exist, auto-index doc pages if they exist
  if (chunks.length === 0) {
    const pageCount = await prisma.docPage.count();
    if (pageCount > 0) {
      await embedAllDocPages();
      chunks = await prisma.docChunk.findMany({
        include: {
          page: {
            select: {
              title: true,
              slug: true,
              path: true,
              category: true,
              githubUrl: true,
            },
          },
        },
      });
    }
  }

  // Format candidate records
  let candidates: {
    id: string;
    pageId: string;
    docTitle: string;
    docSlug: string;
    docPath: string;
    category: string;
    githubUrl: string;
    heading: string | null;
    headingPath: string | null;
    content: string;
    embedding: number[];
  }[] = [];

  if (chunks.length > 0) {
    candidates = chunks.map((c) => ({
      id: c.id,
      pageId: c.pageId,
      docTitle: c.page.title,
      docSlug: c.page.slug,
      docPath: c.page.path,
      category: c.page.category,
      githubUrl: c.page.githubUrl,
      heading: c.heading,
      headingPath: c.headingPath,
      content: c.content,
      embedding: c.embedding,
    }));
  } else {
    // Resilient fallback memory candidates
    for (const item of FALLBACK_MEMORY_CHUNKS) {
      const emb = await generateEmbedding(item.content);
      candidates.push({
        ...item,
        embedding: emb,
      });
    }
  }

  // 2. Dense Semantic Vector Retrieval
  const tDenseStart = Date.now();
  const queryVector = await generateEmbedding(query);
  const denseScoresMap = new Map<string, number>();

  for (const c of candidates) {
    const sim = cosineSimilarity(queryVector, c.embedding);
    denseScoresMap.set(c.id, sim);
  }

  const sortedDense = [...candidates].sort(
    (a, b) => (denseScoresMap.get(b.id) || 0) - (denseScoresMap.get(a.id) || 0)
  );

  const denseRankMap = new Map<string, number>();
  sortedDense.forEach((c, index) => {
    denseRankMap.set(c.id, index + 1);
  });
  denseMs = Date.now() - tDenseStart;

  // 3. Sparse BM25 Keyword Retrieval
  const tSparseStart = Date.now();
  const bm25 = new BM25Index(1.5, 0.75);
  for (const c of candidates) {
    bm25.addDocument(c.id, `${c.heading || ""} ${c.headingPath || ""} ${c.content}`);
  }

  const bm25Results = bm25.search(query, candidates.length);
  const sparseScoresMap = new Map<string, number>();
  const sparseRankMap = new Map<string, number>();

  bm25Results.forEach((res, index) => {
    sparseScoresMap.set(res.id, res.score);
    sparseRankMap.set(res.id, index + 1);
  });
  sparseMs = Date.now() - tSparseStart;

  // Max sparse score for normalization
  const maxSparse = bm25Results.length > 0 ? bm25Results[0].score : 1;

  // 4. Reciprocal Rank Fusion (RRF)
  const tFusionStart = Date.now();
  const RRF_K = 60; // Standard RRF smoothing constant
  const scoredCandidates = candidates.map((c) => {
    const denseScore = denseScoresMap.get(c.id) || 0;
    const denseRank = denseRankMap.get(c.id) || candidates.length;

    const rawSparse = sparseScoresMap.get(c.id) || 0;
    const normalizedSparse = maxSparse > 0 ? rawSparse / maxSparse : 0;
    const sparseRank = sparseRankMap.get(c.id) || candidates.length;

    let rrfScore = 0;
    if (mode === "vector") {
      rrfScore = denseScore;
    } else if (mode === "keyword") {
      rrfScore = normalizedSparse;
    } else {
      // Reciprocal Rank Fusion formula
      const denseRrf = 1.0 / (RRF_K + denseRank);
      const sparseRrf = 1.0 / (RRF_K + sparseRank);
      rrfScore = denseRrf + sparseRrf;
    }

    return {
      chunk: c,
      denseScore: Number(denseScore.toFixed(4)),
      sparseScore: Number(normalizedSparse.toFixed(4)),
      rrfScore: Number(rrfScore.toFixed(5)),
      denseRank,
      sparseRank,
      finalScore: rrfScore,
    };
  });

  // Sort by RRF score
  scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);
  fusionMs = Date.now() - tFusionStart;

  // 5. Contextual Cross-Score Reranking (for top candidates)
  const tRerankStart = Date.now();
  const topCandidates = scoredCandidates.slice(0, Math.max(limit * 2, 20));

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
  const isCodeIntent =
    /def|class|import|return|await|async|params|route|decorator|how to|code|syntax|example/.test(
      lowerQuery
    );

  const reranked = topCandidates.map((item) => {
    if (!rerank) {
      return {
        ...item,
        finalScore: Number(item.denseScore.toFixed(4)),
      };
    }

    const contentLower = item.chunk.content.toLowerCase();
    const headingLower = (item.chunk.headingPath || "").toLowerCase();

    // Factor A: Exact phrase matching (significant precision booster)
    let exactPhraseScore = 0;
    if (contentLower.includes(lowerQuery)) {
      exactPhraseScore = 1.0;
    } else {
      // Check partial consecutive pairs
      let pairsMatched = 0;
      for (let i = 0; i < queryWords.length - 1; i++) {
        const pair = `${queryWords[i]} ${queryWords[i + 1]}`;
        if (contentLower.includes(pair)) pairsMatched++;
      }
      exactPhraseScore = queryWords.length > 1 ? pairsMatched / (queryWords.length - 1) : 0;
    }

    // Factor B: Title / Heading alignment
    let headingScore = 0;
    let headingMatches = 0;
    for (const w of queryWords) {
      if (headingLower.includes(w)) headingMatches++;
    }
    headingScore = queryWords.length > 0 ? headingMatches / queryWords.length : 0;

    // Factor C: Code Block presence for developer queries
    let codeBonus = 0;
    if (isCodeIntent && item.chunk.content.includes("```")) {
      codeBonus = 0.15;
    }

    // Contextual Cross-Score Combination
    // Blends: 40% Dense Semantic + 25% BM25 Sparse + 20% Exact Phrase Match + 15% Heading Alignment + Code Bonus
    const crossScore =
      0.40 * Math.max(0, item.denseScore) +
      0.25 * item.sparseScore +
      0.20 * exactPhraseScore +
      0.15 * headingScore +
      codeBonus;

    // Normalize final score to [0, 1]
    const finalScore = Number(Math.min(1.0, Math.max(0, crossScore)).toFixed(4));

    return {
      ...item,
      finalScore,
    };
  });

  if (rerank) {
    reranked.sort((a, b) => b.finalScore - a.finalScore);
  }
  rerankMs = Date.now() - tRerankStart;

  // Format final results
  const results: SearchResultChunk[] = reranked.slice(0, limit).map((item) => ({
    chunkId: item.chunk.id,
    pageId: item.chunk.pageId,
    docTitle: item.chunk.docTitle,
    docSlug: item.chunk.docSlug,
    docPath: item.chunk.docPath,
    category: item.chunk.category,
    githubUrl: item.chunk.githubUrl,
    heading: item.chunk.heading,
    headingPath: item.chunk.headingPath,
    content: item.chunk.content,
    snippet: generateSnippet(item.chunk.content, query),
    denseScore: item.denseScore,
    sparseScore: item.sparseScore,
    rrfScore: item.rrfScore,
    finalScore: item.finalScore,
    denseRank: item.denseRank,
    sparseRank: item.sparseRank,
    matchHighlights: findMatchHighlights(item.chunk.content, query),
  }));

  const totalMs = Date.now() - startOverall;

  return {
    query,
    mode,
    isReranked: rerank,
    totalCandidates: candidates.length,
    returnedCount: results.length,
    timings: {
      denseMs,
      sparseMs,
      fusionMs,
      rerankMs,
      totalMs,
    },
    results,
  };
}
