"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseValue(value: string) {
  if (!value) return { date: undefined as Date | undefined, time: "09:00" };
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return { date: new Date(y, m - 1, d), time: timePart ?? "09:00" };
}

function toValue(date: Date, time: string) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

type DateTimeFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function DateTimeField({ id, value, onChange, required }: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const { date, time } = parseValue(value);

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
              ? `${date.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })} à ${time}`
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
            onChange(toValue(nextDate, time));
          }}
        />
        <div className="border-t border-border p-2.5">
          <Input
            type="time"
            required={required}
            value={time}
            onChange={(e) => {
              const nextTime = e.target.value || "00:00";
              onChange(toValue(date ?? new Date(), nextTime));
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
