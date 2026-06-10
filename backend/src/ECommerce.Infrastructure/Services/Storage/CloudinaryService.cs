using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ECommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Infrastructure.Services.Storage;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary? _cloudinary;
    private readonly bool _isConfigured;

    public CloudinaryService(IConfiguration configuration)
    {
        var settings = configuration.GetSection("Cloudinary");
        var cloudName = settings["CloudName"];
        var apiKey = settings["ApiKey"];
        var apiSecret = settings["ApiSecret"];

        _isConfigured = !string.IsNullOrWhiteSpace(cloudName)
                     && !string.IsNullOrWhiteSpace(apiKey)
                     && !string.IsNullOrWhiteSpace(apiSecret)
                     && cloudName != "your_cloud_name";

        if (_isConfigured)
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
        }
    }

    public async Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file, string folder = "general")
    {
        if (!_isConfigured)
            return ($"https://placehold.co/600x400?text={Uri.EscapeDataString(file.FileName)}", Guid.NewGuid().ToString());

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"ecommerce/{folder}",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto"),
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary!.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task<List<(string Url, string PublicId)>> UploadImagesAsync(IList<IFormFile> files, string folder = "general")
    {
        var results = new List<(string Url, string PublicId)>();
        foreach (var file in files)
        {
            var result = await UploadImageAsync(file, folder);
            results.Add(result);
        }
        return results;
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        if (!_isConfigured || _cloudinary is null) return true;
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }

    public async Task<bool> DeleteImagesAsync(IList<string> publicIds)
    {
        var tasks = publicIds.Select(DeleteImageAsync);
        var results = await Task.WhenAll(tasks);
        return results.All(r => r);
    }
}
