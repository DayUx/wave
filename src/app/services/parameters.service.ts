import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ToastService, ToastTypes } from './toast.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParametersService {
  public loaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get parameters(): any {
    return this._parameters;
  }

  set parameters(value: any) {
    this._parameters = value;
    const parameters = Object.keys(this._parameters).map((key) => {
      return {
        key: key,
        value: this._parameters[key].value,
      };
    });

    Filesystem.writeFile({
      path: 'parameters.json',
      data: btoa(JSON.stringify(parameters)),
      directory: Directory.Data,
    }).then(() => {
      this.toastService.initiate({
        title: 'SETTINGS.TOASTS.SAVED_SUCCESS.TITLE',
        content: 'SETTINGS.TOASTS.SAVED_SUCCESS.MESSAGE',
        show: true,
        type: ToastTypes.SUCCESS,
        duration: 2000,
      });
    });
  }

  private _parameters: any = {
    COULEUR_PRINCIPALE: {
      value: '#a5c8d5',
      update: function (value: any) {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', value);
      },
    },
    COULEUR_SECONDAIRE: {
      value: '#e9ca7c',
      update: function (value: any) {
        const root = document.documentElement;
        root.style.setProperty('--color-secondary', value);
      },
    },
    RAYON_BORDURES: {
      value: 20,
      update: function (value: any) {
        const root = document.documentElement;
        root.style.setProperty('--border-radius', value + 'px');
      },
    },
    TAILLE_POLICE: {
      value: 20,
      update: function (value: any) {
        const root = document.documentElement;
        root.style.setProperty('--font-size', value + 'px');
      },
    },
    TAILLE_ESPACES: {
      value: 20,
      update: function (value: any) {
        const root = document.documentElement;
        root.style.setProperty('--padding', value + 'px');
      },
    },
    EMPLACEMENT_DONNEES: {
      value: '/subapp/data',
      update: function (value: any) {},
    },
    THEME_SOMBRE: {
      value: 'false',
      update: function (value: any) {
        const style = document.documentElement.style;
        style.setProperty(
          '--theme-color-1',
          value === 'true' ? 'var(--dark)' : '#ffffff'
        );
        style.setProperty(
          '--theme-color-2',
          value === 'true' ? '#ffffff' : 'var(--dark)'
        );
      },
    },
    LANGUE: {
      value: 'fr',
      update: function (value: any) {},
    },
  };

  constructor(
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    this._parameters.LANGUE.update = (value: any) => {
      this.translate.use(value);
    };
    Filesystem.readFile({
      path: 'parameters.json',
      directory: Directory.Data,
    })
      .then(async (result) => {
        let parameters: any[];
        if (typeof result.data === 'string') {
          parameters = JSON.parse(atob(result.data));
        } else {
          parameters = JSON.parse(await result.data.text());
        }
        for (const p of parameters) {
          this._parameters[p.key].value = p.value;
          if (this._parameters[p.key].update) {
            this._parameters[p.key].update(
              this._parameters[p.key].value,
              false
            );
          }
        }
        this.loaded.next(true);
      })
      .catch(() => {
        this.parameters = this._parameters;
      });
  }

  get(key: string): any {
    return this._parameters[key];
  }

  set(key: string | any, value?: any): void {
    let updateFile = false;
    if (typeof key === 'object') {
      for (const k of Object.keys(key)) {
        if (this._parameters[k].value !== key[k]) {
          updateFile = true;
        }
        this._parameters[k].value = key[k];
        if (this._parameters[k].update) {
          this._parameters[k].update(this._parameters[k].value);
        }
      }
    } else {
      if (this._parameters[key].value !== value) {
        updateFile = true;
      }
      this._parameters[key].value = value;
      if (this._parameters[key].update) {
        this._parameters[key].update(this._parameters[key].value);
      }
    }
    if (updateFile) {
      this.parameters = this._parameters;
    }
  }
}
