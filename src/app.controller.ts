import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {

  @Get()
  getHome(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

  @Get('meli')
  getMeli(@Res() res: Response){
    console.log(join(__dirname, '..', 'public', 'indexMercadoLivre.html'));
    res.sendFile(join(__dirname, '..', 'public', 'indexMercadoLivre.html'));

  }

  @Get('shopee')
  getShopee(@Res() res: Response){
    res.sendFile(join(__dirname, '..', 'public', 'indexShopee.html'));
  }

  @Get('amazon')
  getAmazon(@Res() res: Response){
    res.sendFile(join(__dirname, '..', 'public', 'indexAmazon.html'));
  }
}
