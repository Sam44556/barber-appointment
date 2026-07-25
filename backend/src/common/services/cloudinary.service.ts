import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  /**
   * Uploads a file buffer to Cloudinary (or returns base64 data URL as fallback)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'barbershop_uploads',
  ): Promise<string> {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');

    // Fallback if Cloudinary is not configured yet in backend .env
    if (!cloudName) {
      this.logger.warn('Cloudinary cloud_name not configured in backend .env. Storing image as data URL.');
      const mimeType = file.mimetype || 'image/png';
      const base64 = file.buffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            // Fallback on error to base64
            const mimeType = file.mimetype || 'image/png';
            const base64 = file.buffer.toString('base64');
            return resolve(`data:${mimeType};base64,${base64}`);
          }
          if (!result) {
            const mimeType = file.mimetype || 'image/png';
            const base64 = file.buffer.toString('base64');
            return resolve(`data:${mimeType};base64,${base64}`);
          }
          this.logger.log(`File successfully uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }
}
