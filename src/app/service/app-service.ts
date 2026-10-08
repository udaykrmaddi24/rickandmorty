import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  episode: string[];
  image: string;
}

export interface PageInfo {
  count: number;
  next: string | null;
  pages: number;
  prev: string | null;
}

export interface CharacterResponse {
  info: PageInfo;
  results: Character[];
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private http = inject(HttpClient);

  getCharactersList(searchText?: string, page: number = 1): Observable<CharacterResponse> {
    let apiUrl = 'https://rickandmortyapi.com/api/character';

    if (searchText) {
      apiUrl += `?name=${searchText}&page=${page}`;
    } else {
      apiUrl += `?page=${page}`;
    }
  return this.http.get<CharacterResponse>(apiUrl);
}

  getCharacterData(id: string): Observable<Character> {
    const apiUrl = `https://rickandmortyapi.com/api/character/${id}`;
    return this.http.get<Character>(apiUrl);
  }

  getEpisodesInfo(eps: any) {
    const apiUrl = `https://rickandmortyapi.com/api/episode/${eps}`;
    return this.http.get(apiUrl);
  }
  
}
