import { Controller, Get, Module, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}