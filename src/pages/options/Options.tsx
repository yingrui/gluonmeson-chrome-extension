import { Button, Form, Input, Switch, Modal, Tabs } from "antd";
import { isEqual } from "lodash";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import configureStorage, {
  DEFAULT_GM_CONFIG_VALUE,
} from "@root/src/shared/storages/gluonConfig";
import useStorage from "@root/src/shared/hooks/useStorage";

const Options = () => {
  return <div>Options Page</div>;
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
