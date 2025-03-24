import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoServiceService {
  private todoUrl: string = 'https://todolistwebapi20250324215732.azurewebsites.net/api/Todo/';

  constructor(private http: HttpClient) { }


  getTodoList(): Observable<any> {
    const userId = localStorage.getItem('userId');
    return this.http.get<any[]>(`${this.todoUrl}GetUserTodoTasks/${userId}`);
}

createTodoList(data: any): Observable<any> {
    const userId = localStorage.getItem('userId');
    data.userId = userId; // Attach userId to the task object
    return this.http.post<any>(`${this.todoUrl}CreateTodoTask`, data);
}

  updateTodoList(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.todoUrl}UpdateTodoTask/${id}`, data)
  }

  deleteTodoList(id: number): Observable<any> {
    return this.http.delete<any>(`${this.todoUrl}DeleteTodoTask/${id}`);
  }
  updateIsCompleted(id: number, isCompleted: boolean): Observable<any> {
    return this.http.patch<any>(`${this.todoUrl}UpdateIsCompleted/${id}`, isCompleted);
  }


}
