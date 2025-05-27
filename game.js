"use strict";
class ConnectTheDotsGame {
    constructor() {
        this.gridSize = 5;
        this.currentPoint = 0;
        this.points = [];
        this.lines = [];
        this.level = 1;
        this.score = 0;
        this.isDrawing = false;
        this.currentLine = null;
        this.painting = false;
        this.initializeGame();
        this.setupEventListeners();
    }
    initializeGame() {
        this.createGrid();
        this.generatePoints();
        this.updateUI();
    }
    createGrid() {
        const container = document.getElementById('game-container');
        container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        container.innerHTML = '';
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            container.appendChild(cell);
        }
    }
    generatePoints() {
        this.points = [];
        const numPoints = Math.min(5 + this.level, this.gridSize * this.gridSize);
        const cells = document.querySelectorAll('.grid-cell');
        // Limpiar puntos y pintura anteriores
        cells.forEach(cell => {
            const existingPoint = cell.querySelector('.point');
            if (existingPoint) existingPoint.remove();
            cell.classList.remove('painted');
        });
        // Crear camino válido
        const path = this.generateValidPath(numPoints);
        // Colocar los puntos en el camino
        for (let i = 0; i < path.length; i++) {
            const { row, col } = path[i];
            const cellIndex = row * this.gridSize + col;
            const cell = cells[cellIndex];
            const point = document.createElement('div');
            point.className = 'point';
            point.textContent = (i + 1).toString();
            point.dataset.number = (i + 1).toString();
            cell.appendChild(point);
            this.points.push({
                element: point,
                cell: cell,
                number: i + 1
            });
        }
    }
    generateValidPath(length) {
        const directions = [
            { dr: -1, dc: 0 }, // arriba
            { dr: 1, dc: 0 },  // abajo
            { dr: 0, dc: -1 }, // izquierda
            { dr: 0, dc: 1 }   // derecha
        ];
        const visited = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(false));
        // Elegir un punto de inicio aleatorio
        let row = Math.floor(Math.random() * this.gridSize);
        let col = Math.floor(Math.random() * this.gridSize);
        const path = [{ row, col }];
        visited[row][col] = true;
        for (let step = 1; step < length; step++) {
            // Buscar vecinos no visitados
            const neighbors = [];
            for (const { dr, dc } of directions) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize && !visited[nr][nc]) {
                    neighbors.push({ row: nr, col: nc });
                }
            }
            if (neighbors.length === 0) break; // No hay más movimientos posibles
            // Elegir un vecino aleatorio
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            row = next.row;
            col = next.col;
            visited[row][col] = true;
            path.push({ row, col });
        }
        // Si el camino es más corto de lo necesario, volver a intentar
        if (path.length < length) {
            return this.generateValidPath(length);
        }
        return path;
    }
    setupEventListeners() {
        const container = document.getElementById('game-container');
        // Pintar celdas al arrastrar
        container.addEventListener('mousedown', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;
            this.painting = true;
            this.paintCell(cell);
        });
        container.addEventListener('mouseover', (e) => {
            if (!this.painting) return;
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;
            this.paintCell(cell);
        });
        document.addEventListener('mouseup', () => {
            this.painting = false;
        });
        // Juego original: conectar puntos
        container.addEventListener('mousedown', (e) => {
            const point = e.target.closest('.point');
            if (!point) return;
            const pointNumber = parseInt(point.dataset.number);
            if (pointNumber === this.currentPoint + 1) {
                this.isDrawing = true;
                this.startLine(point);
            }
        });
        container.addEventListener('mousemove', (e) => {
            if (!this.isDrawing || !this.currentLine) return;
            this.updateLine(e);
        });
        container.addEventListener('mouseup', (e) => {
            if (!this.isDrawing) return;
            const point = e.target.closest('.point');
            if (point) {
                const pointNumber = parseInt(point.dataset.number);
                if (pointNumber === this.currentPoint + 2) {
                    this.completeLine(point);
                }
            }
            this.isDrawing = false;
            if (this.currentLine) {
                this.currentLine.remove();
                this.currentLine = null;
            }
        });
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetLevel();
        });
        window.addEventListener('resize', () => {
            this.createGrid();
            this.generatePoints();
        });
    }
    paintCell(cell) {
        if (!cell.classList.contains('painted')) {
            cell.classList.add('painted');
        }
    }
    startLine(point) {
        this.currentLine = document.createElement('div');
        this.currentLine.className = 'line';
        point.parentElement.appendChild(this.currentLine);
        this.updateLine({ clientX: point.offsetLeft, clientY: point.offsetTop });
    }
    updateLine(e) {
        if (!this.currentLine) return;
        const startPoint = this.points[this.currentPoint].element;
        const rect = startPoint.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        const endX = e.clientX;
        const endY = e.clientY;
        const length = Math.sqrt(
            Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        );
        const angle = Math.atan2(endY - startY, endX - startX);
        this.currentLine.style.width = `${length}px`;
        this.currentLine.style.transform = `rotate(${angle}rad)`;
    }
    completeLine(point) {
        if (!this.currentLine) return;
        const startPoint = this.points[this.currentPoint].element;
        const endPoint = point;
        const startRect = startPoint.getBoundingClientRect();
        const endRect = endPoint.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;
        const length = Math.sqrt(
            Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        );
        const angle = Math.atan2(endY - startY, endX - startX);
        this.currentLine.style.width = `${length}px`;
        this.currentLine.style.transform = `rotate(${angle}rad)`;
        this.currentLine.classList.add('completed');
        this.currentPoint++;
        this.score += 10;
        point.classList.add('completed');
        if (this.currentPoint === this.points.length - 1) {
            setTimeout(() => {
                this.level++;
                this.resetLevel();
            }, 1000);
        }
        this.updateUI();
    }
    resetLevel() {
        this.currentPoint = 0;
        this.points = [];
        this.lines = [];
        this.createGrid();
        this.generatePoints();
        this.updateUI();
    }
    updateUI() {
        document.getElementById('level').textContent = this.level.toString();
        document.getElementById('score').textContent = this.score.toString();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ConnectTheDotsGame();
});
