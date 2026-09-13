import { z } from "zod";

export const ligneSchema = z.object({
  description: z.string().min(1),
  quantite: z.coerce.number().positive(),
  unite: z.string().min(1).default("unité"),
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

export const updateEntrepriseSchema = z.object({
  nom: z.string().min(1),
  statutJuridique: z.string().optional(),
  siret: z.string().optional(),
  numeroTVA: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  iban: z.string().optional(),
  mentionsComplementaires: z.string().optional(),
  delaiPaiementJours: z.coerce.number().int().positive().optional(),
});

export const createClientSchema = z.object({
  type: z.enum(["PARTICULIER", "PROFESSIONNEL"]).optional(),
  nom: z.string().min(1),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
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
  clientId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterventionSchema = createInterventionSchema.partial().extend({
  status: z.enum(["PLANIFIEE", "CONFIRMEE", "TERMINEE", "ANNULEE"]).optional(),
});

export const createAvoirSchema = z.object({
  factureId: z.string().min(1),
  motif: z.string().optional(),
  lignes: z.array(ligneSchema).min(1),
});

export const updateAvoirSchema = z.object({
  motif: z.string().optional(),
  lignes: z.array(ligneSchema).min(1).optional(),
});

export const createPrestationSchema = z.object({
  designation: z.string().min(1),
  unite: z.string().min(1).default("unité"),
  prixUnitaireHT: z.coerce.number().nonnegative(),
  tauxTVA: z.coerce.number().nonnegative().default(20),
});

export const updatePrestationSchema = createPrestationSchema.partial();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
