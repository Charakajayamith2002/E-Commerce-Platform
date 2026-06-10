using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.Common.Interfaces;

public interface ICloudinaryService
{
    Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file, string folder = "general");
    Task<List<(string Url, string PublicId)>> UploadImagesAsync(IList<IFormFile> files, string folder = "general");
    Task<bool> DeleteImageAsync(string publicId);
    Task<bool> DeleteImagesAsync(IList<string> publicIds);
}
