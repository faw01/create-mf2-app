"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@repo/design-system/components/ui/carousel";
import type { Dictionary } from "@repo/internationalization";
import { useEffect, useState } from "react";

type CasesProps = {
  dictionary: Dictionary;
};

export const Cases = ({ dictionary }: CasesProps) => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <h2 className="text-left font-regular text-xl tracking-tighter md:text-5xl lg:max-w-xl">
            {dictionary.web.home.cases.title}
          </h2>
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((number) => (
                <CarouselItem
                  className="basis-1/4 lg:basis-1/6"
                  key={`logo-${number}`}
                >
                  <div className="flex aspect-square items-center justify-center rounded-md bg-muted p-6">
                    <span className="text-sm">Logo {number}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
