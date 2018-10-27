export default {
  name: 'CSSPaint API',
  console: true,
  js: ``,
  css: `.placeholder {
  background-image: paint(placeholder);
  background-color: whitesmoke;
  width: 160px;
  height: 90px;
}`,
  html: `<div class="placeholder"></div>`,
  worklet: `const LINE_WIDTH = 2;

registerPaint('placeholder', class {
  paint(ctx, {width, height}, styleMap) {
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeRect(0, 0, width, height);

    ctx.lineWidth = LINE_WIDTH / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
  }
}); `,
  type: 'paint'
};
