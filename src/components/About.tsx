import React, { Suspense } from "react";
export default function About() {
  return (<div className="about-this-app">
    <label>About</label>
    <Suspense fallback={<div>loading...</div>}>
      <div className="youtube-video">
        <label htmlFor="vortex-math">Vortex Math</label>
        <iframe name="vortex-math" width="560" height="315" src="https://www.youtube.com/embed/6ZrO90AI0c8" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      </div>

      <div className="youtube-video">
        <label htmlFor="generators">Javascript Generators</label>
        <iframe name="generators" width="560" height="315" src="https://www.youtube.com/embed/gu3FfmgkwUc" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      </div>
    </Suspense>
    <div className="source-code">
      <a href="https://github.com/trevorjamesmartin/vortex-math" target="_new">Source Code</a>
    </div>
  </div>
  );
}
