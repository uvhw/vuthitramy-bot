import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LightningApiService } from '../lightning-api.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelComponent implements OnInit {
  channel$: Observable<any>;

  constructor(
    private lightningApiService: LightningApiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.channel$ = this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          return this.lightningApiService.getChannel$(params.get('short_id'));
        })
      );
  }

}
