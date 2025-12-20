import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { MAX_AVATAR_SIZE } from '../const/max-avatar-size';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    transform(value: unknown) {
        if (!value || typeof value !== 'object') {
            throw new BadRequestException('File is required');
        }

        const maybeFile = value as Record<string, any>;

        if (
            typeof maybeFile.fieldname !== 'string' ||
            typeof maybeFile.originalname !== 'string' ||
            typeof maybeFile.mimetype !== 'string' ||
            typeof maybeFile.size !== 'number' ||
            !(maybeFile.buffer instanceof Buffer)
        ) {
            throw new BadRequestException('Invalid file format');
        }

        const file = maybeFile as Express.Multer.File;

        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            throw new BadRequestException('Unsupported file type');
        }

        if (file.size > MAX_AVATAR_SIZE) {
            throw new BadRequestException(
                'File size exceeds the allowed limit',
            );
        }

        return file;
    }
}
