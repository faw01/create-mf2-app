import { describe, expect, test } from "bun:test";
import {
  assessPackManifest,
  MAX_ENTRY_COUNT,
  MAX_UNPACKED_BYTES,
} from "./verify-pack.js";

type Manifest = Parameters<typeof assessPackManifest>[0];

const cleanPaths = [
  "dist/index.js",
  "package.json",
  "README.md",
  "template/package.json",
  "template/gitignore",
  "template/turbo.json",
  "template/turbo/generators/config.ts",
  "template/.agents/skills/shadcn/SKILL.md",
  "template/.claude/CLAUDE.md",
  "template/apps/app/package.json",
  "template/apps/api/env.example",
  "template/apps/desktop/build/icon.png",
  "template/apps/mobile/assets/images/android-icon-background.png",
  "template/.agents/skills/expo-deployment/references/ios-app-store.md",
  "template/packages/backend/convex/convex.env.ts",
];

const makeManifest = (paths: string[]): Manifest => ({
  entryCount: paths.length,
  files: paths.map((path) => ({ path })),
  unpackedSize: paths.length * 1000,
});

describe("assessPackManifest", () => {
  test("accepts a clean manifest", () => {
    expect(assessPackManifest(makeManifest(cleanPaths))).toEqual([]);
  });

  test("rejects dev artifacts anywhere under template", () => {
    const artifacts = [
      "template/node_modules/react/package.json",
      "template/packages/ai/node_modules/zod/index.js",
      "template/.turbo/cache/abc.tar.zst",
      "template/apps/web/.next/build-manifest.json",
      "template/apps/mobile/.expo/settings.json",
      "template/apps/email/.react-email/pages/index.js",
      "template/apps/desktop/out/main/index.js",
      "template/apps/mobile/ios/Podfile",
      "template/apps/mobile/android/build.gradle",
      "template/apps/storybook/storybook-static/index.html",
      "template/apps/storybook/debug-storybook.log",
      "template/apps/desktop/tsconfig.node.tsbuildinfo",
      "template/bun.lock",
      "template/apps/app/.env.local",
      "template/apps/api/.env",
      "template/apps/web/env.local",
      "template/.claude/settings.local.json",
    ];

    for (const artifact of artifacts) {
      const problems = assessPackManifest(
        makeManifest([...cleanPaths, artifact])
      );
      expect(problems.join("\n")).toContain(artifact);
    }
  });

  test("does not flag sources whose names merely resemble artifacts", () => {
    const lookalikes = [
      "template/apps/mobile/assets/images/android-icon-foreground.png",
      "template/.agents/skills/expo-deployment/references/ios-app-store.md",
      "template/packages/backend/convex/convex.env.ts",
      "template/apps/api/env.example",
      "template/turbo/generators/templates/package.json.hbs",
    ];
    const problems = assessPackManifest(
      makeManifest([...cleanPaths, ...lookalikes])
    );
    expect(problems).toEqual([]);
  });

  test("ignores artifact names outside template/", () => {
    const problems = assessPackManifest(
      makeManifest([...cleanPaths, "dist/chunk.log"])
    );
    expect(problems).toEqual([]);
  });

  test("rejects anomalous entry counts", () => {
    const manifest = makeManifest(cleanPaths);
    manifest.entryCount = MAX_ENTRY_COUNT + 1;
    expect(assessPackManifest(manifest).join("\n")).toContain("entry count");
  });

  test("rejects anomalous unpacked size", () => {
    const manifest = makeManifest(cleanPaths);
    manifest.unpackedSize = MAX_UNPACKED_BYTES + 1;
    expect(assessPackManifest(manifest).join("\n")).toContain("unpacked size");
  });

  test("rejects tarballs missing required sentinels", () => {
    const withoutDist = cleanPaths.filter((path) => path !== "dist/index.js");
    expect(assessPackManifest(makeManifest(withoutDist)).join("\n")).toContain(
      "dist/index.js"
    );

    const withoutSkills = cleanPaths.filter(
      (path) => !path.startsWith("template/.agents/skills/")
    );
    expect(
      assessPackManifest(makeManifest(withoutSkills)).join("\n")
    ).toContain(".agents/skills");
  });
});
