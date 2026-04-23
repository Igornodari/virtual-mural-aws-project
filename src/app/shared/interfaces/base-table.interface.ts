import { Observable } from 'rxjs';
import { ListResponse } from '../types';

export interface IBaseTable{
    setDataSource<T>():Observable<ListResponse<T>>;
  }