import prisma from "./prisma";
import { chunkMarkdownDocument } from "./chunking";
import { generateEmbedding } from "./embeddings";

export interface EmbedStats {
  pagesProcessed: number;
  chunksCreated: number;
  totalTokens: number;
  durationMs: number;
}

// Embeds all ingested doc pages in the database
export async function embedAllDocPages(): Promise<EmbedStats> {
  const startTime = Date.now();
  let pagesProcessed = 0;
  let chunksCreated = 0;
  let totalTokens = 0;

  let pages: any[] = [];
  try {
    pages = await prisma.docPage.findMany({
      select: {
        id: true,
        title: true,
        path: true,
        content: true,
      },
    });
  } catch (err: any) {
    console.warn("⚠️ [embedAllDocPages] Database not reachable. Embedding generation skipped for persistent DB:", err.message);
    return {
      pagesProcessed: 0,
      chunksCreated: 0,
      totalTokens: 0,
      durationMs: Date.now() - startTime,
    };
  }

  for (const page of pages) {
    if (!page.content) continue;

    // 1. Chunk document
    const chunks = chunkMarkdownDocument(page.content, page.title);

    try {
      // 2. Delete old chunks for this page
      await prisma.docChunk.deleteMany({
        where: { pageId: page.id },
      });

      // 3. Generate embeddings and insert
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.content);

        await prisma.docChunk.create({
          data: {
            pageId: page.id,
            chunkIndex: chunk.chunkIndex,
            heading: chunk.heading,
            headingPath: chunk.headingPath,
            content: chunk.content,
            tokenCount: chunk.tokenCount,
            embedding,
          },
        });

        chunksCreated++;
        totalTokens += chunk.tokenCount;
      }

      pagesProcessed++;
    } catch (innerErr: any) {
      console.warn(`⚠️ [embedAllDocPages] Failed indexing chunks for ${page.title}:`, innerErr.message);
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    pagesProcessed,
    chunksCreated,
    totalTokens,
    durationMs,
  };
}
