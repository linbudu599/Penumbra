import {
  FaaSContext,
  func,
  inject,
  provide,
  FunctionHandler,
} from "@midwayjs/faas";

@provide()
@func("index.handler")
export class IndexService implements FunctionHandler {
  @inject()
  ctx: FaaSContext; // context

  async handler() {
    return "Hello Midway-FaaS";
  }

  async anotherHandler() {
    return "Hello, This is another handler!";
  }
}
