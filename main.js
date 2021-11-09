import { random_color, decimal_to_hexadecimal, hexadecimal_to_decimal} from "./utilities.js";
import { draw_cells, clear_cells, draw_grid, index_of } from "./drawing_utilities.js";

//=======================================================================================================

const pen = document.getElementById("pen");
const eraser = document.getElementById("eraser");
const fill = document.getElementById("fill");
const colorPicker = document.getElementById("color-picker");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const checkGrid = document.getElementById("check-grid");
const save = document.getElementById("save-link");

const newCanvas = document.querySelector(".new-canvas");
const modal = document.querySelector(".modal");
const sizeButtons = document.querySelectorAll(".size-radio");
const customSize = document.getElementById("custom-size");
const createCanvas = document.querySelector(".create-canvas");

const clearCanvas = document.querySelector(".clear-canvas");
const colorSelector = document.getElementById("color-selector");
const colors = [...document.querySelectorAll(".color-pad")];
const modes = {
    PEN: "PEN",
    COLOR_PICKER: "COLOR_PICKER",
    FILL: "FILL"
};

let resolution, cellWidth, color, isDrawing, prevX, prevY, mode, cells;

//=======================================================================================================

pen.addEventListener("click", () => {
    mode = modes.PEN;
    color = colorSelector.value;
});

eraser.addEventListener("click", () => {
    mode = modes.PEN;
    color = "rgba(0, 0, 0, 0)"
});

//I will replace the fill functionality with flood fill later
fill.addEventListener("click", () => {
    mode = modes.FILL
    color = colorSelector.value;
});

colorPicker.addEventListener("click", () => mode = modes.COLOR_PICKER);

colors.forEach(colorPad => colorPad.addEventListener("click", () => {
    if (colorPad.style.background) {
        color = colorPad.style.background;
        colorSelector.value = rgb_to_hex(color);
        update_color_history(colors, color);
    }
}));

canvas.addEventListener("mousedown", event => {
    isDrawing = true;
    prevX = event.offsetX;
    prevY = event.offsetY;

    if (mode == modes.PEN) {
        let cell = index_of(event.offsetX, event.offsetY, cellWidth);
        cells[cell.indexX + cell.indexY * resolution] = color;
    }
    else if (mode == modes.COLOR_PICKER) {
        color = colorSelector.value;
        mode = modes.PEN;
        update_color_history(colors, color);
    }
    else if (mode == modes.FILL) { 
        for (let i = 0; i < cells.length; i++)
            cells[i] = color;
        mode = modes.PEN;
    }

});

//this is certainly an annoying bug, but I think I'll finish the implementation of the rest of the buttons and color
//history pad, and will ask for help later.
canvas.addEventListener("mousemove", event => {
    if (mode == modes.PEN) {
        if (isDrawing) {
            let prev, curr, start, end;
            prev = index_of(prevX, prevY, cellWidth);
            curr = index_of(event.offsetX, event.offsetY, cellWidth);

            if (prev.indexX != curr.indexX || prev.indexY != curr.indexY) {
                if (prev.indexX != curr.indexX) {
                    let slope;

                    start = prev.indexX < curr.indexX ? prev.indexX : curr.indexX;
                    end = prev.indexX < curr.indexX ? curr.indexX : prev.indexX;
                    slope = (curr.indexY - prev.indexY) / (curr.indexX - prev.indexX);
                    for (let xi = start; xi <= end; xi++) {
                        let yi = Math.round(slope * (xi - prev.indexX) + prev.indexY);
                        cells[xi + yi * resolution] = color;
                    }
                }
                else {
                    start = prev.indexY < curr.indexY ? prev.indexY : curr.indexY;
                    end = prev.indexY < curr.indexY ? curr.indexY : prev.indexY;
                    for (let yi = start; yi <= end; yi++)
                        cells[prev.indexX + yi * resolution] = color;
                }
            }
        }
        prevX = event.offsetX;
        prevY = event.offsetY;

    }
    else if (mode == modes.COLOR_PICKER) { 
        let colorData = pick_color(event, context);
        colorSelector.value = `#${decimal_to_hexadecimal(colorData[0]).padStart(2, 0)}${decimal_to_hexadecimal(colorData[1]).padStart(2, 0)}${decimal_to_hexadecimal(colorData[2]).padStart(2, 0)}`;
    }
});

canvas.addEventListener("mouseup", event => {
    isDrawing = false;

    if (mode == modes.PEN) { }
    else if (mode == modes.COLOR_PICKER) { }
    else if (mode == modes.FILL) { }
});

canvas.addEventListener("mouseout", () => {
    if (isDrawing) {
        isDrawing = false;
    }
});

//........................................................................................................

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

function rgb_to_hex(rgb) {
    let hex = '#';
    let colors = rgb.split(' ');
    for (let i = 0; i < colors.length; i++)
      hex += decimal_to_hexadecimal(colors[i].match(/\d+/)[0]).padStart(2, '0');

    return hex;
  }

function update_color_history(colors, color) {
    let padHasColor = false, index;
    color = color.includes('#') ? color.toLowerCase() : rgb_to_hex(color).toLowerCase();

    for (let i = 0; i < colors.length; i++) {
        let bgColor = colors[i].style.background;
        if (bgColor) {
            let largest, perDrop, threshold, color1, color2, diff;
            color1 = hexadecimal_to_decimal(color.slice(1));
            color2 = hexadecimal_to_decimal(rgb_to_hex(bgColor).slice(1));
            diff = Math.abs(color1 - color2);
            largest = color1 > color2 ? color1 : color2;
            perDrop = 100 * diff / largest;
            threshold = 1;
            
            if (perDrop < threshold) {
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

function pick_color(event, context) {
    let x, y, pixel;
    x = event.layerX;
    y = event.layerY;
    pixel = context.getImageData(x, y, 1, 1);
    return pixel.data;
}

/* ******************************************************************************************************** */

save.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw_cells(context, cells);
    save.href = canvas.toDataURL("image/png");
});

clearCanvas.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    clear_cells(context, cells);
});

colorSelector.addEventListener("change", event => {
    color = event.target.value;
    update_color_history(colors, color);
});

//=======================================================================================================

function init(res) {
    resolution = res;
    cellWidth = canvas.width / resolution;

    color = colorSelector.value;
    colors[0].style.background = color;
    colors[0].classList.add("color");
    colors[0].classList.add("hovered");
    isDrawing = false;
    mode = modes.PEN;

    cells = [];
    let area = resolution * resolution;
    for (let i = 0; i < area; i++)
        cells[i] = random_color();
}

newCanvas.addEventListener("click", () => modal.style.display = "block");

sizeButtons.forEach(button => button.addEventListener("click", () => customSize.value = ''));

customSize.addEventListener("input", () => {
    sizeButtons.forEach(button => button.checked = false);

    if (customSize.value > 128)
        customSize.value = 128;
});

customSize.addEventListener("focusout", () => {
    let checked = false;
    sizeButtons.forEach(button => {
        if (button.checked) {
            checked = true;
        }
    });
    if (customSize.value < 4 && !checked)
        customSize.value = 4;
});

createCanvas.addEventListener("click", () => {
    modal.style.display = "none";

    let size = 8;
    if (customSize.value)
        size = customSize.value;
    else
        sizeButtons.forEach(button => {
            if (button.checked)
                size = parseInt(button.value);
        });

    init(size);

    customSize.value = '';
    sizeButtons.forEach(button => button.checked = false);
});

//=======================================================================================================

function anime() {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    draw_cells(context, cells);
    if (checkGrid.checked)
        draw_grid(context, cellWidth);

    requestAnimationFrame(anime);
}

init(8);

anime();

//=======================================================================================================