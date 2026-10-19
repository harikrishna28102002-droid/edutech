// -------------------------------------------------------------
// Okapi BM25 Sparse Keyword Ranking Engine
// Standard IR formula with tunable k1 = 1.5, b = 0.75
// -------------------------------------------------------------

export interface BM25Doc {
  id: string;
  tokens: string[];
  tokenCount: number;
  termFreqs: Map<string, number>;
}

export class BM25Index {
  private docs: Map<string, BM25Doc> = new Map();
  private docFreqs: Map<string, number> = new Map();
  private totalDocs: number = 0;
  private totalDocLengths: number = 0;
  private avgDocLength: number = 0;

  // BM25 Hyperparameters
  private k1: number;
  private b: number;

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  // Tokenize text into words, symbols, and code identifiers
  public tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[`*_\[\]()#]/g, " ")
      .split(/[^a-zA-Z0-9_\-]/)
      .filter((t) => t.length > 1);
  }

  // Add document to index
  public addDocument(id: string, text: string) {
    const tokens = this.tokenize(text);
    const termFreqs = new Map<string, number>();

    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    // Update document frequencies for unique terms
    for (const term of termFreqs.keys()) {
      this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
    }

    const doc: BM25Doc = {
      id,
      tokens,
      tokenCount: tokens.length,
      termFreqs,
    };

    this.docs.set(id, doc);
    this.totalDocs++;
    this.totalDocLengths += tokens.length;
    this.avgDocLength = this.totalDocLengths / this.totalDocs;
  }

  // Compute IDF with Robertson-Spärck Jones formula
  private getIDF(term: string): number {
    const docFreq = this.docFreqs.get(term) || 0;
    if (docFreq === 0) return 0;
    return Math.log(1 + (this.totalDocs - docFreq + 0.5) / (docFreq + 0.5));
  }

  // Search and rank documents by BM25 score
  public search(query: string, topK: number = 20): Array<{ id: string; score: number }> {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0 || this.totalDocs === 0) return [];

    const scores = new Map<string, number>();

    for (const qTerm of queryTokens) {
      const idf = this.getIDF(qTerm);
      if (idf <= 0) continue;

      for (const [docId, doc] of this.docs.entries()) {
        const tf = doc.termFreqs.get(qTerm) || 0;
        if (tf === 0) continue;

        // Okapi BM25 formula
        const numerator = tf * (this.k1 + 1);
        const denominator =
          tf + this.k1 * (1 - this.b + (this.b * doc.tokenCount) / (this.avgDocLength || 1));
        const termScore = idf * (numerator / denominator);

        scores.set(docId, (scores.get(docId) || 0) + termScore);
      }
    }

    const ranked = Array.from(scores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);

    return ranked.slice(0, topK);
  }

  public getDocumentCount(): number {
    return this.totalDocs;
  }
}
