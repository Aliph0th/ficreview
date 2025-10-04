import { SetMetadata } from '@nestjs/common';
import { METADATA } from '../constants';

export const Public = () => SetMetadata(METADATA.PUBLIC, true);

export const AuthUncompleted = () => SetMetadata(METADATA.UNCOMPLETED_AUTH, true);
