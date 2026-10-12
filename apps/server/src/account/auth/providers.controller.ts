import { Controller, Get, Header, Inject } from "@nestjs/common";
export interface Providers {
  google: boolean;
  guest: boolean;
}
@Controller("auth")
export class ProvidersController {
  constructor(
    @Inject("AUTH_PROVIDERS") private readonly providers: Providers,
  ) {}
  @Get("providers")
  @Header("Cache-Control", "no-store")
  current() {
    return { google: this.providers.google, guest: this.providers.guest };
  }
}
