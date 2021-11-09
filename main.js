import { random_color, decimal_to_hexadecimal} from "./utilities.js";
import { draw_cells, clear_cells, draw_grid, index_of } from "./drawing_utilities.js";
import { flood_fill, rgb_to_hex, update_color_history, pick_color} from "./color_utilities.js";

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

    canvas.classList.add("pen");
    canvas.classList.remove("eraser");
    canvas.classList.remove("bucket");
    canvas.classList.remove("color-picker");
});

eraser.addEventListener("click", () => {
    mode = modes.PEN;
    color = "rgba(0, 0, 0, 0)"

    canvas.classList.add("eraser");
    canvas.classList.remove("pen");
    canvas.classList.remove("bucket");
    canvas.classList.remove("color-picker");
});

fill.addEventListener("click", () => {
    mode = modes.FILL
    color = colorSelector.value;

    canvas.classList.add("bucket");
    canvas.classList.remove("pen");
    canvas.classList.remove("eraser");
    canvas.classList.remove("color-picker");
});

colorPicker.addEventListener("click", () => {
    mode = modes.COLOR_PICKER

    canvas.classList.add("color-picker");
    canvas.classList.remove("pen");
    canvas.classList.remove("bucket");
    canvas.classList.remove("eraser");
});

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

        canvas.classList.remove("color-picker");
        canvas.classList.add("pen");
    }
    else if (mode == modes.FILL) { 
        let point = index_of(event.offsetX, event.offsetY, cellWidth);
        let tagColor = cells[point.indexX + point.indexY * resolution];
        flood_fill(cells, point, tagColor, color);
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

canvas.addEventListener("mouseup", () => isDrawing = false);

canvas.addEventListener("mouseout", () => {
    if (isDrawing) {
        isDrawing = false;
    }
});

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

function init(res) {
    resolution = res;
    cellWidth = canvas.width / resolution;

    canvas.classList.add("pen");
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