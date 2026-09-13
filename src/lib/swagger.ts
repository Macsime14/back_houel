import { createSwaggerSpec } from "next-swagger-doc";

// Génère la spec OpenAPI à partir des annotations @swagger dans les fichiers
// src/app/api/**/route.ts. Consultable via /docs (voir src/app/docs/page.tsx).
export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API back_houel — devis, factures, planning",
        version: "0.1.0",
        description:
          "Back-office pour Antoine (plombier) : gestion des devis, factures et planning.",
      },
      components: {
        securitySchemes: {
          sessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: "authjs.session-token",
          },
        },
        schemas: {
          Ligne: {
            type: "object",
            required: ["description", "quantite", "prixUnitaireHT"],
            properties: {
              description: { type: "string" },
              quantite: { type: "number" },
              unite: { type: "string", default: "unité", description: "m², ml, heure, forfait..." },
              prixUnitaireHT: { type: "number" },
              tauxTVA: { type: "number", default: 20 },
            },
          },
          Devis: {
            type: "object",
            properties: {
              id: { type: "string" },
              numero: { type: "integer" },
              status: {
                type: "string",
                enum: ["BROUILLON", "ENVOYE", "ACCEPTE", "REFUSE"],
              },
              clientNom: { type: "string" },
              clientEmail: { type: "string", nullable: true },
              clientTelephone: { type: "string", nullable: true },
              clientAdresse: { type: "string", nullable: true },
              notes: { type: "string", nullable: true },
              totalHT: { type: "number" },
              totalTTC: { type: "number" },
              lignes: { type: "array", items: { $ref: "#/components/schemas/Ligne" } },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Facture: {
            type: "object",
            properties: {
              id: { type: "string" },
              numero: { type: "integer", nullable: true, description: "Attribué uniquement à l'émission" },
              status: {
                type: "string",
                enum: ["BROUILLON", "EMISE", "PAYEE", "ANNULEE"],
              },
              verrouillee: { type: "boolean" },
              devisId: { type: "string" },
              clientNom: { type: "string" },
              totalHT: { type: "number" },
              totalTTC: { type: "number" },
              lignes: { type: "array", items: { $ref: "#/components/schemas/Ligne" } },
              emiseAt: { type: "string", format: "date-time", nullable: true },
            },
          },
          Intervention: {
            type: "object",
            properties: {
              id: { type: "string" },
              titre: { type: "string" },
              status: {
                type: "string",
                enum: ["PLANIFIEE", "CONFIRMEE", "TERMINEE", "ANNULEE"],
              },
              debut: { type: "string", format: "date-time" },
              fin: { type: "string", format: "date-time" },
              devisId: { type: "string", nullable: true },
              notes: { type: "string", nullable: true },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
      security: [{ sessionCookie: [] }],
    },
  });
}
