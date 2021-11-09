
export function random_color() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

export function dex_to_hex_bits(dex) {
    if (dex < 10)
        return String.fromCharCode(dex + 48);
    return String.fromCharCode(55 + dex);
}

export function decimal_to_hexadecimal(decimal) {
    let hex = [];

    while (decimal) {
        hex.unshift(dex_to_hex_bits(decimal % 16));
        decimal = Math.floor(decimal / 16);
    }
    return hex.join('');
}