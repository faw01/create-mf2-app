import { beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cliRoot = join(import.meta.dirname, "..");
const cliBin = join(cliRoot, "dist", "index.js");

const hangTimeoutMs = 15_000;

setDefaultTimeout(60_000);

const runCli = (args: string[]) =>
  spawnSync("node", [cliBin, ...args], {
    cwd: cliRoot,
    encoding: "utf8",
    input: "",
    timeout: hangTimeoutMs,
  });

describe("cli entry without a TTY", () => {
  beforeAll(() => {
    const build = spawnSync("bun", ["run", "build"], {
      cwd: cliRoot,
      encoding: "utf8",
    });
    if (build.status !== 0) {
      throw new Error(`CLI build failed:\n${build.stdout}\n${build.stderr}`);
    }
  });

  test("bare invocation exits promptly with help instead of hanging", () => {
    const result = runCli([]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("interactive terminal");
    expect(result.stderr).toContain("--name <name>");
    expect(result.stderr).toContain("--package-manager");
    expect(result.stderr).toContain("Usage: create-mf2-app init");
  });

  test("init with partial flags exits promptly instead of prompting", () => {
    const result = runCli(["init", "--name", "foo"]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--package-manager");
  });

  test("positional name reaches init through the default command", () => {
    const result = runCli(["my-app"]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("interactive terminal");
    expect(result.stderr).not.toContain("unknown command");
    expect(result.stderr).not.toContain("too many arguments");
  });

  test("positional name works on the explicit init subcommand", () => {
    const result = runCli(["init", "my-app"]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("interactive terminal");
    expect(result.stderr).not.toContain("unknown command");
    expect(result.stderr).not.toContain("too many arguments");
  });

  test("--help names init as the default command", () => {
    const result = runCli(["--help"]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("init [options]");
    expect(result.stdout).toContain("(default)");
    expect(result.stdout).toContain("no command runs init");
    expect(result.stdout).toContain("npx create-mf2-app my-app");
  });

  test("init --help lists the positional and the non-interactive flags", () => {
    const result = runCli(["init", "--help"]);

    expect(result.signal).toBeNull();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[name]");
    expect(result.stdout).toContain("same as --name");
    expect(result.stdout).toContain("--name <name>");
    expect(result.stdout).toContain("--package-manager <manager>");
    expect(result.stdout).toContain("--disable-git");
  });
});

describe("positional name precedence", () => {
  const source = readFileSync(join(import.meta.dirname, "index.ts"), "utf8");

  test("--name wins when both the flag and the positional are given", () => {
    expect(source).toContain("options.name ?? nameArg");
  });
});
