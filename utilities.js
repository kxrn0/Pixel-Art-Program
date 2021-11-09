
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

function hex_to_dex_bits(hex) {
    hex = hex.toUpperCase();
    
    if (hex.charCodeAt() < 58)
        return hex.charCodeAt() - 48;
    return hex.charCodeAt() - 55;
}

export function hexadecimal_to_decimal(hex) {
    let dec, power;

    dec = 0;
    power = hex.length - 1;

    for (let i = 0; i < hex.length; i++, power--)
        dec += Math.pow(16, power) * hex_to_dex_bits(hex[i]);
    
    return dec;
}