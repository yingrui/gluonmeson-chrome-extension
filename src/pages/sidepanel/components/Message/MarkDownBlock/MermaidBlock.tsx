import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface Props {
  chart: string;
  isStreaming?: boolean;
}

const Mermaid = ({ chart, isStreaming }: Props) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isStreaming) {
      mermaid.parse(chart).then((value) => {
        if (value) {
          mermaid.initialize({ startOnLoad: true });
          if (containerRef.current) {
            mermaid.contentLoaded();
            setError(null); // 清除之前的错误状态
          }
        } else {
          setError(true);
        }
      });
    }
  }, [chart, isStreaming]);

  return (
    <div className="mermaid" ref={containerRef}>
      {chart}
    </div>
  );
};

export default Mermaid;
