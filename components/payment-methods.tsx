import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { PayPalButton, SquareButton, VenmoButton } from "@/lib/sections/schemas/columns";

interface PaymentMethodsProps {
  payPalButton?: PayPalButton;
  venmoButton?: VenmoButton;
  squareButton?: SquareButton;
  payPalQr: string | null;
  venmoQr: string | null;
  squareQr: string | null;
}

function QrImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(min-width: 640px) 20rem, 60vw"
        unoptimized
      />
    </div>
  );
}

export function PaymentMethods({
  payPalButton,
  venmoButton,
  squareButton,
  payPalQr,
  venmoQr,
  squareQr,
}: PaymentMethodsProps) {
  if (!payPalButton && !venmoButton && !squareButton) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {payPalButton && (
        <div className="flex flex-col gap-3">
          <form
            action="https://www.paypal.com/cgi-bin/webscr"
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value={payPalButton.hostedButtonId} />
            <input type="hidden" name="on0" value={payPalButton.itemName} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`os0-${payPalButton.hostedButtonId}`} className="text-base font-medium">
                {payPalButton.itemName}
              </label>
              <select
                id={`os0-${payPalButton.hostedButtonId}`}
                name="os0"
                className="h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {payPalButton.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="currency_code" value="USD" />
            <Button type="submit" className="h-10 w-full max-w-xs text-base">
              Buy Now with PayPal
            </Button>
          </form>
          {payPalQr && <QrImage src={payPalQr} alt="Scan to pay with PayPal" />}
        </div>
      )}

      {payPalButton && (venmoButton || squareButton) && (
        <div className="h-px w-full max-w-xs bg-border" />
      )}

      {venmoButton && (
        <div className="flex flex-col gap-3">
          <Button
            className="h-10 w-full max-w-xs text-base"
            nativeButton={false}
            render={
              <a
                href={`https://venmo.com/u/${venmoButton.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay with Venmo
              </a>
            }
          />
          {venmoQr && <QrImage src={venmoQr} alt="Scan to pay with Venmo" />}
        </div>
      )}

      {venmoButton && squareButton && <div className="h-px w-full max-w-xs bg-border" />}

      {squareButton && (
        <div className="flex flex-col gap-3">
          <Button
            className="h-10 w-full max-w-xs text-base"
            nativeButton={false}
            render={
              <a href={squareButton.checkoutUrl} target="_blank" rel="noopener noreferrer">
                Pay with Square
              </a>
            }
          />
          {squareQr && <QrImage src={squareQr} alt="Scan to pay with Square" />}
        </div>
      )}
    </div>
  );
}
