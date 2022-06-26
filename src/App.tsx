import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import './App.css'
const About = React.lazy(() => import ('./components/About'));

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
  const [searchParams, setSearchParams] = useSearchParams();
  const iterations = 1;
  const svgElement = useRef<any>(undefined);
  const bkgColorElement = useRef<any>(undefined);
  const [start, setStart] = useState<number>(1);
  const [color, setColor] = useState<any>(searchParams.get('fg') || '#000000');
  const [checked, setChecked] = useState<boolean>(false);
  const [svgBackgroundColor, setSVGBackgroundColor] = useState<any>(searchParams.get('bg') ? searchParams.get('bg') : 'transparent');
  const [chart, setChart] = useState<any>([]);
  const [log, setLog] = useState<any>([]);
  const [formula, setFormula] = useState<string>(searchParams.get('f') || '1xn');
  const [modulus, setModulus] = useState<number>(Number(searchParams?.get('mod') || 9));
  const [multiplier, setMultiplier] = useState<number>(Number(searchParams?.get('mult') || 2));
  const [spinVortex, setSpinVortex] = useState<boolean>(true);
  const [download, setDownload] = useState<string>(searchParams.get('download') || '');
  const getWidth = () => Math.max(1920, modulus);
  const nextNumber = (n: number, base: number) => {
    let [a,] = formula.split('x');
    let one = isNaN(Number(a)) ? 1 : Number(a);
    switch (formula) {
      case "try another formula?":
        // todo...
        break;
      case "nxn":
        return Math.floor((n * n) * multiplier % base);
      case `${one}xn`:
        return Math.floor((one * n) * multiplier % base);
      default:
        return Math.floor(n * multiplier % base);
    }
    return n
  }

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
      }, 50);
    } else {
      vortexMath(modulus);
    }
    setTimeout(() => {
      // after math, update URL.
      let params = {
        mod: String(modulus),
        mult: String(multiplier),
        fg: color,
        bg: svgBackgroundColor,
        f: formula
      };
      setSearchParams(params);
      if (['yes', 'y', 'true', '1'].includes(download?.toLocaleLowerCase())) {
        setDownload('');
        setTimeout(() => saveToFile(), 1000);
      };
    }, 100);
  }, [
    start, modulus, multiplier, iterations, // numbers
    color, svgBackgroundColor, checked // stylers
  ]);
  // download handlers
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
  const [sliderLimit, setSliderLimit] = useState(Math.max(10000, modulus));
  // input handlers
  const handleChangeN = (e: any) => {
    if (Math.floor(e.target.value) < 1) {
      return
    }
    switch (e.currentTarget.name) {
      case 'slider-limit':
        setSliderLimit(Math.max(e.target.value, modulus));
        break;
      case 'multiplier':
        setMultiplier(e.target.value);
        break;
      case 'modulus':
        let m = Math.floor(e.target.value);
        if (m > Math.floor(start)) {
          setModulus(m);
        }
        if (m > sliderLimit) {
          setSliderLimit(m);
        }
        break;
      case 'start':
        if (Math.floor(modulus) > Math.floor(e.target.value)) {
          setStart(e.target.value);
        }
        break;
      default:
        return
    }
  }
  const handleChangeColor = (e: any) => {
    setColor(e?.target?.value || '#000000');
  }
  const handleChangeBackground = (e: any) => {
    let background;
    if (e.currentTarget.name === 'checkbox') {
      const toggled = !checked;
      setChecked(toggled);
      background = toggled ? svgBackgroundColor : 'transparent';
    } else {
      background = checked ? e.target.value : '#000000';
    }
    const body: any = document.querySelector("body");
    setSVGBackgroundColor(background);
    if (checked) {
      body.style.backgroundColor = background;
    }
  }
  // elements
  return <div className="app" style={{ color: color, backgroundColor: svgBackgroundColor }}>

    <div className="canvas-inputs">
      <div className="colors">
        <div className="color-fg">
          <label htmlFor="html5colorpicker">foreground</label>
          <input type="color" id="html5colorpicker" value={color} onChange={handleChangeColor}></input>
        </div>
        <div className="color-bg">
          <label htmlFor="checkbox-bg" aria-label="select a background color ?" />
          <input id="checkbox-bg" type="checkbox" checked={checked} name="checkbox" onChange={handleChangeBackground} />
          <label htmlFor="backgroundColor">background</label>
          <input id="backgroundColor"
            name="backgroundColor" type="color"
            ref={bkgColorElement}
            value={svgBackgroundColor}
            onChange={handleChangeBackground}
            disabled={!checked}
          />
        </div>
      </div>

      {/* Multiplier */}
      <div className="point-multiplier">
        <label htmlFor="multiplier">multiplier</label>
        <input type="number" id="multiplier" name="multiplier"
          min={1} value={multiplier}
          onChange={handleChangeN} />
      </div>
      <label htmlFor="mult-slider" aria-label="muliplier (slider control)" />
      <input type="range" value={multiplier} id="mult-slider" name="multiplier" min="2" max={sliderLimit} onChange={handleChangeN} />
      {/* Modulus */}
      <div className="total-points">
        <label htmlFor="modulus">modulus</label>
        <input type="number" id="modulus" name="modulus"
          min={start + 1} value={modulus}
          onChange={handleChangeN} />
      </div>
      <label htmlFor="mod-slider" aria-label="modulus (slider control)" />
      <input type="range" name="modulus" value={modulus} id="mod-slider" min="2" max={sliderLimit} onChange={handleChangeN} />
    </div>

    <div className="save-range">
      <div className="outer-limits range" id="range">
        <label htmlFor="range">(range)</label>
        <div className="outer-limit-start">
          <label htmlFor="starting-point">start</label>
          <input id="starting-point" type="number" value={start} name="start" onChange={handleChangeN}></input>
        </div>
        <div className="outer-limit-end">
          <label htmlFor="slider-limit">end</label>
          <input id="slider-limit" type="number" name="slider-limit" value={sliderLimit} onChange={handleChangeN}></input>
        </div>
      </div>
    </div>
    <div className="checkbox-spin">
      <button className="save-btn" onClick={saveToFile}>save to file</button>
      <div>
        <input id="spin-vortex" type="checkbox" checked={spinVortex} onChange={() => setSpinVortex(!spinVortex)} />
        <label htmlFor="spin-vortex">spin</label>
      </div>

    </div>


    <div className="svg-wrapper">
      <div className="formula-text">
        <label>{searchParams.get('f') || '1xn'}x{multiplier}%{modulus}</label>
      </div>
      <div className="svg-container">
        <div className={spinVortex ? "svg-vortex" : "svg-wrapper"}>
          <svg viewBox={`0 0 ${getWidth()} ${getWidth()}`} ref={svgElement}>
            <circle cx={getWidth() / 2} cy={getWidth() / 2} r={getWidth() / 2} stroke={color} strokeWidth="3" fill={svgBackgroundColor} />
            <polyline points={translateSVG()} strokeWidth="2" fill="none" stroke={color} />
            Sorry, your browser does not support inline SVG.
          </svg>
        </div>
      </div>
    </div>
    <hr />
    <About />
    <p hidden>
      {log.join(', ')}
    </p>
  </div>;
}
