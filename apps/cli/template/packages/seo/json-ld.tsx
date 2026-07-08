import type { Thing, WithContext } from "schema-dts";

type JsonLdProps = {
  code: WithContext<Thing>;
};

const escapeJsonForHtml = (json: string): string =>
  json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const buildJsonLdHtml = (code: WithContext<Thing>) => ({
  __html: escapeJsonForHtml(JSON.stringify(code)),
});

export const JsonLd = ({ code }: JsonLdProps) => (
  <script
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD script with escaped content
    dangerouslySetInnerHTML={buildJsonLdHtml(code)}
    type="application/ld+json"
  />
);

export type * from "schema-dts";
