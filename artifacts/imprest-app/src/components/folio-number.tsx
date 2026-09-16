/** The running ledger folio number shown bottom-right of every list/table frame. */
export function FolioNumber({ count, perPage = 12 }: { count: number; perPage?: number }) {
  const folio = Math.max(1, Math.ceil(count / perPage));
  return (
    <div className="folio-number mt-4 text-right" data-testid="folio-number">
      Folio {String(Math.min(folio, 1)).padStart(2, '0')} / {String(folio).padStart(2, '0')} — {count} {count === 1 ? 'record' : 'records'}
    </div>
  );
}
