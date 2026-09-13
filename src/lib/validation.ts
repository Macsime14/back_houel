import { z } from "zod";

export const ligneSchema = z.object({
  description: z.string().min(1),
  quantite: z.coerce.number().positive(),
  prixUnitaireHT: z.coerce.number().nonnegative(),
  tauxTVA: z.coerce.number().nonnegative().default(20),
});

export const createDevisSchema = z.object({
  clientId: z.string().optional(),
  clientNom: z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientTelephone: z.string().optional(),
  clientAdresse: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema).min(1),
});

export const createClientSchema = z.object({
  nom: z.string().min(1),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const updateDevisSchema = createDevisSchema.partial().extend({
  status: z.enum(["BROUILLON", "ENVOYE", "ACCEPTE", "REFUSE"]).optional(),
});

export const createInterventionSchema = z.object({
  titre: z.string().min(1),
  debut: z.coerce.date(),
  fin: z.coerce.date(),
  devisId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterventionSchema = createInterventionSchema.partial().extend({
  status: z.enum(["PLANIFIEE", "CONFIRMEE", "TERMINEE", "ANNULEE"]).optional(),
});
