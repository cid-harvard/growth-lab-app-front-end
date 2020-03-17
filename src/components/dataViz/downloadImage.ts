enum FileFormat {
  SVG = 'svg',
  PNG = 'png',
}

interface Input {
  svg: Node | null;
  width: number | undefined;
  height: number | undefined;
  title: string;
  fileFormat?: FileFormat;
}

export default (input: Input) => {
  const {svg, title} = input;
  const width = input.width ? input.width : 1500;
  const height = input.height ? input.height : 1500;
  const canvas = document.createElement('canvas');
  if (canvas && svg) {
    const img = new Image();
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);

    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
    img.width = width;
    img.height = height;

    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext('2d');

    let url = '';
    img.onload = function() {
      if (canvasContext) {
        canvasContext.drawImage(img, 0, 0, width, height);
      }
      url = canvas.toDataURL('image/png');

      const fileFormat = input.fileFormat !== undefined ? input.fileFormat : FileFormat.PNG;
      const a = document.createElement('a');
      if (fileFormat === FileFormat.SVG) {
        a.href = img.src;
      } else {
        a.href = url;
      }
      a.download = title +'.' + fileFormat;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      document.body.removeChild(img);
    };

    document.body.appendChild(img);
  }
};