"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Caption(props: { displayMonth: Date; onMonthChange?: (date: Date) => void }) {
  const { displayMonth, onMonthChange } = props;
  const dayPicker = useDayPicker();
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })
  );
  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = 1900; y <= currentYear + 10; y++) years.push(y);

  return (
    <div className="flex gap-2 justify-center items-center w-full bg-background text-foreground font-sans mb-2">
      <Select
        value={displayMonth.getMonth().toString()}
        onValueChange={val => {
          const newDate = new Date(displayMonth);
          newDate.setMonth(Number(val));
          onMonthChange?.(newDate);
        }}
      >
        <SelectTrigger className="w-28 h-8 text-base font-sans bg-background border-border">
          <SelectValue className="font-sans" >{months[displayMonth.getMonth()]}</SelectValue>
        </SelectTrigger>
        <SelectContent className="font-sans">
          <SelectGroup>
            {months.map((m: string, i: number) => (
              <SelectItem key={m} value={i.toString()} className="font-sans">{m}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={displayMonth.getFullYear().toString()}
        onValueChange={val => {
          const newDate = new Date(displayMonth);
          newDate.setFullYear(Number(val));
          onMonthChange?.(newDate);
        }}
      >
        <SelectTrigger className="w-20 h-8 text-base font-sans bg-background border-border">
          <SelectValue className="font-sans">{displayMonth.getFullYear()}</SelectValue>
        </SelectTrigger>
        <SelectContent className="font-sans">
          <SelectGroup>
            {years.map((y: number) => (
              <SelectItem key={y} value={y.toString()} className="font-sans">{y}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rounded-lg bg-background text-foreground font-sans", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex flex-col items-center justify-center mb-2 gap-1 bg-background text-foreground font-sans",
        caption_label: "hidden",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Caption,
      }}
      captionLayout="dropdown"
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
