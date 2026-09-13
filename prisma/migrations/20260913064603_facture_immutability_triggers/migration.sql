-- Immuabilité légale des factures émises, appliquée directement en base
-- (défense en profondeur en complément des vérifications déjà faites dans
-- facture.service.ts). Sans ces triggers, une facture verrouillée reste
-- protégée tant qu'on passe par l'application, mais un accès direct à la
-- base (Prisma Studio, requête SQL manuelle, futur bug applicatif) pourrait
-- la modifier ou la supprimer. Avec ces triggers, c'est impossible quel que
-- soit le chemin emprunté : seul le passage EMISE -> PAYEE reste autorisé
-- sur une facture verrouillée, tout le reste (montants, lignes, numéro,
-- suppression) est bloqué au niveau PostgreSQL lui-même.

CREATE OR REPLACE FUNCTION facture_bloquer_modification_verrouillee()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."verrouillee" THEN
      RAISE EXCEPTION 'Facture % verrouillée : suppression interdite', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  -- TG_OP = 'UPDATE' : une facture non verrouillée reste librement modifiable
  -- (brouillon) ; le passage brouillon -> verrouillée (émission) n'est donc
  -- pas concerné par ce garde-fou, seule la modification d'une facture déjà
  -- verrouillée l'est.
  IF OLD."verrouillee" THEN
    IF NOT (
      OLD.status = 'EMISE' AND NEW.status = 'PAYEE' AND NEW."verrouillee" = TRUE
      AND (to_jsonb(NEW) - 'status' - 'payeeAt' - 'updatedAt')
        = (to_jsonb(OLD) - 'status' - 'payeeAt' - 'updatedAt')
    ) THEN
      RAISE EXCEPTION 'Facture % verrouillée : seul le passage au statut PAYEE est autorisé', OLD.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_facture_immutabilite ON "Facture";
CREATE TRIGGER trg_facture_immutabilite
  BEFORE UPDATE OR DELETE ON "Facture"
  FOR EACH ROW
  EXECUTE FUNCTION facture_bloquer_modification_verrouillee();

-- Les lignes d'une facture verrouillée ne doivent jamais changer non plus :
-- ni modification, ni suppression, ni ajout d'une nouvelle ligne.
CREATE OR REPLACE FUNCTION ligne_facture_bloquer_si_verrouillee()
RETURNS TRIGGER AS $$
DECLARE
  v_verrouillee BOOLEAN;
  v_facture_id TEXT;
BEGIN
  v_facture_id := COALESCE(NEW."factureId", OLD."factureId");
  SELECT "verrouillee" INTO v_verrouillee FROM "Facture" WHERE id = v_facture_id;

  IF v_verrouillee THEN
    RAISE EXCEPTION 'Facture % verrouillée : ses lignes ne peuvent plus être modifiées', v_facture_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ligne_facture_immutabilite ON "LigneFacture";
CREATE TRIGGER trg_ligne_facture_immutabilite
  BEFORE INSERT OR UPDATE OR DELETE ON "LigneFacture"
  FOR EACH ROW
  EXECUTE FUNCTION ligne_facture_bloquer_si_verrouillee();
