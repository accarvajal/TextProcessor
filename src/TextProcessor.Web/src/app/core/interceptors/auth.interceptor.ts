import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Replace these with your actual credentials
  const username = 'admin';
  const password = 'password';
  
  const authHeader = 'Basic ' + btoa(username + ':' + password);
  
  const authReq = req.clone({
    headers: req.headers.set('Authorization', authHeader)
  });
  
  return next(authReq);
};