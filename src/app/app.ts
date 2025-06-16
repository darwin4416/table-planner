import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: fabric.Canvas;

  shape: 'circle' | 'rectangle' | 'square' = 'circle';

  // Chair inputs for rectangle/square
  rectChairInputs = { top: 2, bottom: 2, left: 1, right: 1 };

  // Chair inputs per quadrant for circle
  circleChairInputs = {
    ne: 1,
    se: 1,
    sw: 1,
    nw: 1
  };

  tableIdCounter = 1;
  tables: {
    id: number;
    type: string;
    fabricObject: fabric.Object;
    chairCount: number;
  }[] = [];

  ngOnInit(): void {
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: 800,
      height: 500,
      backgroundColor: '#f5f5f5',
      selection: false
    });

    // Enable object movement
    this.canvas.on('object:moving', () => {
      this.canvas.renderAll();
    });
  }

  addTable(): void {
  let table: fabric.Object;
  const id = this.tableIdCounter++;
  let chairCount = 0;
  const chairs: fabric.Circle[] = [];

  // Random position within canvas bounds
  const left = 100 + Math.random() * 600;
  const top = 100 + Math.random() * 300;

  switch (this.shape) {
    case 'circle':
      table = new fabric.Circle({
        radius: 40,
        fill: '#8ecae6',
        left: left,
        top: top,
        originX: 'center',
        originY: 'center',
        selectable: true
      });
      chairCount = this.addCircleChairs(table.left!, table.top!, this.circleChairInputs, chairs);
      break;

    case 'rectangle':
      table = new fabric.Rect({
        width: 120,
        height: 60,
        fill: '#fb8500',
        left: left,
        top: top,
        originX: 'center',
        originY: 'center',
        selectable: true
      });
      chairCount = this.addRectChairs(table.left!, table.top!, 120, 60, this.rectChairInputs, chairs);
      break;

    case 'square':
      table = new fabric.Rect({
        width: 80,
        height: 80,
        fill: '#219ebc',
        left: left,
        top: top,
        originX: 'center',
        originY: 'center',
        selectable: true
      });
      chairCount = this.addRectChairs(table.left!, table.top!, 80, 80, this.rectChairInputs, chairs);
      break;
  }

  // Create a group with table and chairs
  const group = new fabric.Group([table, ...chairs], {
    left: left,
    top: top,
    selectable: true,
    hasControls: true,
    hasBorders: true
  });

  this.canvas.add(group);
  this.tables.push({ id, type: this.shape, fabricObject: group, chairCount });
  this.canvas.renderAll();
}

  addChair(x: number, y: number, chairs: fabric.Circle[]): void {
  const chair = new fabric.Circle({
    radius: 6,
    fill: '#023047',
    left: x,
    top: y,
    originX: 'center',
    originY: 'center',
    selectable: false
  });
  chairs.push(chair);
}

addCircleChairs(cx: number, cy: number, quadrantChairs: any, chairs: fabric.Circle[]): number {
  const radius = 70;
  let total = 0;

  const quadrants = [
    { key: 'ne', start: 0, end: 90 },
    { key: 'se', start: 90, end: 180 },
    { key: 'sw', start: 180, end: 270 },
    { key: 'nw', start: 270, end: 360 }
  ];

  quadrants.forEach(q => {
    const count = quadrantChairs[q.key];
    if (count > 0) {
      const angleStep = (q.end - q.start) / (count + 1);
      for (let i = 1; i <= count; i++) {
        const angle = (q.start + i * angleStep) * (Math.PI / 180);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        this.addChair(x, y, chairs);
        total++;
      }
    }
  });

  return total;
}

addRectChairs(cx: number, cy: number, width: number, height: number, edges: any, chairs: fabric.Circle[]): number {
  const spacing = 20;
  const leftX = cx - width / 2;
  const topY = cy - height / 2;
  let total = 0;

  // Top edge
  for (let i = 0; i < edges.top; i++) {
    const x = leftX + (i + 1) * (width / (edges.top + 1));
    const y = topY - spacing;
    this.addChair(x, y, chairs);
    total++;
  }

  // Bottom edge
  for (let i = 0; i < edges.bottom; i++) {
    const x = leftX + (i + 1) * (width / (edges.bottom + 1));
    const y = topY + height + spacing;
    this.addChair(x, y, chairs);
    total++;
  }

  // Left edge
  for (let i = 0; i < edges.left; i++) {
    const x = leftX - spacing;
    const y = topY + (i + 1) * (height / (edges.left + 1));
    this.addChair(x, y, chairs);
    total++;
  }

  // Right edge
  for (let i = 0; i < edges.right; i++) {
    const x = leftX + width + spacing;
    const y = topY + (i + 1) * (height / (edges.right + 1));
    this.addChair(x, y, chairs);
    total++;
  }

  return total;
}

  clearCanvas(): void {
  this.canvas.clear();
  this.canvas.backgroundColor = '#f5f5f5';
  this.canvas.renderAll(); // Ensure the background color update is rendered
  this.tables = [];
  this.tableIdCounter = 1;
}
}