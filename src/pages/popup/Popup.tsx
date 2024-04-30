import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap/dist/react-bootstrap.min.js";

const Popup = () => {
  const storage = chrome.storage.local;

  function setInputElementValue(id: string, value: string): void {
    const inputElement = document.getElementById(id);
    if (!!inputElement && inputElement instanceof HTMLInputElement) {
      inputElement.value = value;
    }
  }

  function loadChanges() {
    storage.get("configure", function (items: any) {
      if (!!items && !!items.configure) {
        setInputElementValue("apiKey", items.configure.apiKey);
        setInputElementValue("baseURL", items.configure.baseURL);
        setInputElementValue("organization", items.configure.organization);
      } else {
        setInputElementValue("apiKey", "");
        setInputElementValue("baseURL", "");
        setInputElementValue("organization", "");
      }
    });
  }

  loadChanges();

  async function saveSettings(event: any) {
    event.preventDefault();

    const apiKey = (document.getElementById("apiKey") as HTMLInputElement)
      .value;
    const baseURL = (document.getElementById("baseURL") as HTMLInputElement)
      .value;
    const organization = (
      document.getElementById("organization") as HTMLInputElement
    ).value;

    // Save settings using Chrome Storage API or handle them as needed
    const configure = {
      apiKey: apiKey,
      baseURL: baseURL,
      organization: organization,
    };
    await storage.set({ configure: configure }, function () {
      alert("Settings have been saved successfully!");
    });
  }

  async function clear(event: any) {
    event.preventDefault();

    await storage.set({ configure: null }, function () {
      loadChanges();
    });
  }

  return (
    <div className="form-container">
      <Form id="settings-form">
        <Form.Group controlId="apiKey">
          <Form.Label>API Key:</Form.Label>
          <Form.Control type="password" size="sm" required />
        </Form.Group>
        <Form.Group controlId="baseURL">
          <Form.Label>Base URL:</Form.Label>
          <Form.Control type="text" size="sm" required />
        </Form.Group>
        <Form.Group controlId="organization">
          <Form.Label>Organization:</Form.Label>
          <Form.Control type="text" size="sm" required />
        </Form.Group>
        <Row className="text-center">
          <Col>
            <Button
              className="m-2"
              size="sm"
              onClick={saveSettings}
              variant="primary"
            >
              Save Settings
            </Button>
            <Button
              className="m-2"
              size="sm"
              onClick={clear}
              variant="secondary"
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
