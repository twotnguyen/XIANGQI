import {
  Controller,
  Get,
  Header,
  Inject,
  Module,
  type DynamicModule,
} from "@nestjs/common";
interface Providers {
  google: boolean;
  guest: boolean;
}
@Controller("auth")
class ProvidersController {
  constructor(
    @Inject("AUTH_PROVIDERS") private readonly providers: Providers,
  ) {}
  @Get("providers")
  @Header("Cache-Control", "no-store")
  current() {
    return { google: this.providers.google, guest: this.providers.guest };
  }
}
@Module({})
export class AuthProvidersModule {
  static forRoot(providers: Providers): DynamicModule {
    return {
      module: AuthProvidersModule,
      controllers: [ProvidersController],
      providers: [{ provide: "AUTH_PROVIDERS", useValue: providers }],
    };
  }
}
