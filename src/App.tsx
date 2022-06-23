import { useEffect, useRef, useState } from "react";
import './App.css'

function* generateAngles(units: number) {
  let current: number;
  const start = 90;
  const unit = 360 / units;
  let next = start;
  for (let i = 0; i < units; i++) {
    if (next === 0) {
      current = 360;
    } else {
      current = next;
    }
    yield current;
    next = current - unit;
  }
}

function* mapGen(it: any, mapFunc: any) {
  for (let item of it) {
    yield mapFunc(item);
  }
}

function genPerimeter(limit: number, diameter: number): Generator {
  const width = diameter || 200;
  return mapGen(generateAngles(limit), (deg: number) => {
    const radians = (deg * Math.PI) / 180
    return {
      x: (width / 2) + (Math.cos(radians) * width / 2),
      y: (width / 2) - (Math.sin(radians) * width / 2),
      angle: deg
    }
  });
}

export default function App() {
  const [color, setColor] = useState<any>('#000');
  const [checked, setChecked] = useState<boolean>(false);
  const [svgBackgroundColor, setSVGBackgroundColor] = useState<any>('transparent')
  const [chart, setChart] = useState<any>([]);
  const [modulus, setModulus] = useState<number>(9)//877
  const [multiplier, setMultiplier] = useState<number>(2);//42
  const [iterations, setIterations] = useState<number>(1);
  const [start, setStart] = useState<number>(1);
  const [log, setLog] = useState<any>([]);
  const svgElement = useRef<any>(undefined);
  const bkgColorElement = useRef<any>(undefined);
  const [spinVortex, setSpinVortex] = useState<boolean>(true);
  const getWidth = () => Math.max(1920, modulus);
  const nextNumber = (n: number, base: number) => (n * multiplier) % base;
  const vortexMath = (base: number) => {
    let points: any = [...genPerimeter(modulus, getWidth())];
    setChart(points);
    let i = start;
    let p = points[i];
    if (!p) return;
    i = nextNumber(i, base);
    let moves = [start, i];
    for (let _ = start; _ < base * iterations; _++) {
      i = nextNumber(i, base);
      moves.push(i);
      if (i === start || moves.slice(-1) === moves.slice(-2, -1)) {
        break;
      }
    }
    setLog(moves);
  }
  const clear = () => {
    setLog([]);
  }
  useEffect(() => {
    if (checked) {
      clear();
      setTimeout(() => {
        vortexMath(modulus);
      }, 20);
    } else {
      vortexMath(modulus);
    }
  }, [start, modulus, multiplier, iterations, color, svgBackgroundColor, checked /* , centerCanvas.current*/]);
  useEffect(() => {
  }, [log]);
  function translateSVG() {
    return log.map((i: number) => ` ${chart[i].x},${chart[i].y}`)
  }
  const triggerDownload = (imgURI: any) => {
    let a = document.createElement('a');
    a.setAttribute('download', `${modulus}-${multiplier}-mod-mult.svg`);
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.click();
  }
  const saveToFile = () => {
    let data = (new XMLSerializer()).serializeToString(svgElement.current);
    let svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    let url = URL.createObjectURL(svgBlob);
    triggerDownload(url);
  }
  return <div className="app" style={{ color: color, backgroundColor: svgBackgroundColor }}>
    <div className="canvas-inputs">
      <div className="color-pickers">
        <label htmlFor="color">Line Color</label>
        <input type="color" id="html5colorpicker" value={color} onChange={(e: any) => { setColor(e.target.value) }}></input>
        <div>
          <input type="checkbox" checked={checked} onChange={(e: any) => {
            const background = (!checked === false) ? 'transparent' : svgBackgroundColor;
            setChecked(!checked);
            setSVGBackgroundColor(background);
            document.body.style.color = color;
            document.body.style.background = background;
            setTimeout(() => {
              svgElement.current.focus();
            }, 500);

          }} />

          <label htmlFor="backgroundColor">Background Color</label>
          <input id="backgroundColor" type="color" ref={bkgColorElement} value={svgBackgroundColor} onChange={(e: any) => {
            const background = checked ? e.target.value : 'transparent';

            setSVGBackgroundColor(background);
            document.body.style.background = background;

          }}></input>
        </div>
      </div>
      <div className="point-multiplier">
        <label htmlFor="multiplier">Multiplier</label>
        <input type="number" id="multiplier" name="multiplier"
          min={2} value={multiplier}
          onChange={(e: any) => {
            setMultiplier(e.target.value);
          }} />
      </div>
      <input type="range" value={multiplier} id="mult-slider" min="2" max="10000" onChange={(e: any) => setMultiplier(e.target.value)} />
      <div className="total-points">
        <label htmlFor="modulus">Modulus</label>
        <input type="number" id="modulus" name="modulus"
          min={2} value={modulus}
          onChange={(e: any) => {
            setModulus(e.target.value);
          }} />
      </div>
      <input type="range" value={modulus} id="mod-slider" min="2" max="10000" onChange={(e: any) => setModulus(e.target.value)} />
    </div>
    <button onClick={saveToFile}>save to file</button>
    <div className="svg-wrapper">
      <label htmlFor="spin-vortex">spin</label>
      <input id="spin-vortex" type="checkbox" checked={spinVortex} onChange={() => setSpinVortex(!spinVortex)} />

      <div className={spinVortex ? "svg-vortex" : "svg-wrapper"}>
        <svg viewBox={`0 0 ${getWidth()} ${getWidth()}`} ref={svgElement}>
          <circle cx={getWidth() / 2} cy={getWidth() / 2} r={getWidth() / 2} stroke={color} stroke-width="3" fill={svgBackgroundColor} />
          <polyline points={
            translateSVG()
          } stroke-width="2" fill="none" stroke={color} />
          Sorry, your browser does not support inline SVG.
        </svg>
      </div>

      <p hidden>
        {log.join(', ')}
      </p>
    </div>
  </div>;
}
