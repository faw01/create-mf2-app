"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const themes = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const ThemeMenuItem = ({ label, value }: { label: string; value: string }) => {
  const { setTheme } = useTheme();
  const handleSelect = useCallback(() => {
    setTheme(value);
  }, [setTheme, value]);

  return <DropdownMenuItem onClick={handleSelect}>{label}</DropdownMenuItem>;
};

export const ModeToggle = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="shrink-0 text-foreground" size="icon" variant="ghost">
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {themes.map(({ label, value }) => (
        <ThemeMenuItem key={value} label={label} value={value} />
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
