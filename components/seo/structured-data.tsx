import { buildStructuredData } from "@/lib/seo";

export function StructuredData() {
  return (
    <script
      id="profile-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c"),
      }}
    />
  );
}
