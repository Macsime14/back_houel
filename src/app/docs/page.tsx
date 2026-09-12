import { getApiDocs } from "@/lib/swagger";
import SwaggerUiClient from "./swagger-ui-client";

// Page dev-only : documentation interactive des routes API, générée depuis
// les annotations @swagger de chaque route.ts. Pas un écran du dashboard.
export default async function DocsPage() {
  const spec = await getApiDocs();
  return <SwaggerUiClient spec={spec as Record<string, unknown>} />;
}
