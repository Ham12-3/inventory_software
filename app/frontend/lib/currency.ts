/**
 * Currency utility functions for British Pounds
 */

/**
 * Format a number as British Pounds currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const { 
    showSymbol = true, 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2 
  } = options;

  const formatter = new Intl.NumberFormat('en-GB', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'GBP',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(amount);
};

/**
 * Format currency for display in tables and lists
 * @param amount - The amount to format
 * @returns Formatted currency string with £ symbol
 */
export const formatPrice = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

/**
 * Parse a currency string to a number
 * @param currencyString - String like "£12.34" or "12.34"
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format large amounts with thousands separators
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatLargeCurrency = (amount: number): string => {
  return formatCurrency(amount, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
}; 