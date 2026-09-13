-- La relance client (derniereRelanceAt) doit pouvoir se faire sur une
-- facture deja verrouillee : sans cette mise a jour du trigger
-- d'immutabilite (voir migration facture_immutability_triggers), elle
-- serait bloquee comme n'importe quelle autre modification.
CREATE OR REPLACE FUNCTION facture_bloquer_modification_verrouillee()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."verrouillee" THEN
      RAISE EXCEPTION 'Facture % verrouillée : suppression interdite', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  IF OLD."verrouillee" THEN
    IF NOT (
      (
        (OLD.status = 'EMISE' AND NEW.status = 'PAYEE' AND NEW."verrouillee" = TRUE)
        OR (NEW.status = OLD.status AND NEW."verrouillee" = TRUE)
      )
      AND (to_jsonb(NEW) - 'status' - 'payeeAt' - 'updatedAt' - 'derniereRelanceAt')
        = (to_jsonb(OLD) - 'status' - 'payeeAt' - 'updatedAt' - 'derniereRelanceAt')
    ) THEN
      RAISE EXCEPTION 'Facture % verrouillée : seul le passage au statut PAYEE ou une relance sont autorisés', OLD.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
