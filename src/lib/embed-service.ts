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

  const pages = await prisma.docPage.findMany({
    select: {
      id: true,
      title: true,
      path: true,
      content: true,
    },
  });

  for (const page of pages) {
    if (!page.content) continue;

    // 1. Chunk document
    const chunks = chunkMarkdownDocument(page.content, page.title);

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
  }

  const durationMs = Date.now() - startTime;

  return {
    pagesProcessed,
    chunksCreated,
    totalTokens,
    durationMs,
  };
}
