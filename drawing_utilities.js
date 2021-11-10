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

export function draw_line(event, prevCoords, cells, cellWidth, color) {
    let prev, curr, start, end, resolution;
    prev = index_of(prevCoords.prevX, prevCoords.prevY, cellWidth);
    curr = index_of(event.offsetX, event.offsetY, cellWidth);
    resolution = Math.sqrt(cells.length);

    if (prev.indexX != curr.indexX || prev.indexY != curr.indexY) {
        if (prev.indexX != curr.indexX) {
            let slope;

            start = prev.indexX < curr.indexX ? prev.indexX : curr.indexX;
            end = (prev.indexX < curr.indexX ? curr.indexX : prev.indexX) % resolution;
            if (start < 0)
                start = 0;
            slope = (curr.indexY - prev.indexY) / (curr.indexX - prev.indexX);
            for (let xi = start; xi <= end; xi++) {
                let yi = Math.round(slope * (xi - prev.indexX) + prev.indexY);
                cells[xi + yi * resolution] = color;
            }
        }
        else {
            start = prev.indexY < curr.indexY ? prev.indexY : curr.indexY;
            end = (prev.indexY < curr.indexY ? curr.indexY : prev.indexY) % resolution;
            for (let yi = start; yi <= end; yi++)
                cells[prev.indexX + yi * resolution] = color;
        }
    }
}