import { useState, useEffect } from 'react';

export function useTranslatedData(originalGuests: any[], locale: string) {
  const [translatedGuests, setTranslatedGuests] = useState(originalGuests);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If target language is English or default, bypass the translation pipeline
    if (locale !== 'am') {
      setTranslatedGuests(originalGuests);
      return;
    }

    // Skip network request entirely if there are no guests to process
    if (!originalGuests || originalGuests.length === 0) {
      setTranslatedGuests([]);
      return;
    }

    const translateBatch = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLanguage: 'am',
            rows: originalGuests.map((guest) => ({
              guestName: guest.guestName,
              reasonOfStay: guest.reasonOfStay,
              nationality: guest.nationality,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error('Batch API responded with error status');
        }

        const data = await res.json();
        const returnedRows = data.rows || [];

        // Zip the backend translations back with the initial metadata (IDs, dates, etc.)
        const mergedGuests = originalGuests.map((guest, index) => {
          const translation = returnedRows[index];
          if (!translation) return guest;

          return {
            ...guest,
            guestName: translation.amharicName || guest.guestName,
            reasonOfStay: translation.amharicReason || guest.reasonOfStay,
            nationality: translation.amharicNationality || guest.nationality,
          };
        });

        setTranslatedGuests(mergedGuests);
      } catch (error) {
        console.error('Batch translation operation failed:', error);
        // Fallback to original un-translated data if request completely crashes
        setTranslatedGuests(originalGuests);
      } finally {
        setLoading(false);
      }
    };

    translateBatch();
  }, [originalGuests, locale]);

  return { translatedGuests, loading };
}