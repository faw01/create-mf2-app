"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";

const languages = [
  { label: "🇬🇧 English", value: "en" },
  { label: "🇪🇸 Español", value: "es" },
  { label: "🇩🇪 Deutsch", value: "de" },
  { label: "🇨🇳 中文", value: "zh" },
  { label: "🇫🇷 Français", value: "fr" },
  { label: "🇵🇹 Português", value: "pt" },
];

const LanguageMenuItem = ({
  label,
  onSelect,
  value,
}: {
  label: string;
  onSelect: (locale: string) => void;
  value: string;
}) => {
  const handleClick = () => {
    onSelect(value);
  };

  return <DropdownMenuItem onClick={handleClick}>{label}</DropdownMenuItem>;
};

export const LanguageSwitcher = () => {
  const router = useRouter();

  const switchLanguage = (locale: string) => {
    const defaultLocale = "en";
    const { pathname } = window.location;
    const [, firstSegment] = pathname.split("/");
    const currentLocale = languages.some((l) => l.value === firstSegment)
      ? firstSegment
      : defaultLocale;

    // The default locale is omitted from URLs; prefix it so the replace
    // below has a locale segment to swap.
    const newPathname = pathname.startsWith(`/${currentLocale}`)
      ? pathname
      : `/${currentLocale}${pathname}`;

    router.push(newPathname.replace(`/${currentLocale}`, `/${locale}`));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="shrink-0 text-foreground"
          size="icon"
          variant="ghost"
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map(({ label, value }) => (
          <LanguageMenuItem
            key={value}
            label={label}
            onSelect={switchLanguage}
            value={value}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
