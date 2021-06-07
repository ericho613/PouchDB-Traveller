import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as ResultCardActions from './result-card.actions';
// import * as fromApp from '../../../../store/app.reducer';
// import { Store } from '@ngrx/store';
import { ElectronService } from '../../../../core/services/index';

@Injectable()
export class ResultCardEffects {

  buildFileTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResultCardActions.buildFileTree),
      tap((action) => {
        this.electronService.forkedChildProcessBuildFileTree(action.obj, action.level);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    // private store: Store<fromApp.AppState>
  ) {}
}
