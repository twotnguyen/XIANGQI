import { Module, type DynamicModule } from "@nestjs/common";
import { Providers, ProvidersController } from "./providers.controller.js";
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
