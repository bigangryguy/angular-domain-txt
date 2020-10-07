import { Injectable } from '@angular/core';
import { Domain } from './domain';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private domainsUrl = 'http://localhost:5000/domains';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient
  ) { }

  getDomains(): Observable<Domain> {
    return this.http
      .get<Domain>(this.domainsUrl, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError<Domain>('getDomains', null))
      );
  }

  createDomain(domain): Observable<Domain> {
    return this.http
      .post<Domain>(this.domainsUrl, JSON.stringify(domain), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError<Domain>('createDomain', null))
      );
  }

  updateDomain(domain): Observable<Domain> {
    return this.http
      .put<Domain>(this.domainsUrl, JSON.stringify(domain), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError<Domain>('updateDomain', null))
      );
  }

  deleteDomain(id): Observable<Domain> {
    return this.http
      .delete<Domain>(this.domainsUrl + '/' + id, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError<Domain>('deleteDomain', null))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
