import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppService, Character } from '../../service/app-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-character-details',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './character-details.html',
  styleUrl: './character-details.scss',
})
export class CharacterDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private appService = inject(AppService);

  charDetails: Character | null = null;
  searchControl = new FormControl('');
  epsInfo = signal<any>([]);
  filteredEps = signal<any>([]);
  loading: boolean = false;

  ngOnInit() {
    this.loading = true;
    this.searchEpsList();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appService.getCharacterData(id).subscribe(res => {
        this.charDetails = res;
        this.getEpsInfo();
      })
    }
  }

  getEpsInfo() {
    console.log(this.charDetails);
    const epsIds = this.charDetails?.episode.map(ep => {
      return ep.split('/')[5]
    }).join(',');
    console.log(epsIds);
    this.appService.getEpisodesInfo(epsIds).subscribe(res => {
      if (Array.isArray(res))
        this.epsInfo.set(res);
      else
        this.epsInfo.set([res]);
      this.filteredEps.set(this.epsInfo());
      this.loading = false;
    })
  }

  searchEpsList() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      const value = search?.trim().toLowerCase() ?? '';

      this.filteredEps.set(
        this.epsInfo().filter((ep: any) =>
          ep.name.toLowerCase().includes(value)
        )
      );
    });
  }

}
