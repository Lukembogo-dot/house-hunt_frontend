/**
 * Formats a price value.
 * If the price is >= 1,000,000, it formats it as "1.5M", "2M" etc.
 * Otherwise it returns the standard locale string with commas.
 * 
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined) return "";

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return price;

    if (numericPrice >= 1000000) {
        const millions = numericPrice / 1000000;
        // toFixed(2) gives 2 decimals. parseFloat removes trailing .00 or .X0 (e.g. "1.00" -> 1, "1.50" -> 1.5, "1.25" -> 1.25)
        return parseFloat(millions.toFixed(2)) + "M";
    }

    return numericPrice.toLocaleString();
};
