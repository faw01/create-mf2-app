import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("init", {
    actions: [
      (answers) => {
        if (
          "name" in answers &&
          typeof answers.name === "string" &&
          answers.name.startsWith("@repo/")
        ) {
          answers.name = answers.name.replace("@repo/", "");
        }
        return "Config sanitized";
      },
      {
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
        type: "add",
      },
    ],
    description: "Generate a new package for the Monorepo",
    prompts: [
      {
        message:
          "What is the name of the package? (You can skip the `@repo/` prefix)",
        name: "name",
        type: "input",
      },
    ],
  });
}
