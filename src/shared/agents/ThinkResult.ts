interface ThinkResult {
  type: "actions" | "message" | "stream";
  actions?: Action[];
  stream?: any;
  firstChunk?: any;
  message?: string;
}

export default ThinkResult;
