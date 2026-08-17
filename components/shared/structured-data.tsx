export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD is generated server-side from trusted data, not user HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
