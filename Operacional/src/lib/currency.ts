export function toMinor(value: string|number, currency = "BRL") {
  // FB retorna strings; converter para centavos
  const n = typeof value === "string" ? parseFloat(value) : value || 0;
  return Math.round(n * 100);
}

export function fromMinor(value: number, currency = "BRL") {
  return (value || 0) / 100;
}

export function formatCurrency(value: number, currency = "BRL") {
  const formatted = fromMinor(value, currency);
  
  switch (currency) {
    case "BRL":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(formatted);
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency", 
        currency: "USD"
      }).format(formatted);
    default:
      return `${formatted.toFixed(2)} ${currency}`;
  }
}

export function parseCurrency(value: string, currency = "BRL"): number {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^\d.,]/g, "");
  const parsed = parseFloat(cleaned.replace(",", "."));
  return toMinor(parsed, currency);
}
