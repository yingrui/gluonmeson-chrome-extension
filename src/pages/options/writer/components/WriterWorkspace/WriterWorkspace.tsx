import React from "react";

import WriterSider from "@pages/options/writer/components/WriterSider/WriterSider";
import WriterEditor from "@pages/options/writer/components/WriterEditor/WriterEditor";

const WriterWorkspace: React.FC = () => {
  return (
    <>
      <WriterSider></WriterSider>
      <WriterEditor></WriterEditor>
    </>
  );
};

export default WriterWorkspace;
