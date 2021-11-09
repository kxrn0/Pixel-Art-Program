export function draw_cells(context, cells) {
    let cellW, resolution;
    resolution = Math.sqrt(cells.length);
    cellW = context.canvas.width / resolution;
    for (let x = 0; x < resolution; x++)
        for (let y = 0; y < resolution; y++) {
            context.fillStyle = cells[x + y * resolution];
            context.fillRect(x * cellW, y * cellW, cellW, cellW);
        }
}

export function clear_cells(context, cells) {
    for (let i = 0; i < cells.length; i++)
        cells[i] = "rgba(0, 0, 0, 0)";
    draw_cells(context, cells);
}

export function draw_grid(context, cellW) {
    context.strokeStyle = "rgba(4, 1, 3, 0.75)";
    context.lineWidth = 1;

    let resolution = context.canvas.width * cellW;

    for (let x = 0; x < resolution; x++) {
        context.beginPath();
        context.moveTo(x * cellW, 0);
        context.lineTo(x * cellW, resolution * cellW);
        context.stroke();
    }

    for (let y = 0; y < resolution; y++) {
        context.beginPath();
        context.moveTo(0, y * cellW);
        context.lineTo(resolution * cellW, y * cellW);
        context.stroke();
    }
}

export function index_of(canvasX, canvasY, cellW) {
    return {indexX: Math.floor(canvasX / cellW), indexY: Math.floor(canvasY / cellW)};
}