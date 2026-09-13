"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseValue(value: string) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type DateFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateField({ id, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const date = parseValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon />
            {date
              ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
              : "Choisir une date"}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          locale={fr}
          selected={date}
          defaultMonth={date}
          onSelect={(nextDate) => {
            if (!nextDate) return;
            onChange(toValue(nextDate));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
