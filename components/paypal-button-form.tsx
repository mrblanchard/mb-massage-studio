import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { PayPalButton } from "@/lib/sections/schemas/columns";

export function PayPalButtonForm({ hostedButtonId, itemName, options, qrCodeUrl }: PayPalButton) {
  return (
    <div className="flex flex-col gap-4">
      <form
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="cmd" value="_s-xclick" />
        <input type="hidden" name="hosted_button_id" value={hostedButtonId} />
        <input type="hidden" name="on0" value={itemName} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`os0-${hostedButtonId}`} className="text-base font-medium">
            {itemName}
          </label>
          <select
            id={`os0-${hostedButtonId}`}
            name="os0"
            className="h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="currency_code" value="USD" />
        <Button type="submit" className="h-10 w-full max-w-xs text-base">
          Buy Now
        </Button>
      </form>
      {qrCodeUrl && (
        <div className="relative aspect-square w-full max-w-xs">
          <Image
            src={qrCodeUrl}
            alt="Scan to pay with PayPal"
            fill
            className="object-contain"
            sizes="(min-width: 640px) 20rem, 60vw"
          />
        </div>
      )}
    </div>
  );
}
