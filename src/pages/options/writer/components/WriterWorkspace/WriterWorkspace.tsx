import React from "react";

import WriterSider from "@pages/options/writer/components/WriterSider/WriterSider";
import WriterEditor from "@pages/options/writer/components/WriterEditor/WriterEditor";
import WriterContext from "@pages/options/writer/context/WriterContext";

const WriterWorkspace: React.FC = (props: Record<string, unknown>) => {
  const context = props.context as WriterContext;
  return (
    <>
      <WriterSider context={context}></WriterSider>
      <WriterEditor context={context}></WriterEditor>
    </>
  );
};

export default WriterWorkspace;
