import {
  OnfidoInvalidSignatureError,
  WebhookEventVerifier,
  WebhookEventType,
  WebhookEventResourceType,
  WebhookEventObjectStatus
} from "onfido-node";

const webhookToken = "YKOC6mkBxi6yK2zlUIrLMvsJMFEZObP5";
const verifier = new WebhookEventVerifier(webhookToken);

const rawEvent = `{"payload":{"resource_type":"workflow_task","action":"workflow_task.started","object":{"id":"profile_1eb92","task_spec_id":"profile_1eb92","task_def_id":"profile_data","workflow_run_id":"bc77c6e5-753a-4580-96a6-aaed3e5a8d19","status":"started","started_at_iso8601":"2024-07-10T12:49:09Z","href":"https://api.eu.onfido.com/v3.6/workflow_runs/bc77c6e5-753a-4580-96a6-aaed3e5a8d19/tasks/profile_1eb92"},"resource":{"created_at":"2024-07-10T12:49:09Z","id":"profile_1eb92","workflow_run_id":"bc77c6e5-753a-4580-96a6-aaed3e5a8d19","updated_at":"2024-07-10T12:49:09Z","input":{},"task_def_version":null,"task_def_id":"profile_data","output":null}}}`;

const expectedEvent = {
  payload: {
    action: WebhookEventType.WorkflowTaskStarted,
    resource_type: WebhookEventResourceType.WorkflowTask,
    object: {
      id: "profile_1eb92",
      href:
        "https://api.eu.onfido.com/v3.6/workflow_runs/bc77c6e5-753a-4580-96a6-aaed3e5a8d19/tasks/profile_1eb92",
      status: WebhookEventObjectStatus.Started,
      started_at_iso8601: "2024-07-10T12:49:09Z",
      task_def_id: "profile_data",
      task_spec_id: "profile_1eb92",
      workflow_run_id: "bc77c6e5-753a-4580-96a6-aaed3e5a8d19"
    },
    resource: {
      created_at: "2024-07-10T12:49:09Z",
      id: "profile_1eb92",
      input: {},
      output: null,
      task_def_id: "profile_data",
      task_def_version: null,
      updated_at: "2024-07-10T12:49:09Z",
      workflow_run_id: "bc77c6e5-753a-4580-96a6-aaed3e5a8d19"
    }
  }
};

it("returns the event if the signature is valid", () => {
  const signature =
    "c95a5b785484f6fa1bc25f381b5595d66bf85cb442eefb06aa007802ee6a4dfa";

  const event = verifier.readPayload(rawEvent, signature);

  expect(event).toEqual(expectedEvent);
});

it("allows passing the body as a buffer", () => {
  const signature =
    "c95a5b785484f6fa1bc25f381b5595d66bf85cb442eefb06aa007802ee6a4dfa";

  const event = verifier.readPayload(Buffer.from(rawEvent), signature);

  expect(event).toEqual(expectedEvent);
  expect(event.payload.object.href).toEqual(
    "https://api.eu.onfido.com/v3.6/workflow_runs/bc77c6e5-753a-4580-96a6-aaed3e5a8d19/tasks/profile_1eb92"
  );

  // Test alternative way to access fields (it also works for additional properties)
  expect(event.payload.object["status"]).toEqual("started");
});

it("throws an error if the signature is invalid", () => {
  const signature =
    "c95a5b785484f6fa1bc25f381b5595d66bf85cb442eefb06aa007802ee6a4dfb";

  expect(() => verifier.readPayload(rawEvent, signature)).toThrow(
    OnfidoInvalidSignatureError
  );
});
