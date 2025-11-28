// backend/src/services/cloudinary.service.js

import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
//función genérica de subida y eliminación de archivos en Cloudinary
export const uploadFile = async (
  buffer,
  {
    folder,
    resourceType = "raw", // para PDFs/archivos en general
    publicId,
  }
) => {
  if (!buffer) return null;

  const result = await new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
    };

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
  };
};


export const deleteFile = async (publicId, resourceType = "raw") => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

// Funciones específicas para tipos comunes de archivos
export const uploadRawFile = (buffer, folder) =>
  uploadFile(buffer, { folder, resourceType: "raw" });

export const uploadImage = (buffer, folder) =>
  uploadFile(buffer, { folder, resourceType: "image" });

export const deleteRawFile = (publicId) => deleteFile(publicId, "raw");
export const deleteImageFile = (publicId) => deleteFile(publicId, "image");

export const buildRawDownloadUrl = (publicId, filename = "archivo.pdf") => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    flags: "attachment",
    attachment: filename, 
  });
};