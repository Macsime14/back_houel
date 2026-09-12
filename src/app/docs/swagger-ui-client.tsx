"use client";

import "swagger-ui-react/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";

export default function SwaggerUiClient({ spec }: { spec: Record<string, unknown> }) {
  return <SwaggerUI spec={spec} />;
}
