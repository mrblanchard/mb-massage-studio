import QRCode from "qrcode";

export async function generateQrDataUrl(text: string, color: string): Promise<string> {
  return QRCode.toDataURL(text, {
    color: { dark: color, light: "#ffffff" },
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
  });
}
