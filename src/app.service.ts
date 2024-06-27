import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  get(): string {
    return 'This app keeps your secret notes!';
  }
}
