"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();
  const params = useParams();

  const switchLanguage = (locale: string) => {
    const defaultLocale = "en";
    let newPathname = pathname;

    // The default locale is omitted from URLs; prefix it so the replace
    // below has a locale segment to swap.
    if (
      !pathname.startsWith(`/${params.locale}`) &&
      params.locale === defaultLocale
    ) {
      newPathname = `/${params.locale}${pathname}`;
    }

    newPathname = newPathname.replace(`/${params.locale}`, `/${locale}`);

    router.push(newPathname);
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
