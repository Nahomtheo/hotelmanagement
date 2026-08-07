import { NextResponse } from 'next/server';
import translate from 'google-translate-api-next';

interface TranslationRow {
  guestName?: string;
  reasonOfStay?: string;
  nationality?: string;
}

const BATCH_SIZE = 15; // Process in small chunks to avoid string length limits or rate limits
const DELIMITER = ' ||| ';
const ROW_DELIMITER = '\n---ROW---\n';

// Memory cache for exact matches
const cache = new Map<string, string>();
// 1. Helper to capitalize names (Fixes "chala" -> "Chala" -> "ጫላ")
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// 2. Updated Name Translation Logic

async function translateBatchChunk(rowsChunk: TranslationRow[], target: string) {
  // Construct a single payload for the entire chunk
  const payloadLines: string[] = [];

  rowsChunk.forEach((row) => {
    const capitalizedName = row.guestName ? toTitleCase(row.guestName) : '';
    const cachedTranslation = cache.get(capitalizedName);
    const name = row.guestName?.trim() ? ` ${capitalizedName}` : 'EMPTY';
    const reason = row.reasonOfStay?.trim() || 'EMPTY';
    const nationality = row.nationality?.trim() || 'EMPTY';

    // Combine 3 fields into 1 line using a distinct delimiter
    payloadLines.push(`${name}${DELIMITER}${reason}${DELIMITER}${nationality}`);
    
  });

  const fullPayload = payloadLines.join(ROW_DELIMITER);
  console.log('Translating chunk:', fullPayload);

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Batch translation timeout')), 8000)
    );

    const translatePromise = translate(fullPayload, { to: target });
    const res: any = await Promise.race([translatePromise, timeoutPromise]);
    const translatedText = res?.text || '';
    console.log('Translated chunk:', translatedText);

    const translatedRowStrings = translatedText.split(/--- ረድፍ---|\n--- ረድፍ---\n/);

    return rowsChunk.map((originalRow, index) => {
      const translatedLine = translatedRowStrings[index] || '';
      const parts = translatedLine.split(/\|\|\||\|\|/);

      let nameVal = parts[0]?.trim() || '';
      // Remove context marker if Google kept/translated it
      nameVal = nameVal.replace(/^.*?:/g, '').trim();
      
      const reasonVal = parts[1]?.trim() === 'EMPTY' ? '' : parts[1]?.trim() || '';
      const nationalityVal = parts[2]?.trim() === 'EMPTY' ? '' : parts[2]?.trim() || '';

      return {
        amharicName: nameVal === 'EMPTY' ? '' : (nameVal || originalRow.guestName || ''),
        amharicReason: reasonVal || originalRow.reasonOfStay || '',
        amharicNationality: nationalityVal || originalRow.nationality || '',
      };
    });
  } catch (error) {
    console.warn('Batch chunk failed, returning original values:', error);
    // Safe fallback: return raw inputs if request times out or gets blocked
    return rowsChunk.map((r) => ({
      amharicName: r.guestName || '',
      amharicReason: r.reasonOfStay || '',
      amharicNationality: r.nationality || '',
    }));
  }
}

export async function POST(request: Request) {
  try {
    const { rows, targetLanguage } = await request.json();

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Invalid input: expected an array under "rows"' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    const target = targetLanguage || 'am';
    const results: any[] = [];

    // Chunk rows sequentially so we never fire multiple network requests in parallel
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const translatedChunk = await translateBatchChunk(chunk, target);
      results.push(...translatedChunk);
    }
    

    return NextResponse.json({ rows: results });
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Translation system error' },
      { status: 500 }
    );
  }
}