import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const configured = config.get<string>("INTEGRATION_ENCRYPTION_KEY") || config.get<string>("JWT_SECRET") || "change-this-secret";
    this.key = createHash("sha256").update(configured).digest();
  }

  encrypt(value: unknown): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
  }

  decrypt<T>(value: string | null | undefined): T | null {
    if (!value) return null;
    const [ivPart, tagPart, dataPart] = value.split(".");
    if (!ivPart || !tagPart || !dataPart) return null;
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivPart, "base64"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64"));
    const decoded = Buffer.concat([decipher.update(Buffer.from(dataPart, "base64")), decipher.final()]).toString("utf8");
    return JSON.parse(decoded) as T;
  }
}
