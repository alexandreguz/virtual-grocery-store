import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
  ]
};

// NG02801: Angular detected that `HttpClient` is not configured to use `fetch` APIs. 
// It's strongly recommended to enable `fetch` for applications that use Server-Side Rendering for better performance and compatibility. 
// To enable `fetch`, add the `withFetch()` to the `provideHttpClient()` call at the root of the application.