import { provide } from "@midwayjs/faas";

// userService.ts
@provide()
export class UserService {
  async getUser() {
    return "User Linbudu";
  }
}
