import { DataLocalService } from '../../services/data-local.service';
import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  // opciones para que el slide no haga el efecto de deslisar el slide
  slideOpts = {
    allowSlidePrev: false,
    allowSlideNext: false,
  };
  constructor(
    private barcodeScanner: BarcodeScanner,
    private dataLocal: DataLocalService
  ) {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  ionViewWillEnter() {
    this.scan();
  }

  ionViewWillLeave() {}

  scan() {
    this.barcodeScanner
      .scan()
      .then((barcodeData) => {
        console.log('Barcode data');
        console.log(barcodeData);

        // si  no se cancelo el escaneo hacer :
        if (!barcodeData.cancelled) {
          this.dataLocal.guardarRegistro(barcodeData.format, barcodeData.text);
        }
      })
      .catch((err) => {
        console.log('Error_tab1', err);
        // this.dataLocal.guardarRegistro('QRCode', 'https://www.google.com');
        this.dataLocal.guardarRegistro(
          'QRCode',
          'geo:40.745305104570534,-74.03804197749027'
        );
      });
  }
}
