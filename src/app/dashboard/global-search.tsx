"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, FileText, Receipt, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchAction } from "./search-action";
import type { SearchResults } from "@/services/search.service";

const EMPTY_RESULTS: SearchResults = { clients: [], devis: [], factures: [], interventions: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      return;
    }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        setResults(await searchAction(query));
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results.clients.length > 0 ||
    results.devis.length > 0 ||
    results.factures.length > 0 ||
    results.interventions.length > 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search /> Rechercher…
        <kbd className="ml-2 hidden rounded border border-border px-1.5 font-mono text-xs sm:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Recherche"
        description="Rechercher un client, un devis, une facture ou une intervention"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Rechercher un client, un devis, une facture..."
        />
        <CommandList>
          {query.trim().length < 2 ? (
            <CommandEmpty>Tapez au moins 2 caractères.</CommandEmpty>
          ) : !hasResults && !isPending ? (
            <CommandEmpty>Aucun résultat pour « {query} ».</CommandEmpty>
          ) : (
            <>
              {results.clients.length > 0 && (
                <CommandGroup heading="Clients">
                  {results.clients.map((r) => (
                    <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.href)}>
                      <Users />
                      <span>{r.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.devis.length > 0 && (
                <CommandGroup heading="Devis">
                  {results.devis.map((r) => (
                    <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.href)}>
                      <FileText />
                      <span>{r.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.factures.length > 0 && (
                <CommandGroup heading="Factures">
                  {results.factures.map((r) => (
                    <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.href)}>
                      <Receipt />
                      <span>{r.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.interventions.length > 0 && (
                <CommandGroup heading="Planning">
                  {results.interventions.map((r) => (
                    <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.href)}>
                      <CalendarClock />
                      <span>{r.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
