import { useEffect, useState } from "react";
import Globe from "react-globe.gl";

export default function GlobeView() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="globe-wrap">
      <Globe
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"

        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

        atmosphereColor="#4f8cff"
        atmosphereAltitude={0.25}

      />
    </div>
  );
}
        
