function extractPublicId(cloudinaryUrl) {
  try {
    const urlParts = cloudinaryUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicIdWithExtension = urlParts.slice(-2).join('/'); 
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); 
    return publicId;
  } catch (err) {
    console.error("Failed to extract public_id from URL:", err.message);
    return null;
  }
}

export default extractPublicId;