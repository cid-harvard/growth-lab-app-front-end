enum FileFormat {
  SVG = 'svg',
  PNG = 'png',
}

interface Input {
  svg: Node | null;
  width: number | undefined;
  height: number | undefined;
  fileFormat?: FileFormat;
}

export default async (input: Input) => {
  const {svg, fileFormat} = input;
  const width = input.width ? input.width : 1500;
  const height = input.height ? input.height : 1500;
  const canvas = document.createElement('canvas');
  if (canvas && svg) {
    const img = new Image();
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);

    img.src = 'data:image/svg+xml;base64,'+ window.btoa(svgStr);
    img.width = width;
    img.height = height;

    canvas.width = width;
    canvas.height = height;
    const canvasContext = await canvas.getContext('2d');
    let url = '';
    if (canvasContext) {
      await canvasContext.drawImage(img, 0, 0, width, height);
      url = canvas.toDataURL('image/png');
    }
    // Now save as png
    const a = document.createElement('a');
    if (fileFormat === FileFormat.SVG) {
      a.href = img.src;
      a.download = 'chart.svg';
    } else {
      a.href = url;
      a.download = 'chart-new.png';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};