import { useCurrencyDisplay } from '@/hooks/useSettings';
import {
  formatMoney,
  getUnitLabel,
  toDisplayValue,
  toRialFromInput,
} from '@/utils/money';

export function useMoney() {
  const currencyDisplay = useCurrencyDisplay();

  return {
    currencyDisplay,
    formatMoney: (rialValue: number) => formatMoney(rialValue, currencyDisplay),
    toDisplayValue: (rialValue: number) =>
      toDisplayValue(rialValue, currencyDisplay),
    toRialFromInput: (inputValue: number) =>
      toRialFromInput(inputValue, currencyDisplay),
    unitLabel: getUnitLabel(currencyDisplay),
  };
}
