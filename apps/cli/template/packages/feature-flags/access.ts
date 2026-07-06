import { type ApiData, verifyAccess } from "flags";
import { type NextRequest, NextResponse } from "next/server";
// biome-ignore lint/performance/noNamespaceImport: flags SDK convention
import * as flags from "./index";

export const getFlags = async (request: NextRequest) => {
  const access = await verifyAccess(request.headers.get("Authorization"));

  if (!access) {
    return NextResponse.json(null, { status: 401 });
  }

  const definitions = Object.fromEntries(
    Object.values(flags).map((flag) => [
      flag.key,
      {
        description: flag.description,
        options: flag.options,
        origin: flag.origin,
      },
    ])
  );

  return NextResponse.json<ApiData>({
    definitions,
  });
};
