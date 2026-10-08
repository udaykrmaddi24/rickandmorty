import { Component, inject, OnInit, signal } from '@angular/core';
import { AppService, Character, CharacterResponse } from '../../service/app-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, MatPaginatorModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private appService = inject(AppService);
  private router = inject(Router);
  private authService = inject(AuthService);

  characterdsData: any;
  charactersList = signal<Character[]>([]);
  loading = signal(false);
  searchControl = new FormControl('');

  constructor() {
  }

  ngOnInit(): void {
    this.getCharactersList();
    this.searchControl.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(search => {
        this.loading.set(true);
        return this.appService.getCharactersList(search ?? '')
      })).subscribe(res => {
        console.log(res);
        this.characterdsData = res;
        this.charactersList.set(res?.results);
        this.loading.set(false);
      }, err => {
        console.error(err);
        this.charactersList.set([]);
        this.loading.set(false);
      })
  }

  getCharactersList() {
    this.loading.set(true);
    this.appService.getCharactersList().subscribe((res: CharacterResponse) => {
      console.log(res);
      this.characterdsData = res;
      this.charactersList.set(res?.results);
      this.loading.set(false);
    }, err => {
      console.error(err);
      this.charactersList.set([]);
      this.loading.set(false);
    }
    )
  }

  navigateToCharDetails(id: number) {
    // if(this.authService.isAdmin())
    this.router.navigate(['char-details', id]);
    // else 
    //   return;
  }


  onPageChange(event: PageEvent) {
    const page = event.pageIndex + 1;
    this.loading.set(true);
    this.appService.getCharactersList('', page).subscribe({
      next: res => {
        this.characterdsData = res;
        this.charactersList.set(res.results);
      },
      error: err => {
        console.error(err);
        this.charactersList.set([]);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

}
