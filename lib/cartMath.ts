// Single place that knows how a cart line is priced:
// (base price + selected toppings/sides) x quantity.
type Extra = { price?: number | string };
type Line = {
  price: number | string;
  quantity?: number;
  customizations?: Extra[] | null;
};

export const extrasTotal = (item: Line) =>
  (item.customizations ?? []).reduce(
    (sum, c) => sum + (Number(c.price) || 0),
    0,
  );

export const unitPrice = (item: Line) =>
  (Number(item.price) || 0) + extrasTotal(item);

export const lineTotal = (item: Line) =>
  unitPrice(item) * (Number(item.quantity) || 1);

export const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2);
