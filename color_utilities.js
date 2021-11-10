import { hexadecimal_to_decimal, decimal_to_hexadecimal } from "./utilities.js";

export function flood_fill(cells, point, tagColor, fillColor) {
    if (!tagColor.includes('#'))
        tagColor = rgb_to_hex(tagColor);
    if (!fillColor.includes('#'))
        fillColor = rgb_to_hex(fillColor);

    if (same_color(tagColor, fillColor, 2.5)) {
        return;
    }

    let res = Math.sqrt(cells.length);
    let cellHexColor = cells[point.indexX + point.indexY * res];
    if (!cellHexColor.includes('#'))
        cellHexColor = rgb_to_hex(cellHexColor);
  
    if (same_color(cellHexColor, tagColor, 2.5)) {
        cells[point.indexX + point.indexY * res] = fillColor;

        if (point.indexY) {
            let top = { indexX : point.indexX, indexY : point.indexY - 1};
            flood_fill(cells, top, tagColor, fillColor);
        }
        if (point.indexX + 1 < res) {
            let right = { indexX : point.indexX + 1, indexY : point.indexY};
            flood_fill(cells, right, tagColor, fillColor);
        }
        if (point.indexY + 1 < res) {
            let bottom = { indexX : point.indexX, indexY : point.indexY + 1};
            flood_fill(cells, bottom, tagColor, fillColor);
        }
        if (point.indexX - 1 >= 0) {
            let left = { indexX : point.indexX - 1, indexY : point.indexY};
            flood_fill(cells, left, tagColor, fillColor);
        }
    }
}

 function add_to_color_history(colors, color) {
    let maxIndex = colors.reduce((index, color) => index += color.classList.contains("color") ? 1 : 0, 0);
    if (maxIndex < colors.length) {
        colors[maxIndex].classList.add("color");
        colors[maxIndex].classList.add("hovered");
    }

    if (maxIndex == colors.length)
        maxIndex--;

    for (let i = maxIndex; i > 0; i--)
        colors[i].style.background = colors[i - 1].style.background;
    colors[0].style.background = color;
}

export function rgb_to_hex(rgb) {
    let hex = '#';
    let colors = rgb.split(' ');
    for (let i = 0; i < colors.length; i++)
      hex += decimal_to_hexadecimal(colors[i].match(/\d+/)[0]).padStart(2, '0');

    return hex;
}

function same_color(color1, color2, threshold) {
    if (color1 === color2)
        return true;

    color1 = hexadecimal_to_decimal(color1.slice(1));
    color2 = hexadecimal_to_decimal(color2.slice(1));

    let largest, perDrop, diff;
    diff = Math.abs(color1 - color2);
    largest = color1 > color2 ? color1 : color2;
    perDrop = 100 * diff / largest;

    return perDrop < threshold;
}

export function update_color_history(colors, color) {
    let padHasColor = false, index;
    color = color.includes('#') ? color.toLowerCase() : rgb_to_hex(color).toLowerCase();

    for (let i = 0; i < colors.length; i++) {
        let bgColor = colors[i].style.background;
        if (bgColor) {
            if (same_color(color, rgb_to_hex(bgColor), 2.5)) {
                padHasColor = true;
                index = i;
                break;
            }
        }
    }

    if (padHasColor) {
        for (let i = index; i > 0; i--)
            colors[i].style.background = colors[i - 1].style.background;
        colors[0].style.background = color;
    }
    else 
        add_to_color_history(colors, color);
}

export function pick_color(event, context) {
    let x, y, pixel;
    x = event.layerX;
    y = event.layerY;
    pixel = context.getImageData(x, y, 1, 1);
    return pixel.data;
}