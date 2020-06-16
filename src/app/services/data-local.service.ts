import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root',
})
export class DataLocalService {
  guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navcontroller: NavController,
    private inab: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
  ) {
    this.cargarStorage();

    console.log('registros obtenidos', this.guardados);
  }

  async cargarStorage() {
    this.guardados = (await this.storage.get('registros')) || [];
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();

    const nuevoRegistro: Registro = new Registro(format, text);

    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);
    console.log('registros guardados', this.guardados);

    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro(registro: Registro) {
    this.navcontroller.navigateForward('/tabs/tab2');

    // console.log('tipo' + registro.type);
    switch (registro.type) {
      case 'http':
        this.inab.create(registro.text, '_system');
        break;
      case 'geo':
        // console.log('navega a mapa');
        this.navcontroller.navigateForward(['/tabs/tab2/mapa/', registro.text]);
        break;
    }
  }

  enviarCorreo() {
    const titulos = 'Tipo, Formato, creado en, Texto\n';
    const arrayTemp = [];

    arrayTemp.push(titulos);

    this.guardados.forEach((registro) => {
      const linea = `${registro.type}, ${registro.format}, ${
        registro.created
      }, ${registro.text.replace(',', '_')}\n`;

      arrayTemp.push(linea);
    });

    // console.log(arrayTemp.join(''));
    this.crearArchivoFisico(arrayTemp.join(''));
  }

  crearArchivoFisico(text: string) {
    this.file
      .checkFile(this.file.dataDirectory, 'registros.csv')
      .then((existe) => {
        console.log('existe Archivo?', existe);

        return this.escribirEnArchivo(text);
      })
      .catch((err) => {
        // lanza el catch si no existe el archivo  en tal caso lo creamos con: file.createFile
        // esto devuelve una promesa indicando que se creo bien
        return this.file
          .createFile(this.file.dataDirectory, 'registros.csv', false)
          .then((creado) => {
            this.escribirEnArchivo(text);
          })
          .catch((error2) => {
            console.log('No se pudo crear el archivo', error2);
          });
      });
  }

  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(
      this.file.dataDirectory,
      'registros.csv',
      text
    );

    console.log('Archivo Creado');
    const archivo = `${this.file.dataDirectory}registros.csv`;
    console.log(this.file.dataDirectory + 'registros.csv');

    const email = {
      to: 'scaballeros08@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        // 'file://img/logo.png',
        // 'res://icon.png',
        // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
        // 'file://README.pdf',
        archivo,
      ],
      subject: 'Backup de Scans',
      body:
        'Aqui Tiene sus Backups de los scans- <strong>IonicScanApp</strong>',
      isHtml: true,
    };

    // Send a text message using default options
    this.emailComposer.open(email);
  }
}
