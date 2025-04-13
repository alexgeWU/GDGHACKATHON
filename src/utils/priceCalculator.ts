interface UnitInfo {
  value: number;
  unit: string;
}

interface PriceInfo {
  totalPrice: number;
  unitPrice: number | null;
  quantity: number;
  unit: string;
}

function parseUnitInfo(text: string): UnitInfo | null {
  const regex = /(\d+(\.\d+)?)(\s*)(oz|fl oz|lb|g|kg|ml|l|count|ct|pk)/i;
  const match = text.match(regex);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[4].toLowerCase();

  return { value, unit };
}

function normalizeToBaseUnit(value: number, unit: string): number | null {
  switch (unit) {
    case 'oz': return value * 28.35; // grams
    case 'fl oz': return value * 29.57; // milliliters
    case 'lb': return value * 453.6; // grams
    case 'g': return value;
    case 'kg': return value * 1000;
    case 'ml': return value;
    case 'l': return value * 1000;
    case 'count':
    case 'ct':
    case 'pk':
      return value;
    default: return null;
  }
}

export function calculatePriceInfo(name: string, price: number): PriceInfo | null {
  const parsed = parseUnitInfo(name);
  if (!parsed) return null;

  const quantity = normalizeToBaseUnit(parsed.value, parsed.unit);
  if (!quantity || price === null) return null;

  return {
    totalPrice: price,
    unitPrice: price / quantity,
    quantity: parsed.value,
    unit: parsed.unit
  };
}

export function formatPriceInfo(priceInfo: PriceInfo): string {
  return `$${priceInfo.totalPrice.toFixed(2)} for ${priceInfo.quantity} ${priceInfo.unit} ($${(priceInfo.unitPrice || 0).toFixed(3)} per ${priceInfo.unit})`;
} 