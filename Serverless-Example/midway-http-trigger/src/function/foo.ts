import {
  FaaSContext,
  func,
  inject,
  init,
  provide,
  FunctionHandler,
} from "@midwayjs/faas";

@provide()
export class FooService implements FunctionHandler {
  @inject()
  ctx: FaaSContext; // context

  prop: string = "Initial!";

  @init()
  async init() {
    this.prop = "getInitialProps";
  }

  // 这个名字与f.yml中的要对应
  @func("foo.handler")
  async handler(event: any) {
    // @ts-ignore
    // const user = await this.ctx.userService.getUser();
    // console.log(user);
    console.log(this.prop);
    console.log("Midway!!!");
    // console.log(this.ctx);
    return "!!!!!!!!!!!!!!!!!!";
  }
}
