export interface Chunk {
  chunkIndex: number;
  heading: string;
  headingPath: string;
  content: string;
  tokenCount: number;
}

// Estimate tokens based on words and code characters
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.8);
}

// Splits markdown content into semantic, context-preserving chunks
export function chunkMarkdownDocument(
  markdown: string,
  docTitle: string,
  maxWordsPerChunk: number = 350,
  overlapWords: number = 40
): Chunk[] {
  const chunks: Chunk[] = [];
  const lines = markdown.split("\n");

  let currentH1 = docTitle;
  let currentH2 = "";
  let currentH3 = "";
  let sectionContent: string[] = [];
  let inCodeBlock = false;

  const flushSection = () => {
    if (sectionContent.length === 0) return;

    const fullSectionText = sectionContent.join("\n").trim();
    if (!fullSectionText) return;

    const heading = currentH3 || currentH2 || currentH1;
    const headingPath = [currentH1, currentH2, currentH3].filter(Boolean).join(" > ");

    const words = fullSectionText.split(/\s+/);

    if (words.length <= maxWordsPerChunk) {
      // Chunk fits within size limit
      chunks.push({
        chunkIndex: chunks.length + 1,
        heading,
        headingPath,
        content: `### ${headingPath}\n\n${fullSectionText}`,
        tokenCount: estimateTokens(fullSectionText),
      });
    } else {
      // Split large section by paragraphs or code blocks
      const paragraphs = fullSectionText.split(/\n\s*\n/);
      let currentSubChunk: string[] = [];
      let currentWordCount = 0;

      for (const p of paragraphs) {
        const pWords = p.split(/\s+/).length;
        if (currentWordCount + pWords > maxWordsPerChunk && currentSubChunk.length > 0) {
          const chunkText = currentSubChunk.join("\n\n").trim();
          chunks.push({
            chunkIndex: chunks.length + 1,
            heading,
            headingPath,
            content: `### ${headingPath}\n\n${chunkText}`,
            tokenCount: estimateTokens(chunkText),
          });

          // Take overlap words from the end of current chunk
          const lastParagraph = currentSubChunk[currentSubChunk.length - 1];
          const overlapSlice = lastParagraph.split(/\s+/).slice(-overlapWords).join(" ");
          currentSubChunk = [overlapSlice, p];
          currentWordCount = overlapSlice.split(/\s+/).length + pWords;
        } else {
          currentSubChunk.push(p);
          currentWordCount += pWords;
        }
      }

      if (currentSubChunk.length > 0) {
        const chunkText = currentSubChunk.join("\n\n").trim();
        if (chunkText.length > 20) {
          chunks.push({
            chunkIndex: chunks.length + 1,
            heading,
            headingPath,
            content: `### ${headingPath}\n\n${chunkText}`,
            tokenCount: estimateTokens(chunkText),
          });
        }
      }
    }

    sectionContent = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      sectionContent.push(line);
      continue;
    }

    if (!inCodeBlock) {
      if (line.startsWith("# ")) {
        flushSection();
        currentH1 = line.replace(/^#\s+/, "").trim();
        currentH2 = "";
        currentH3 = "";
        continue;
      } else if (line.startsWith("## ")) {
        flushSection();
        currentH2 = line.replace(/^##\s+/, "").trim();
        currentH3 = "";
        continue;
      } else if (line.startsWith("### ")) {
        flushSection();
        currentH3 = line.replace(/^###\s+/, "").trim();
        continue;
      }
    }

    sectionContent.push(line);
  }

  flushSection();

  return chunks;
}
