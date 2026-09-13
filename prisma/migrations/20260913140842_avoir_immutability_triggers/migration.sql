-- Immuabilité légale des avoirs émis (défense en profondeur, même principe
-- que trg_facture_immutabilite dans facture_immutability_triggers) : une
-- fois émis, un avoir ne connaît aucune transition ultérieure (contrairement
-- à une facture qui peut passer de EMISE à PAYEE), donc toute modification
-- ou suppression est bloquée sans exception une fois verrouillé.

CREATE OR REPLACE FUNCTION avoir_bloquer_modification_verrouillee()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."verrouillee" THEN
      RAISE EXCEPTION 'Avoir % verrouillé : suppression interdite', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  IF OLD."verrouillee" THEN
    RAISE EXCEPTION 'Avoir % verrouillé : aucune modification n''est autorisée', OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_avoir_immutabilite ON "Avoir";
CREATE TRIGGER trg_avoir_immutabilite
  BEFORE UPDATE OR DELETE ON "Avoir"
  FOR EACH ROW
  EXECUTE FUNCTION avoir_bloquer_modification_verrouillee();

-- Les lignes d'un avoir verrouillé ne doivent jamais changer non plus : ni
-- modification, ni suppression, ni ajout d'une nouvelle ligne.
CREATE OR REPLACE FUNCTION ligne_avoir_bloquer_si_verrouillee()
RETURNS TRIGGER AS $$
DECLARE
  v_verrouillee BOOLEAN;
  v_avoir_id TEXT;
BEGIN
  v_avoir_id := COALESCE(NEW."avoirId", OLD."avoirId");
  SELECT "verrouillee" INTO v_verrouillee FROM "Avoir" WHERE id = v_avoir_id;

  IF v_verrouillee THEN
    RAISE EXCEPTION 'Avoir % verrouillé : ses lignes ne peuvent plus être modifiées', v_avoir_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ligne_avoir_immutabilite ON "LigneAvoir";
CREATE TRIGGER trg_ligne_avoir_immutabilite
  BEFORE INSERT OR UPDATE OR DELETE ON "LigneAvoir"
  FOR EACH ROW
  EXECUTE FUNCTION ligne_avoir_bloquer_si_verrouillee();

-- Amorce le compteur de numérotation des avoirs (voir FactureCounter, jamais
-- amorcé de la même façon en migration : on corrige ça ici pour AvoirCounter
-- afin qu'émettre le premier avoir fonctionne sans étape manuelle).
INSERT INTO "AvoirCounter" (id, "dernierNumero") VALUES (1, 0) ON CONFLICT (id) DO NOTHING;
