import { NextResponse } from 'next/server';
import translate from 'google-translate-api-next';

// Define an interface for the incoming rows
interface TranslationRow {
  guestName?: string;
  reasonOfStay?: string;
  nationality?: string;
}

export async function POST(request: Request) {
  try {
    const { rows, targetLanguage } = await request.json();

    // Ensure rows is an array
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid input: expected an array of rows under "rows"' }, { status: 400 });
    }

    const target = targetLanguage || 'am';

    // Process all rows concurrently
    const translatedRows = await Promise.all(
      rows.map(async (row: TranslationRow) => {
        const { guestName, reasonOfStay, nationality } = row;

        // If all fields are empty, return early for this row
        if (!guestName && !reasonOfStay && !nationality) {
          return { amharicName: "", amharicReason: "", amharicNationality: "" };
        }

        const nameTemplate = guestName && guestName.trim() ? `My name is "${guestName}"` : "";
        const reasonText = reasonOfStay && reasonOfStay.trim() ? reasonOfStay : "";
        const nationalityText = nationality && nationality.trim() ? nationality : "";

        // Prepare translation promises for the individual fields in this row
        const promises: Promise<any>[] = [];

        // 1. Name translation promise
        if (nameTemplate) {
          promises.push(
            translate(nameTemplate, { to: target }).then((res) => {
              const rawTranslation = res.text || "";
              const match = rawTranslation.match(/"([^"]+)"|'([^']+)'/);
              return { type: 'name', value: (match ? (match[1] || match[2]) : rawTranslation).trim() };
            })
          );
        } else {
          promises.push(Promise.resolve({ type: 'name', value: guestName || "" }));
        }

        // 2. Reason translation promise
        if (reasonText) {
          promises.push(
            translate(reasonText, { to: target }).then((res) => ({
              type: 'reason',
              value: (res.text || "").trim(),
            }))
          );
        } else {
          promises.push(Promise.resolve({ type: 'reason', value: reasonOfStay || "" }));
        }

        // 3. Nationality translation promise
        if (nationalityText) {
          promises.push(
            translate(nationalityText, { to: target }).then((res) => ({
              type: 'nationality',
              value: (res.text || "").trim(),
            }))
          );
        } else {
          promises.push(Promise.resolve({ type: 'nationality', value: nationality || "" }));
        }

        // Wait for all fields of this specific row to finish translating
        const results = await Promise.all(promises);

        // Map the results back to the row structure
        return {
          amharicName: results.find((r) => r.type === 'name')?.value || "",
          amharicReason: results.find((r) => r.type === 'reason')?.value || "",
          amharicNationality: results.find((r) => r.type === 'nationality')?.value || "",
        };
      })
    );

    return NextResponse.json({ rows: translatedRows });

  } catch (error: any) {
    console.error('Free translation batch wrapper failed:', error);
    return NextResponse.json(
      { error: 'Translation system error' }, 
      { status: 500 }
    );
  }
}